var curPage = -1;
var AurosalRunning = false;
var HeartRateRunning = false;
var TempRunning = false;
var BreatheRunning = false;
var curBreatheTime = 0;
var curMultiBreatheTime = 0;
var curMultiBreatheLastTime = null;
var curBreatheLastTime = null;
var curBreatheTotalTime = 0;
var curMultiBreatheTotalTime = 0;
var arousalInterval = null;
var hrvInterval1 = null;
var hrvInterval2 = null;
var TempInterval = null;
var bloodPressureInterval1 = null;
var bloodPressureInterval2 = null;
var breathingInterval = null;
var MultibreathingInterval = null;
var iframeReloadInterval = null;
var iframeLoaded = false;
var lastReadMessage = 0;
var curActive = -1;
var arousalChart = null;

var Charge = document.querySelector("#charge");
window.addEventListener("DOMContentLoaded", function () {
  var firstVideo = document.querySelector("#firstVideo");
  var secondVideo = document.querySelector("#secondVideo");
  var initialAnimation = document.querySelector(".initialAnimation");
  var tap_to_unmute = document.querySelector(".tap_to_unmute");
  firstVideo.play();
  firstVideo.addEventListener("ended", function () {
    firstVideo.style.display = "none";
    secondVideo.play();
    initialAnimation.style.backgroundColor = "#d3def4";
  });
  secondVideo.addEventListener("ended", function () {
    initialAnimation.style.display = "none";
  });
  var backbuttons = document.querySelectorAll(".backButton");
  backbuttons.forEach((element) => {
    element.addEventListener("click", goback);
  });
  initialAnimation.addEventListener("click", function () {
    tap_to_unmute.style.display = "none";
    secondVideo.muted = false;
  });

  iframeReloadInterval = setInterval(() => {
    if (iframeLoaded == false) {
      document.querySelector("iframe").src = "abc";
      requestAnimationFrame(() => {
        document.querySelector("iframe").src = "http://localhost:8080";
      });
    } else {
      clearInterval(iframeReloadInterval);
    }
  }, 1000);

  var elems = document.querySelector(".TrainingOptions").children;
  for (var i = 0; i < elems.length; i++) {
    const index = i;
    elems[i].addEventListener("click", function () {
      for (var j = 0; j < elems.length; j++) {
        if (index != j) {
          document.querySelector("[data-pageindex='" + j + "']").style.display =
            "none";
        } else {
          curPage = index;
          document.querySelector(
            "[data-pageindex='" + index + "']"
          ).style.display = "block";
          history.pushState(
            { state: curPage },
            "State " + curPage,
            "?state=" + curPage
          );
          requestAnimationFrame(function () {
            document.querySelector(
              "[data-pageindex='" + index + "']"
            ).style.transform = "translateY(0vh)";
            if (!document.querySelector(".Page").classList.contains("hidden")) {
              document.querySelector(".Page").classList += " hidden";
            }
            if (index == 0) {
              curActive = 0;
              time = 0;
              loadArousal();
            } else if (index == 4) {
              curActive = 4;
              time = 0;
              loadMultiChannel();
              renderMultiBreathePath();
            } else if (index == 1) {
              curActive = 1;
              time = 0;
              hrv_lf_dominantCount = 0;
              loadHRV();
              renderBreathePath();
            } else if (index == 2) {
              curActive = 2;
              time = 0;

              loadTemp();
            } else if (index == 3) {
              curActive = 3;
              time = 0;
              multi_lf_dominantCount = 0;
              balance_lf_dominantCount = 0;
              loadBloodPressure();
            }
          });
        }
      }
    });
  }
  window.onpopstate = goback;

  var arousalMinimzeAnimationBtn = document.querySelector(
    "#arousalMinimzeAnimationBtn"
  );
  var arousalShowAnimationBtn = document.querySelector(
    "#arousalShowAnimationBtn"
  );
  var arousalGraph = document.querySelector("#arousalGraph");
  var arousalBodyVideoCont = document
    .querySelector(".arousalBodyCont")
    .querySelector(".videoCont");

  arousalMinimzeAnimationBtn.addEventListener("click", () => {
    arousalBodyVideoCont.style.display = "none";
    arousalMinimzeAnimationBtn.style.display = "none";
    arousalShowAnimationBtn.style.display = "block";
    if (arousalChart != null)
      arousalChart.setSize(
        arousalGraph.getBoundingClientRect().width,
        arousalGraph.getBoundingClientRect().height,
        (doAnimation = false)
      );
  });
  arousalMinimzeAnimationBtn.click();
  arousalShowAnimationBtn.addEventListener("click", () => {
    arousalBodyVideoCont.style.display = "block";
    arousalShowAnimationBtn.style.display = "none";
    arousalMinimzeAnimationBtn.style.display = "block";
    ArousalChoseItemText.innerHTML = "Choose Your Animation";
    aurosalVideo.src = "";
    if (window.innerWidth < 768) {
      if (arousalChart != null)
        arousalChart.setSize(
          arousalGraph.getBoundingClientRect().width,
          arousalGraph.getBoundingClientRect().height,
          (doAnimation = false)
        );
    } else {
      if (arousalChart != null)
        arousalChart.setSize(
          arousalGraph.getBoundingClientRect().width / 2,
          arousalGraph.getBoundingClientRect().height,
          (doAnimation = false)
        );
    }
  });

  var BalanceHideAnimationBtn = document.querySelector(
    "#BalanceHideAnimationBtn"
  );
  var BalanceShowAnimationBtn = document.querySelector(
    "#BalanceShowAnimationBtn"
  );
  var BloodPressureSubGraph2 = document.querySelector(
    "#BloodPressureSubGraph2"
  );
  var balanceVideoCont = document
    .querySelector(".BloodPressureRow1")
    .querySelector(".videoCont");

  BalanceHideAnimationBtn.addEventListener("click", () => {
    balanceVideoCont.style.display = "none";
    BalanceHideAnimationBtn.style.display = "none";
    BalanceShowAnimationBtn.style.display = "block";
    if (bloodPressureChart1_2 != null)
      bloodPressureChart1_2.setSize(
        BloodPressureSubGraph2.getBoundingClientRect().width,
        BloodPressureSubGraph2.getBoundingClientRect().height,
        (doAnimation = false)
      );
  });
  BalanceHideAnimationBtn.click();
  BalanceShowAnimationBtn.addEventListener("click", () => {
    balanceVideoCont.style.display = "block";
    BalanceShowAnimationBtn.style.display = "none";
    BalanceHideAnimationBtn.style.display = "block";
    if (bloodPressureChart1_2 != null)
      bloodPressureChart1_2.setSize(
        BloodPressureSubGraph2.getBoundingClientRect().width,
        BloodPressureSubGraph2.getBoundingClientRect().height,
        (doAnimation = false)
      );
  });

  var ArousalChoseItemText = document.querySelector("#arousalChosenItemText");
  // var PauseAurosalButton = document.querySelector("#PauseAurosalButton");
  var StartAurosalButton = document.querySelector("#StartAurosalButton");
  // PauseAurosalButton.addEventListener("click", () => {
  //     AurosalRunning = false
  //     document.querySelector("#aurosalVideo").pause()
  //     StartAurosalButton.style.display = "block"
  //     PauseAurosalButton.style.display = "none"

  // })
  StartAurosalButton.addEventListener("click", () => {
    AurosalRunning = true;
    // PauseAurosalButton.style.display = "block"
    // StartAurosalButton.style.display = "none"
  });

  var IncInhaleBtn = document.querySelector("#IncInhaleBtn");
  var InhaleVal = document.querySelector("#InhaleVal");
  var DecInhaleBtn = document.querySelector("#DecInhaleBtn");
  var IncHold1Btn = document.querySelector("#IncHold1Btn");
  var Hold1Val = document.querySelector("#Hold1Val");
  var DecHold1Btn = document.querySelector("#DecHold1Btn");
  var IncExhaleBtn = document.querySelector("#IncExhaleBtn");
  var ExhaleVal = document.querySelector("#ExhaleVal");
  var DecExhaleBtn = document.querySelector("#DecExhaleBtn");
  var IncHold2Btn = document.querySelector("#IncHold2Btn");
  var Hold2Val = document.querySelector("#Hold2Val");
  var DecHold2Btn = document.querySelector("#DecHold2Btn");

  InhaleVal.innerHTML = getCookie("hrv_inhale");
  Hold1Val.innerHTML = getCookie("hrv_hold");
  ExhaleVal.innerHTML = getCookie("hrv_exhale");
  Hold2Val.innerHTML = getCookie("hrv_hold2");

  IncInhaleBtn.addEventListener("click", () => {
    InhaleVal.innerHTML = parseFloat(InhaleVal.innerHTML) + 0.5;
    setCookie("hrv_inhale", InhaleVal.innerHTML, 1000);
    renderBreathePath();
  });
  DecInhaleBtn.addEventListener("click", () => {
    InhaleVal.innerHTML = parseFloat(InhaleVal.innerHTML) - 0.5;
    setCookie("hrv_inhale", InhaleVal.innerHTML, 1000);

    renderBreathePath();
  });
  IncHold1Btn.addEventListener("click", () => {
    Hold1Val.innerHTML = parseFloat(Hold1Val.innerHTML) + 0.5;
    setCookie("hrv_hold", Hold1Val.innerHTML, 1000);

    renderBreathePath();
  });
  DecHold1Btn.addEventListener("click", () => {
    Hold1Val.innerHTML = parseFloat(Hold1Val.innerHTML) - 0.5;
    setCookie("hrv_hold", Hold1Val.innerHTML, 1000);

    renderBreathePath();
  });
  IncExhaleBtn.addEventListener("click", () => {
    ExhaleVal.innerHTML = parseFloat(ExhaleVal.innerHTML) + 0.5;
    setCookie("hrv_exhale", ExhaleVal.innerHTML, 1000);

    renderBreathePath();
  });
  DecExhaleBtn.addEventListener("click", () => {
    ExhaleVal.innerHTML = parseFloat(ExhaleVal.innerHTML) - 0.5;
    setCookie("hrv_exhale", ExhaleVal.innerHTML, 1000);

    renderBreathePath();
  });
  IncHold2Btn.addEventListener("click", () => {
    Hold2Val.innerHTML = parseFloat(Hold2Val.innerHTML) + 0.5;
    setCookie("hrv_hold2", Hold2Val.innerHTML, 1000);

    renderBreathePath();
  });
  DecHold2Btn.addEventListener("click", () => {
    Hold2Val.innerHTML = parseFloat(Hold2Val.innerHTML) - 0.5;
    setCookie("hrv_hold2", Hold2Val.innerHTML, 1000);

    renderBreathePath();
  });

  var HeartRatePacerStartButton = document.querySelector(
    "#HeartRatePacerStartButton"
  );
  var HeartRatePacerStopButton = document.querySelector(
    "#HeartRatePacerStopButton"
  );
  HeartRatePacerStartButton.addEventListener("click", () => {
    HeartRatePacerStopButton.style.pointerEvents = "all";
    HeartRatePacerStartButton.style.pointerEvents = "none";
    curBreatheLastTime = new Date();

    breathingInterval = setInterval(() => {
      curBreatheTime += (new Date() - curBreatheLastTime) / 1000;
      curBreatheLastTime = new Date();
      if (curBreatheTime > curBreatheTotalTime) {
        curBreatheLastTime = new Date();
        curBreatheTime = 0;
        //clearInterval(breathingInterval)
        renderMultiBreatheCircle();
        //HeartRatePacerStopButton.style.pointerEvents = "none"
        //HeartRatePacerStartButton.style.pointerEvents = "all"
      }
      renderBreatheCircle();
    }, 30);
  });
  HeartRatePacerStopButton.addEventListener("click", () => {
    HeartRatePacerStopButton.style.pointerEvents = "none";
    HeartRatePacerStartButton.style.pointerEvents = "all";

    curBreatheTime = 0;
    clearInterval(breathingInterval);
    renderBreatheCircle();
  });

  // var MultiHeartRatePacerStartButton = document.querySelector(
  //   "#MultiHeartRatePacerStartButton"
  // );
  // var MultiHeartRatePacerStopButton = document.querySelector(
  //   "#MultiHeartRatePacerStopButton"
  // );
  // MultiHeartRatePacerStartButton.addEventListener("click", () => {
  //   //MultiHeartRatePacerStopButton.style.display = "block";
  //   MultiHeartRatePacerStartButton.style.display = "none";
  //   curMultiBreatheLastTime = new Date();
  //   MultibreathingInterval = setInterval(() => {
  //     curMultiBreatheTime += (new Date() - curMultiBreatheLastTime) / 1000;
  //     curMultiBreatheLastTime = new Date();

  //     if (curMultiBreatheTime > curMultiBreatheTotalTime) {
  //       curMultiBreatheLastTime = new Date();
  //       curMultiBreatheTime = 0;
  //       //clearInterval(MultibreathingInterval)
  //       renderMultiBreatheCircle();
  //       //MultiHeartRatePacerStopButton.style.display = "none"
  //       //MultiHeartRatePacerStartButton.style.display = "block"
  //     }
  //     renderMultiBreathePath();
  //   }, 30);
  // });
  // MultiHeartRatePacerStopButton.addEventListener("click", () => {
  //   MultiHeartRatePacerStopButton.style.display = "none";
  //   MultiHeartRatePacerStartButton.style.display = "block";

  //   curMultiBreatheTime = 0;
  //   clearInterval(MultibreathingInterval);
  //   renderMultiBreathePath();
  // });
  //loadArousalAnim();

  if (window.addEventListener) {
    window.addEventListener("message", handleMessage, false);
  } else if (window.attachEvent) {
    // ie8
    window.attachEvent("onmessage", handleMessage);
  }

  var StartHeartRateButton = document.querySelector("#StartHeartRateButton");
  var PauseHeartRateButton = document.querySelector("#PauseHeartRateButton");
  var HeartRateShowAnimationBtn = document.querySelector(
    "#HeartRateShowAnimationBtn"
  );
  var HeartRateHideAnimationBtn = document.querySelector(
    "#HeartRateHideAnimationBtn"
  );
  var hrvVideoContainer = document.querySelector(".hrvVideoContainer");
  var HeartRateBody2 = document.querySelector(".HeartRateBody2");
  var HeartRateBodyCont = document.querySelector(".HeartRateBodyCont");
  var HeartRateBarGraph = document.querySelector(".HeartRateBarGraph");
  var HeartRateLowerCont = document.querySelector(".HeartRateLowerCont");

  StartHeartRateButton.addEventListener("click", () => {
    HeartRateRunning = true;
    StartHeartRateButton.style.display = "none";
    PauseHeartRateButton.style.display = "block";
  });
  PauseHeartRateButton.addEventListener("click", () => {
    HeartRateRunning = false;
    StartHeartRateButton.style.display = "block";
    PauseHeartRateButton.style.display = "none";
    if (hrvVideo.style.display != "none") hrvVideo.pause();
    else
      hrvIframe.contentWindow.postMessage(
        '{"event":"command","func":"' + "pauseVideo" + '","args":""}',
        "*"
      );
  });

  HeartRateShowAnimationBtn.addEventListener("click", () => {
    hrvVideoContainer.style.display = "block";
    HeartRateShowAnimationBtn.style.display = "none";
    HeartRateHideAnimationBtn.style.display = "block";
    renderBreathePath();
  });
  HeartRateHideAnimationBtn.addEventListener("click", () => {
    hrvVideoContainer.style.display = "none";

    HeartRateShowAnimationBtn.style.display = "block";
    HeartRateHideAnimationBtn.style.display = "none";
  });
  HeartRateHideAnimationBtn.click();

  var StartTempButton = document.querySelector("#StartTempButton");
  //   var PauseTempButton = document.querySelector("#PauseTempButton");
  var TempShowAnimationBtn = document.querySelector("#TempShowAnimationBtn");
  var TempHideAnimationBtn = document.querySelector("#TempHideAnimationBtn");
  var TempBody2 = document.querySelector("#TempBody2");
  var TempBodyCont = document.querySelector("#TempBodyCont");
  var TempGraph = document.querySelector(".TempGraph");
  var TempVideo = document.querySelector("#TempVideo");
  var TempIframe = document.querySelector("#TempIframe");
  var booldPressureVideo = document.querySelector("#booldPressureVideo");
  var booldPressureIframe = document.querySelector("#booldPressureIframe");
  var hrvVideo = document.querySelector("#hrvVideo");
  var hrvIframe = document.querySelector("#hrvIframe");

  StartTempButton.addEventListener("click", () => {
    TempRunning = true;
    // StartTempButton.style.display = "none";
    // PauseTempButton.style.display = "block";
  });
  //   PauseTempButton.addEventListener("click", () => {
  //     TempRunning = false;
  //     StartTempButton.style.display = "block";
  //     PauseTempButton.style.display = "none";
  //     if (TempVideo.style.display != "none") TempVideo.pause();
  //     else
  //       TempIframe.contentWindow.postMessage(
  //         '{"event":"command","func":"' + "pauseVideo" + '","args":""}',
  //         "*"
  //       );
  //   });

  var TempChoseItemText = document.querySelector("#tempChosenItemText");
  TempShowAnimationBtn.addEventListener("click", () => {
    TempBody2.style.display = "block";
    TempChoseItemText.innerHTML = "Choose Your Animation";
    TempVideo.src = "";
    if (window.innerWidth < 768) {
      if (tempChart != null)
        tempChart.setSize(
          TempBodyCont.getBoundingClientRect().width,
          TempGraph.getBoundingClientRect().height,
          (doAnimation = false)
        );
    } else {
      if (tempChart != null)
        tempChart.setSize(
          TempBodyCont.getBoundingClientRect().width / 2,
          TempGraph.getBoundingClientRect().height,
          (doAnimation = false)
        );
    }
    TempShowAnimationBtn.style.display = "none";
    TempHideAnimationBtn.style.display = "block";
  });
  TempHideAnimationBtn.addEventListener("click", () => {
    TempBody2.style.display = "none";

    TempShowAnimationBtn.style.display = "block";
    TempHideAnimationBtn.style.display = "none";
    if (tempChart != null)
      tempChart.setSize(
        TempBodyCont.getBoundingClientRect().width,
        TempGraph.getBoundingClientRect().height,
        (doAnimation = false)
      );
  });
  TempHideAnimationBtn.click();

  var StartBreatheButton = document.querySelector("#StartBreatheButton");
  var PauseBreatheButton = document.querySelector("#PauseBreatheButton");

  StartBreatheButton.addEventListener("click", () => {
    BreatheRunning = true;
    StartBreatheButton.style.display = "none";
    PauseBreatheButton.style.display = "block";
  });
  PauseBreatheButton.addEventListener("click", () => {
    BreatheRunning = false;
    StartBreatheButton.style.display = "block";
    PauseBreatheButton.style.display = "none";
    if (booldPressureVideo.style.display != "none") booldPressureVideo.pause();
    else
      booldPressureIframe.contentWindow.postMessage(
        '{"event":"command","func":"' + "pauseVideo" + '","args":""}',
        "*"
      );
  });

  var tempChange = document.querySelector("#tempChange");
  tempChange.addEventListener("click", () => {
    isCelcius = !isCelcius;
    if (isCelcius) {
      tempChange.innerHTML = "F";
      tempChart.series[0].show();
      tempChart.series[1].hide();
    } else {
      tempChange.innerHTML = "C";
      tempChart.series[1].show();
      tempChart.series[0].hide();
    }
  });

  var MultiIncInhaleBtn = document.querySelector("#MultiIncInhaleBtn");
  var MultiInhaleVal = document.querySelector("#MultiInhaleVal");
  var MultiDecInhaleBtn = document.querySelector("#MultiDecInhaleBtn");
  var MultiIncHold1Btn = document.querySelector("#MultiIncHold1Btn");
  var MultiHold1Val = document.querySelector("#MultiHold1Val");
  var MultiDecHold1Btn = document.querySelector("#MultiDecHold1Btn");
  var MultiIncExhaleBtn = document.querySelector("#MultiIncExhaleBtn");
  var MultiExhaleVal = document.querySelector("#MultiExhaleVal");
  var MultiDecExhaleBtn = document.querySelector("#MultiDecExhaleBtn");
  var MultiIncHold2Btn = document.querySelector("#MultiIncHold2Btn");
  var MultiHold2Val = document.querySelector("#MultiHold2Val");
  var MultiDecHold2Btn = document.querySelector("#MultiDecHold2Btn");

  MultiInhaleVal.innerHTML = getCookie("multi_inhale");
  MultiHold1Val.innerHTML = getCookie("multi_hold");
  MultiExhaleVal.innerHTML = getCookie("multi_exhale");
  MultiHold2Val.innerHTML = getCookie("multi_hold2");

  MultiIncInhaleBtn.addEventListener("click", () => {
    MultiInhaleVal.innerHTML = parseFloat(MultiInhaleVal.innerHTML) + 0.5;
    setCookie("multi_inhale", MultiInhaleVal.innerHTML, 1000);

    renderMultiBreathePath();
  });
  MultiDecInhaleBtn.addEventListener("click", () => {
    MultiInhaleVal.innerHTML = parseFloat(MultiInhaleVal.innerHTML) - 0.5;
    setCookie("multi_inhale", MultiInhaleVal.innerHTML, 1000);

    renderMultiBreathePath();
  });
  MultiIncHold1Btn.addEventListener("click", () => {
    MultiHold1Val.innerHTML = parseFloat(MultiHold1Val.innerHTML) + 0.5;
    setCookie("multi_hold", MultiHold1Val.innerHTML, 1000);

    renderMultiBreathePath();
  });
  MultiDecHold1Btn.addEventListener("click", () => {
    MultiHold1Val.innerHTML = parseFloat(MultiHold1Val.innerHTML) - 0.5;
    setCookie("multi_hold", MultiHold1Val.innerHTML, 1000);
    renderMultiBreathePath();
  });
  MultiIncExhaleBtn.addEventListener("click", () => {
    MultiExhaleVal.innerHTML = parseFloat(MultiExhaleVal.innerHTML) + 0.5;
    setCookie("multi_exhale", MultiExhaleVal.innerHTML, 1000);
    renderMultiBreathePath();
  });
  MultiDecExhaleBtn.addEventListener("click", () => {
    MultiExhaleVal.innerHTML = parseFloat(MultiExhaleVal.innerHTML) - 0.5;
    setCookie("multi_exhale", MultiExhaleVal.innerHTML, 1000);
    renderMultiBreathePath();
  });
  MultiIncHold2Btn.addEventListener("click", () => {
    MultiHold2Val.innerHTML = parseFloat(MultiHold2Val.innerHTML) + 0.5;
    setCookie("multi_hold2", MultiHold2Val.innerHTML, 1000);
    renderMultiBreathePath();
  });
  MultiDecHold2Btn.addEventListener("click", () => {
    MultiHold2Val.innerHTML = parseFloat(MultiHold2Val.innerHTML) - 0.5;
    setCookie("multi_hold2", MultiHold2Val.innerHTML, 1000);
    renderMultiBreathePath();
  });
  new audioClass(document.querySelector(".arousalButtons"));
  new audioClass(document.querySelector(".HeartRateButtons"));
  new audioClass(document.querySelector(".TempHeadCont"));
  new audioClass(document.querySelector(".BloodPressureTitleButtons"));
  new videoDropDown(document.querySelector(".aurosalAnimVideo"));
  new videoDropDown(document.querySelector(".TempVideo"));
  new videoDropDown(document.querySelector(".heartrateAnimVideo"));
  new videoDropDown(document.querySelector(".balanceAnimVideo"));
  new GuidedClass(document.querySelector(".HeartRatePacerButtons"));
  //new GuidedClass(document.querySelector("#MultiAudioButton"));
});

