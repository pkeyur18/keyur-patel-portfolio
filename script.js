document.getElementById('year').textContent = new Date().getFullYear();

// theme toggle
const themeToggle = document.getElementById('themeToggle');
themeToggle.addEventListener('click', ()=>{
  const current = document.documentElement.getAttribute('data-theme');
  const next = current === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem('theme', next);
});

// scroll progress
const progressBar = document.getElementById('progressBar');
function updateProgress(){
  const h = document.documentElement;
  const scrolled = (h.scrollTop) / (h.scrollHeight - h.clientHeight) * 100;
  progressBar.style.width = scrolled + '%';
}
document.addEventListener('scroll', updateProgress);
updateProgress();

// scroll reveal
const revealEls = document.querySelectorAll('.reveal');
const io = new IntersectionObserver((entries)=>{
  entries.forEach(entry=>{
    if(entry.isIntersecting){
      entry.target.classList.add('visible');
      io.unobserve(entry.target);
    }
  });
},{threshold:0.12, rootMargin:'0px 0px -60px 0px'});
revealEls.forEach(el=>io.observe(el));

// stat counters
const counters = document.querySelectorAll('.count');
const countIO = new IntersectionObserver((entries)=>{
  entries.forEach(entry=>{
    if(entry.isIntersecting){
      const el = entry.target;
      const target = +el.dataset.target;
      let cur = 0;
      const step = Math.max(1, target/24);
      const tick = ()=>{
        cur += step;
        if(cur >= target){ el.textContent = target; return; }
        el.textContent = Math.floor(cur);
        requestAnimationFrame(tick);
      };
      tick();
      countIO.unobserve(el);
    }
  });
},{threshold:0.5});
counters.forEach(el=>countIO.observe(el));

// ---- FitTrack demo: weekly split generator ----
const WEEKLY_SPLITS = {
  'muscle-gain': [
    {day:'Mon', focus:'Push', items:['Bench Press','Incline DB Press','Triceps Pushdown']},
    {day:'Tue', focus:'Pull', items:['Deadlift','Barbell Row','Lat Pulldown']},
    {day:'Wed', focus:'Legs', items:['Back Squat','Leg Press','Calf Raise']},
    {day:'Thu', focus:'Rest / Mobility', items:['Light stretching','Foam rolling']},
    {day:'Fri', focus:'Upper Body', items:['Overhead Press','Pull-Up','Barbell Curl']},
  ],
  'fat-loss': [
    {day:'Mon', focus:'Full Body Circuit', items:['Goblet Squat','Push-Up','Kettlebell Swing']},
    {day:'Tue', focus:'Cardio + Core', items:['Rowing Intervals','Plank','Mountain Climbers']},
    {day:'Wed', focus:'Upper Body Circuit', items:['DB Row','Shoulder Press','Bicep Curl']},
    {day:'Thu', focus:'Active Recovery', items:['Brisk walk','Stretching']},
    {day:'Fri', focus:'Lower Body Circuit', items:['Lunges','Step-Ups','Glute Bridge']},
  ],
  'general': [
    {day:'Mon', focus:'Full Body', items:['Squat','Bench Press','Bent-Over Row']},
    {day:'Tue', focus:'Cardio', items:['Jog / Cycle 30 min']},
    {day:'Wed', focus:'Upper Body', items:['Overhead Press','Pull-Up','Dips']},
    {day:'Thu', focus:'Rest', items:['Stretching']},
    {day:'Fri', focus:'Lower Body', items:['Deadlift','Leg Press','Calf Raise']},
  ],
};

const goalButtons = document.querySelectorAll('.goal-btn');
let selectedGoal = 'muscle-gain';
goalButtons.forEach(btn=>{
  btn.addEventListener('click', ()=>{
    goalButtons.forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');
    selectedGoal = btn.dataset.goal;
  });
});

const splitResult = document.getElementById('splitResult');
document.getElementById('generateSplitBtn').addEventListener('click', ()=>{
  const plan = WEEKLY_SPLITS[selectedGoal];
  splitResult.innerHTML = plan.map(d =>
    `<div class="split-day"><b>${d.day} — ${d.focus}</b><span>${d.items.join(', ')}</span></div>`
  ).join('');
});

const prBanner = document.getElementById('prBanner');
document.getElementById('logSetBtn').addEventListener('click', ()=>{
  prBanner.classList.remove('show');
  void prBanner.offsetWidth; // restart animation
  prBanner.classList.add('show');
});

// ---- Spendly demo: quick-add keypad ----
let amountStr = '0';
let selectedCategory = 'Food';
let budgetSpent = 0;
const BUDGET_LIMIT = 8000;

const amountDisplay = document.getElementById('amountDisplay');
const chipButtons = document.querySelectorAll('.chip-btn');
const budgetFill = document.getElementById('budgetFill');
const budgetSpentEl = document.getElementById('budgetSpent');
const saveToast = document.getElementById('saveToast');

function renderAmount(){
  amountDisplay.textContent = '₹' + amountStr;
}

chipButtons.forEach(btn=>{
  btn.addEventListener('click', ()=>{
    chipButtons.forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');
    selectedCategory = btn.dataset.cat;
  });
});

document.getElementById('keypad').addEventListener('click', (e)=>{
  const btn = e.target.closest('button[data-key]');
  if(!btn) return;
  const key = btn.dataset.key;

  if(key === 'back'){
    amountStr = amountStr.length > 1 ? amountStr.slice(0,-1) : '0';
    renderAmount();
    return;
  }
  if(key === 'save'){
    const value = parseInt(amountStr, 10) || 0;
    if(value <= 0) return;
    budgetSpent = Math.min(budgetSpent + value, BUDGET_LIMIT);
    budgetFill.style.width = ((budgetSpent / BUDGET_LIMIT) * 100) + '%';
    budgetSpentEl.textContent = '₹' + budgetSpent.toLocaleString('en-IN');
    saveToast.textContent = `Saved ₹${value.toLocaleString('en-IN')} to ${selectedCategory}`;
    saveToast.classList.add('show');
    setTimeout(()=> saveToast.classList.remove('show'), 2200);
    amountStr = '0';
    renderAmount();
    return;
  }
  // digit
  amountStr = amountStr === '0' ? key : amountStr + key;
  if(amountStr.length > 6) amountStr = amountStr.slice(0,6);
  renderAmount();
});

const lockReveal = document.getElementById('lockReveal');
const lockDetail = document.getElementById('lockDetail');
lockReveal.addEventListener('click', ()=>{
  const isOpen = lockDetail.classList.toggle('show');
  lockReveal.setAttribute('aria-expanded', String(isOpen));
});

// ---- Contact form: mailto fallback (no backend on this static site) ----
document.getElementById('contactForm').addEventListener('submit', (e)=>{
  e.preventDefault();
  const name = document.getElementById('cf-name').value;
  const email = document.getElementById('cf-email').value;
  const project = document.getElementById('cf-project').value;
  const message = document.getElementById('cf-message').value;

  const subject = encodeURIComponent(`Project inquiry from ${name}`);
  const body = encodeURIComponent(
    `Name: ${name}\nEmail: ${email}\nProject type: ${project}\n\n${message}`
  );
  window.location.href = `mailto:patelkeyur941@gmail.com?subject=${subject}&body=${body}`;
});
