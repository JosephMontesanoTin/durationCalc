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
  let mde = Math.sqrt(baseCVR * (1 - baseCVR)) / (Math.sqrt(numberOfUsersAtXDay / critScore) * baseCVR);
  if (upLiftSelected) {
    return Math.round(baseCVR * mde * 100 * 100) / 100;
  } else {
    return (mde * 100).toFixed(2);
  }
}

function newCVRAtXDay(baseCVR, numberOfUsersAtXDay, critScore) {
  let mde = Math.sqrt(baseCVR * (1 - baseCVR)) / (Math.sqrt(numberOfUsersAtXDay / critScore) * baseCVR);
  return (baseCVR * 100 + (baseCVR * mde * 100 * 100) / 100).toFixed(2);
}

function calcSampleSize() {
  let message = "conversion rate increase";
  let graphLabel = "Percent";
  let critScore = 2 * Math.pow(Number(document.querySelector("#power-level").value) + Number(document.querySelector("#sig-level").value), 2);
  let baseCVR = document.querySelector("#baseCVR").value / 100;
  let newCVR;

  if (!upLiftSelected && document.querySelector(".mde-label").innerText != `Expected Improvement Percentage:`) {
    //if MDE is selected off of uplift
    message = "improvement percentage";
    graphLabel = "Improvement percentage";
    document.querySelector(".mde-label").innerText = `Expected Improvement Percentage:`;
    document.querySelector("#mde").value = document.querySelector("#mde").value / baseCVR;
    checkValue = Number(document.querySelector("#mde").value);
  } else if (document.querySelector(".mde-label").innerText == `Expected Improvement Percentage:` && !upLiftSelected) {
    //if mde was already selected, but MDE was updated
    message = "Improvement percentage";
    graphLabel = "Improvement percentage";
    checkValue = Number(document.querySelector("#mde").value);
  } else if (document.querySelector(".mde-label").innerText != "Expected Conversion Rate increase:") {
    //if uplift wasn't selected, and needs to update
    document.querySelector(".mde-label").innerText = `Expected Conversion Rate increase:`;
    document.querySelector("#mde").value = Number(document.querySelector("#mde").value * baseCVR);
    checkValue = document.querySelector("#mde").value;
  } else {
    //if uplift was already selected
    checkValue = Number(document.querySelector("#mde").value);
  }
  let numberOfVisitors = document.querySelector("#visitors").value;
  if (daySelected) {
    document.querySelector(".days > label").innerText = "Average Visitors Per Day";
  } else {
    numberOfVisitors = numberOfVisitors / 14;
    document.querySelector(".days > label").innerText = "Average Visitors Per 2 Weeks";
  }

  if (upLiftSelected) {
    newCVR = "";
  }

  numberOfVisitors = numberOfVisitors / (Number(document.querySelector("#variations").value) + 1);

  let mde = document.querySelector("#mde").value / 100 / baseCVR;

  let calculationInbetween = Math.sqrt(baseCVR * (1 - baseCVR)) / (baseCVR * mde);
  let sampleSize = document.querySelector("#variations").value * (critScore * Math.pow(calculationInbetween, 2));

  let numberOfUsersAtXDay = Number(document.querySelector("#days").value) * numberOfVisitors;
  let calculatedMDE = Math.sqrt(baseCVR * (1 - baseCVR)) / (Math.sqrt(numberOfUsersAtXDay / critScore) * baseCVR);
  document.querySelector(".paragraph1").innerHTML = `To detect a ${Math.round(baseCVR * mde * 100 * 100) / 100}% uplift of a ${
    baseCVR * 100
  }% base CVR you will need <span class="high-result">${Math.ceil(sampleSize)} visitors per variation.</span> At the current traffic level that will take <div class="high-result">${Math.ceil(
    (sampleSize * Number(document.querySelector("#variations").value) + 1) / numberOfVisitors
  )} days.</div>`;

  document.querySelector(".paragraph2").innerHTML = `With the above settings after ${document.querySelector("#days").value} days you can detect any uplift above <span class="high-result">${
    Math.round(baseCVR * calculatedMDE * 100 * 100) / 100
  }% uplift.</span>  Any lift smaller than this may be missed.`;

  let weeksOfTest = 8;
  if (firstCalc) {
    for (i = 1; i < weeksOfTest; i++) {
      let weekDiv = document.createElement("div");
      let numberOfUsersatXWeek = i * 7 * numberOfVisitors;
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
      let numberOfUsersatXWeek = i * 7 * numberOfVisitors;
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

  let xValues = [];
  let yValues = [];

  let daysOfTest = 32;

  for (i = 1; i < daysOfTest; i += 1) {
    let numberOfUsersatXday = i * numberOfVisitors;
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

function dayToggle(e) {
  if (e.target.innerText == "Days") {
    if (!daySelected) {
      document.querySelector("#visitors").value = Math.round(document.querySelector("#visitors").value / 14);
    }
    daySelected = true;
  } else if (e.target.innerText == "2 Weeks") {
    if (daySelected) {
      document.querySelector("#visitors").value = Math.round(document.querySelector("#visitors").value * 14);
    }
    daySelected = false;
  }
  calcSampleSize();
}

document.querySelectorAll(".option2").forEach((element) => {
  element.addEventListener("click", dayToggle);
});

function toggleAdvancedOptions() {
  document.querySelector(".advanced-options-holder").classList.toggle("invisible");
}

document.querySelector(".options-toggle").addEventListener("click", toggleAdvancedOptions);

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
