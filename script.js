/* =====================================================
   THE COMEBACK
   PITCH TALES CRICKET CLUB

   V1 FITNESS ENGINE

   Current activities:
   - Walking
   - Calories
   - Water
   - Sleep
   - Weight

   Future:
   - Gym
   - Running
   - Cricket training
   - Custom workouts
===================================================== */


/* =====================================================
   SETTINGS
===================================================== */

const SETTINGS = {

  // Starting point
  startWeight: 98.5,

  // Final goal
  targetWeight: 75,

  // Daily calorie assumptions
  maintenanceCalories: 2700,

  targetCalories: 2000,

  // Approximate energy equivalent
  caloriesPerKg: 7700,

  // Daily targets
  stepGoal: 8000,

  waterGoal: 3.5,

  sleepGoal: 7

};


/* =====================================================
   PLAYER DATA
===================================================== */

let player = {

  startWeight:
    SETTINGS.startWeight,

  currentWeight:
    SETTINGS.startWeight,

  targetWeight:
    SETTINGS.targetWeight,

  steps: 0,

  calories: 0,

  water: 0,

  sleep: 0,

  day: 1,

  episodeProgress: 0

};


/* =====================================================
   LOAD SAVED DATA
===================================================== */

const savedPlayer =
  localStorage.getItem(
    "theComebackPlayer"
  );


if (savedPlayer) {

  try {

    player =
      JSON.parse(savedPlayer);

  } catch (error) {

    console.log(
      "Saved data could not be loaded."
    );

  }

}


/* =====================================================
   SAVE DATA
===================================================== */

function saveData() {

  localStorage.setItem(
    "theComebackPlayer",
    JSON.stringify(player)
  );

}


/* =====================================================
   FORMAT NUMBER
===================================================== */

function formatNumber(number) {

  return Number(number).toLocaleString(
    "en-IN"
  );

}


/* =====================================================
   UPDATE DASHBOARD
===================================================== */

function updateDashboard() {


  /* -------------------------
     Basic values
  ------------------------- */

  document.getElementById(
    "steps"
  ).textContent =
    formatNumber(player.steps);


  document.getElementById(
    "calories"
  ).textContent =
    formatNumber(player.calories);


  document.getElementById(
    "water"
  ).textContent =
    player.water.toFixed(1);


  document.getElementById(
    "sleep"
  ).textContent =
    player.sleep.toFixed(1);


  document.getElementById(
    "currentWeight"
  ).textContent =
    player.currentWeight.toFixed(1);


  document.getElementById(
    "remainingWeight"
  ).textContent =
    Math.max(
      player.currentWeight -
      player.targetWeight,
      0
    ).toFixed(1);


  document.getElementById(
    "dayNumber"
  ).textContent =
    player.day;



  /* =================================================
     WALKING PROGRESS
  ================================================= */

  let stepPercent =
    (
      player.steps /
      SETTINGS.stepGoal
    ) * 100;


  stepPercent =
    Math.min(
      stepPercent,
      100
    );


  document.getElementById(
    "stepsProgress"
  ).style.width =
    stepPercent + "%";



  /* =================================================
     CALORIE PROGRESS
  ================================================= */

  let caloriePercent =
    (
      player.calories /
      SETTINGS.targetCalories
    ) * 100;


  caloriePercent =
    Math.min(
      caloriePercent,
      100
    );


  document.getElementById(
    "calorieProgress"
  ).style.width =
    caloriePercent + "%";



  /* =================================================
     WATER PROGRESS
  ================================================= */

  let waterPercent =
    (
      player.water /
      SETTINGS.waterGoal
    ) * 100;


  waterPercent =
    Math.min(
      waterPercent,
      100
    );


  document.getElementById(
    "waterProgress"
  ).style.width =
    waterPercent + "%";



  /* =================================================
     SLEEP PROGRESS
  ================================================= */

  let sleepPercent =
    (
      player.sleep /
      SETTINGS.sleepGoal
    ) * 100;


  sleepPercent =
    Math.min(
      sleepPercent,
      100
    );


  document.getElementById(
    "sleepProgress"
  ).style.width =
    sleepPercent + "%";



  /* =================================================
     WEIGHT JOURNEY
  ================================================= */

  const totalJourney =
    player.startWeight -
    player.targetWeight;


  const completedJourney =
    player.startWeight -
    player.currentWeight;


  let weightPercent =
    (
      completedJourney /
      totalJourney
    ) * 100;


  weightPercent =
    Math.max(
      0,
      Math.min(
        weightPercent,
        100
      )
    );


  document.getElementById(
    "weightProgress"
  ).style.width =
    weightPercent + "%";



  /* =================================================
     EPISODE
  ================================================= */

  document.getElementById(
    "episodeProgress"
  ).style.width =
    player.episodeProgress + "%";


  document.getElementById(
    "episodePercent"
  ).textContent =
    player.episodeProgress + "%";



  /* =================================================
     MILESTONE
  ================================================= */

  updateMilestone();



  /* =================================================
     GOAL FORECAST
  ================================================= */

  calculateGoalForecast();



  /* =================================================
     SAVE
  ================================================= */

  saveData();

}