var isCelcius = true;
var initArousal = null;
var time = 0;
var breatheData = [];
var itemsCount = 1500;
var aurosalVideo = document.querySelector("#aurosalVideo");
var aurosalIframe = document.querySelector("#aurosalIframe");
var aurosalAnimVideo = document.querySelector(".aurosalAnimVideo");
var RelaxationLevelValue = document.querySelector("#RelaxationLevelValue");
var TempVideo = document.querySelector("#TempVideo");
var tempvalue = document.querySelector("#tempvalue");
var BloodPressureBeatsValue = document.querySelector(
  "#BloodPressureBeatsValue"
);
var BloodPressureBreathsValue = document.querySelector(
  "#BloodPressureBreathsValue"
);
var multitempvalue = document.querySelector("#MultiTempVal");
var arousalvalue = document.querySelector("#Multiarousalvalue");
var beatvalue = document.querySelector("#Multibeatvalue");
var ArousalVal = document.querySelector("#ArousalVal");
var SliderPercent = document.querySelector("#SliderPercent");
var MultiSliderPercent = document.querySelector("#MultiSliderPercent");
var SliderCircle = document.querySelector("#SliderCircle");
var MultiSliderCircle = document.querySelector("#MultiSliderCircle");
var BalanceSliderCircle = document.querySelector("#BalanceSliderCircle");
var TempVideoCont = document.querySelector(".TempVideo");
var BalanceVideo = document.querySelector(".BalanceVideo");
var HeartRateBody2 = document.querySelector(".HeartRateBody2");
var heartRatelfdomiValue = document.querySelector(".heartRatelfdomiValue");
var multichannelbargraphvalue = document.querySelector(
  ".multichannelbargraphvalue"
);
var BloodPressureBarGraphValue = document.querySelector(
  ".BloodPressureBarGraphValue"
);
var hrvVideoContainer = document.querySelector(".hrvVideoContainer");

