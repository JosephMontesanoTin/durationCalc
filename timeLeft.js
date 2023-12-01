let firstCalc = true;
//this value is used to check if this is the first time the calculation is running
//the first time it runs it builds the divs needed for the weeks
let upLiftSelected = false;
let daySelected = true;
let checkValue = Number(document.querySelector("#mde").value);
let dayCount;
//this value is used as a general number to give users a baseline of where they want to be able to end their test
//currently its 2.5 for uplift, and 5 for MDE
//both of these numbers are arbitrary and oversimplify the decision of choosing when to end an test
//Howevery, they can possibly be useful for a quick and easy method of intepreting possible breakpoints
function upliftAtXDay(baseCVR, numberOfUsersAtXDay, critScore) {
  //console.log(critScore);
  let mde = Math.sqrt(baseCVR * (1 - baseCVR)) / (Math.sqrt(numberOfUsersAtXDay / critScore) * baseCVR);
  return (mde * 100).toFixed(2);
}

function newCVRAtXDay(baseCVR, numberOfUsersAtXDay, critScore) {
  let mde = Math.sqrt(baseCVR * (1 - baseCVR)) / (Math.sqrt(numberOfUsersAtXDay / critScore) * baseCVR);
  return (baseCVR * 100 + (baseCVR * mde * 100 * 100) / 100).toFixed(2);
}

function trafficNeeded(baseCVR, variationCVR, critScore, numOfVariations) {
  //calculates total traffic for
  let trafficNeeded = critScore * Math.pow(Math.sqrt(baseCVR * (1 - baseCVR)) / (baseCVR * (variationCVR / 100)), 2);
  return Math.round(trafficNeeded * numOfVariations);
  //console.log(trafficNeeded);
}

function colorGenerator(trafficRequired, currentTraffic, dailyVisitors) {
  let daysRemaining = (trafficRequired - currentTraffic) / dailyVisitors;
  if (daysRemaining < 7) {
    return "gold";
  } else if (daysRemaining < 14) {
    return "green";
  } else {
    return "red";
  }
}

