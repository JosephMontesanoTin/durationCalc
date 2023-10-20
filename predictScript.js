//title poppins
//other roboto

let firstCalc = true;
//this value is used to check if this is the first time the calculation is running
//the first time it runs it builds the divs needed for the weeks
let upLiftSelected = false;
let daySelected = true;
let checkValue = 5;
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

function calculateFeasibility(baseCVR, dailyUsers, critScore) {
  let assumedUplift = 0.05;
  let visitorsNeeded = critScore * Math.pow(Math.sqrt(baseCVR * (1 - baseCVR)) / (baseCVR * assumedUplift), 2);
  let daysRequired = visitorsNeeded / dailyUsers;
  let feasScore = (1 - Math.pow((daysRequired - 14) / 42, 2)) * 100;
  if (daysRequired < 14) {
    feasScore = 100;
  } else if (daysRequired > 56) {
    feasScore = 0;
  } else if (daysRequired == 56) {
    feasScore = 1;
  }
  console.log(daysRequired);

  let feasRating = "gray";
  let feasScoring = "a slower than average";

  console.log(feasScore < 100);
  if (feasScore == 100) {
    feasRating = "gold";
    feasScoring = "a very fast test";
  } else if (feasScore < 100) {
    feasRating = "green";
    feasScoring = "a relatively quick test";
    if (feasScore < 75) {
      feasRating = "yellow";
      feasScoring = "an average test length";
      if (feasScore < 31) {
        feasRating = "red";
        feasScoring = "a slightly slower than average  test";
        if (feasScore == 0) {
          feasRating = "gray";
          feasScoring = "a much slower than average test";
        }
      }
    }
  }

  let weeksNeeded = Math.round(Math.round(daysRequired) / 7);
  if (weeksNeeded < 2) {
    weeksNeeded = 2;
  }

  document.querySelector(".day-answer").innerHTML = `Duration Score: <span class="underline ${feasRating}">${Math.round(feasScore)}</span>
  <div class="sub-result">There will be enough traffic to detect a ${assumedUplift * 100}% lift around ${weeksNeeded} weeks.</div>
  <div class="rating-score">A score of <span class=${feasRating}>${Math.round(feasScore)}</span> means this is <span class=${feasRating}>${feasScoring}</span>.</div>
  `;
}

function calcSampleSize() {
  let message = "conversion rate increase";
  let graphLabel = "Percent";
  let critScore = 2 * Math.pow(Number(0.84) + Number(1.96), 2);
  let baseCVR = document.querySelector("#baseCVR").value / 100;

  let numberOfVisitors = document.querySelector("#visitors").value;

  numberOfVisitors = numberOfVisitors / (Number(document.querySelector("#variations").value) + 1);

  let xValues = [];
  let yValues = [];

  let daysOfTest = 56;

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
  calculateFeasibility(baseCVR, numberOfVisitors, critScore);
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
  document.querySelector(".advanced-options-holder").classList.toggle("show");
}

document.querySelector(".options-toggle").addEventListener("click", toggleAdvancedOptions);

var modal = document.getElementById("myModal");
var btn = document.getElementById("dayCalc");
var span = document.getElementsByClassName("close")[0];
btn.onclick = function () {
  modal.style.display = "block";
};

span.onclick = function () {
  modal.style.display = "none";
};

window.onclick = function (event) {
  if (event.target == modal) {
    modal.style.display = "none";
  }
};

function visitorCalculation() {
  console.log(document.querySelector("#total-visitors").value / document.querySelector("#days-run").value);
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

//test length instead of KPI