ind = 0;
lastHandled = false;
var hev_lf_dominantCount = 0;
var multi_lf_dominantCount = 0;
var balance_lf_dominantCount = 0;

function handleMessage(msg) {
  if (curActive == -1) return;
  data = JSON.parse(msg.data);
  if (data.values[0].hr == null) {
    if (lastHandled) {
      lastHandled = false;
      return;
    }
  }

  lastHandled = true;
  iframeLoaded = true;
  if (curActive == 0 && AurosalRunning) {
    if (data.values[ind].gs != null) {
      var val = parseInt(data.values[ind].gs);
      if (initArousal == null) {
        initArousal = val;
        time = 0;
        arousalChart.series[0].update({
          zones: [
            {
              value: val,
              color: "#67caf2",
            },
            {
              color: "#ff8382",
            },
          ],
        });
      } else {
        if (aurosalAnimVideo.getBoundingClientRect().width != 0) {
          if (initArousal > val) {
            if (aurosalVideo.style.display != "none") aurosalVideo.play();
            else
              aurosalIframe.contentWindow.postMessage(
                '{"event":"command","func":"' + "playVideo" + '","args":""}',
                "*"
              );
          } else {
            if (aurosalVideo.style.display != "none") aurosalVideo.pause();
            else
              aurosalIframe.contentWindow.postMessage(
                '{"event":"command","func":"' + "pauseVideo" + '","args":""}',
                "*"
              );
          }
        } else {
          if (aurosalVideo.style.display != "none") aurosalVideo.pause();
          else
            aurosalIframe.contentWindow.postMessage(
              '{"event":"command","func":"' + "pauseVideo" + '","args":""}',
              "*"
            );
        }
      }
      if (arousalChart.series[0].data.length >= itemsCount)
        arousalChart.series[0].addPoint([time, val], true, true, false);
      else arousalChart.series[0].addPoint([time, val], true, false, false);
      ArousalVal.innerHTML = "AROUSAL LEVEL = " + val;

      time += 100;
    }
  } else if (curActive == 1) {
    if (!HeartRateRunning) return;

    if (data.values[ind].hr != null) {
      var val = parseInt(data.values[ind].hr);
      if (hrvChart.series[0].data.length >= itemsCount)
        hrvChart.series[0].addPoint([time, val], true, true, false);
      else hrvChart.series[0].addPoint([time, val], true, false, false);

      time += 1000;

      if (initHr == null) initHr = val;
      if (HeartRateBody2.getBoundingClientRect().width != 0) {
        if (initHr > val) {
          if (hrvVideoContainer.style.display != "none") hrvVideo.pause();
          else
            hrvIframe.contentWindow.postMessage(
              '{"event":"command","func":"' + "pauseVideo" + '","args":""}',
              "*"
            );
        } else {
          if (hrvVideoContainer.style.display != "none") hrvVideo.play();
          else
            hrvIframe.contentWindow.postMessage(
              '{"event":"command","func":"' + "playVideo" + '","args":""}',
              "*"
            );
        }
      } else {
        if (hrvVideoContainer.style.display != "none") hrvVideo.pause();
        else
          hrvIframe.contentWindow.postMessage(
            '{"event":"command","func":"' + "pauseVideo" + '","args":""}',
            "*"
          );
      }
    }
    if (data.values[ind].v_p_p_e != null) {
      var vlf = parseFloat(data.values[ind].v_p_p_e);
      var lf = parseFloat(data.values[ind].l_p_p_e);
      var hf = parseFloat(data.values[ind].h_p_p_e);
      if (lf > hf && lf > vlf) hrv_lf_dominantCount++;
      hrvBar.series[0].update({
        data: [
          {
            name: "VLF%",
            y: vlf,
          },
          {
            name: "LF%",
            y: lf,
          },
          {
            name: "HF%",
            y: hf,
          },
        ],
      });
      var lfdominant = parseFloat((hrv_lf_dominantCount / (time / 1000)) * 100);
      Charge.style.height = lfdominant + "%";
      // HeartRatePieChart.series[0].update(
      //   {
      //     data: [
      //       {
      //         y: lfdominant,
      //       },
      //       { y: 100 - lfdominant },
      //     ],
      //   },
      //   true,
      //   false,
      //   false
      // );
      heartRatelfdomiValue.innerHTML = lfdominant.toFixed(1);

      var lfdivhf = (lf / hf).toFixed(2);
      RelaxationLevelValue.innerHTML = lfdivhf;
      if (lfdivhf < 1.5) {
        SliderPercent.innerHTML = "0%";
        SliderCircle.style.left = "0%";
      } else if (lfdivhf > 2) {
        SliderPercent.innerHTML = "100%";
        SliderCircle.style.left = "100%";
      } else {
        var pct = (((lfdivhf - 1.5) / 0.5) * 100).toFixed(2);
        SliderPercent.innerHTML = pct + "%";
        SliderCircle.style.left = pct + "%";
      }
    }
  } else if (curActive == 2) {
    if (!TempRunning) return;
    if (data.values[ind].tmp != null) {
      var val = parseInt(data.values[ind].tmp);
      if (initTemp == null) {
        initTemp = val;
        if (isCelcius)
          tempvalue.innerHTML = (val / 100).toFixed(2) + " <sup>o</sup>C";
        else
          tempvalue.innerHTML =
            (((val / 100) * 9) / 5 + 32).toFixed(2) + " <sup>o</sup>F";
        tempChart.series[0].addPoint([time, val / 100], true, false, false);
      } else {
        if (TempVideoCont.getBoundingClientRect().width != 0) {
          if (initTemp > val) {
            if (TempVideo.style.display != "none") TempVideo.pause();
            else
              TempIframe.contentWindow.postMessage(
                '{"event":"command","func":"' + "pauseVideo" + '","args":""}',
                "*"
              );
          } else {
            if (TempVideo.style.display != "none") TempVideo.play();
            else
              TempIframe.contentWindow.postMessage(
                '{"event":"command","func":"' + "playVideo" + '","args":""}',
                "*"
              );
          }
        } else {
          if (TempVideo.style.display != "none") TempVideo.pause();
          else
            TempIframe.contentWindow.postMessage(
              '{"event":"command","func":"' + "pauseVideo" + '","args":""}',
              "*"
            );
        }
        if (isCelcius)
          tempvalue.innerHTML = (val / 100).toFixed(2) + " <sup>o</sup>C";
        else
          tempvalue.innerHTML =
            (((val / 100) * 9) / 5 + 32).toFixed(2) + " <sup>o</sup>F";
        if (tempChart.series[0].data.length >= itemsCount) {
          tempChart.series[0].addPoint([time, val / 100], true, true, false);
          tempChart.series[1].addPoint(
            [time, ((val / 100) * 9) / 5 + 32],
            true,
            true,
            false
          );
        } else {
          tempChart.series[0].addPoint([time, val / 100], true, false, false);
          tempChart.series[1].addPoint(
            [time, ((val / 100) * 9) / 5 + 32],
            true,
            false,
            false
          );
        }
      }
      time += 1000;
    }
  } else if (curActive == 3) {
    if (!BreatheRunning) return;
    if (data.values[ind].hr != null) {
      var val = parseInt(data.values[ind].hr);
      BloodPressureBeatsValue.innerHTML = val;
      if (initBp == null) initBp = val;
      if (BalanceVideo.getBoundingClientRect().width != 0) {
        if (initBp > val) {
          if (booldPressureVideo.style.display != "none")
            booldPressureVideo.pause();
          else
            booldPressureIframe.contentWindow.postMessage(
              '{"event":"command","func":"' + "pauseVideo" + '","args":""}',
              "*"
            );
        } else {
          if (booldPressureVideo.style.display != "none")
            booldPressureVideo.play();
          else
            booldPressureIframe.contentWindow.postMessage(
              '{"event":"command","func":"' + "playVideo" + '","args":""}',
              "*"
            );
        }
      } else {
        if (booldPressureVideo.style.display != "none")
          booldPressureVideo.pause();
        else
          booldPressureIframe.contentWindow.postMessage(
            '{"event":"command","func":"' + "pauseVideo" + '","args":""}',
            "*"
          );
      }
      if (bloodPressureChart2.series[0].data.length >= 1) {
        if (
          bloodPressureChart2.series[0].data[0].x <
          bloodPressureChart2.series[1].data[0].x
        ) {
          bloodPressureChart2.series[0].addPoint(
            [time, val],
            true,
            true,
            false
          );
        } else {
          bloodPressureChart2.series[0].addPoint(
            [time, val],
            true,
            false,
            false
          );
        }
      } else {
        bloodPressureChart2.series[0].addPoint(
          [time, val],
          false,
          false,
          false
        );
      }
    }
    if (data.values[ind].re != null) {
      var val2 = parseInt(data.values[ind].re);
      breatheData.push(val2);
      if (breatheData.length > 500) {
        breatheData.shift();
      }
      if (bloodPressureChart2.series[1].data.length >= itemsCount)
        bloodPressureChart2.series[1].addPoint([time, val2], true, true, false);
      else
        bloodPressureChart2.series[1].addPoint(
          [time, val2],
          true,
          false,
          false
        );

      var val = parseInt(data.values[ind].pr);
      if (bloodPressureChart1_2.series[0].data.length >= itemsCount)
        bloodPressureChart1_2.series[0].addPoint(
          [time, val],
          true,
          true,
          false
        );
      else
        bloodPressureChart1_2.series[0].addPoint(
          [time, val],
          true,
          false,
          false
        );

      time += 1000;
    }

    var vlf = parseFloat(data.values[ind].v_p_p_e);
    var lf = parseFloat(data.values[ind].l_p_p_e);
    var hf = parseFloat(data.values[ind].h_p_p_e);
    var lfdominant = parseFloat(
      (balance_lf_dominantCount / (time / 1000)) * 100
    );
    if (lf > hf && data.values[ind].l_p_p_e > vlf) balance_lf_dominantCount++;
    balanceBar.series[0].update(
      {
        data: [
          {
            y: lfdominant,
          },
          {
            y: 100 - lfdominant,
          },
        ],
      },
      true,
      false,
      false
    );
    BloodPressureBarGraphValue.innerHTML = lfdominant.toFixed(1);

    if (data.values[ind].v_p_p_e != null) {
      var lfdivhf = (
        parseFloat(data.values[ind].l_p_p_e) /
        parseFloat(data.values[ind].h_p_p_e)
      ).toFixed(2);
      if (lfdivhf < 1.5) {
        BalanceSliderPercent.innerHTML = "0%";
        BalanceSliderCircle.style.left = "0%";
      } else if (lfdivhf > 2) {
        BalanceSliderPercent.innerHTML = "100%";
        BalanceSliderCircle.style.left = "100%";
      } else {
        var pct = (((lfdivhf - 1.5) / 0.5) * 100).toFixed(2);
        BalanceSliderPercent.innerHTML = pct + "%";
        BalanceSliderCircle.style.left = pct + "%";
      }
    }
    if (breatheData.length > 11) {
      var sorted = asc(breatheData.slice());
      firstquantile = quantile(sorted, 0.45);
      thirdquantile = quantile(sorted, 0.55);
      upperPart = false;
      var peaks = 0;
      for (var i = 0; i < breatheData.length; i++) {
        if (breatheData[i] > thirdquantile && !upperPart) {
          upperPart = true;
          peaks++;
        } else if (breatheData[i] < firstquantile) {
          upperPart = false;
        }
      }
      if (breatheData.length > 300)
        BloodPressureBreathsValue.innerHTML = (
          (peaks / ((breatheData.length * 1000) / 6)) *
          300000
        ).toFixed(2);
    }
  } else if (curActive == 4) {
    if (data.values[ind].tmp != null) {
      var val = parseInt(data.values[ind].tmp);
      multitempvalue.innerHTML = (val / 100).toFixed(1);
      if (multiTempChart.series[0].data.length >= itemsCount)
        multiTempChart.series[0].addPoint([time, val / 100], true, true, false);
      else
        multiTempChart.series[0].addPoint(
          [time, val / 100],
          true,
          false,
          false
        );
    }
    if (data.values[ind].gs != null) {
      var val = parseInt(data.values[ind].gs);
      arousalvalue.innerHTML = (val / 100).toFixed(1);
      if (multiArousalChart.series[0].data.length >= itemsCount)
        multiArousalChart.series[0].addPoint(
          [time, val / 100],
          true,
          true,
          false
        );
      else
        multiArousalChart.series[0].addPoint(
          [time, val / 100],
          true,
          false,
          false
        );
    }
    if (data.values[ind].hr != null) {
      var val = parseInt(data.values[ind].hr) * 100;
      beatvalue.innerHTML = (val / 100).toFixed(1);
      if (multiBeatChart.series[0].data.length >= itemsCount)
        multiBeatChart.series[0].addPoint([time, val / 100], true, true, false);
      else
        multiBeatChart.series[0].addPoint(
          [time, val / 100],
          true,
          false,
          false
        );
    }
    if (data.values[ind].v_p_p_e != null) {
      var lfdivhf = (
        parseFloat(data.values[ind].l_p_p_e) /
        parseFloat(data.values[ind].h_p_p_e)
      ).toFixed(2);
      if (lfdivhf < 1.5) {
        MultiSliderPercent.innerHTML = "0%";
        MultiSliderCircle.style.left = "0%";
      } else if (lfdivhf > 2) {
        MultiSliderPercent.innerHTML = "100%";
        MultiSliderCircle.style.left = "100%";
      } else {
        var pct = (((lfdivhf - 1.5) / 0.5) * 100).toFixed(2);
        MultiSliderPercent.innerHTML = pct + "%";
        MultiSliderCircle.style.left = pct + "%";
      }
    }
    var vlf = parseFloat(data.values[ind].v_p_p_e);
    var lf = parseFloat(data.values[ind].l_p_p_e);
    var hf = parseFloat(data.values[ind].h_p_p_e);
    if (lf > hf && data.values[ind].l_p_p_e > vlf) multi_lf_dominantCount++;
    var lfdominant = parseFloat((multi_lf_dominantCount / (time / 1000)) * 100);
    multiChannelBar.series[0].update(
      {
        data: [
          {
            y: lfdominant,
          },
          {
            y: 100 - lfdominant,
          },
        ],
      },
      true,
      false,
      false
    );
    multichannelbargraphvalue.innerHTML = lfdominant.toFixed(1);
    time += 1000;
  }
}

