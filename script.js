const pages = document.querySelectorAll(".page");
const navButtons = document.querySelectorAll("[data-page]");

function showPage(id){
  pages.forEach(p => p.classList.toggle("active-page", p.id === id));
  document.querySelectorAll(".nav-btn,.tab").forEach(b => {
    b.classList.toggle("active", b.dataset.page === id);
  });
  window.scrollTo({top:0, behavior:"smooth"});
}

navButtons.forEach(btn => btn.addEventListener("click", () => showPage(btn.dataset.page)));

document.querySelectorAll(".filter").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".filter").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
  });
});

function setupCanvas(canvas, values, options={}){
  if(!canvas) return;
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  const width = Math.max(280, rect.width);
  const height = canvas.height;
  canvas.width = width * dpr;
  canvas.height = height * dpr;
  const ctx = canvas.getContext("2d");
  ctx.scale(dpr,dpr);

  const pad = {top:18,right:8,bottom:25,left:8};
  const w = width-pad.left-pad.right;
  const h = height-pad.top-pad.bottom;
  const min = options.min ?? Math.min(...values);
  const max = options.max ?? Math.max(...values);
  const range = max-min || 1;

  ctx.clearRect(0,0,width,height);

  // Grid
  ctx.strokeStyle = "#152230";
  ctx.lineWidth = 1;
  for(let i=0;i<4;i++){
    const y = pad.top + h*(i/3);
    ctx.beginPath(); ctx.moveTo(pad.left,y); ctx.lineTo(width-pad.right,y); ctx.stroke();
  }

  const points = values.map((v,i)=>({
    x: pad.left + w*(i/(values.length-1)),
    y: pad.top + h*(1-(v-min)/range)
  }));

  // Fill
  const grad = ctx.createLinearGradient(0,pad.top,0,height);
  grad.addColorStop(0,"rgba(22,131,255,.30)");
  grad.addColorStop(1,"rgba(22,131,255,0)");
  ctx.beginPath();
  ctx.moveTo(points[0].x,height-pad.bottom);
  points.forEach(p=>ctx.lineTo(p.x,p.y));
  ctx.lineTo(points[points.length-1].x,height-pad.bottom);
  ctx.closePath();
  ctx.fillStyle=grad;
  ctx.fill();

  // Line
  ctx.beginPath();
  points.forEach((p,i)=>i ? ctx.lineTo(p.x,p.y) : ctx.moveTo(p.x,p.y));
  ctx.strokeStyle="#1683ff";
  ctx.lineWidth=2.5;
  ctx.shadowColor="rgba(22,131,255,.45)";
  ctx.shadowBlur=8;
  ctx.stroke();
  ctx.shadowBlur=0;

  // Points
  points.forEach((p,i)=>{
    ctx.beginPath();
    ctx.arc(p.x,p.y,i===points.length-1?4:2.5,0,Math.PI*2);
    ctx.fillStyle="#1683ff";
    ctx.fill();
  });

  if(options.labels){
    ctx.fillStyle="#647387";
    ctx.font="9px -apple-system, BlinkMacSystemFont, sans-serif";
    options.labels.forEach((label,i)=>{
      const x=pad.left+w*(i/(options.labels.length-1));
      ctx.fillText(label,x-10,height-7);
    });
  }
}

function drawCharts(){
  setupCanvas(
    document.getElementById("todayChart"),
    [32,38,42,48,50,57,63,70,78],
    {min:0,max:100,labels:["","", "", "", "", "", "", "", ""]}
  );

  setupCanvas(
    document.getElementById("weightChart"),
    [98.5,98.2,97.8,98.1,97.4,96.8,96.2,95.5,94.8,94.5,93.8,93.0,92.4,91.8,90.9,90.2,89.5,88.5,87.4,86.2,85.3,84.0,82.8,81.7,80.5,79.2,78.1,77.0,76.2,75.0],
    {min:73,max:100,labels:["Day 1","Day 15","Day 30","Day 45","Day 60","Day 75","Day 90"]}
  );
}

window.addEventListener("resize", drawCharts);
drawCharts();
