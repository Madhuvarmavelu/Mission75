(function(){
  const app = document.getElementById('app');
  let profile = null;
  let logs = [];
  let loaded = false;

  // ---------- icon svgs ----------
  const ICONS = {
    scale:'<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="4"/><path d="M7 15a5 5 0 0 1 10 0"/><circle cx="12" cy="8" r="1.2"/></svg>',
    water:'<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11z"/></svg>',
    steps:'<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20c0-3 1-4 3-4s2 2 2 4M4 20v-3M17 4c0 3-1 4-3 4s-2-2-2-4M17 4v3"/></svg>',
    protein:'<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 4c3 0 5 2 5 5s-2 5-5 5-5-2-5-5 2-5 5-5z"/><path d="M11 12 5 18l1 1 6-6"/></svg>',
    eat:'<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 3v7a2 2 0 0 0 4 0V3M9 10v11M17 3c-1.5 1.5-2 3-2 5s1 3 2 3v10"/></svg>',
    burn:'<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2c1 3-2 4-2 7a3 3 0 0 0 6 0c1 1 1 3 0 5a5 5 0 1 1-9-3c0-3 2-4 5-9z"/></svg>',
    bmr:'<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 12h-4l-3 8-4-16-3 8H2"/></svg>'
  };
  function badge(color, softColor, icon){
    return `<div class="badge" style="background:${softColor};color:${color};">${icon}</div>`;
  }
  function chip(color, softColor, icon, label, value){
    return `<div class="chip" style="background:${softColor};color:${color};">
      <div class="badge" style="background:${color};color:#fff;">${icon}</div>
      <span style="color:var(--ink-soft);">${label}</span><b style="color:var(--ink);">${value}</b>
    </div>`;
  }

  // ---------- storage helpers ----------
  async function loadData(){
    try{
      const p = await window.storage.get('profile');
      profile = p ? JSON.parse(p.value) : null;
    }catch(e){ profile = null; }
    try{
      const l = await window.storage.get('logs');
      logs = l ? JSON.parse(l.value) : [];
    }catch(e){ logs = []; }
    loaded = true;
  }
  async function saveProfile(p){
    profile = p;
    await window.storage.set('profile', JSON.stringify(p));
  }
  async function saveLogs(){
    await window.storage.set('logs', JSON.stringify(logs));
  }

  // ---------- date helpers ----------
  function todayKey(){
    const d = new Date();
    return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
  }
  function fmtDate(key){
    const [y,m,d] = key.split('-');
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    return months[parseInt(m,10)-1] + ' ' + parseInt(d,10);
  }

  // ---------- calculations ----------
  function calcBMR(weight, height, age, gender){
    const base = 10*weight + 6.25*height - 5*age;
    return Math.round(gender === 'male' ? base + 5 : base - 161);
  }
  function latestWeight(){
    if(logs.length === 0) return profile.startWeight;
    const sorted = [...logs].sort((a,b)=> a.date < b.date ? 1 : -1);
    return sorted[0].weight;
  }
  function avgDeficit(){
    if(logs.length === 0) return null;
    const bmr = calcBMR(latestWeight(), profile.height, profile.age, profile.gender);
    let total = 0;
    logs.forEach(l=>{
      const burned = bmr + (l.caloriesBurned||0);
      total += (burned - (l.caloriesEat||0));
    });
    return Math.round(total/logs.length);
  }
  function daysToGoal(){
    const cur = latestWeight();
    const remainingKg = cur - profile.goalWeight;
    if(remainingKg <= 0) return {reached:true};
    const def = avgDeficit();
    if(def === null || def <= 0) return {reached:false, days:null};
    const days = Math.ceil((remainingKg * 7700) / def);
    return {reached:false, days};
  }

  // ---------- render router ----------
  function render(){
    if(!loaded){ app.innerHTML = ''; return; }
    if(!profile){ renderOnboarding(); }
    else{ renderDashboard(); }
  }

  // ---------- ONBOARDING ----------
  function renderOnboarding(){
    app.innerHTML = `
      <div class="top-nav">
        <div class="wordmark"><span class="dot"></span>Weight Tracker</div>
      </div>
      <div class="eyebrow" style="margin-bottom:6px;">Set up</div>
      <h1 style="font-size:26px;margin-bottom:22px;">Tell us about you</h1>

      <div class="card">
        <div class="field">
          <label>Sex (for BMR calculation)</label>
          <div class="toggle-group" id="genderToggle">
            <div class="toggle-opt active" data-val="female">Female</div>
            <div class="toggle-opt" data-val="male">Male</div>
          </div>
        </div>
        <div class="row">
          <div class="field">
            <label>Age</label>
            <input type="number" id="inAge" min="10" max="100" placeholder="30">
            <div class="unit">years</div>
          </div>
          <div class="field">
            <label>Height</label>
            <input type="number" id="inHeight" min="100" max="250" placeholder="165">
            <div class="unit">cm</div>
          </div>
        </div>
        <div class="row">
          <div class="field">
            <label>Current weight</label>
            <input type="number" id="inWeight" min="30" max="300" step="0.1" placeholder="70">
            <div class="unit">kg</div>
          </div>
          <div class="field">
            <label>Goal weight</label>
            <input type="number" id="inGoal" min="30" max="300" step="0.1" placeholder="62">
            <div class="unit">kg</div>
          </div>
        </div>
        <button class="btn btn-coral" id="btnStart">Calculate BMR &amp; start</button>
        <div id="errMsg" style="color:var(--coral);font-family:var(--font-mono);font-size:12px;margin-top:10px;"></div>
      </div>
    `;

    let gender = 'female';
    document.querySelectorAll('.toggle-opt').forEach(el=>{
      el.addEventListener('click', ()=>{
        document.querySelectorAll('.toggle-opt').forEach(o=>o.classList.remove('active'));
        el.classList.add('active');
        gender = el.dataset.val;
      });
    });

    document.getElementById('btnStart').addEventListener('click', async ()=>{
      const age = parseFloat(document.getElementById('inAge').value);
      const height = parseFloat(document.getElementById('inHeight').value);
      const weight = parseFloat(document.getElementById('inWeight').value);
      const goal = parseFloat(document.getElementById('inGoal').value);
      const err = document.getElementById('errMsg');
      if(!age || !height || !weight || !goal){
        err.textContent = 'Please fill in every field.';
        return;
      }
      if(goal >= weight){
        err.textContent = 'Goal weight should be lower than your current weight.';
        return;
      }
      const bmr = calcBMR(weight, height, age, gender);
      await saveProfile({age, height, gender, startWeight:weight, goalWeight:goal, bmr, createdAt:todayKey()});
      render();
    });
  }

  // ---------- DASHBOARD ----------
  function renderDashboard(){
    const cur = latestWeight();
    const bmr = calcBMR(cur, profile.height, profile.age, profile.gender);
    const def = avgDeficit();
    const proj = daysToGoal();
    const todayEntry = logs.find(l=>l.date === todayKey());

    const start = profile.startWeight, goal = profile.goalWeight;
    let pct = ((start - cur) / (start - goal)) * 100;
    pct = Math.max(0, Math.min(100, pct));

    let heroHtml = '';
    if(proj.reached){
      heroHtml = `
        <div class="hero-number">🎉</div>
        <div class="hero-label">Goal reached</div>
        <div class="hero-sub">You're at ${cur} kg — at or below your ${goal} kg goal.</div>`;
    } else if(proj.days === null){
      heroHtml = `
        <div class="hero-number">—</div>
        <div class="hero-label">Days to goal</div>
        <div class="hero-sub">Log today's calories to see your projection.</div>`;
    } else if(def <= 0){
      heroHtml = `
        <div class="hero-number">—</div>
        <div class="hero-label">Days to goal</div>
        <div class="hero-sub">Your average calorie balance is a surplus, not a deficit — you won't progress at this rate.</div>`;
    } else {
      heroHtml = `
        <div class="hero-number">${proj.days}</div>
        <div class="hero-label">Days to goal at current pace</div>
        <div class="hero-sub">Averaging a ${def} kcal/day deficit across ${logs.length} logged day${logs.length===1?'':'s'}</div>`;
    }

    app.innerHTML = `
      <div class="top-nav">
        <div class="wordmark"><span class="dot"></span>Weight Tracker</div>
        <button class="link-btn" id="btnEditProfile">Edit profile</button>
      </div>

      <div class="hero">
        ${heroHtml}
        <div class="scale">
          <div class="scale-track">
            <div class="scale-fill" style="width:${pct}%;"></div>
            <div class="scale-marker" style="left:${pct}%;" data-val="${cur} kg"></div>
          </div>
          <div class="scale-labels">
            <span>Start · ${start} kg</span>
            <span>Goal · ${goal} kg</span>
          </div>
        </div>
      </div>

      <div class="stat-grid">
        <div class="stat">
          ${badge('var(--violet)','var(--violet-soft)',ICONS.bmr)}
          <div><div class="stat-val">${bmr}</div><div class="stat-lbl">BMR kcal/day</div></div>
        </div>
        <div class="stat">
          ${badge('var(--blue)','var(--blue-soft)',ICONS.scale)}
          <div><div class="stat-val">${cur}</div><div class="stat-lbl">Current kg</div></div>
        </div>
      </div>

      <div class="card" id="logCard"></div>

      <div class="section-title">History</div>
      <div class="card history-wrap" id="historyCard"></div>

      <div class="footer-actions">
        <button class="btn-ghost" id="btnReset">Reset all data</button>
      </div>
    `;

    renderLogCard(todayEntry);
    renderHistory();

    document.getElementById('btnEditProfile').addEventListener('click', renderEditProfile);
    document.getElementById('btnReset').addEventListener('click', async ()=>{
      if(confirm('This clears your profile and every logged day. Continue?')){
        await window.storage.delete('profile');
        await window.storage.delete('logs');
        profile = null; logs = [];
        render();
      }
    });
  }

  function renderLogCard(todayEntry){
    const card = document.getElementById('logCard');
    if(todayEntry && !card.dataset.editing){
      card.innerHTML = `
        <div class="section-title">Today · ${fmtDate(todayEntry.date)}</div>
        <div class="chip-grid">
          ${chip('var(--blue)','var(--blue-soft)',ICONS.scale,'Weight',todayEntry.weight+' kg')}
          ${chip('var(--blue)','var(--blue-soft)',ICONS.water,'Water',todayEntry.water+' L')}
          ${chip('var(--amber)','var(--amber-soft)',ICONS.steps,'Steps',todayEntry.steps)}
          ${chip('var(--violet)','var(--violet-soft)',ICONS.protein,'Protein',todayEntry.protein+' g')}
          ${chip('var(--coral)','var(--coral-soft)',ICONS.eat,'Eaten',todayEntry.caloriesEat+' kcal')}
          ${chip('var(--green)','var(--green-soft)',ICONS.burn,'Burned',todayEntry.caloriesBurned+' kcal')}
        </div>
        <button class="btn btn-outline btn-small" style="margin-top:18px;" id="btnEditToday">Edit today's log</button>
      `;
      document.getElementById('btnEditToday').addEventListener('click', ()=>{
        card.dataset.editing = '1';
        renderLogForm(card, todayEntry);
      });
    } else {
      renderLogForm(card, todayEntry);
    }
  }

  function renderLogForm(card, existing){
    const e = existing || {};
    card.innerHTML = `
      <div class="section-title">Log today · ${fmtDate(todayKey())}</div>
      <div class="row">
        <div class="field">
          <label>Weight</label>
          <input type="number" id="lWeight" step="0.1" min="20" placeholder="kg" value="${e.weight ?? ''}">
        </div>
        <div class="field">
          <label>Water</label>
          <input type="number" id="lWater" step="0.1" min="0" placeholder="litres" value="${e.water ?? ''}">
        </div>
      </div>
      <div class="row">
        <div class="field">
          <label>Steps</label>
          <input type="number" id="lSteps" step="1" min="0" placeholder="count" value="${e.steps ?? ''}">
        </div>
        <div class="field">
          <label>Protein</label>
          <input type="number" id="lProtein" step="1" min="0" placeholder="grams" value="${e.protein ?? ''}">
        </div>
      </div>
      <div class="row">
        <div class="field">
          <label>Calories eaten</label>
          <input type="number" id="lEat" step="1" min="0" placeholder="kcal" value="${e.caloriesEat ?? ''}">
        </div>
        <div class="field">
          <label>Calories burned <span style="text-transform:none;">(exercise)</span></label>
          <input type="number" id="lBurn" step="1" min="0" placeholder="kcal" value="${e.caloriesBurned ?? ''}">
        </div>
      </div>
      <button class="btn btn-coral" id="btnSaveLog">Save today's log</button>
      <div id="logErr" style="color:var(--coral);font-family:var(--font-mono);font-size:12px;margin-top:10px;"></div>
    `;
    document.getElementById('btnSaveLog').addEventListener('click', async ()=>{
      const weight = parseFloat(document.getElementById('lWeight').value);
      const water = parseFloat(document.getElementById('lWater').value);
      const steps = parseInt(document.getElementById('lSteps').value);
      const protein = parseFloat(document.getElementById('lProtein').value);
      const caloriesEat = parseFloat(document.getElementById('lEat').value);
      const caloriesBurned = parseFloat(document.getElementById('lBurn').value);
      const err = document.getElementById('logErr');
      if([weight,water,steps,protein,caloriesEat,caloriesBurned].some(v=>isNaN(v))){
        err.textContent = 'Please fill in every field.';
        return;
      }
      const entry = {date:todayKey(), weight, water, steps, protein, caloriesEat, caloriesBurned};
      const idx = logs.findIndex(l=>l.date===todayKey());
      if(idx >= 0) logs[idx] = entry; else logs.push(entry);
      await saveLogs();
      render();
    });
  }

  function renderHistory(){
    const card = document.getElementById('historyCard');
    if(logs.length === 0){
      card.innerHTML = `<div class="empty-note">No entries yet — log today to start your history.</div>`;
      return;
    }
    const sorted = [...logs].sort((a,b)=> a.date < b.date ? 1 : -1);
    let rows = sorted.map(l=>{
      const bmr = calcBMR(l.weight, profile.height, profile.age, profile.gender);
      const def = bmr + (l.caloriesBurned||0) - (l.caloriesEat||0);
      const defClass = def > 0 ? 'pos' : 'neg';
      const defText = def > 0 ? '+'+def : def;
      return `<tr>
        <td>${fmtDate(l.date)}</td>
        <td>${l.weight}</td>
        <td>${l.water}</td>
        <td>${l.steps}</td>
        <td>${l.protein}</td>
        <td>${l.caloriesEat}</td>
        <td>${l.caloriesBurned}</td>
        <td class="${defClass}">${defText}</td>
      </tr>`;
    }).join('');
    card.innerHTML = `
      <table>
        <thead><tr>
          <th>Date</th><th>Kg</th><th>L</th><th>Steps</th><th>Prot.</th><th>Eat</th><th>Burn</th><th>Deficit</th>
        </tr></thead>
        <tbody>${rows}</tbody>
      </table>
    `;
  }

  // ---------- EDIT PROFILE ----------
  function renderEditProfile(){
    app.innerHTML = `
      <div class="top-nav">
        <div class="wordmark"><span class="dot"></span>Weight Tracker</div>
        <button class="link-btn" id="btnCancel">Cancel</button>
      </div>
      <div class="eyebrow" style="margin-bottom:6px;">Edit</div>
      <h1 style="font-size:26px;margin-bottom:22px;">Your profile</h1>
      <div class="card">
        <div class="field">
          <label>Sex (for BMR calculation)</label>
          <div class="toggle-group" id="genderToggle">
            <div class="toggle-opt" data-val="female">Female</div>
            <div class="toggle-opt" data-val="male">Male</div>
          </div>
        </div>
        <div class="row">
          <div class="field">
            <label>Age</label>
            <input type="number" id="inAge" value="${profile.age}">
          </div>
          <div class="field">
            <label>Height (cm)</label>
            <input type="number" id="inHeight" value="${profile.height}">
          </div>
        </div>
        <div class="field">
          <label>Goal weight (kg)</label>
          <input type="number" id="inGoal" step="0.1" value="${profile.goalWeight}">
        </div>
        <button class="btn btn-coral" id="btnSaveProfile">Save changes</button>
      </div>
    `;
    document.querySelectorAll('.toggle-opt').forEach(el=>{
      if(el.dataset.val === profile.gender) el.classList.add('active');
      el.addEventListener('click', ()=>{
        document.querySelectorAll('.toggle-opt').forEach(o=>o.classList.remove('active'));
        el.classList.add('active');
      });
    });
    document.getElementById('btnCancel').addEventListener('click', render);
    document.getElementById('btnSaveProfile').addEventListener('click', async ()=>{
      const age = parseFloat(document.getElementById('inAge').value);
      const height = parseFloat(document.getElementById('inHeight').value);
      const goal = parseFloat(document.getElementById('inGoal').value);
      const gender = document.querySelector('.toggle-opt.active').dataset.val;
      const updated = {...profile, age, height, goalWeight:goal, gender};
      updated.bmr = calcBMR(latestWeight(), height, age, gender);
      await saveProfile(updated);
      render();
    });
  }

  // ---------- init ----------
  (async ()=>{
    await loadData();
    render();
  })();
})();