function renderBreathePath() {
  var HeartRatePacerGraph = document.querySelector("#HeartRatePacerGraph");
  var BreatheSVG = document.querySelector("#BreatheSVG");
  var BreathePath = document.querySelector("#BreathePath");
  var InhaleVal = parseFloat(document.querySelector("#InhaleVal").innerHTML);
  var Hold1Val = parseFloat(document.querySelector("#Hold1Val").innerHTML);
  var ExhaleVal = parseFloat(document.querySelector("#ExhaleVal").innerHTML);
  var Hold2Val = parseFloat(document.querySelector("#Hold2Val").innerHTML);
  curBreatheTotalTime = InhaleVal + Hold1Val + Hold2Val + ExhaleVal;
  changeBreathePerMinute();
  var lineWidthDivBy2 = 10;
  var svgheight = 150;

  var svgWidth = HeartRatePacerGraph.getBoundingClientRect().width;
  BreatheSVG.setAttribute("height", svgheight);
  BreatheSVG.setAttribute("width", svgWidth);

  var breatheDivByWidth =
    (svgWidth - lineWidthDivBy2 * 2) / curBreatheTotalTime;
  var path =
    "M" +
    lineWidthDivBy2 +
    " " +
    (svgheight - lineWidthDivBy2) +
    " L" +
    (breatheDivByWidth * InhaleVal + lineWidthDivBy2) +
    " " +
    lineWidthDivBy2 +
    " L" +
    breatheDivByWidth * (InhaleVal + Hold1Val) +
    " " +
    lineWidthDivBy2 +
    " L" +
    breatheDivByWidth * (InhaleVal + Hold1Val + ExhaleVal) +
    " " +
    (svgheight - lineWidthDivBy2) +
    " " +
    "L" +
    breatheDivByWidth * (InhaleVal + Hold1Val + ExhaleVal + Hold2Val) +
    " " +
    (svgheight - lineWidthDivBy2);
  BreathePath.setAttribute("d", path);
  curBreatheTime = 0;

  renderBreatheCircle();
}