/* =====================================================
   MILESTONE
===================================================== */

function updateMilestone() {


  const milestoneTarget =
    95;


  const milestoneStart =
    player.startWeight;


  const milestoneTotal =
    milestoneStart -
    milestoneTarget;


  const milestoneCompleted =
    milestoneStart -
    player.currentWeight;


  let milestonePercent =
    (
      milestoneCompleted /
      milestoneTotal
    ) * 100;


  milestonePercent =
    Math.max(
      0,
      Math.min(
        milestonePercent,
        100
      )
    );


  document.getElementById(
    "milestoneProgress"
  ).style.width =
    milestonePercent + "%";


  const remaining =
    Math.max(
      player.currentWeight -
      milestoneTarget,
      0
    );


  document.getElementById(
    "milestoneText"
  ).textContent =
    remaining.toFixed(1) +
    " kg to go";

}


/* =====================================================
   GOAL FORECAST
===================================================== */

function calculateGoalForecast() {


  const currentWeight =
    player.currentWeight;


  const targetWeight =
    player.targetWeight;


  /* -------------------------
     Weight remaining
  ------------------------- */

  const remainingWeight =
    currentWeight -
    targetWeight;


  /* -------------------------
     Daily calorie deficit
  ------------------------- */

  const dailyDeficit =
    SETTINGS.maintenanceCalories -
    SETTINGS.targetCalories;


  /* -------------------------
     Update displayed settings
  ------------------------- */

  document.getElementById(
    "maintenanceCalories"
  ).textContent =
    SETTINGS.maintenanceCalories;


  document.getElementById(
    "forecastCalories"
  ).textContent =
    SETTINGS.targetCalories;


  document.getElementById(
    "dailyDeficit"
  ).textContent =
    dailyDeficit;



  /* -------------------------
     Already reached goal
  ------------------------- */

  if (remainingWeight <= 0) {

    document.getElementById(
      "goalDays"
    ).textContent =
      "0";


    document.getElementById(
      "goalDate"
    ).textContent =
      "GOAL REACHED";


    return;

  }



  /* -------------------------
     Invalid deficit
  ------------------------- */

  if (dailyDeficit <= 0) {

    document.getElementById(
      "goalDays"
    ).textContent =
      "--";


    document.getElementById(
      "goalDate"
    ).textContent =
      "Increase deficit";


    return;

  }



  /* -------------------------
     Total calories required
  ------------------------- */

  const totalCaloriesNeeded =
    remainingWeight *
    SETTINGS.caloriesPerKg;



  /* -------------------------
     Estimated days
  ------------------------- */

  const estimatedDays =
    Math.ceil(
      totalCaloriesNeeded /
      dailyDeficit
    );



  /* -------------------------
     Estimated date
  ------------------------- */

  const goalDate =
    new Date();


  goalDate.setDate(
    goalDate.getDate() +
    estimatedDays
  );



  const formattedDate =
    goalDate.toLocaleDateString(
      "en-IN",
      {
        day: "numeric",

        month: "short",

        year: "numeric"
      }
    );



  /* -------------------------
     Update UI
  ------------------------- */

  document.getElementById(
    "goalDays"
  ).textContent =
    formatNumber(
      estimatedDays
    );


  document.getElementById(
    "goalDate"
  ).textContent =
    formattedDate;

}


