class GuidedClass {
    constructor(div) {
        var playing = false;
        var arrow = div.querySelector(".GuidedArrow");
        var GuidedButton = div.querySelector(".GuidedButton");
        var GuidedLanguageSelector = div.querySelector(".GuidedLanguageSelector");
        var HerbrewAudio = div.querySelector(".HerbrewAudio");
        var HerbrewEnglishAudio = div.querySelector(".HerbrewEnglishAudio");
        var StopGuidedButton = div.querySelector(".StopGuidedButton");
        var GuidedArrow = div.querySelector(".GuidedArrow");
        var toggleGuidedLanguageSelector = function(e) {
            if (e.target.classList.contains("GuidedLanguageSelector"))
                return;
            if (GuidedLanguageSelector.style.display == "flex") {
                GuidedLanguageSelector.style.display = "none"
                GuidedArrow.children[0].style.transform = "rotate(0deg)"
                window.removeEventListener("click", toggleGuidedLanguageSelector)

            } else {
                GuidedArrow.children[0].style.transform = "rotate(180deg)"
                GuidedLanguageSelector.style.display = "flex"
            }
        }
        arrow.addEventListener("click", function(e) {
            GuidedLanguageSelector.style.display = "flex";
            window.addEventListener("click", toggleGuidedLanguageSelector)
            e.stopPropagation();
            e.preventDefault();
            return false;
        })
        GuidedLanguageSelector.addEventListener("click", function(e) {
            if (e.target.classList.contains("Herbrew")) {
                GuidedButton.setAttribute("data-lang", "Herbrew")
                if (playing) {
                    HerbrewAudio.pause();
                    HerbrewAudio.currentTime = 0;
                    HerbrewEnglishAudio.play();
                }
            } else if (e.target.classList.contains("English")) {
                GuidedButton.setAttribute("data-lang", "English")
                if (playing) {
                    HerbrewEnglishAudio.pause();
                    HerbrewEnglishAudio.currentTime = 0;
                    HerbrewAudio.play();
                }
            }
            GuidedLanguageSelector.style.display = "none";
            e.preventDefault();
            e.stopPropagation();
            return false;
        })
        GuidedButton.addEventListener("click", function() {
            var lang = GuidedButton.getAttribute("data-lang");
            StopGuidedButton.style.display = "flex";
            GuidedButton.style.display = "none";
            if (lang == "English") {
                HerbrewEnglishAudio.play();
                playing = true;
            } else if (lang == "Herbrew") {
                HerbrewAudio.play();
                playing = true;
            }
        })
        StopGuidedButton.addEventListener("click", function() {
            StopGuidedButton.style.display = "none";
            GuidedButton.style.display = "flex";
            var lang = GuidedButton.getAttribute("data-lang");
            if (lang == "English") {
                HerbrewEnglishAudio.pause();
                HerbrewEnglishAudio.currentTime = 0;
                playing = false;
            } else if (lang == "Herbrew") {
                HerbrewAudio.pause();
                HerbrewAudio.currentTime = 0;
                playing = false;
            }
        })
    }
}

class videoDropDown {
    constructor(div) {
        var chosenItem = div.querySelector(".chosenItem");
        var chosenItemText = div.querySelector(".chosenItemText");
        var dropDownContainer = div.querySelector(".dropDownContainer");
        var video = div.querySelector("video");
        var iframe = div.querySelector("iframe");
        var toggleContainer = function(e) {
            if (e.target.classList.contains("youtubeLink")) {
                e.stopPropagation();
                return false;
            }
            if (e.target.classList.contains("gear")) {
                e.target.previousSibling.style.pointerEvents = "all";
                e.target.previousSibling.focus();
                e.target.previousSibling.setSelectionRange(0, e.target.previousSibling.value.length)
                e.target.previousSibling.style.backgroundColor = "#fff";
                e.stopPropagation();
                e.target.nextSibling.style.display = "block";
                e.target.style.display = "none";
                return false;
            }
            if (e.target.classList.contains("tick")) {
                e.target.previousSibling.previousSibling.style.pointerEvents = "none";
                e.target.previousSibling.previousSibling.style.backgroundColor = "rgba(255, 255, 255, 0)";
                e.stopPropagation();
                e.target.parentNode.setAttribute("data-src", e.target.previousSibling.previousSibling.value);
                e.target.previousSibling.style.display = "block";
                e.target.style.display = "none";
                return false;
            }
            if (dropDownContainer.parentNode.classList.contains("dropdownVisible")) {
                dropDownContainer.parentNode.classList.remove("dropdownVisible")
                if (e.target.classList.contains("youtube")) {
                    var url = new URL(e.target.getAttribute("data-src"));
                    var v = url.searchParams.get("v");
                    if (v == "" || v == null) {
                        alert("invalid url");
                        return;
                    }
                    iframe.setAttribute("src", "https://www.youtube.com/embed/" + v + "?loop=1&enablejsapi=1");
                    video.pause();
                    iframe.style.display = "block";
                    video.style.display = "none";
                    const isVideoPlaying = video => !!(video.currentTime > 0 && !video.paused && !video.ended && video.readyState > 2);
                    if (!isVideoPlaying)
                        iframe.contentWindow.postMessage('{"event":"command","func":"' + 'playVideo' + '","args":""}', '*');
                    chosenItemText.innerHTML = e.target.getAttribute("data-src");
                } else {
                    iframe.style.display = "none";
                    iframe.contentWindow.postMessage('{"event":"command","func":"' + 'pauseVideo' + '","args":""}', '*');
                    video.style.display = "block";
                    video.src = "/videos/" + e.target.getAttribute("data-src");
                    chosenItemText.innerHTML = e.target.innerHTML;
                }
                window.removeEventListener("click", toggleContainer);

            } else {
                dropDownContainer.parentNode.classList += " dropdownVisible";
                window.addEventListener("click", toggleContainer);
            }
            e.stopPropagation();
            return false;
        }
        chosenItem.addEventListener("click", toggleContainer)
    }
}