function renderMultiBreathePath() {
  var HeartRatePacerGraph = document.querySelector("#multiChannelPacerGraph");
  var BreatheSVG = document.querySelector("#multiChannelBreatheSVG");
  var BreathePath = document.querySelector("#multiChannelBreathePath");
  var InhaleVal = parseFloat(
    document.querySelector("#MultiInhaleVal").innerHTML
  );
  var Hold1Val = parseFloat(document.querySelector("#MultiHold1Val").innerHTML);
  var ExhaleVal = parseFloat(
    document.querySelector("#MultiExhaleVal").innerHTML
  );
  var Hold2Val = parseFloat(document.querySelector("#MultiHold2Val").innerHTML);
  curMultiBreatheTotalTime = InhaleVal + Hold1Val + Hold2Val + ExhaleVal;
  document.querySelector("#pacerRateText").innerHTML = (
    60 / curMultiBreatheTotalTime
  ).toFixed(3);
  changeBreathePerMinute();
  var lineWidthDivBy2 = 10;
  var svgheight = 130;

  var svgWidth = HeartRatePacerGraph.getBoundingClientRect().width;
  BreatheSVG.setAttribute("height", svgheight);
  BreatheSVG.setAttribute("width", svgWidth);

  var breatheDivByWidth =
    (svgWidth - lineWidthDivBy2 * 2) / curMultiBreatheTotalTime;
  var path =
    "M" +
    lineWidthDivBy2 +
    " " +
    (svgheight - lineWidthDivBy2) +
    " L" +
    (breatheDivByWidth * InhaleVal + lineWidthDivBy2) +
    " " +
    lineWidthDivBy2 +
    " L" +
    breatheDivByWidth * (InhaleVal + Hold1Val) +
    " " +
    lineWidthDivBy2 +
    " L" +
    breatheDivByWidth * (InhaleVal + Hold1Val + ExhaleVal) +
    " " +
    (svgheight - lineWidthDivBy2) +
    " " +
    "L" +
    breatheDivByWidth * (InhaleVal + Hold1Val + ExhaleVal + Hold2Val) +
    " " +
    (svgheight - lineWidthDivBy2);
  BreathePath.setAttribute("d", path);
  curBreatheTime = 0;

  renderMultiBreatheCircle();
}

