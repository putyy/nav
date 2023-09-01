window.addEventListener('DOMContentLoaded', function () {
    (async function () {
        const docStyle = document.documentElement.style;
        const styleList = ['', 'invert(85%) hue-rotate(180deg)', 'invert(100%) hue-rotate(180deg)',];
        const appDataCacheKey = 'app-data-cache';
        const appDataCacheBgKey = 'app-bg-cache';
        const engineColor = [
            {
                default: "#ffffff",
                active: "#11e8c6",
            },
            {
                default: "#ffffff",
                active: "#1169e8",
            },
            {
                default: "black",
                active: "#ffffff",
            }
        ];
        const appData = await getCategory();
        (function (appData) {
            if (appData.mode_index === 1) {
                $(".category").removeClass("hide");
            } else {
                $(".category").addClass("hide");
            }

            let bgCache = localStorage.getItem(appDataCacheBgKey);
            if (bgCache) {
                $("body").css("background-image", "url(" + bgCache + ")")
            } else {
                $("body").css("background-image", "url(" + appData.background_image_url + ")")
            }

            document.body.style.setProperty('--engine-color-default', engineColor[appData.engine_color_index].default)
            document.body.style.setProperty('--engine-color-active', engineColor[appData.engine_color_index].active)

            setTheme()
            let inputObj = $(".search .form .input");
            if (appData.engine_index !== 0) {
                let engineHtml = "";
                let placeholder = "";
                appData.engine.forEach(function (v, k) {
                    if (k === appData.engine_index) {
                        engineHtml += `<li class="item active" data-url="${v.url}" data-placeholder="${v.placeholder}" data-index="${k}">${v.title}</li>`;
                        placeholder = v.placeholder;
                    } else {
                        engineHtml += `<li class="item" data-url="${v.url}" data-placeholder="${v.placeholder}" data-index="${k}">${v.title}</li>`;
                    }
                })
                inputObj.attr("placeholder", placeholder)
                $(".engine").html(engineHtml);
            }
            $(".content").removeClass("hide");
            inputObj.focus();
        })(appData)

        function buildRightHtml(nav) {
            return `<li class="item"><a class="link" href="${nav.url}" target="_blank">
                          <img alt="${nav.title}" class="icon" src="/icon/${nav.icon}"/>
                          <span class="name">${nav.title}</span>
                      </a></li>`;
        }

        async function getCategory() {
            let cache = localStorage.getItem(appDataCacheKey);
            if (cache) {
                let res = JSON.parse(cache);
                if (window.gowas_version && window.gowas_version === res.version) {
                    return res;
                }
            }
            await $.get('/main.json', function (res) {
                cache = res
                localStorage.setItem(appDataCacheKey, JSON.stringify(cache))
            }, 'json')
            return cache
        }

        function setTheme() {
            docStyle.filter = styleList[appData.theme_index];
            document.body.querySelectorAll("img, picture, video").forEach(function (el) {
                el.style.filter = appData.theme_index ? "invert(1) hue-rotate(180deg)" : ""
            })
        }

        $(".search")
            .on("keydown", ".input", function (e) {
                let theEvent = e || window.event;
                let code = theEvent.keyCode || theEvent.which || theEvent.charCode;
                if (code === 13) {
                    let v = $(".search .form .input").val()
                    if (v) {
                        window.open($(".engine .active").attr("data-url") + v, "_blank");
                    }
                    return false
                }
            })
            .on("click", ".submit", function () {
                window.open($(".engine .active").attr("data-url") + $(".search .form .input").val(), "_blank");
            })
            .on("click", ".engine .item", function () {
                $(".engine .active").removeClass("active");
                $(this).addClass("active");
                $(".search .form .input").attr("placeholder", $(this).attr("data-placeholder")).focus()
                appData.engine_index = parseInt($(this).attr("data-index"));
                localStorage.setItem(appDataCacheKey, JSON.stringify(appData))
            })
            .on("click", ".tips", function () {
                let obj = $(this).parent().find(".tip");
                if (obj.is(":visible")) {
                    obj.fadeOut();
                } else {
                    obj.fadeIn();
                }
            })
            .on("click", ".tip .mode", function () {
                let obj = $(".category");
                if (obj.hasClass("hide")) {
                    obj.removeClass("hide");
                    appData.mode_index = 1;
                } else {
                    obj.addClass("hide");
                    appData.mode_index = 0;
                }
                $(".setting .tip").hide();
                localStorage.setItem(appDataCacheKey, JSON.stringify(appData))
            })
            .on("click", ".tip .theme", function () {
                appData.theme_index = appData.theme_index >= styleList.length - 1 ? 0 : appData.theme_index + 1;
                setTheme()
                localStorage.setItem(appDataCacheKey, JSON.stringify(appData))
            })
            .on("click", ".tip .bg", function () {
                $("#file").click()
            })
            .on("click", ".tip .clear", function () {
                localStorage.removeItem(appDataCacheKey, null)
                localStorage.removeItem(appDataCacheBgKey, null)
                location.reload()
            })
            .on("click", ".color", function () {
                appData.engine_color_index = appData.engine_color_index >= engineColor.length - 1 ? 0 : appData.engine_color_index + 1;
                document.body.style.setProperty('--engine-color-default', engineColor[appData.engine_color_index].default)
                document.body.style.setProperty('--engine-color-active', engineColor[appData.engine_color_index].active)
                localStorage.setItem(appDataCacheKey, JSON.stringify(appData))
            })

        $("#file").change(function () {
            let file = $(this)[0].files[0];
            let reader = new FileReader(); // 创建FileReader对象

            reader.onload = function (e) {
                let fileContent = e.target.result;
                localStorage.setItem(appDataCacheBgKey, fileContent);
                $("body").css("background-image", "url(" + fileContent + ")")
            };
            reader.readAsDataURL(file);
        })

        $('.category').on('click', '.menu .item', function () {
            let that = $(this)
            $(".category .one .active").removeClass("active");
            that.addClass("active");
            let data = appData.data
            let index = that.attr("data-index");
            let leftHtml = '';
            let rightHtml = '';
            let child = data[index].child;
            if (data[index].menus){
                data[index].menus.forEach(function (nav) {
                    rightHtml += buildRightHtml(nav)
                })
            }
            if (child) {
                child.forEach(function (v, k) {
                    if (k === 0) {
                        leftHtml += `<li class="item active" data-index="${index}_-1">全部</li>`;
                    }
                    leftHtml += `<li class="item" data-index="${index}_${k}">${child[k].title}</li>`;
                    data[index].child[k].menus.forEach(function (nav) {
                        rightHtml += buildRightHtml(nav)
                    })
                })
            }

            $('.category .two>.left').html(leftHtml)
            $('.category .two>.right').html(rightHtml)

        }).on('click', '.left .item', function () {
            $(".category .left .active").removeClass("active");
            $(this).addClass("active");
            let indexArr = $(this).attr('data-index').split('_');
            let data = appData.data[indexArr[0]].child
            let rightHtml = '';
            if (data && indexArr[1] === '-1') {
                data.forEach(function (v, k) {
                    v.menus.forEach(function (nav) {
                        rightHtml += buildRightHtml(nav)
                    })
                })
            } else if (data[indexArr[1]].menus) {
                data[indexArr[1]].menus.forEach(function (nav) {
                    rightHtml += buildRightHtml(nav)
                })
            }
            $('.category .two>.right').html(rightHtml)
        })
    })()
})