function calcSampleSize() {
  message = "improvement percentage";
  graphLabel = "Improvement percentage";
  let critScore = 2 * Math.pow(Number(document.querySelector("#power-level").value) + Number(document.querySelector("#sig-level").value), 2);
  let baseCVR = document.querySelector("#baseCVR").value / 100;
  let newCVR;

  if (firstCalc) {
    document.querySelector(".mde-label").innerText = `Expected Improvement Percentage:`;
    document.querySelector("#mde").value = document.querySelector("#mde").value / baseCVR;
    checkValue = Math.abs(Number(document.querySelector("#mde").value));
  } else if (!firstCalc) {
    checkValue = Math.abs(Number(document.querySelector("#mde").value));
  }

  let dailyVisitors = document.querySelector("#currentTraffic").value / document.querySelector("#days").value;

  if (upLiftSelected) {
    newCVR = "";
  }

  dailyVisitorsPerVariation = dailyVisitors / (Number(document.querySelector("#variations").value) + 1);

  let mde = document.querySelector("#mde").value / 100 / baseCVR;

  let calculationInbetween = Math.sqrt(baseCVR * (1 - baseCVR)) / (baseCVR * mde);
  let sampleSize = document.querySelector("#variations").value * (critScore * Math.pow(calculationInbetween, 2));

  let weeksOfTest = 8;
  if (firstCalc) {
    for (i = 1; i < weeksOfTest; i++) {
      let weekDiv = document.createElement("div");
      let numberOfUsersatXWeek = i * 7 * dailyVisitorsPerVariation;
      let weeklyUpflit = upliftAtXDay(baseCVR, numberOfUsersatXWeek, critScore);
      weekDiv.innerHTML = `<span>Week ${i}: </span><span class="week-results ${
        weeklyUpflit <= checkValue ? "green-text" : "red-text"
      } week-${i}-results">${weeklyUpflit}%</span><span class="newCVR-${i}"> or a new CVR of ${newCVRAtXDay(baseCVR, numberOfUsersatXWeek, critScore)}</span>`;
      weekDiv.classList.add(`week-holder`);
      document.querySelector(".week-info").append(weekDiv);
      firstCalc = false;
    }
  } else {
    for (i = 1; i < weeksOfTest; i++) {
      let numberOfUsersatXWeek = i * 7 * dailyVisitorsPerVariation;
      let weeklyUpflit = upliftAtXDay(baseCVR, numberOfUsersatXWeek, critScore);
      document.querySelector(`.week-${i}-results`).outerHTML = `<span class="week-results ${weeklyUpflit <= checkValue ? "green-text" : "red-text"} week-${i}-results">${weeklyUpflit}%</span>`;
      document.querySelector(`.newCVR-${i}`).innerText = ` or a new CVR of ${newCVRAtXDay(baseCVR, numberOfUsersatXWeek, critScore)}`;
    }
  }

  if (document.querySelector(".green-text")) {
    let weeksToTest = document.querySelector(".green-text").parentElement.querySelector("span").innerText.match(/\d+/)[0];
    let weekErrorClasses = "hide weekError";
    if (weeksToTest < 2) {
      weeksToTest = 2;
      weekErrorClasses = "weekError";
    }
    document.querySelector(
      ".day-answer"
    ).innerHTML = `It will take at least <span class="underline">${weeksToTest} weeks</span> to confirm your results<div class="${weekErrorClasses}">Tests should always run at least 2 weeks including weekends.</div>`;
  } else {
    document.querySelector(".day-answer").innerHTML = `It will take over <span class="underline">seven weeks</span> to confirm your results`;
  }

  //BELOW IS MESSAGING FOR DAYS

  let trafficRequired = trafficNeeded(baseCVR, checkValue, critScore, Number(document.querySelector("#variations").value) + 1);
  let currentTraffic = document.querySelector("#currentTraffic").value;
  let currentDays = document.querySelector("#days").value;

  let newColor = colorGenerator(trafficRequired, currentTraffic, dailyVisitors);

  if (trafficRequired > currentTraffic) {
    document.querySelector(".day-answer").innerHTML = `It will take an additional <span class="${newColor}">${trafficRequired - currentTraffic}</span> visitors, or <span class="${newColor}">${
      Math.round(trafficRequired / dailyVisitors) - currentDays
    }</span> more days <div>to have a representative sample size.*</div><div class="percentage">This KPI has <span class="${newColor}">${Math.round(
      (currentTraffic / trafficRequired) * 100
    )}%</span> of the traffic for a representative sample size*</div>`;
  } else {
    document.querySelector(".day-answer").innerHTML = `You have enough traffic to conclude this KPI!`;
  }

  //ABOVE IS MESSAGING FOR DAYS

  //console.log(checkValue);
  let xValues = [];
  let yValues = [];

  let daysOfTest = 32;

  for (i = 1; i < daysOfTest; i += 1) {
    let numberOfUsersatXday = i * dailyVisitorsPerVariation;
    yValues[i] = upliftAtXDay(baseCVR, numberOfUsersatXday, critScore);
    xValues[i] = i;
  }

  new Chart("myChart", {
    type: "line",
    options: {
      title: {
        display: true,
        text: `Trackable ${message}`,
        fontSize: "24",
        fontColor: "#111111",
      },
      legend: {
        display: true,
        fontColor: "rgb(255, 99, 132)",
        position: "left",
        usePointStyle: true,
        rotation: 180,
      },
    },

    data: {
      labels: xValues,

      datasets: [
        {
          label: `${graphLabel}`,
          backgroundColor: "rgba(0,0,255,1.0)",
          borderColor: "rgba(0,0,255,1)",
          data: yValues,
        },
      ],
    },
  });
  document.querySelector(".week-title").innerText = `Trackable ${message} by week`;
}

calcSampleSize();

document.querySelector("#calcButton").addEventListener("click", calcSampleSize);

document.addEventListener("keypress", (event) => {
  let keyCode = event.keyCode ? event.keyCode : event.which;
  if (keyCode === 13) {
    document.querySelector("#calcButton").click();
  }
});

function mdeToggle(e) {
  if (e.target.innerText == "Conversion Rate increase") {
    upLiftSelected = true;
  } else {
    upLiftSelected = false;
  }
  calcSampleSize();
}

document.querySelectorAll(".option").forEach((element) => {
  element.addEventListener("click", mdeToggle);
});

function toggleAdvancedOptions() {
  document.querySelector(".advanced-options-holder").classList.toggle("show");
}

document.querySelector(".options-toggle").addEventListener("click", toggleAdvancedOptions);
document.querySelector(".advanced-close").addEventListener("click", toggleAdvancedOptions);

var modal = document.getElementById("myModal");
var span = document.getElementsByClassName("close")[0];

span.onclick = function () {
  modal.style.display = "none";
};

window.onclick = function (event) {
  if (event.target == modal) {
    modal.style.display = "none";
  }
};

function visitorCalculation() {
  document.querySelector("#visitors").value = Math.round(document.querySelector("#total-visitors").value / document.querySelector("#days-run").value);
  modal.style.display = "none";
  calcSampleSize();
}

document.querySelector("#visitorCalc").addEventListener("click", visitorCalculation);

//Things that could be added as a toggle (or options)
//number of days on the graph
//number of weeks to look at
//breakpoint for mde and uplift

//Improvement percentage (MDE)
//Conversion Rate increase (UPLIFT)

//https://docs.google.com/document/d/1OMH3WmWtoGA0EFDLbxj93IcvZcXuLK5eJNe53B1O2Jc/edit

//TODO: improvement must be at stat sig
//explain green and red text
//calculator or day counter

//baseline or  control

//expected improvement percent to change