function renderMultiBreatheCircle() {
  var curBreatheCircle = document.querySelector(
    "#multiChannelcurBreatheCircle"
  );
  var HeartRatePacerGraph = document.querySelector("#multiChannelPacerGraph");
  var BreatheSVG = document.querySelector("#multiChannelBreatheSVG");
  var InhaleVal = parseFloat(
    document.querySelector("#MultiInhaleVal").innerHTML
  );
  var Hold1Val = parseFloat(document.querySelector("#MultiHold1Val").innerHTML);
  var ExhaleVal = parseFloat(
    document.querySelector("#MultiExhaleVal").innerHTML
  );
  var Hold2Val = parseFloat(document.querySelector("#MultiHold2Val").innerHTML);

  var lineWidthDivBy2 = 10;
  var svgheight = 130;

  var svgWidth = HeartRatePacerGraph.getBoundingClientRect().width;

  var breatheDivByWidth =
    (svgWidth - lineWidthDivBy2 * 2) / curMultiBreatheTotalTime;

  if (curMultiBreatheTime < InhaleVal) {
    curBreatheCircle.setAttribute(
      "cx",
      lineWidthDivBy2 + curMultiBreatheTime * breatheDivByWidth
    );
    curBreatheCircle.setAttribute(
      "cy",
      lineWidthDivBy2 +
        (1 - curMultiBreatheTime / InhaleVal) *
          (svgheight - lineWidthDivBy2 * 2)
    );
  } else if (curMultiBreatheTime < InhaleVal + Hold1Val) {
    curBreatheCircle.setAttribute(
      "cx",
      lineWidthDivBy2 +
        breatheDivByWidth * InhaleVal +
        (curMultiBreatheTime - InhaleVal) * breatheDivByWidth
    );
    curBreatheCircle.setAttribute("cy", lineWidthDivBy2);
  } else if (curMultiBreatheTime < InhaleVal + Hold1Val + ExhaleVal) {
    curBreatheCircle.setAttribute(
      "cx",
      breatheDivByWidth * (InhaleVal + Hold1Val) +
        (curMultiBreatheTime - InhaleVal - Hold1Val) * breatheDivByWidth
    );
    curBreatheCircle.setAttribute(
      "cy",
      lineWidthDivBy2 +
        ((curMultiBreatheTime - InhaleVal - Hold1Val) / ExhaleVal) *
          (svgheight - lineWidthDivBy2 * 2)
    );
  } else {
    curBreatheCircle.setAttribute(
      "cx",
      breatheDivByWidth * (InhaleVal + Hold1Val + ExhaleVal) +
        (curMultiBreatheTime - InhaleVal - ExhaleVal - Hold1Val) *
          breatheDivByWidth
    );
    curBreatheCircle.setAttribute("cy", svgheight - lineWidthDivBy2);
  }
}

function changeBreathePerMinute() {
  document.querySelector("#breatherate").innerHTML =
    "Pacer rate=" + 60 / curBreatheTotalTime + " breaths per minute";
}

function renderBreatheCircle() {
  var curBreatheCircle = document.querySelector("#curBreatheCircle");
  var HeartRatePacerGraph = document.querySelector("#HeartRatePacerGraph");
  var BreatheSVG = document.querySelector("#BreatheSVG");
  var InhaleVal = parseFloat(document.querySelector("#InhaleVal").innerHTML);
  var Hold1Val = parseFloat(document.querySelector("#Hold1Val").innerHTML);
  var ExhaleVal = parseFloat(document.querySelector("#ExhaleVal").innerHTML);
  var Hold2Val = parseFloat(document.querySelector("#Hold2Val").innerHTML);

  var lineWidthDivBy2 = 10;
  var svgheight = 150;

  var svgWidth = HeartRatePacerGraph.getBoundingClientRect().width;

  var breatheDivByWidth =
    (svgWidth - lineWidthDivBy2 * 2) / curBreatheTotalTime;

  if (curBreatheTime < InhaleVal) {
    curBreatheCircle.setAttribute(
      "cx",
      lineWidthDivBy2 + curBreatheTime * breatheDivByWidth
    );
    curBreatheCircle.setAttribute(
      "cy",
      lineWidthDivBy2 +
        (1 - curBreatheTime / InhaleVal) * (svgheight - lineWidthDivBy2 * 2)
    );
  } else if (curBreatheTime < InhaleVal + Hold1Val) {
    curBreatheCircle.setAttribute(
      "cx",
      lineWidthDivBy2 +
        breatheDivByWidth * InhaleVal +
        (curBreatheTime - InhaleVal) * breatheDivByWidth
    );
    curBreatheCircle.setAttribute("cy", lineWidthDivBy2);
  } else if (curBreatheTime < InhaleVal + Hold1Val + ExhaleVal) {
    curBreatheCircle.setAttribute(
      "cx",
      breatheDivByWidth * (InhaleVal + Hold1Val) +
        (curBreatheTime - InhaleVal - Hold1Val) * breatheDivByWidth
    );
    curBreatheCircle.setAttribute(
      "cy",
      lineWidthDivBy2 +
        ((curBreatheTime - InhaleVal - Hold1Val) / ExhaleVal) *
          (svgheight - lineWidthDivBy2 * 2)
    );
  } else {
    curBreatheCircle.setAttribute(
      "cx",
      breatheDivByWidth * (InhaleVal + Hold1Val + ExhaleVal) +
        (curBreatheTime - InhaleVal - ExhaleVal - Hold1Val) * breatheDivByWidth
    );
    curBreatheCircle.setAttribute("cy", svgheight - lineWidthDivBy2);
  }
}

var bloodPressureChart2 = null;
var bloodPressureChart1_2 = null;
var balanceBar = null;

function loadBloodPressure() {
  bloodPressureChart1_2 = Highcharts.stockChart("BloodPressureSubGraph2", {
    xAxis: {
      type: "datetime",
      labels: {
        format: "{value:%H:%M:%S}",
        style: {
          color: "#0080FF",
        },
      },
    },
    yAxis: {
      labels: {
        style: {
          color: "#0080FF",
        },
      },
      title: {
        text: "",
      },
      gridLineColor: "#FFF3",
    },
    plotOptions: {
      series: {
        enableMouseTracking: false,
        states: {
          hover: {
            enabled: false,
          },
        },
      },
    },

    tooltip: {
      enabled: false,

      valueDecimals: 2,
      shared: true,
      headerFormat: "Session_time: {point.x:%H:%M:%S}<br/>",
    },
    rangeSelector: {
      enabled: false,
    },
    chart: {
      panning: true,
      alignTicks: false,
      backgroundColor: "rgba(0,0,0,0)",
    },
    navigator: {
      enabled: false,
    },
    scrollbar: {
      enabled: false,
    },
    series: [
      {
        name: "Blood Pressure 2",
        data: [],
        color: {
          linearGradient: {
            x1: 0,
            y1: 0,
            x2: 0,
            y2: 1,
          },
          stops: [
            [0, "blue"],
            [0.5, "green"],
            [1, "red"],
          ],
        },
      },
    ],
  });
  bloodPressureChart2 = Highcharts.stockChart("BloodPressureMainGraph", {
    xAxis: {
      type: "datetime",
      labels: {
        format: "{value:%H:%M:%S}",
        style: {
          color: "#0080FF",
        },
      },
    },
    title: {
      text: "Blood preassure-לחץ דם",
      style: {
        color: "#0080FF",
      },
    },
    yAxis: [
      {
        labels: {
          style: {
            color: "#FF0000",
          },
        },
        title: {
          text: "",
        },
        gridLineColor: "#FFF3",
      },
      {
        labels: {
          style: {
            color: "#0080FF",
          },
        },
        title: {
          text: "",
        },
        gridLineColor: "#FFF3",
      },
    ],

    plotOptions: {
      series: {
        enableMouseTracking: false,
        states: {
          hover: {
            enabled: false,
          },
        },
      },
    },

    tooltip: {
      enabled: false,
      valueDecimals: 2,
      shared: true,
      headerFormat: "Session_time: {point.x:%H:%M:%S}<br/>",
    },
    rangeSelector: {
      enabled: false,
    },
    chart: {
      panning: true,
      alignTicks: false,
      backgroundColor: "rgba(0,0,0,0)",
    },
    navigator: {
      enabled: false,
    },
    scrollbar: {
      enabled: false,
    },
    series: [
      {
        name: "Beats per minute",
        color: "#ff0000",
        data: [],
        type: "spline",
      },
      {
        name: "Breaths per minute",
        color: "#0080ff",
        data: [],
        yAxis: 1,
        type: "spline",
      },
    ],
  });
  if (balanceBar != null) return;
  balanceBar = Highcharts.chart("BloodPressureBarGraph", {
    chart: {
      plotBackgroundColor: null,
      plotBorderWidth: null,
      plotShadow: false,
      type: "pie",
      backgroundColor: "rgba(0,0,0,0)",
      width: 100,
      animation: false,
      height: 200,
    },
    title: {
      text: "%lf dominant",
      style: {
        color: "#0080FF",
        fontSize: "14px",
      },
    },
    series: [
      {
        name: "Value",
        colorByPoint: true,
        animation: false,

        data: [
          {
            name: "%lf dominant",
            y: 100.0,
            color: "#90ed7d",
          },
          {
            name: "",
            y: 0,
            color: "transparent",
          },
        ],
      },
    ],
  });
}