/* =====================================================
   ADD STEPS
===================================================== */

function addSteps(amount) {


  player.steps += amount;


  /*
    Safety limit so accidental
    clicks don't create absurd numbers.
  */

  if (player.steps > 50000) {

    player.steps = 50000;

  }


  calculateEpisode();

  updateDashboard();

}


/* =====================================================
   ADD CALORIES
===================================================== */

function addCalories() {


  const input =
    prompt(
      "How many calories did you eat?"
    );


  if (!input) {

    return;

  }


  const calories =
    parseInt(input);


  if (
    isNaN(calories) ||
    calories <= 0
  ) {

    alert(
      "Please enter a valid calorie amount."
    );

    return;

  }


  player.calories +=
    calories;


  updateDashboard();

}


/* =====================================================
   ADD WATER
===================================================== */

function addWater() {


  player.water +=
    0.5;


  if (player.water > 10) {

    player.water = 10;

  }


  updateDashboard();

}


/* =====================================================
   ADD SLEEP
===================================================== */

function addSleep() {


  player.sleep +=
    1;


  if (player.sleep > 24) {

    player.sleep = 24;

  }


  updateDashboard();

}


/* =====================================================
   UPDATE WEIGHT
===================================================== */

function updateWeight() {


  const input =
    document.getElementById(
      "weightInput"
    );


  const newWeight =
    parseFloat(
      input.value
    );


  if (isNaN(newWeight)) {

    alert(
      "Please enter a valid weight."
    );

    return;

  }


  if (
    newWeight < 40 ||
    newWeight > 200
  ) {

    alert(
      "Please enter a realistic weight."
    );

    return;

  }


  player.currentWeight =
    newWeight;


  input.value = "";


  calculateEpisode();

  updateDashboard();

}


/* =====================================================
   EPISODE ENGINE
===================================================== */

function calculateEpisode() {


  const totalWeight =
    player.startWeight -
    player.targetWeight;


  const weightLost =
    player.startWeight -
    player.currentWeight;


  let journeyPercent =
    (
      weightLost /
      totalWeight
    ) * 100;


  journeyPercent =
    Math.max(
      0,
      Math.min(
        journeyPercent,
        100
      )
    );



  /*
    21 episodes across
    the complete journey.
  */

  const episodeSize =
    100 / 21;


  let episode =
    Math.floor(
      journeyPercent /
      episodeSize
    ) + 1;


  if (episode > 21) {

    episode = 21;

  }



  /*
    Calculate progress
    inside current episode.
  */

  const previousEpisodeProgress =
    (episode - 1) *
    episodeSize;


  let currentProgress =
    (
      (
        journeyPercent -
        previousEpisodeProgress
      ) /
      episodeSize
    ) * 100;


  currentProgress =
    Math.max(
      0,
      Math.min(
        Math.round(
          currentProgress
        ),
        100
      )
    );


  player.episodeProgress =
    currentProgress;

}


/* =====================================================
   CONTINUE EPISODE
===================================================== */

function continueEpisode() {


  if (
    player.episodeProgress >= 100
  ) {

    alert(
      "Episode complete! Your next chapter is unlocked."
    );

  } else {

    alert(
      "Keep building your routine. Your comeback is in your hands."
    );

  }

}


/* =====================================================
   START NEW DAY
===================================================== */

function startNewDay() {


  player.day++;


  player.steps = 0;

  player.calories = 0;

  player.water = 0;

  player.sleep = 0;


  updateDashboard();

}


/* =====================================================
   INITIALIZE APP
===================================================== */

calculateEpisode();

updateDashboard();