class audioClass {
    constructor(div) {
        var arousalAddAudioBtn = div.querySelector(".AddAudioBtn");
        var aurosalAudio = div.querySelector(".Audio");
        var arousalAudioFile = div.querySelector(".AudioFile");
        var arousalPauseBtn = div.querySelector(".PauseBtn");
        var arousalStopBtn = div.querySelector(".StopBtn");
        var arousalPlayBtn = div.querySelector(".PlayBtn");
        arousalAudioFile.addEventListener("change", () => {
            var reader = new FileReader();
            reader.onload = function(e) {
                aurosalAudio.src = this.result;
            };
            reader.readAsDataURL(arousalAudioFile.files[0]);
            arousalPlayBtn.style.display = "block";
            arousalStopBtn.style.display = "block";
            arousalAddAudioBtn.style.display = "none";
        })
        arousalPlayBtn.addEventListener("click", () => {
            aurosalAudio.play();
            arousalPlayBtn.style.display = "none";
            arousalPauseBtn.style.display = "block";
            arousalStopBtn.style.display = "block";
            arousalAddAudioBtn.style.display = "none";
        })
        arousalPauseBtn.addEventListener("click", () => {
            aurosalAudio.pause();
            arousalPauseBtn.style.display = "none";
            arousalPlayBtn.style.display = "block";
        })
        arousalStopBtn.addEventListener("click", () => {
            aurosalAudio.pause();
            aurosalAudio.currentTime = 0
            arousalPauseBtn.style.display = "none";
            arousalPlayBtn.style.display = "block";
            arousalStopBtn.style.display = "none";
            arousalAddAudioBtn.style.display = "block";
        })
        var audioDropDownArrow = div.querySelector(".audioDropDownArrow");
        var audioDropDownContainer = div.querySelector(".audioDropDownContainer");
        var toogleaudioDropDown = function(e) {
            if (e.target.classList.contains("dropdownAudio"))
                return;
            if (audioDropDownContainer.style.display == "block") {
                audioDropDownArrow.children[0].style.transform = "rotate(0deg)"
                audioDropDownContainer.style.display = "none";
                window.removeEventListener("click", toogleaudioDropDown);
            } else {
                audioDropDownContainer.style.display = "block";
                audioDropDownArrow.children[0].style.transform = "rotate(180deg)"
                window.addEventListener("click", toogleaudioDropDown);
            }
            e.preventDefault();
            e.stopPropagation();
            return false;
        }
        audioDropDownArrow.addEventListener("click", toogleaudioDropDown);
        audioDropDownContainer.addEventListener("click", function(e) {
            if (e.target.classList.contains("dropdownAudio")) {
                aurosalAudio.src = e.target.getAttribute("data-src");
                audioDropDownArrow.children[0].style.transform = "rotate(0deg)"
                audioDropDownContainer.style.display = "none";
                arousalPlayBtn.style.display = "block";
                arousalStopBtn.style.display = "block";
                arousalAddAudioBtn.style.display = "none";
            }
        })
    }

}

function setCookie(c_name, value, exdays) {
    var exdate = new Date();
    exdate.setDate(exdate.getDate() + exdays);
    var c_value = escape(value) + ((exdays == null) ? "" : "; expires=" + exdate.toUTCString());
    document.cookie = c_name + "=" + c_value;
}

function getCookie(c_name) {
    var i, x, y, ARRcookies = document.cookie.split(";");
    for (i = 0; i < ARRcookies.length; i++) {
        x = ARRcookies[i].substr(0, ARRcookies[i].indexOf("="));
        y = ARRcookies[i].substr(ARRcookies[i].indexOf("=") + 1);
        x = x.replace(/^\s+|\s+$/g, "");
        if (x == c_name) {
            return unescape(y);
        }
    }
}

if (getCookie('hrv_inhale') == null) {
    setCookie('hrv_inhale', "1", 1000)
    setCookie('hrv_hold', "3", 1000)
    setCookie('hrv_exhale', "4", 1000)
    setCookie('hrv_hold2', "2", 1000)

}
if (getCookie('multi_inhale') == null) {
    setCookie('multi_inhale', "1", 1000)
    setCookie('multi_hold', "3", 1000)
    setCookie('multi_exhale', "4", 1000)
    setCookie('multi_hold2', "2", 1000)

}