var hrvChart = null;
var hrvBar = null;
var HeartRatePieChart = null;

function loadHRV() {
  hrvChart = Highcharts.stockChart("HeartRateLowerCont", {
    title: {
      text: "Heart rate- דופק",
      style: {
        color: "#0080FF",
      },
    },
    xAxis: {
      type: "datetime",
      labels: {
        format: "{value:%H:%M:%S}",
        style: {
          color: "#0080FF",
        },
      },
    },
    yAxis: {
      labels: {
        style: {
          color: "#0080FF",
        },
      },
      title: {
        text: "",
      },
      gridLineColor: "#FFF3",
    },
    plotOptions: {
      series: {
        enableMouseTracking: false,
        states: {
          hover: {
            enabled: false,
          },
        },
      },
    },

    tooltip: {
      enabled: false,
      valueDecimals: 2,
      shared: true,
      headerFormat: "Session_time: {point.x:%H:%M:%S}<br/>",
    },
    rangeSelector: {
      enabled: false,
    },
    chart: {
      panning: true,
      alignTicks: false,
      backgroundColor: "rgba(0,0,0,0)",
    },
    navigator: {
      enabled: false,
    },
    scrollbar: {
      enabled: false,
    },
    series: [
      {
        data: [],
        type: "spline",
      },
    ],
  });
  if (hrvBar != null) return;
  hrvBar = Highcharts.chart("HeartRateBarGraph", {
    legend: { enabled: false },
    title: {
      text: "",
    },
    chart: {
      type: "column",
      backgroundColor: "rgba(0,0,0,0)",
      width: 200,
      animation: false,
    },
    xAxis: {
      type: "category",
      labels: {
        style: {
          color: "#0080FF",
        },
      },
    },
    yAxis: {
      title: {
        text: "",
        style: {
          color: "#0080FF",
        },
      },
      labels: {
        style: {
          color: "#0080FF",
        },
      },
      gridLineColor: "#FFF3",
    },
    legend: {
      enabled: false,
    },
    plotOptions: {
      series: {
        enableMouseTracking: false,
        borderWidth: 0,
        dataLabels: {
          enabled: true,
          format: "{point.y:.1f}",
        },
      },
    },

    tooltip: {
      headerFormat: '<span style="font-size:11px">{series.name}</span><br>',
      pointFormat:
        '<span style="color:{point.color}">{point.name}</span>: <b>{point.y:.2f}%</b> of total<br/>',
    },

    series: [
      {
        name: "",
        colorByPoint: true,
        data: [
          {
            name: "VLF%",
            y: 0,
            color: "#7cb5ec",
            pointWidth: 30,
          },
          {
            name: "LF%",
            y: 0,
            color: "#90ed7d",
            pointWidth: 50,
          },
          {
            name: "HF%",
            y: 0,
            color: "#434348",
            pointWidth: 30,
          },
        ],
      },
    ],
  });
  if (HeartRatePieChart != null) return;

  // HeartRatePieChart = Highcharts.chart("HeartRatePieChart", {
  //   chart: {
  //     plotBackgroundColor: null,
  //     plotBorderWidth: null,
  //     plotShadow: false,
  //     type: "pie",
  //     backgroundColor: "rgba(0,0,0,0)",
  //     animation: false,

  //     width: 100,
  //     height: 150,
  //   },
  //   title: {
  //     text: "%lf dominant",
  //     style: {
  //       color: "#0080FF",
  //       fontSize: "14px",
  //     },
  //   },
  //   series: [
  //     {
  //       name: "Value",
  //       colorByPoint: true,
  //       animation: false,

  //       data: [
  //         {
  //           name: "%lf dominant",
  //           y: 100.0,
  //           color: "#90ed7d",
  //         },
  //         {
  //           name: "",
  //           y: 0,
  //           color: "transparent",
  //         },
  //       ],
  //     },
  //   ],
  // });
}
var tempChart = null;
var initTemp = null;
var initHr = null;
var initBp = null;

function loadTemp() {
  tempChart = Highcharts.stockChart("TempGraph", {
    title: {
      text: "",
      style: {
        color: "#0080FF",
      },
    },
    xAxis: {
      type: "datetime",
      labels: {
        format: "{value:%H:%M:%S}",
        style: {
          color: "#0080FF",
        },
      },
    },
    yAxis: {
      labels: {
        style: {
          color: "#0080FF",
        },
      },
      title: {
        text: "",
      },
      gridLineColor: "#FFF3",
    },
    plotOptions: {
      series: {
        enableMouseTracking: false,
        states: {
          hover: {
            enabled: false,
          },
        },
      },
    },

    tooltip: {
      enabled: false,
      valueDecimals: 2,
      shared: true,
      headerFormat: "Session_time: {point.x:%H:%M:%S}<br/>",
    },
    rangeSelector: {
      enabled: false,
    },
    chart: {
      panning: true,
      alignTicks: false,
      backgroundColor: "rgba(0,0,0,0)",
    },
    navigator: {
      enabled: false,
    },
    scrollbar: {
      enabled: false,
    },
    series: [
      {
        name: "Celcius",
        data: [],
        type: "spline",
      },
      {
        name: "Farenheit",
        data: [],
        visible: false,
        color: "#ff8080",
        type: "spline",
      },
    ],
  });
}

function loadArousal() {
  arousalChart = Highcharts.chart("arousalGraph", {
    legend: { enabled: false },
    title: {
      text: "",
      style: {
        color: "#0080FF",
      },
    },
    xAxis: {
      type: "datetime",
      isDirty: true,
      labels: {
        format: "{value:%H:%M:%S}",
        style: {
          color: "#0080FF",
        },
      },
      title: {
        text: "Time reading in seconds",
        style: {
          color: "#0080FF",
        },
      },
    },
    yAxis: {
      labels: {
        style: {
          color: "#0080FF",
        },
      },
      title: {
        text: "Arousal value",
        style: {
          color: "#0080FF",
        },
      },
      gridLineColor: "#FFF3",
    },
    plotOptions: {
      series: {
        enableMouseTracking: false,
        states: {
          hover: {
            enabled: false,
          },
        },
      },
    },

    tooltip: {
      enabled: false,
      valueDecimals: 2,
      shared: true,
      headerFormat: "Session_time: {point.x:%H:%M:%S}<br/>",
    },
    rangeSelector: {
      enabled: false,
    },
    chart: {
      panning: true,
      alignTicks: false,
      backgroundColor: "rgba(0,0,0,0)",
    },
    navigator: {
      enabled: false,
    },
    scrollbar: {
      enabled: false,
    },
    series: [
      {
        data: [],
        zoneAxis: "y",
        marker: {
          enabled: false,
        },
        type: "spline",
      },
    ],
  });
}

var multiArousalChart = null;
var multiTempChart = null;
var multiBeatChart = null;
var multiChannelBar = null;

