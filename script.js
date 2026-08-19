// Activity-aware calorie calculation.
// Maintenance/base burn and step burn are kept separate so step calories
// are not accidentally counted twice.
const currentWeight = 98.5;
const goalWeight = 75.0;
const caloriesConsumed = 1420;
const stepsToday = 6240;

// Editable assumptions for the tracker.
const baseDailyBurn = 2280;       // baseline daily burn excluding today's steps
const stepBurnPerStep = 0.0526;  // ~328 kcal for 6,240 steps

const stepsBurned = Math.round(stepsToday * stepBurnPerStep);
const totalBurn = baseDailyBurn + stepsBurned;
const dailyDeficit = Math.max(totalBurn - caloriesConsumed, 0);

const remainingKg = Math.max(currentWeight - goalWeight, 0);
const requiredDeficit = remainingKg * 7700;
const daysToGoal = dailyDeficit > 0
  ? Math.ceil(requiredDeficit / dailyDeficit)
  : null;

document.getElementById("consumedValue").textContent = caloriesConsumed.toLocaleString();
document.getElementById("baseBurnValue").textContent = baseDailyBurn.toLocaleString();
document.getElementById("stepsBurnValue").textContent = stepsBurned.toLocaleString();
document.getElementById("totalBurnValue").textContent = `${totalBurn.toLocaleString()} kcal`;
document.getElementById("deficitLabel").textContent = `−${dailyDeficit.toLocaleString()} kcal`;
document.getElementById("dailyDeficit").textContent = `${dailyDeficit.toLocaleString()} kcal`;
document.getElementById("daysRemaining").textContent = daysToGoal ?? "—";

// Activity-aware calorie calculation.
// Step calories are separate from baseline burn to avoid double-counting.
const currentWeight = 98.5;
const goalWeight = 75.0;
const caloriesConsumed = 1420;
const stepsToday = 6240;

const baseDailyBurn = 2280;
const stepBurnPerStep = 0.0526;

const stepsBurned = Math.round(stepsToday * stepBurnPerStep);
const totalBurn = baseDailyBurn + stepsBurned;
const dailyDeficit = Math.max(totalBurn - caloriesConsumed, 0);

const remainingKg = Math.max(currentWeight - goalWeight, 0);
const daysToGoal = dailyDeficit > 0
  ? Math.ceil((remainingKg * 7700) / dailyDeficit)
  : null;

document.getElementById("consumedValue").textContent = caloriesConsumed.toLocaleString();
document.getElementById("baseBurnValue").textContent = baseDailyBurn.toLocaleString();
document.getElementById("stepsBurnValue").textContent = stepsBurned.toLocaleString();
document.getElementById("totalBurnValue").textContent = `${totalBurn.toLocaleString()} kcal`;
document.getElementById("deficitLabel").textContent = `−${dailyDeficit.toLocaleString()} kcal`;
document.getElementById("dailyDeficit").textContent = `${dailyDeficit.toLocaleString()} kcal`;
document.getElementById("daysRemaining").textContent = daysToGoal ?? "—";

const canvas = document.getElementById("weightChart");

const ctx = canvas.getContext("2d");

function drawChart(){
  const dpr = window.devicePixelRatio || 1;
  const width = canvas.clientWidth;
  const height = canvas.height;

  canvas.width = width * dpr;
  canvas.height = height * dpr;
  ctx.setTransform(dpr,0,0,dpr,0,0);

  const values = [
    98.5,98.2,97.8,98.1,97.4,96.8,96.2,95.5,
    94.8,94.5,93.8,93.0,92.4,91.8,90.9,90.2,
    89.5,88.5,87.4,86.2,85.3,84.0,82.8,81.7,
    80.5,79.2,78.1,77.0,76.2,75.0
  ];

  const pad = {top:12,right:5,bottom:15,left:5};
  const w = width-pad.left-pad.right;
  const h = height-pad.top-pad.bottom;
  const min = 73;
  const max = 100;

  ctx.clearRect(0,0,width,height);

  ctx.strokeStyle="#142130";
  ctx.lineWidth=1;

  for(let i=0;i<3;i++){
    const y=pad.top+h*(i/2);
    ctx.beginPath();
    ctx.moveTo(pad.left,y);
    ctx.lineTo(width-pad.right,y);
    ctx.stroke();
  }

  const points=values.map((v,i)=>({
    x:pad.left+w*(i/(values.length-1)),
    y:pad.top+h*(1-(v-min)/(max-min))
  }));

  const gradient=ctx.createLinearGradient(0,pad.top,0,height);
  gradient.addColorStop(0,"rgba(22,131,255,.28)");
  gradient.addColorStop(1,"rgba(22,131,255,0)");

  ctx.beginPath();
  ctx.moveTo(points[0].x,height-pad.bottom);
  points.forEach((p,i)=>i?ctx.lineTo(p.x,p.y):ctx.lineTo(p.x,p.y));
  ctx.lineTo(points.at(-1).x,height-pad.bottom);
  ctx.closePath();
  ctx.fillStyle=gradient;
  ctx.fill();

  ctx.beginPath();
  points.forEach((p,i)=>i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));
  ctx.strokeStyle="#1683ff";
  ctx.lineWidth=2.2;
  ctx.shadowColor="rgba(22,131,255,.45)";
  ctx.shadowBlur=8;
  ctx.stroke();
  ctx.shadowBlur=0;

  [points[0],points.at(-1)].forEach(p=>{
    ctx.beginPath();
    ctx.arc(p.x,p.y,3.5,0,Math.PI*2);
    ctx.fillStyle="#1683ff";
    ctx.fill();
  });
}

document.getElementById("logButton").addEventListener("click",()=>{
  document.querySelector(".today").scrollIntoView({behavior:"smooth"});
});

window.addEventListener("resize",drawChart);
drawChart();
