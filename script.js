const DEFAULTS = {
  weight: 98.5,
  goalWeight: 75,
  calories: 1420,
  calorieGoal: 2000,
  baseBurn: 2280,
  steps: 6240,
  stepsGoal: 8000,
  protein: 82,
  proteinGoal: 120,
  water: 2.4,
  waterGoal: 3.5,
  day: 6
};

const state = JSON.parse(localStorage.getItem("madhuvarmaComeback")) || {...DEFAULTS};

const $ = id => document.getElementById(id);
const clamp = (value,min,max) => Math.min(Math.max(value,min),max);

function save(){
  localStorage.setItem("madhuvarmaComeback", JSON.stringify(state));
}

function stepCalories(){
  // Simple editable estimate: approximately 0.0526 kcal per step.
  // This is only an estimate; actual burn varies by pace, terrain and body size.
  return Math.round(state.steps * 0.0526);
}

function calculate(){
  const remaining = Math.max(state.weight - state.goalWeight, 0);
  const stepsBurn = stepCalories();
  const totalBurn = state.baseBurn + stepsBurn;
  const deficit = Math.max(totalBurn - state.calories, 0);

  const days = deficit > 0
    ? Math.ceil((remaining * 7700) / deficit)
    : null;

  return {remaining, stepsBurn, totalBurn, deficit, days};
}

function render(){
  const c = calculate();

  $("currentWeight").textContent = state.weight.toFixed(1);
  $("goalWeight").textContent = state.goalWeight.toFixed(1);
  $("remainingWeight").textContent = c.remaining.toFixed(1);

  const lost = Math.max(DEFAULTS.weight - state.weight, 0);
  const totalJourney = Math.max(DEFAULTS.weight - state.goalWeight, .1);
  const progress = clamp((lost / totalJourney) * 100, 0, 100);

  $("weightProgress").style.width = `${progress}%`;
  document.querySelector(".goal-ring").style.background =
    `conic-gradient(var(--blue) ${Math.max(progress, 8)}%, #263241 ${Math.max(progress, 8)}%)`;
  $("weightPercent").textContent = `${Math.round(progress)}%`;

  $("caloriesConsumed").textContent = state.calories.toLocaleString();
  $("baseBurn").textContent = state.baseBurn.toLocaleString();
  $("stepsBurn").textContent = c.stepsBurn.toLocaleString();
  $("totalBurn").textContent = `${c.totalBurn.toLocaleString()} kcal`;
  $("dailyDeficit").textContent = `−${c.deficit.toLocaleString()} kcal`;

  $("daysRemaining").textContent = c.days ?? "—";
  $("goalDeficit").textContent = `${c.deficit.toLocaleString()} kcal`;
  $("goalRemaining").textContent = `${c.remaining.toFixed(1)} kg`;
  $("monthsRemaining").textContent = c.days ? `≈ ${(c.days / 30.44).toFixed(1)} months` : "—";

  if(c.days){
    const date = new Date();
    date.setDate(date.getDate() + c.days);
    $("goalDate").textContent = date.toLocaleDateString(undefined,{
      day:"numeric", month:"short", year:"numeric"
    });
  }else{
    $("goalDate").textContent = "—";
  }

  $("stepsValue").textContent = state.steps.toLocaleString();
  $("caloriesValue").textContent = state.calories.toLocaleString();
  $("proteinValue").textContent = state.protein.toLocaleString();
  $("waterValue").textContent = state.water.toFixed(1);

  $("stepsBar").style.width = `${clamp(state.steps/state.stepsGoal*100,0,100)}%`;
  $("caloriesBar").style.width = `${clamp(state.calories/state.calorieGoal*100,0,100)}%`;
  $("proteinBar").style.width = `${clamp(state.protein/state.proteinGoal*100,0,100)}%`;
  $("waterBar").style.width = `${clamp(state.water/state.waterGoal*100,0,100)}%`;

  const completion = Math.round(
    (
      clamp(state.steps/state.stepsGoal,0,1) +
      clamp(state.calories/state.calorieGoal,0,1) +
      clamp(state.protein/state.proteinGoal,0,1) +
      clamp(state.water/state.waterGoal,0,1)
    ) / 4 * 100
  );
  $("todayPercent").textContent = `${completion}%`;

  $("quickWeight").textContent = `${state.weight.toFixed(1)} kg`;
  $("quickCalories").textContent = state.calorieGoal.toLocaleString();
  $("quickBaseBurn").textContent = state.baseBurn.toLocaleString();
  $("quickStepsGoal").textContent = state.stepsGoal.toLocaleString();
  $("dayPill").textContent = `DAY ${String(state.day).padStart(2,"0")}`;
}

const EDITS = {
  weight: {
    title:"Current weight",
    label:"Weight",
    unit:"kg",
    key:"weight",
    step:"0.1"
  },
  calories: {
    title:"Calories consumed",
    label:"Calories consumed today",
    unit:"kcal",
    key:"calories",
    step:"1"
  },
  baseBurn: {
    title:"Base daily burn",
    label:"Baseline calories burned",
    unit:"kcal",
    key:"baseBurn",
    step:"1"
  },
  steps: {
    title:"Steps today",
    label:"Steps",
    unit:"steps",
    key:"steps",
    step:"1"
  },
  protein: {
    title:"Protein",
    label:"Protein consumed today",
    unit:"g",
    key:"protein",
    step:"1"
  },
  water: {
    title:"Water",
    label:"Water consumed today",
    unit:"L",
    key:"water",
    step:"0.1"
  },
  stepsGoal: {
    title:"Daily step goal",
    label:"Step goal",
    unit:"steps",
    key:"stepsGoal",
    step:"1"
  }
};

let activeEdit = null;

function openEditor(type){
  const config = EDITS[type];
  if(!config) return;

  activeEdit = type;
  $("modalTitle").textContent = config.title;
  $("inputLabel").textContent = config.label;
  $("inputUnit").textContent = config.unit;
  $("editInput").step = config.step;
  $("editInput").value = state[config.key];

  $("modal").classList.add("open");
  $("modal").setAttribute("aria-hidden","false");

  setTimeout(()=>{
    $("editInput").focus();
    $("editInput").select();
  },50);
}

function closeEditor(){
  $("modal").classList.remove("open");
  $("modal").setAttribute("aria-hidden","true");
  activeEdit = null;
}

document.addEventListener("click", event=>{
  const edit = event.target.closest("[data-edit]");
  if(edit) openEditor(edit.dataset.edit);

  if(event.target.matches("[data-close]")) closeEditor();
});

$("saveBtn").addEventListener("click",()=>{
  if(!activeEdit) return;

  const config = EDITS[activeEdit];
  let value = Number($("editInput").value);

  if(!Number.isFinite(value) || value < 0) return;

  state[config.key] = value;
  save();
  render();
  closeEditor();
});

$("editInput").addEventListener("keydown", event=>{
  if(event.key === "Enter") $("saveBtn").click();
  if(event.key === "Escape") closeEditor();
});

render();