function loadMultiChannel() {
  multiArousalChart = Highcharts.chart("MultiChannelArousalChart", {
    legend: { enabled: false },
    title: {
      text: "Arousal",
      style: {
        color: "#0080FF",
      },
    },
    xAxis: {
      type: "datetime",
      labels: {
        format: "{value:%H:%M:%S}",
        style: {
          color: "#FFF",
        },
      },
    },
    yAxis: {
      labels: {
        style: {
          color: "#0080FF",
        },
      },
      title: {
        text: "",
      },
      gridLineColor: "#FFF3",
    },

    plotOptions: {
      series: {
        enableMouseTracking: false,
        states: {
          hover: {
            enabled: false,
          },
        },
      },
    },

    tooltip: {
      enabled: false,
      valueDecimals: 2,
      shared: true,
      headerFormat: "Session_time: {point.x:%H:%M:%S}<br/>",
    },
    rangeSelector: {
      enabled: false,
    },
    chart: {
      panning: true,
      alignTicks: false,
      backgroundColor: "rgba(0,0,0,0)",
    },
    navigator: {
      enabled: false,
    },
    scrollbar: {
      enabled: false,
    },
    series: [
      {
        data: [],
        color: "#a1c696",
        marker: {
          enabled: false,
        },
        type: "spline",
      },
    ],
  });
  multiTempChart = Highcharts.chart("MultiChannelTempChart", {
    legend: { enabled: false },
    title: {
      text: "Temperature",
      style: {
        color: "#0080FF",
      },
    },
    xAxis: {
      type: "datetime",
      labels: {
        format: "{value:%H:%M:%S}",
        style: {
          color: "#0080FF",
        },
      },
    },
    yAxis: {
      labels: {
        style: {
          color: "#0080FF",
        },
      },
      title: {
        text: "",
      },
      gridLineColor: "#FFF3",
    },
    plotOptions: {
      series: {
        enableMouseTracking: false,
        states: {
          hover: {
            enabled: false,
          },
        },
      },
    },

    tooltip: {
      enabled: false,
      valueDecimals: 2,
      shared: true,
      headerFormat: "Session_time: {point.x:%H:%M:%S}<br/>",
    },
    rangeSelector: {
      enabled: false,
    },
    chart: {
      panning: true,
      alignTicks: false,
      backgroundColor: "rgba(0,0,0,0)",
    },
    navigator: {
      enabled: false,
    },
    scrollbar: {
      enabled: false,
    },
    series: [
      {
        data: [],
        color: "#FFA500",
        marker: {
          enabled: false,
        },
        type: "spline",
      },
    ],
  });
  multiBeatChart = Highcharts.chart("MultiChannelBeatChart", {
    legend: { enabled: false },
    title: {
      text: "Beat",
      style: {
        color: "#0080FF",
      },
    },
    xAxis: {
      type: "datetime",
      labels: {
        format: "{value:%H:%M:%S}",
        style: {
          color: "#0080FF",
        },
      },
    },
    yAxis: {
      labels: {
        style: {
          color: "#0080FF",
        },
      },
      title: {
        text: "",
      },
      lineColor: "#F00",
      gridLineColor: "#FFF3",
    },
    plotOptions: {
      series: {
        enableMouseTracking: false,
        states: {
          hover: {
            enabled: false,
          },
        },
      },
    },

    tooltip: {
      enabled: false,
      valueDecimals: 2,
      shared: true,
      headerFormat: "Session_time: {point.x:%H:%M:%S}<br/>",
    },
    rangeSelector: {
      enabled: false,
    },
    chart: {
      panning: true,
      alignTicks: false,
      backgroundColor: "rgba(0,0,0,0)",
    },
    legend: { enabled: false },
    navigator: {
      enabled: false,
    },
    scrollbar: {
      enabled: false,
    },
    series: [
      {
        data: [],
        color: "#ff0000",
        marker: {
          enabled: false,
        },
        type: "spline",
      },
    ],
  });
  if (multiChannelBar != null) return;
  multiChannelBar = Highcharts.chart("MultiChannelBarGraph", {
    chart: {
      plotBackgroundColor: null,
      plotBorderWidth: null,
      plotShadow: false,
      type: "pie",
      backgroundColor: "rgba(0,0,0,0)",

      height: 130,
      width: 100,
    },
    title: {
      text: "%lf dominant",
      style: {
        color: "#0080FF",
        fontSize: "14px",
      },
    },
    series: [
      {
        name: "Value",
        colorByPoint: true,
        animation: false,

        data: [
          {
            name: "%lf dominant",
            y: 100.0,
            color: "#90ed7d",
          },
          {
            name: "",
            y: 0,
            color: "transparent",
          },
        ],
      },
    ],
  });
}

function goback() {
  curActive = -1;
  document.querySelector("[data-pageindex='" + curPage + "']").style.transform =
    "translateY(100vh)";
  setTimeout(function () {
    document.querySelector("[data-pageindex='" + curPage + "']").style.display =
      "none";
    if (document.querySelector(".Page").classList.contains("hidden")) {
      document.querySelector(".Page").classList.remove("hidden");
    }
  }, 500);
  if (curPage == 0) {
    clearInterval(arousalInterval);
    document
      .querySelector("[data-pageindex='0']")
      .querySelector("video")
      .pause();
    document
      .querySelector("[data-pageindex='0']")
      .querySelector("iframe")
      .contentWindow.postMessage(
        '{"event":"command","func":"' + "pauseVideo" + '","args":""}',
        "*"
      );
    document
      .querySelector("[data-pageindex='0']")
      .querySelector("video").currentTime = 0;
  } else if (curPage == 1) {
    clearInterval(hrvInterval1);
    clearInterval(hrvInterval2);
    document
      .querySelector("[data-pageindex='1']")
      .querySelector("video")
      .pause();
    document
      .querySelector("[data-pageindex='1']")
      .querySelector("video").currentTime = 0;

    document
      .querySelector("[data-pageindex='1']")
      .querySelector("iframe")
      .contentWindow.postMessage(
        '{"event":"command","func":"' + "pauseVideo" + '","args":""}',
        "*"
      );
  } else if (curPage == 2) {
    clearInterval(TempInterval);
    document
      .querySelector("[data-pageindex='2']")
      .querySelector("video")
      .pause();
    document
      .querySelector("[data-pageindex='2']")
      .querySelector("video").currentTime = 0;
    document
      .querySelector("[data-pageindex='2']")
      .querySelector("iframe")
      .contentWindow.postMessage(
        '{"event":"command","func":"' + "pauseVideo" + '","args":""}',
        "*"
      );
  } else if (curPage == 3) {
    clearInterval(bloodPressureInterval1);
    clearInterval(bloodPressureInterval2);
    document
      .querySelector("[data-pageindex='3']")
      .querySelector("video")
      .pause();
    document
      .querySelector("[data-pageindex='3']")
      .querySelector("video").currentTime = 0;
    document
      .querySelector("[data-pageindex='3']")
      .querySelector("iframe")
      .contentWindow.postMessage(
        '{"event":"command","func":"' + "pauseVideo" + '","args":""}',
        "*"
      );
  } else if (curPage == 4) {
  }
}

// sort array ascending
const asc = (arr) => arr.sort((a, b) => a - b);

const sum = (arr) => arr.reduce((a, b) => a + b, 0);

const mean = (arr) => sum(arr) / arr.length;

// sample standard deviation
const std = (arr) => {
  const mu = mean(arr);
  const diffArr = arr.map((a) => (a - mu) ** 2);
  return Math.sqrt(sum(diffArr) / (arr.length - 1));
};

const quantile = (sorted, q) => {
  const pos = (sorted.length - 1) * q;
  const base = Math.floor(pos);
  const rest = pos - base;
  if (sorted[base + 1] !== undefined) {
    return sorted[base] + rest * (sorted[base + 1] - sorted[base]);
  } else {
    return sorted[base];
  }
};

function expand(e) {
  e.style.display = "none";
  e.parentNode.children[1].style.display = "block";
  document.querySelector(".multiChannelbreathsCont").style.display = "none";
  var nodes = e.parentNode.parentNode.parentNode.children;
  for (var i = 0; i < nodes.length; i++) {
    if (nodes[i] != e.parentNode.parentNode) {
      nodes[i].style.display = "none";
    }
  }
  var parent = e.parentNode.parentNode.querySelector(".graphCont");
  if (
    e.parentNode.parentNode.querySelector("#MultiChannelArousalChart") != null
  ) {
    if (multiArousalChart != null)
      multiArousalChart.setSize(
        parent.getBoundingClientRect().width,
        parent.getBoundingClientRect().height - 20,
        (doAnimation = false)
      );
  } else if (
    e.parentNode.parentNode.querySelector("#MultiChannelTempChart") != null
  ) {
    if (multiArousalChart != null)
      multiTempChart.setSize(
        parent.getBoundingClientRect().width,
        parent.getBoundingClientRect().height - 20,
        (doAnimation = false)
      );
  } else if (
    e.parentNode.parentNode.querySelector("#MultiChannelBeatChart") != null
  ) {
    if (multiArousalChart != null)
      multiBeatChart.setSize(
        parent.getBoundingClientRect().width,
        parent.getBoundingClientRect().height - 20,
        (doAnimation = false)
      );
  }
}

function shrink(e) {
  e.style.display = "none";
  e.parentNode.children[0].style.display = "block";
  document.querySelector(".multiChannelbreathsCont").style.display = "block";
  var nodes = e.parentNode.parentNode.parentNode.children;
  for (var i = 0; i < nodes.length; i++) {
    nodes[i].style.display = "flex";
  }
  var parent = document.querySelector("#MultiChannelArousalChart").parentNode;
  console.log(parent.getBoundingClientRect().width);

  if (multiArousalChart != null)
    multiArousalChart.setSize(
      parent.getBoundingClientRect().width - 20,
      parent.getBoundingClientRect().height - 20,
      (doAnimation = false)
    );
  if (multiTempChart != null)
    multiTempChart.setSize(
      parent.getBoundingClientRect().width - 20,
      parent.getBoundingClientRect().height - 20,
      (doAnimation = false)
    );
  if (multiBeatChart != null)
    multiBeatChart.setSize(
      parent.getBoundingClientRect().width - 20,
      parent.getBoundingClientRect().height - 20,
      (doAnimation = false)
    );
}
