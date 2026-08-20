const STORAGE_KEY = "leoWeightLossQuest";

const DEFAULT_STATE = {
  weight: 98.5,

  calories: 0,
  protein: 0,
  steps: 0,
  water: 0,

  missions: {}
};


/* =========================
   LOAD / SAVE
========================= */

function loadState() {

  try {

    const saved =
      JSON.parse(
        localStorage.getItem(STORAGE_KEY)
      );

    return {
      ...DEFAULT_STATE,
      ...saved,
      missions: {
        ...DEFAULT_STATE.missions,
        ...(saved?.missions || {})
      }
    };

  } catch {

    return {
      ...DEFAULT_STATE,
      missions: {}
    };

  }
}


function saveState() {

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(state)
  );

}


let state = loadState();


/* =========================
   HELPERS
========================= */

function getNumber(id) {

  const value =
    Number(
      document.getElementById(id).value
    );

  return Math.max(
    0,
    Number.isFinite(value)
      ? value
      : 0
  );

}


/* =========================
   AUTOMATIC XP
========================= */

function calculateAutomaticXP() {

  const calories =
    getNumber("calories");

  const protein =
    getNumber("protein");

  const steps =
    getNumber("steps");

  const water =
    getNumber("water");


  let xp = 0;


  /*
    Each stat gives maximum 50 XP.
  */

  xp +=
    Math.min(
      calories / 2000,
      1
    ) * 50;


  xp +=
    Math.min(
      protein / 120,
      1
    ) * 50;


  xp +=
    Math.min(
      steps / 8000,
      1
    ) * 50;


  xp +=
    Math.min(
      water / 3.5,
      1
    ) * 50;


  return Math.floor(xp);
}


/* =========================
   MISSION XP
========================= */

function calculateMissionXP() {

  let xp = 0;


  Object.keys(
    state.missions
  ).forEach(id => {

    if (
      state.missions[id]
    ) {

      const mission =
        document.getElementById(id);

      if (mission) {

        xp += Number(
          mission.dataset.xp
        );

      }

    }

  });


  return xp;
}


/* =========================
   TOTAL XP
========================= */

function calculateTotalXP() {

  return (
    calculateAutomaticXP() +
    calculateMissionXP()
  );

}


/* =========================
   LEVEL
========================= */

function getLevel(xp) {

  return Math.floor(
    xp / 100
  ) + 1;

}


function getRank(level) {

  const ranks = [

    "ROOKIE",

    "DISCIPLINED",

    "WARRIOR",

    "ELITE",

    "BEAST",

    "LEGEND"

  ];


  return ranks[
    Math.min(
      level - 1,
      ranks.length - 1
    )
  ];

}


/* =========================
   WEIGHT PROGRESS
========================= */

function calculateWeightProgress() {

  const startWeight = 98.5;

  const goalWeight = 75;

  const currentWeight =
    state.weight;


  const totalLoss =
    startWeight - goalWeight;


  const lost =
    startWeight -
    currentWeight;


  let percentage =
    (lost / totalLoss) * 100;


  percentage =
    Math.max(
      0,
      Math.min(
        100,
        percentage
      )
    );


  return percentage;

}


/* =========================
   DAYS TO GOAL
========================= */

function calculateDaysToGoal() {

  const goalWeight = 75;

  const currentWeight =
    state.weight;


  const remaining =
    Math.max(
      0,
      currentWeight -
      goalWeight
    );


  /*
    700 calorie estimated
    daily deficit.

    7700 calories ≈
    1 kg body fat.

    Therefore:

    700 / 7700
    ≈ 0.091 kg/day
  */

  const kgPerDay =
    700 / 7700;


  return Math.ceil(
    remaining / kgPerDay
  );

}


/* =========================
   RENDER
========================= */

function render() {

  const totalXP =
    calculateTotalXP();


  const level =
    getLevel(totalXP);


  const rank =
    getRank(level);


  /*
    XP
  */

  document.getElementById(
    "xp"
  ).textContent =
    `${totalXP} XP`;


  document.getElementById(
    "rank"
  ).textContent =
    `LEVEL ${level} · ${rank}`;


  const remainingXP =
    100 -
    (totalXP % 100);


  document.getElementById(
    "levelNext"
  ).textContent =
    `${remainingXP} XP to next level`;


  /*
    Weight
  */

  document.getElementById(
    "weightDisplay"
  ).textContent =
    `${state.weight.toFixed(1)} kg`;


  const kgLeft =
    Math.max(
      0,
      state.weight - 75
    );


  document.getElementById(
    "kgLeft"
  ).textContent =
    `${kgLeft.toFixed(1)} kg`;


  /*
    Days
  */

  const days =
    calculateDaysToGoal();


  document.getElementById(
    "daysLeft"
  ).textContent =
    days === 0
      ? "GOAL REACHED"
      : `~${days} days`;


  /*
    Weight progress
  */

  document.getElementById(
    "progress"
  ).style.width =
    `${calculateWeightProgress()}%`;

}


/* =========================
   STAT INPUTS
========================= */

const statIds = [

  "calories",

  "protein",

  "steps",

  "water"

];


statIds.forEach(id => {

  const input =
    document.getElementById(id);


  input.value =
    state[id] || "";


  input.addEventListener(
    "input",
    () => {

      state[id] =
        getNumber(id);


      saveState();

      render();

    }
  );

});


/* =========================
   MISSIONS
========================= */

const missionIds = [

  "m1",
  "m2",
  "m3",
  "m4",
  "m5",
  "m6"

];


missionIds.forEach(id => {

  const checkbox =
    document.getElementById(id);


  checkbox.checked =
    Boolean(
      state.missions[id]
    );


  checkbox
    .closest(".mission")
    .classList.toggle(
      "done",
      checkbox.checked
    );


  checkbox.addEventListener(
    "change",
    () => {

      state.missions[id] =
        checkbox.checked;


      checkbox
        .closest(".mission")
        .classList.toggle(
          "done",
          checkbox.checked
        );


      saveState();

      render();

    }
  );

});


/* =========================
   SAVE WEIGHT
========================= */

document
  .getElementById("saveWeight")
  .addEventListener(
    "click",
    () => {

      const input =
        document.getElementById(
          "weightInput"
        );


      const value =
        Number(input.value);


      if (
        !Number.isFinite(value) ||
        value <= 0
      ) {

        alert(
          "Please enter a valid weight."
        );

        return;

      }


      state.weight =
        value;


      saveState();


      input.value = "";


      render();

    }
  );


/* =========================
   RESET
========================= */

document
  .getElementById("reset")
  .addEventListener(
    "click",
    () => {

      const confirmed =
        confirm(
          "Reset today's tracker?"
        );


      if (!confirmed) {
        return;
      }


      state = {

        ...DEFAULT_STATE,

        missions: {}

      };


      saveState();


      location.reload();

    }
  );


/* =========================
   INITIAL RENDER
========================= */

render();