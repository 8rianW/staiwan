'use strict';
const loader=document.getElementById('loader');
const loaderFill=document.querySelector('.loader-fill');
window.addEventListener('load',()=>{
  loaderFill.style.width='100%';
  setTimeout(()=>{ loader.classList.add('hidden'); initAll(); },2000);
});
const cur=document.getElementById('cursor');
const ring=document.getElementById('cursor-ring');
let cx=0,cy=0,rx=0,ry=0;
document.addEventListener('mousemove',e=>{ cx=e.clientX; cy=e.clientY; cur.style.left=cx+'px'; cur.style.top=cy+'px'; });
(function followRing(){ rx+=(cx-rx)*.1; ry+=(cy-ry)*.1; ring.style.left=rx+'px'; ring.style.top=ry+'px'; requestAnimationFrame(followRing); })();
document.querySelectorAll('a,button,.grid-cell,.warmth-photo,.gr-item,.cu-item').forEach(el=>{
  el.addEventListener('mouseenter',()=>document.body.classList.add('hovering'));
  el.addEventListener('mouseleave',()=>document.body.classList.remove('hovering'));
});
const nav=document.getElementById('nav');
const navName=document.getElementById('navSectionName');
const navDots=document.querySelectorAll('.nav-dot');
const sections=document.querySelectorAll('.section');
window.addEventListener('scroll',()=>{ nav.classList.toggle('scrolled',window.scrollY>60); updateScrollProgress(); updateNavDots(); },{passive:true});
navDots.forEach(dot=>{ dot.addEventListener('click',()=>{ document.getElementById(dot.dataset.target)?.scrollIntoView({behavior:'smooth'}); }); });
function updateNavDots(){ let cur2=0; sections.forEach((s,i)=>{ const r=s.getBoundingClientRect(); if(r.top<=window.innerHeight*.5) cur2=i; }); navDots.forEach((d,i)=>d.classList.toggle('active',i===cur2)); navName.textContent=sections[cur2]?.dataset.name||''; }
const scrollFill=document.getElementById('scroll-fill');
function updateScrollProgress(){ const t=document.body.scrollHeight-window.innerHeight; scrollFill.style.height=(window.scrollY/t*100)+'%'; }
function initAll(){
  const obs=new IntersectionObserver(entries=>{
    entries.forEach(e=>{
      if(!e.isIntersecting) return;
      const el=e.target;
      const delay=parseFloat(el.dataset.delay||0)*1000;
      setTimeout(()=>el.classList.add('in'),delay);
      obs.unobserve(el);
    });
  },{threshold:0.12,rootMargin:'0px 0px -60px 0px'});
  document.querySelectorAll('.reveal,.reveal-up,.reveal-photo').forEach(el=>obs.observe(el));
  const sObs=new IntersectionObserver(entries=>{ entries.forEach(e=>{ if(e.isIntersecting) e.target.classList.add('active'); }); },{threshold:0.3});
  sections.forEach(s=>sObs.observe(s));
  const fbObs=new IntersectionObserver(entries=>{ entries.forEach(e=>{ if(e.isIntersecting) e.target.classList.add('in'); }); },{threshold:0.4});
  const fb=document.querySelector('.freedom-bars'); if(fb) fbObs.observe(fb);
  initSyntax(); initChaos(); initEnding();
}
const wordPairs=[
  {from:'CHAOS',to:'ACTION',taiwan:['C','A','O']},
  {from:'CHAOS',to:'NATION',taiwan:['A','N']},
  {from:'LOST',to:'STAND',taiwan:['T','A','N']},
  {from:'MESS',to:'MEANS',taiwan:['A','N']},
  {from:'NOISE',to:'ONSITE',taiwan:['I','N']},
];
let pairIdx=0,isAnimating=false;
const syntaxFrom=document.getElementById('syntaxFrom');
const syntaxTo=document.getElementById('syntaxTo');
const syntaxBtn=document.getElementById('syntaxNext');
function renderWord(el,word,tc){ el.innerHTML=''; word.split('').forEach(ch=>{ const s=document.createElement('span'); s.className='s-letter'+(tc.includes(ch)?' taiwan':''); s.textContent=ch; el.appendChild(s); }); }
function animateTransform(fw,tw,tc){
  if(isAnimating) return; isAnimating=true;
  syntaxFrom.querySelectorAll('.s-letter').forEach((l,i)=>{ setTimeout(()=>l.classList.add('out'),i*60); });
  const delay=fw.length*60+200;
  syntaxTo.innerHTML='';
  tw.split('').forEach((ch,i)=>{ const s=document.createElement('span'); s.className='s-letter in'+(tc.includes(ch)?' taiwan':''); s.textContent=ch; syntaxTo.appendChild(s); setTimeout(()=>s.classList.remove('in'),delay+i*70); });
  setTimeout(()=>{ renderWord(syntaxFrom,fw,tc); isAnimating=false; },delay+tw.length*70+300);
}
function initSyntax(){
  const p=wordPairs[pairIdx]; renderWord(syntaxFrom,p.from,p.taiwan); renderWord(syntaxTo,p.to,p.taiwan);
  syntaxBtn.addEventListener('click',()=>{ pairIdx=(pairIdx+1)%wordPairs.length; const n=wordPairs[pairIdx]; animateTransform(n.from,n.to,n.taiwan); });
  const sObs=new IntersectionObserver(entries=>{
    if(!entries[0].isIntersecting) return;
    let auto=setInterval(()=>{ pairIdx=(pairIdx+1)%wordPairs.length; const n=wordPairs[pairIdx]; animateTransform(n.from,n.to,n.taiwan); },3500);
    syntaxBtn.addEventListener('click',()=>clearInterval(auto));
    sObs.unobserve(entries[0].target);
  },{threshold:0.5});
  const ss=document.getElementById('s-syntax'); if(ss) sObs.observe(ss);
}
function initChaos(){
  const canvas=document.getElementById('chaosCanvas'); if(!canvas) return;
  const ctx=canvas.getContext('2d');
  const colors=['#B23A3A','#2F5D9F','#3A7D44','#C9A84C','#7B4F9E'];
  let particles=[],settled=false,W,H;
  function resize(){ W=canvas.width=canvas.offsetWidth; H=canvas.height=canvas.offsetHeight; }
  window.addEventListener('resize',resize,{passive:true}); resize();
  class Particle{
    constructor(){ this.reset(true); }
    reset(r){ this.x=r?Math.random()*W:W/2; this.y=r?Math.random()*H:H/2; this.vx=(Math.random()-.5)*(settled?1.5:3.5); this.vy=(Math.random()-.5)*(settled?1.5:3.5); this.rad=Math.random()*2+1; this.alpha=Math.random()*.6+.3; this.color=colors[Math.floor(Math.random()*colors.length)]; this.life=Math.random()*200+100; this.age=0; }
    update(){ if(settled){ this.vx+=(Math.sin(this.y*.012+Date.now()*.0005)-this.vx)*.06; this.vy+=(Math.cos(this.x*.012+Date.now()*.0005)-this.vy)*.06; } else{ this.vx+=(Math.random()-.5)*.3; this.vy+=(Math.random()-.5)*.3; } this.x+=this.vx; this.y+=this.vy; this.age++; if(this.age>this.life||this.x<-10||this.x>W+10||this.y<-10||this.y>H+10) this.reset(false); }
    draw(){ ctx.beginPath(); ctx.arc(this.x,this.y,this.rad,0,Math.PI*2); ctx.fillStyle=this.color+Math.floor(this.alpha*255).toString(16).padStart(2,'0'); ctx.fill(); }
  }
  for(let i=0;i<200;i++) particles.push(new Particle());
  function loop(){ ctx.fillStyle='rgba(0,0,0,0.18)'; ctx.fillRect(0,0,W,H); particles.forEach(p=>{ p.update(); p.draw(); }); requestAnimationFrame(loop); }
  loop();
  const cObs=new IntersectionObserver(entries=>{ if(entries[0].isIntersecting) setTimeout(()=>{ settled=true; },1800); else settled=false; },{threshold:0.4});
  const cs=document.getElementById('s-chaos'); if(cs) cObs.observe(cs);
}
function initEnding(){
  const chips=document.querySelectorAll('.w-chip');
  const dropWord=document.getElementById('dropWord');
  const placeholder=document.querySelector('.drop-placeholder');
  const dropZone=document.getElementById('dropZone');
  chips.forEach(chip=>{
    chip.addEventListener('click',()=>{
      chips.forEach(c=>c.classList.remove('selected')); chip.classList.add('selected');
      dropWord.classList.remove('show'); placeholder.classList.add('hidden'); dropZone.classList.add('active');
      setTimeout(()=>{ dropWord.textContent=chip.dataset.word; dropWord.classList.add('show'); },200);
    });
    chip.setAttribute('draggable',true);
    chip.addEventListener('dragstart',e=>{ e.dataTransfer.setData('text/plain',chip.dataset.word); chip.classList.add('selected'); });
  });
  dropZone.addEventListener('dragover',e=>{ e.preventDefault(); dropZone.classList.add('active'); });
  dropZone.addEventListener('dragleave',()=>dropZone.classList.remove('active'));
  dropZone.addEventListener('drop',e=>{ e.preventDefault(); const w=e.dataTransfer.getData('text/plain'); dropWord.classList.remove('show'); placeholder.classList.add('hidden'); setTimeout(()=>{ dropWord.textContent=w; dropWord.classList.add('show'); },150); });
}