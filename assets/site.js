/* Nima GTM · motion layer. Plain JS, no dependencies.
   One animation loop that sleeps whenever nothing is moving, so phones keep their battery. */
(function(){
'use strict';
var d=document,root=d.documentElement,body=d.body;
var $=function(s,c){return (c||d).querySelector(s)},$$=function(s,c){return [].slice.call((c||d).querySelectorAll(s))};
var clamp=function(v,a,b){return v<a?a:v>b?b:v},lerp=function(a,b,t){return a+(b-a)*t};
var ease=function(t){return t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2};
var W=innerWidth,H=innerHeight;
var isTouch=matchMedia('(hover:none),(pointer:coarse)').matches;
var RM=matchMedia('(prefers-reduced-motion:reduce)').matches;
function sget(k){try{return sessionStorage.getItem(k)}catch(e){return null}}
function sset(k,v){try{sessionStorage.setItem(k,v)}catch(e){}}
function sdel(k){try{sessionStorage.removeItem(k)}catch(e){}}
if(!isTouch&&!RM)body.classList.add('cz');

/* animation loop */
var raf=0;
function kick(){if(!raf)raf=requestAnimationFrame(frame)}

/* word split */
function split(el){var n=0;
  (function walk(node){[].slice.call(node.childNodes).forEach(function(c){
    if(c.nodeType===3){var parts=c.textContent.split(/(\s+)/),fr=d.createDocumentFragment();
      parts.forEach(function(p){if(!p)return;if(/^\s+$/.test(p)){fr.appendChild(d.createTextNode(' '));return}
        var w=d.createElement('span');w.className='w';var i=d.createElement('span');i.style.setProperty('--i',n++);i.textContent=p;w.appendChild(i);fr.appendChild(w)});
      c.parentNode.replaceChild(fr,c)}
    else if(c.nodeType===1&&!c.classList.contains('w'))walk(c)})})(el)}
$$('.sp').forEach(split);

/* reveals */
var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');if(e.target.__od)odRun(e.target);io.unobserve(e.target)}})},{rootMargin:'0px 0px -8% 0px',threshold:.1});
$$('.sp,.rv,.pt,.cs-c,.cta').forEach(function(el){if(RM)el.classList.add('in');else io.observe(el)});

/* odometers */
function odBuild(el){var n=+el.dataset.n,h='',r,i;for(r=0;r<2;r++)for(i=0;i<10;i++)h+='<span>'+i+'</span>';for(i=0;i<=n;i++)h+='<span>'+i+'</span>';
  el.innerHTML='<span class="od-c">'+h+'</span>';el.__t=20+n}
function odRun(nc){$$('.od',nc).forEach(function(el,i){var c=el.firstChild;setTimeout(function(){c.style.transform='translateY(-'+(el.__t*1.12)+'em)'},i*120+80)})}
$$('.od').forEach(function(el){if(RM)return;el.setAttribute('aria-hidden','true');odBuild(el);var nc=el.closest('.nc');if(!nc.__od){nc.__od=1;io.observe(nc)}});

/* clocks */
function clocks(){var f=function(tz){try{return new Intl.DateTimeFormat('en-GB',{timeZone:tz,hour:'2-digit',minute:'2-digit'}).format(new Date())}catch(e){return '--:--'}};
  var l=f('Europe/London'),p=f('Europe/Paris');$$('[data-clock=ldn]').forEach(function(e){e.textContent=l});$$('[data-clock=par]').forEach(function(e){e.textContent=p})}
clocks();setInterval(clocks,20000);

/* smooth wheel, desktop only */
var ss={on:!isTouch&&!RM,cur:scrollY,tgt:scrollY,run:false},hold=0;
function maxY(){return root.scrollHeight-H}
if(ss.on){addEventListener('wheel',function(e){if(e.ctrlKey||body.classList.contains('lock'))return;e.preventDefault();
  if(!ss.run){ss.cur=scrollY;ss.tgt=scrollY}
  var dy=e.deltaMode===1?e.deltaY*32:e.deltaY;ss.tgt=clamp(ss.tgt+dy,0,maxY());ss.run=true;kick()},{passive:false});
  addEventListener('keydown',function(){ss.run=false});addEventListener('mousedown',function(){ss.run=false})}
function ssTick(){if(!ss.run)return false;ss.cur=lerp(ss.cur,ss.tgt,.11);if(Math.abs(ss.tgt-ss.cur)<.5){ss.cur=ss.tgt;ss.run=false}scrollTo(0,ss.cur);return ss.run}
function jump(y){hd.classList.remove('hid');hold=Date.now()+1400;y=clamp(y,0,maxY());
  if(RM){scrollTo(0,y);return}
  if(ss.on){ss.cur=scrollY;ss.tgt=y;ss.run=true;kick()}else scrollTo({top:y,behavior:'smooth'})}

/* same-page anchors */
d.addEventListener('click',function(e){var a=e.target.closest('a[href^="#"]');if(!a)return;var t=d.getElementById(a.getAttribute('href').slice(1));if(!t)return;e.preventDefault();
  jump(t.getBoundingClientRect().top+scrollY-(a.hasAttribute('data-top')?0:72));try{history.replaceState(null,'',a.getAttribute('href'))}catch(x){}t.setAttribute('tabindex','-1');t.focus({preventScroll:true})});

/* menu */
var burger=$('#burger'),mm=$('#mm');
function setMenu(o){if(o)hd.classList.remove('hid');root.classList.toggle('mmo',o);body.classList.toggle('lock',o);burger.setAttribute('aria-expanded',o);burger.setAttribute('aria-label',o?'Close menu':'Open menu');mm.setAttribute('aria-hidden',!o);if(o)mm.removeAttribute('inert');else mm.setAttribute('inert','')}
burger.addEventListener('click',function(){setMenu(!root.classList.contains('mmo'))});
addEventListener('keydown',function(e){if(e.key==='Escape'&&root.classList.contains('mmo')){setMenu(false);burger.focus()}});
mm.setAttribute('inert','');
var topBtn=$('#top');if(topBtn)topBtn.addEventListener('click',function(){jump(0)});

/* page wipe between real pages */
var wipe=$('#wipe'),wipeT=$('#wipeT');
function leaving(href,label){sset('nima-wipe',label||'');wipeT.textContent=label||'';wipe.classList.remove('outw');wipe.classList.add('on');void wipe.offsetWidth;wipe.classList.add('in');setTimeout(function(){location.href=href},560)}
d.addEventListener('click',function(e){var a=e.target.closest('a[href]');if(!a||RM)return;if(e.metaKey||e.ctrlKey||e.shiftKey||e.altKey||e.button)return;if(a.target==='_blank')return;
  var h=a.getAttribute('href');if(!h||h.charAt(0)==='#'||/^(mailto|tel|https?):/.test(h))return;
  var path=h.split('#')[0];if(path===(location.pathname.split('/').pop()||'index.html')){if(h.indexOf('#')<0){e.preventDefault();setMenu(false);jump(0)}return}
  e.preventDefault();setMenu(false);leaving(h,a.getAttribute('data-l')||'')});
function arrive(){if(!root.classList.contains('wipe-in'))return;wipeT.textContent=sget('nima-wipe')||'';sdel('nima-wipe');wipe.classList.add('on');
  setTimeout(function(){wipe.classList.add('outw');root.classList.remove('wipe-in');setTimeout(function(){wipe.classList.remove('on','outw')},760)},60)}
addEventListener('pageshow',function(e){if(e.persisted){wipe.classList.remove('on','in','outw');root.classList.remove('wipe-in')}});

/* cursor, magnetic buttons, card glow */
var hd=$('#hd'),mx=W/2,my=H/2,rx=mx,ry=my,cEl=$('#cur'),cR=$('.cur-r'),cD=$('.cur-d'),curT=$('#curT');
if(!isTouch&&!RM){
  addEventListener('mousemove',function(e){mx=e.clientX;my=e.clientY;kick();
    var m=e.target.closest&&e.target.closest('.mag');
    $$('.mag.mg').forEach(function(b){if(b!==m){b.style.transform='';b.classList.remove('mg')}});
    if(m){var r=m.getBoundingClientRect(),dx=e.clientX-(r.left+r.width/2),dy=e.clientY-(r.top+r.height/2),k=m.classList.contains('cta-btn')?.3:.18;m.classList.add('mg');m.style.transform='translate('+dx*k+'px,'+dy*k+'px)'}
    var wc=e.target.closest&&e.target.closest('.wc');if(wc){var q=wc.getBoundingClientRect();wc.style.setProperty('--gx',(e.clientX-q.left)+'px');wc.style.setProperty('--gy',(e.clientY-q.top)+'px')}});
  var CUR=[['.wc','View'],['.svr','Open'],['.pk','Pick']];
  d.addEventListener('mouseover',function(e){var lab=null;for(var i=0;i<CUR.length;i++)if(e.target.closest(CUR[i][0])){lab=CUR[i][1];break}
    if(lab){curT.textContent=lab;cEl.classList.add('big')}else cEl.classList.remove('big')});
  d.addEventListener('mouseleave',function(){cEl.classList.add('hide')});d.addEventListener('mouseenter',function(){cEl.classList.remove('hide')});
}else if(cEl){cEl.style.display='none'}
function cursor(){if(isTouch||RM)return false;rx=lerp(rx,mx,.2);ry=lerp(ry,my,.2);cR.style.transform='translate3d('+rx+'px,'+ry+'px,0)';cD.style.transform='translate3d('+mx+'px,'+my+'px,0)';return Math.abs(rx-mx)+Math.abs(ry-my)>.3}

/* measurements */
var hero=$('#hero'),sx=$('#sx'),mt=$('.mt'),mtTr=$('#mtTr'),ft=$('.ft'),cta=$('#cta'),mbar=$('#mbar'),M={},papers=$$('.paper'),sxLis=sx?$$('li',sx):[],sxN=$('#sxN'),mtLine=$('#mtLine'),mtDot=$('#mtDot');
function top(el){return el.getBoundingClientRect().top+scrollY}
function measure(){W=innerWidth;H=innerHeight;
  if(hero)M.hero=[top(hero),hero.offsetHeight];
  if(sx)M.sx=[top(sx),sx.offsetHeight];
  if(mt&&mtTr&&!RM){if(W>900){mt.style.height=(mtTr.scrollWidth-W+H*1.15)+'px'}else mt.style.height='';M.mt=[top(mt),mt.offsetHeight,mtTr.scrollWidth-W]}
  resizeEng();kick()}
addEventListener('resize',function(){var w=innerWidth;if(isTouch&&w===W&&Math.abs(innerHeight-H)<160){H=innerHeight;return}measure()});
addEventListener('load',measure);
if(d.fonts&&d.fonts.ready)d.fonts.ready.then(measure);

/* hero engine: particles that drift, then fall into line as you scroll */
var cv=$('#eng'),cx=cv&&!RM?cv.getContext('2d'):null,DPR=Math.min(devicePixelRatio||1,W<700?1.5:1.6),P=[],NP=0,L=15;
function resizeEng(){if(!cx)return;var w=cv.clientWidth,h=cv.clientHeight;if(!w)return;cv.width=w*DPR;cv.height=h*DPR;cx.setTransform(DPR,0,0,DPR,0,0);cx.fillStyle='#050506';cx.fillRect(0,0,w,h);
  var n=W<700?800:W<1200?1700:2500;if(n!==NP){NP=n;P=[];for(var i=0;i<n;i++)P.push({x:Math.random()*w,y:Math.random()*h,vx:0,vy:0,l:i%L,lx:Math.random(),sp:.6+Math.random()*.9,d:Math.random(),b:Math.random()<.13,j:Math.random()-.5})}}
function drawEng(t,e){var w=cv.clientWidth,h=cv.clientHeight;if(!w)return;
  cx.fillStyle='rgba(5,5,6,'+(.16+e*.1)+')';cx.fillRect(0,0,w,h);
  var cyy=h*(W<700?.34:.42),gap=h*(W<700?.028:.04),tt=t*.001,i,l,s;
  if(e>.02){cx.strokeStyle='rgba(244,242,238,'+(e*.05)+')';cx.lineWidth=1;cx.beginPath();
    for(l=0;l<L;l++){var off=(l-(L-1)/2)*gap;cx.moveTo(-10,cyy+off);for(s=0;s<=20;s++){var lx=s/20,sq=1-ease(clamp((lx-.3)/.68,0,1))*.94;cx.lineTo(w*(-.05+lx*1.1),cyy+off*sq)}}cx.stroke()}
  var dim=[],hi=[];
  for(i=0;i<P.length;i++){var p=P[i];
    if(e<.999){var a=Math.sin(p.x*.0022+tt*.35)*2.2+Math.cos(p.y*.0028-tt*.28)*2.2+Math.sin((p.x+p.y)*.0012+tt*.1)*1.3;
      p.vx+=Math.cos(a)*.07;p.vy+=Math.sin(a)*.07;
      if(!isTouch){var dx=p.x-mx,dy=p.y-my,d2=dx*dx+dy*dy;if(d2<16000){var f=(1-d2/16000)*.9,q=Math.sqrt(d2+1);p.vx+=dx/q*f;p.vy+=dy/q*f}}
      p.vx*=.95;p.vy*=.95;p.x+=p.vx*p.sp;p.y+=p.vy*p.sp;
      if(p.x<-10)p.x=w+10;if(p.x>w+10)p.x=-10;if(p.y<-10)p.y=h+10;if(p.y>h+10)p.y=-10}
    p.lx+=.00055*p.sp*(.4+e*1.6);if(p.lx>1)p.lx-=1;
    var k=ease(clamp(e*1.5-p.d*.5,0,1)),X=p.x,Y=p.y;
    if(k>0){var sd=1-ease(clamp((p.lx-.3)/.68,0,1))*.94,LX=w*(-.05+p.lx*1.1),LY=cyy+((p.l-(L-1)/2)*gap+p.j*gap*.3)*sd;X=lerp(p.x,LX,k);Y=lerp(p.y,LY,k)}
    (p.b?hi:dim).push(X,Y)}
  cx.fillStyle='rgba(200,198,193,'+(.34+e*.2)+')';for(i=0;i<dim.length;i+=2)cx.fillRect(dim[i],dim[i+1],1.3,1.3);
  cx.fillStyle='rgba(244,242,238,.95)';for(i=0;i<hi.length;i+=2)cx.fillRect(hi[i],hi[i+1],1.7,1.7);
  if(e>.3){var gr=W<700?64:120,g=cx.createRadialGradient(w*.99,cyy,0,w*.99,cyy,gr);g.addColorStop(0,'rgba(244,242,238,'+((e-.3)*(W<700?.16:.3))+')');g.addColorStop(1,'rgba(244,242,238,0)');cx.fillStyle=g;cx.fillRect(w*.99-gr,cyy-gr,gr*2,gr*2)}
}

/* portraits */
var PORS=$$('.por');
PORS.forEach(function(p){p.__r=0;p.__t=0;p.__x=50;p.__y=38;
  if(isTouch||RM)return;
  p.addEventListener('mousemove',function(e){var r=p.getBoundingClientRect();p.__x=(e.clientX-r.left)/r.width*100;p.__y=(e.clientY-r.top)/r.height*100;p.__t=Math.max(r.width,r.height)*.34;kick()});
  p.addEventListener('mouseleave',function(){p.__t=0;kick()})});
function portraits(){var more=false;for(var i=0;i<PORS.length;i++){var p=PORS[i],r=p.getBoundingClientRect();if(r.bottom<0||r.top>H)continue;
  if(r.top<H*.9&&!p.__in){p.__in=1;p.classList.add('in')}
  var k=clamp((H-r.top)/(H+r.height),0,1);p.style.setProperty('--ps',ease(clamp(k*1.6,0,1)).toFixed(3));
  if(isTouch){p.__x=50;p.__y=36;p.__t=clamp((k-.25)/.45,0,1)*r.height*1.3}
  p.__r=lerp(p.__r,p.__t,.09);if(Math.abs(p.__r-p.__t)>.5)more=true;p.style.setProperty('--r',p.__r.toFixed(1)+'px');p.style.setProperty('--x',p.__x.toFixed(1)+'%');p.style.setProperty('--y',p.__y.toFixed(1)+'%')}return more}

/* one frame */
var lastY=scrollY,ph2=false,ph1El=$('#ph1'),ph2El=$('#ph2'),heroLive=false;
function frame(t){raf=0;var more=false;
  if(ssTick())more=true;
  if(cursor())more=true;
  var y=scrollY,i,dy=y-lastY;lastY=y;
  if(Math.abs(dy)>3&&Date.now()>hold&&!root.classList.contains('mmo'))hd.classList.toggle('hid',dy>0&&y>H*.7);
  hd.classList.toggle('sol',y>40);
  var lt=false;for(i=0;i<papers.length;i++){var r=papers[i].getBoundingClientRect();if(r.top<=34&&r.bottom>=34){lt=true;break}}
  hd.classList.toggle('lt',lt&&!root.classList.contains('mmo'));
  if(hero&&!RM){
    var hp=clamp((y-M.hero[0])/(M.hero[1]-H),0,1);
    hero.style.setProperty('--pa',ease(clamp((hp-.16)/.3,0,1)).toFixed(4));
    hero.style.setProperty('--pb',ease(clamp((hp-.36)/.3,0,1)).toFixed(4));
    var pr=clamp((hp-.08)/.62,0,1);hero.style.setProperty('--pp',pr.toFixed(3));
    var on2=hp>.42;if(on2!==ph2){ph2=on2;ph1El.classList.toggle('on',!on2);ph2El.classList.toggle('on',on2)}
    heroLive=y<M.hero[0]+M.hero[1];
    if(heroLive&&cx){drawEng(t,ease(pr));more=true}
  }
  if(sx&&!RM){var q=clamp((y-M.sx[0])/(M.sx[1]-H),0,1),nf=0;
    for(i=0;i<sxLis.length;i++){var k=clamp((q-.06-i*.21)/.15,0,1);sxLis[i].style.setProperty('--k',k.toFixed(3));if(k>.95)nf++}
    sxN.textContent=nf}
  if(mt&&M.mt&&!RM&&W>900){var m=clamp((y-M.mt[0])/(M.mt[1]-H),0,1);mtTr.style.transform='translate3d('+(-m*M.mt[2]).toFixed(1)+'px,0,0)';
    mtLine.style.strokeDashoffset=(1000*(1-m)).toFixed(1);mtDot.style.left=(m*100)+'%';
    var sts=mtTr.children;for(i=0;i<sts.length;i++)sts[i].classList.toggle('on',m>=i/(sts.length-1)-.1)}
  if(portraits())more=true;
  var fr=ft.getBoundingClientRect();if(fr.top<H&&!RM)ft.style.setProperty('--fw',ease(clamp((H-fr.top)/(fr.height*.9),0,1)).toFixed(3));
  if(mbar){var hide=false;if(cta){var c=cta.getBoundingClientRect();hide=c.top<H*.86&&c.bottom>0}mbar.classList.toggle('on',y>(hero&&M.hero?M.hero[0]+M.hero[1]-H*1.02:H*.7)&&!hide&&fr.top>H*.8)}
  if(more)kick()}
addEventListener('scroll',kick,{passive:true});

/* method cards on phones light up as they enter */
if(mtTr&&(isTouch||innerWidth<=900||RM)){var io2=new IntersectionObserver(function(es){es.forEach(function(e){e.target.classList.toggle('on',e.isIntersecting)})},{threshold:.4});$$('.st').forEach(function(s){io2.observe(s)})}

/* languages rotator */
(function(){var a=$('#hello'),b=$('#helloL');if(!a||RM)return;var L2=[['Hello','English'],['Bonjour','Français'],['Ciao','Italiano'],['سلام','فارسی']],i=0;
  setInterval(function(){a.classList.add('sw');setTimeout(function(){i=(i+1)%L2.length;a.textContent=L2[i][0];b.textContent=L2[i][1];a.dir=i===3?'rtl':'ltr';a.classList.remove('sw')},420)},2400)})();

/* recommender */
(function(){var pks=$$('.pk');if(!pks.length)return;var REC={audit:['GTM Audit','Two weeks to find exactly what is broken, and what to fix first.'],sprint:['Pipeline Sprint','Three months to build your outbound engine and run it with you.'],partner:['Revenue Partner','A senior operator embedded as your commercial team.']},c=$('.pick-c'),T=$('#pickT'),D=$('#pickD');
  pks.forEach(function(b){b.addEventListener('click',function(){pks.forEach(function(x){x.setAttribute('aria-checked',x===b)});var r=REC[b.dataset.r];c.classList.remove('fl');void c.offsetWidth;c.classList.add('fl');T.textContent=r[0];D.textContent=r[1]})})})();

/* boot */
function start(){if(hero){hero.classList.add('ld');hero.style.setProperty('--in',0);var hs=$('.hero-s');hs.classList.remove('hero-intro');setTimeout(function(){hero.classList.remove('ld')},1500)}}
measure();arrive();kick();
if(hero&&!RM)$('.hero-s').classList.add('hero-intro');
var pl=$('#pl');
if(root.classList.contains('pl-on')&&pl){sset('nima-seen','1');
  var t0=performance.now(),plN=$('#plN'),plB=$('#plB'),DUR=1050;
  (function run(){var p=clamp((performance.now()-t0)/DUR,0,1),v=Math.round(ease(p)*100);plN.textContent=('00'+v).slice(-3);plB.style.width=v+'%';
    if(p<1){requestAnimationFrame(run);return}
    pl.classList.add('out');setTimeout(start,260);setTimeout(function(){root.classList.remove('pl-on')},1000)})();
}else{setTimeout(start,root.classList.contains('wipe-in')?300:80)}
})();
