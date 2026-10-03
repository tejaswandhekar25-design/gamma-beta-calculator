/**
 * app.js — Splash, theme toggle, template integral UI, calculator, KaTeX
 */
document.addEventListener('DOMContentLoaded', () => {

  // ===== SPLASH =====
  const splash = document.getElementById('splash-screen');
  const mainSite = document.getElementById('main-site');
  const splashP = document.getElementById('splash-particles');
  for (let i = 0; i < 30; i++) {
    const p = document.createElement('div');
    p.className = 'splash-particle';
    const s = Math.random() * 8 + 3;
    p.style.cssText = `width:${s}px;height:${s}px;left:${Math.random()*100}%;animation-delay:${Math.random()*4}s;animation-duration:${4+Math.random()*4}s;`;
    splashP.appendChild(p);
  }
  setTimeout(() => { splash.classList.add('hidden'); mainSite.classList.remove('hidden'); initParticles(); drawParticles(); }, 4500);

  // ===== THEME TOGGLE =====
  const toggle = document.getElementById('theme-toggle');
  const saved = localStorage.getItem('theme');
  if (saved) document.documentElement.setAttribute('data-theme', saved);
  toggle.addEventListener('click', () => {
    const cur = document.documentElement.getAttribute('data-theme');
    const nxt = cur === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', nxt);
    localStorage.setItem('theme', nxt);
  });

  // ===== PARTICLES =====
  const canvas = document.getElementById('particle-canvas');
  const ctx = canvas.getContext('2d');
  let particles = [];
  function resizeCanvas() { canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
  function mkP() { return { x:Math.random()*canvas.width, y:Math.random()*canvas.height, vx:(Math.random()-.5)*.4, vy:(Math.random()-.5)*.4, size:Math.random()*2.5+.5, op:Math.random()*.3+.1, hue:Math.random()*40+340 }; }
  function initParticles() { resizeCanvas(); particles=[]; for(let i=0;i<50;i++) particles.push(mkP()); }
  function drawParticles() {
    ctx.clearRect(0,0,canvas.width,canvas.height);
    for(const p of particles){ p.x+=p.vx;p.y+=p.vy;if(p.x<0||p.x>canvas.width)p.vx*=-1;if(p.y<0||p.y>canvas.height)p.vy*=-1;ctx.beginPath();ctx.arc(p.x,p.y,p.size,0,Math.PI*2);ctx.fillStyle=`hsla(${p.hue},80%,70%,${p.op})`;ctx.fill(); }
    for(let i=0;i<particles.length;i++) for(let j=i+1;j<particles.length;j++){ const dx=particles[i].x-particles[j].x,dy=particles[i].y-particles[j].y,d=Math.sqrt(dx*dx+dy*dy);if(d<150){ctx.beginPath();ctx.moveTo(particles[i].x,particles[i].y);ctx.lineTo(particles[j].x,particles[j].y);ctx.strokeStyle=`hsla(350,60%,60%,${.06*(1-d/150)})`;ctx.lineWidth=.5;ctx.stroke();}}
    requestAnimationFrame(drawParticles);
  }
  window.addEventListener('resize', () => { resizeCanvas(); particles=[]; for(let i=0;i<50;i++) particles.push(mkP()); });

  // ===== KaTeX =====
  function rK(el,l){try{katex.render(l,el,{displayMode:true,throwOnError:false});}catch(e){el.textContent=l;}}
  function rKI(el,l){try{katex.render(l,el,{displayMode:false,throwOnError:false});}catch(e){el.textContent=l;}}
  function waitK(cb){if(typeof katex!=='undefined')cb();else setTimeout(()=>waitK(cb),100);}
  waitK(()=>{initHero();initTheory();initExamples();renderPrefixes();});

  function initHero(){
    const g=document.getElementById('gamma-hero-formula'),b=document.getElementById('beta-hero-formula');
    if(g)rK(g,'\\Gamma(n) = \\int_0^{\\infty} t^{n-1} e^{-t}\\, dt');
    if(b)rK(b,'B(x,y) = \\int_0^1 t^{x-1}(1-t)^{y-1}\\, dt');
  }
  function renderPrefixes(){
    const gp=document.getElementById('gamma-prefix');
    if(gp)rKI(gp,'\\Gamma(n) =');
  }

  // ===== TABS =====
  const tabs=document.querySelectorAll('.calc-tab');
  const groups={'gamma':document.getElementById('input-gamma'),'beta':document.getElementById('input-beta'),'gamma-integral':document.getElementById('input-gamma-integral'),'beta-integral':document.getElementById('input-beta-integral')};
  let activeType='gamma';
  tabs.forEach(t=>t.addEventListener('click',()=>{
    tabs.forEach(x=>x.classList.remove('active'));t.classList.add('active');activeType=t.dataset.type;
    Object.values(groups).forEach(g=>g.classList.remove('visible'));groups[activeType].classList.add('visible');
    document.getElementById('solution-area').classList.remove('visible');
  }));

  // ===== TEMPLATE FIELD SWITCHING =====
  const giSel = document.getElementById('gamma-int-type');
  if(giSel) giSel.addEventListener('change', () => {
    document.querySelectorAll('#input-gamma-integral .template-fields').forEach(f=>f.classList.remove('visible'));
    const sel = giSel.value;
    const fieldMap = {type1:'gi-fields-type1',type2:'gi-fields-type2',type3:'gi-fields-type3',type4:'gi-fields-type4'};
    const el = document.getElementById(fieldMap[sel]);
    if(el) el.classList.add('visible');
  });

  const biSel = document.getElementById('beta-int-type');
  if(biSel) biSel.addEventListener('change', () => {
    document.querySelectorAll('#input-beta-integral .template-fields').forEach(f=>f.classList.remove('visible'));
    const id = 'bi-fields-' + biSel.value;
    const el = document.getElementById(id);
    if(el) el.classList.add('visible');
  });

  // ===== GLOBAL PASTE IMAGE BUTTON =====
  const globalPasteBtn = document.getElementById('paste-img-global');
  const globalPreview = document.getElementById('paste-preview-global');

  function handleImagePaste(blob) {
    const url = URL.createObjectURL(blob);
    globalPreview.innerHTML = `<img src="${url}" alt="Pasted question"/><button class="remove-img" title="Remove">✕</button>`;
    globalPreview.classList.add('has-img');
    delete globalPreview.dataset.ocrDone;
    globalPreview.querySelector('.remove-img').addEventListener('click', () => {
      globalPreview.innerHTML = '';
      globalPreview.classList.remove('has-img');
      delete globalPreview.dataset.ocrDone;
      URL.revokeObjectURL(url);
    });
  }

  if (globalPasteBtn) {
    globalPasteBtn.addEventListener('click', async () => {
      try {
        const items = await navigator.clipboard.read();
        for (const item of items) {
          const imgType = item.types.find(t => t.startsWith('image/'));
          if (imgType) {
            const blob = await item.getType(imgType);
            handleImagePaste(blob);
            return;
          }
        }
        alert('No image found in clipboard. Copy a screenshot first (use Snipping Tool or PrtScn), then click this button.');
      } catch (e) {
        alert('Could not read clipboard. Please use Ctrl+V to paste, or try: 1) Take screenshot 2) Click this button');
      }
    });
  }

  // Support Ctrl+V paste anywhere on the calculator
  const calcContainer = document.querySelector('.calculator-container');
  if (calcContainer) {
    calcContainer.addEventListener('paste', (e) => {
      const items = e.clipboardData.items;
      for (const item of items) {
        if (item.type.startsWith('image/')) {
          const blob = item.getAsFile();
          handleImagePaste(blob);
          e.preventDefault();
          return;
        }
      }
    });
  }

  // ===== SOLVE =====
  document.getElementById('solve-btn').addEventListener('click', () => solve());
  document.querySelectorAll('.calc-input').forEach(i=>i.addEventListener('keydown',e=>{if(e.key==='Enter')solve();}));

  async function solve(){
    // If there's a pasted screenshot that hasn't been acknowledged yet, guide the user
    const globalImg = globalPreview ? globalPreview.querySelector('img') : null;
    if (globalImg && !globalPreview.dataset.ocrDone) {
      globalPreview.dataset.ocrDone = '1';
      const area = document.getElementById('solution-area');
      const stepsEl = document.getElementById('solution-steps');
      stepsEl.innerHTML = `<div class="step" style="border-left:3px solid var(--accent-2);">
        <div class="step-header"><span class="step-number">📸</span><span class="step-title">Screenshot pasted! Now follow these steps:</span></div>
        <div class="step-content">
          <p><strong>Step 1:</strong> Look at your screenshot above and identify the integral type.</p>
          <p><strong>Step 2:</strong> Select the correct tab — <strong>Gamma Integral</strong> or <strong>Beta Integral</strong>.</p>
          <p><strong>Step 3:</strong> Choose the matching formula type from the dropdown.</p>
          <p><strong>Step 4:</strong> Fill in the parameter values (A, B, C, M, N, etc.) from your question.</p>
          <p><strong>Step 5:</strong> Click <strong>"Solve Step-by-Step"</strong> again to get your answer!</p>
        </div>
      </div>`;
      area.classList.add('visible');
      area.scrollIntoView({behavior:'smooth',block:'start'});
      return;
    }
    solveFromFields();
  }

  function solveFromFields(){
    let result;
    switch(activeType){
      case 'gamma':
        result=MathEngine.solveGamma(document.getElementById('gamma-n').value);
        break;
      case 'beta':
        result=MathEngine.solveBeta(document.getElementById('beta-x').value,document.getElementById('beta-y').value);
        break;
      case 'gamma-integral': {
        const gType = document.getElementById('gamma-int-type').value;
        if(gType==='type1'){
          result=MathEngine.solveGammaIntTemplate(document.getElementById('gi-a').value,document.getElementById('gi-b').value,document.getElementById('gi-c').value);
        } else if(gType==='type2'){
          result=MathEngine.solveGammaLogInt(document.getElementById('gi-log-a').value,document.getElementById('gi-log-b').value);
        } else if(gType==='type3'){
          result=MathEngine.solveGammaExpBase(document.getElementById('gi-exp-a').value,document.getElementById('gi-exp-b').value);
        }
        break;
      }
      case 'beta-integral': {
        const bType = document.getElementById('beta-int-type').value;
        if(bType==='power'){
          result=MathEngine.solveBetaIntPower(document.getElementById('bi-pw-a').value,document.getElementById('bi-pw-n').value,document.getElementById('bi-pw-b').value);
        } else if(bType==='range'){
          result=MathEngine.solveBetaIntRange(document.getElementById('bi-rg-m').value,document.getElementById('bi-rg-n').value,document.getElementById('bi-rg-A').value);
        } else if(bType==='ab'){
          result=MathEngine.solveBetaIntAB(document.getElementById('bi-ab-m').value,document.getElementById('bi-ab-n').value,document.getElementById('bi-ab-a').value,document.getElementById('bi-ab-b').value);
        } else if(bType==='trig'){
          result=MathEngine.solveBetaTrig(document.getElementById('bi-tr-m').value,document.getElementById('bi-tr-n').value);
        }
        break;
      }
    }
    renderSolution(result);
  }

  function renderSolution(result){
    const area=document.getElementById('solution-area'),stepsEl=document.getElementById('solution-steps');
    stepsEl.innerHTML='';
    if(result.error){stepsEl.innerHTML=`<div class="error-message">⚠️ ${result.error}</div>`;area.classList.add('visible');return;}
    result.steps.forEach((step,i)=>{
      const d=document.createElement('div');d.className=step.isFinal?'final-answer':'step';d.style.animationDelay=`${i*.08}s`;
      if(step.isFinal){d.innerHTML=`<div class="final-label">✨ Final Answer</div><div class="step-math" id="sm-${i}"></div>`;}
      else{d.innerHTML=`<div class="step-header"><span class="step-number">${i+1}</span><span class="step-title">${step.title}</span></div><div class="step-content">${step.content?`<p>${step.content}</p>`:''}${step.math?`<div class="step-math" id="sm-${i}"></div>`:''}</div>`;}
      stepsEl.appendChild(d);
      if(step.math){const m=document.getElementById(`sm-${i}`);if(m)rK(m,step.math);}
    });
    area.classList.add('visible');area.scrollIntoView({behavior:'smooth',block:'start'});
  }

  // Copy
  document.getElementById('copy-btn').addEventListener('click',()=>{
    navigator.clipboard.writeText(document.getElementById('solution-steps').innerText).then(()=>{
      const s=document.getElementById('copy-btn').querySelector('span');s.textContent='Copied!';setTimeout(()=>s.textContent='Copy',2000);
    });
  });

  // ===== THEORY =====
  function initTheory(){
    const gd=document.getElementById('theory-gamma-def');
    if(gd)rK(gd,'\\Gamma(n) = \\int_0^{\\infty} t^{n-1}\\, e^{-t}\\, dt \\quad (n > 0)');
    const gp=document.getElementById('theory-gamma-props');
    if(gp)['\\Gamma(n+1) = n \\cdot \\Gamma(n)','\\Gamma(n) = (n-1)! \\;\\text{for positive integers}','\\Gamma\\left(\\frac{1}{2}\\right) = \\sqrt{\\pi}','\\Gamma(1) = 1,\\; \\Gamma(2) = 1','\\Gamma(n)\\,\\Gamma(1-n) = \\frac{\\pi}{\\sin(n\\pi)}'].forEach(p=>{const li=document.createElement('li'),sp=document.createElement('span');li.appendChild(sp);gp.appendChild(li);rK(sp,p);});
    const bd=document.getElementById('theory-beta-def');
    if(bd)rK(bd,'B(x,y) = \\int_0^1 t^{x-1}(1-t)^{y-1}\\, dt \\quad (x,y > 0)');
    const bp=document.getElementById('theory-beta-props');
    if(bp)['B(x,y) = B(y,x)','B(x,y) = \\frac{\\Gamma(x)\\,\\Gamma(y)}{\\Gamma(x+y)}','B(x,y) = 2\\int_0^{\\pi/2} \\sin^{2x-1}\\theta\\,\\cos^{2y-1}\\theta\\, d\\theta','B(m,n) = \\frac{(m-1)!(n-1)!}{(m+n-1)!}'].forEach(p=>{const li=document.createElement('li'),sp=document.createElement('span');li.appendChild(sp);bp.appendChild(li);rK(sp,p);});
    const rf=document.getElementById('theory-relation-formula');
    if(rf)rK(rf,'B(x,y) = \\frac{\\Gamma(x) \\cdot \\Gamma(y)}{\\Gamma(x+y)}');
    const sv=document.getElementById('special-values-grid');
    if(sv)[['\\Gamma(1) = 1','0!=1'],['\\Gamma(2) = 1','1!=1'],['\\Gamma(3) = 2','2!=2'],['\\Gamma(4) = 6','3!=6'],['\\Gamma(5) = 24','4!=24'],['\\Gamma(6) = 120','5!=120'],['\\Gamma(\\frac{1}{2}) = \\sqrt{\\pi}','≈1.7725'],['\\Gamma(\\frac{3}{2}) = \\frac{\\sqrt{\\pi}}{2}','≈0.8862'],['B(1,1) = 1',''],['B(2,2) = \\frac{1}{6}','≈0.1667'],['B(\\frac{1}{2},\\frac{1}{2}) = \\pi','≈3.1416']].forEach(([l,n])=>{const d=document.createElement('div');d.className='special-value';const sp=document.createElement('span');d.appendChild(sp);if(n){const sm=document.createElement('small');sm.style.cssText='display:block;margin-top:4px;color:var(--text-muted);font-size:12px';sm.textContent=n;d.appendChild(sm);}sv.appendChild(d);rKI(sp,l);});
  }

  // ===== EXAMPLES =====
  function initExamples(){
    const grid=document.getElementById('examples-grid');if(!grid)return;
    const exs=[
      {type:'Gamma',formula:'\\Gamma(5)',inputs:{mode:'gamma',gamma:'5'},answer:'= 4! = 24'},
      {type:'Gamma',formula:'\\Gamma\\left(\\frac{1}{2}\\right)',inputs:{mode:'gamma',gamma:'1/2'},answer:'= √π ≈ 1.7725'},
      {type:'Gamma',formula:'\\Gamma\\left(\\frac{7}{2}\\right)',inputs:{mode:'gamma',gamma:'7/2'},answer:'= 15√π/8'},
      {type:'Gamma',formula:'\\Gamma(10)',inputs:{mode:'gamma',gamma:'10'},answer:'= 9! = 362880'},
      {type:'Beta',formula:'B(3, 4)',inputs:{mode:'beta',x:'3',y:'4'},answer:'= 1/60'},
      {type:'Beta',formula:'B(2, 3)',inputs:{mode:'beta',x:'2',y:'3'},answer:'= 1/12'},
      {type:'Beta',formula:'B\\left(\\frac{1}{2}, \\frac{1}{2}\\right)',inputs:{mode:'beta',x:'1/2',y:'1/2'},answer:'= π'},
      {type:'Beta',formula:'B(5, 3)',inputs:{mode:'beta',x:'5',y:'3'},answer:'= 1/105'},
      {type:'Gamma',formula:'\\Gamma\\left(\\frac{3}{2}\\right)',inputs:{mode:'gamma',gamma:'3/2'},answer:'= √π/2'},
    ];
    exs.forEach((ex,i)=>{
      const c=document.createElement('div');c.className='example-card';c.id=`ex-${i}`;
      c.innerHTML=`<div class="example-type">${ex.type}</div><div class="example-formula" id="ef-${i}"></div><div class="example-answer">${ex.answer}</div>`;
      c.addEventListener('click',()=>{
        const tab=document.querySelector(`.calc-tab[data-type="${ex.inputs.mode}"]`);if(tab)tab.click();
        if(ex.inputs.mode==='gamma')document.getElementById('gamma-n').value=ex.inputs.gamma;
        else{document.getElementById('beta-x').value=ex.inputs.x;document.getElementById('beta-y').value=ex.inputs.y;}
        solve();document.getElementById('calculator').scrollIntoView({behavior:'smooth'});
      });
      grid.appendChild(c);
      const fe=document.getElementById(`ef-${i}`);if(fe)rKI(fe,ex.formula);
    });
  }

  // Smooth scroll
  document.querySelectorAll('a[href^="#"]').forEach(l=>l.addEventListener('click',e=>{e.preventDefault();const t=document.querySelector(l.getAttribute('href'));if(t)t.scrollIntoView({behavior:'smooth',block:'start'});}));

  // Intersection observer
  setTimeout(()=>{
    const obs=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.style.opacity='1';e.target.style.transform='translateY(0)';}}),{threshold:.1});
    document.querySelectorAll('.theory-card,.matlab-card,.example-card').forEach(el=>{el.style.opacity='0';el.style.transform='translateY(30px)';el.style.transition='opacity .6s ease,transform .6s ease';obs.observe(el);});
  },5000);
});
