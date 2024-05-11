// by Kirno (natyx.net)

$(document).ready(function () {
    const base = (document.querySelector("base") || {}).href;
    const container = $("#sortable");
   
    const liveStats = () => {
      let hidden, visibilityChange;
   
      if (typeof document.hidden !== "undefined") {
        hidden = "hidden";
        visibilityChange = "visibilitychange";
      } else if (typeof document.msHidden !== "undefined") {
        hidden = "msHidden";
        visibilityChange = "msvisibilitychange";
      } else if (typeof document.webkitHidden !== "undefined") {
        hidden = "webkitHidden";
        visibilityChange = "webkitvisibilitychange";
      }
   
      const livestatsRefreshTimeouts = [];
      const livestatsFuncs = [];
      const livestatsContainers = $(".livestats-container");
   
      function stopLivestatsRefresh() {
        for (
          let _i = 0, _livestatsRefreshTime = livestatsRefreshTimeouts;
          _i < _livestatsRefreshTime.length;
          _i++
        ) {
          const timeoutId = _livestatsRefreshTime[_i];
          window.clearTimeout(timeoutId);
        }
      }
   
      function startLivestatsRefresh() {
        for (
          let _i2 = 0, _livestatsFuncs = livestatsFuncs;
          _i2 < _livestatsFuncs.length;
          _i2++
        ) {
          const fun = _livestatsFuncs[_i2];
          fun();
        }
      }
   
      if (livestatsContainers.length > 0) {
        if (
          typeof document.addEventListener === "undefined" ||
          hidden === undefined
        ) {
          console.log("This browser does not support visibilityChange");
        } else {
          document.addEventListener(
            visibilityChange,
            function () {
              if (document[hidden]) {
                stopLivestatsRefresh();
              } else {
                startLivestatsRefresh();
              }
            },
            false
          );
        }
   
        livestatsContainers.each(function (index) {
          const id = $(this).data("id");
          const dataonly = $(this).data("dataonly");
          const increaseby = dataonly == 1 ? 20000 : 1000;
          const container = $(this);
          const max_timer = 30000;
          let timer = 5000;
   
          const fun = function worker() {
            $.ajax({
              url: base + "get_stats/" + id,
              dataType: "json",
              success: function success(data) {
                container.html(data.html);
                if (data.status == "active") timer = increaseby;
                else {
                  if (timer < max_timer) timer += 2000;
                }
              },
              complete: function complete() {
                // Schedule the next request when the current one's complete
                livestatsRefreshTimeouts[index] = window.setTimeout(
                  worker,
                  timer
                );
              },
            });
          };
   
          livestatsFuncs[index] = fun;
          fun();
        });
      }
    };
   
    const customMain = () => {
      if (window.location.pathname !== "/") return;
      $.get(base + "tags", function (data) {
        container.html("");
        container.css("opacity", "1");
        const tagArr = Array.from($("tbody tr td a", data));
        tags = tagArr
          .filter((_d, idx) => idx % 2 === 0)
          .map((node) => node.href.split("/").pop());
        const tagPromises = tags.map((tag) => $.get(base + "tag/" + tag));

        if (tags.length === 0) return;
        Promise.all(tagPromises)
          .then((tagsHtml) => {
            const tagsNodes = tagsHtml.map((html, idx) => {
              const inner = $("#sortable", html).html();
              const wrapper1 = document.createElement("div");
              const wrapper2 = document.createElement("div");
              wrapper2.classList.add("tags-container");
              wrapper2.innerHTML = inner;
              const tagTitle = document.createElement("h4");
              tagTitle.classList.add("tags-title");
              tagTitle.textContent = tags[idx].replaceAll("-", " ");
              wrapper1.append(tagTitle);
              wrapper1.append(wrapper2);
              return wrapper1;
            });
            container.append(tagsNodes);
          })
          .finally(() => liveStats());
      });
    };
    customMain();
  });