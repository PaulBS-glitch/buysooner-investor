const slides=[...document.querySelectorAll('.slide')];
const index=document.querySelector('#index');
const next=document.querySelector('#next');
const nav=document.querySelector('#presentation-nav');
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
let current=0;

function countUp(el){
  const final=el.dataset.final||(el.dataset.final=el.textContent);
  el.textContent=final;
  const m=final.match(/^([^\\d]*)([\\d,]+(?:\\.\\d+)?)(.*)$/);
  if(reduced.matches||!m||/^Q\\d|^Y\\d/.test(final)||/\\d/.test(m[3]))return;
  const token=(Number(el.dataset.run)||0)+1;
  el.dataset.run=token;
  const target=Number(m[2].replaceAll(',',''));
  const decimals=(m[2].split('.')[1]||'').length;
  const start=performance.now();
  function tick(now){
    if(Number(el.dataset.run)!==token)return;
    const p=Math.min(1,(now-start)/1300);
    el.textContent=p===1?final:m[1]+(target*(1-(1-p)**3)).toLocaleString('en-AU',{
      minimumFractionDigits:decimals,
      maximumFractionDigits:decimals,
      useGrouping:m[2].includes(',')
    })+m[3];
    if(p<1)requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

const observer=new IntersectionObserver(entries=>{
  entries.forEach(({target,isIntersecting})=>{
    if(!isIntersecting)return;
    target.classList.add('in-view');
    if(target.classList.contains('number'))countUp(target);
    observer.unobserve(target);
  });
},{threshold:.15,rootMargin:'0px 0px -8% 0px'});

[...document.querySelectorAll('.reveal,.number,.chart,.stack-diagram,.amount-track')]
  .filter(target=>!target.closest('.enhanced-slide'))
  .forEach(target=>observer.observe(target));

function pageFromHash(){
  const found=slides.findIndex(slide=>'#'+slide.id===location.hash);
  return found>=0?found:0;
}

function showPage(position,{updateHash=true,focus=false}={}){
  const target=Math.max(0,Math.min(slides.length-1,position));
  slides.forEach((slide,i)=>slide.hidden=i!==target);
  current=target;
  index.value=String(target);
  next.disabled=target===slides.length-1;
  const navSlot=slides[target].querySelector('.presentation-nav-slot,.appendix7-nav-slot');
  (navSlot||slides[target]).append(nav);

  if(updateHash)history.replaceState(null,'','#'+slides[target].id);
  document.querySelector('#viewer')?.scrollTo({top:0,behavior:'instant'});
  window.scrollTo({top:0,behavior:'instant'});

  requestAnimationFrame(()=>{
    window.dispatchEvent(new Event('resize'));
    window.dispatchEvent(new CustomEvent('presentation-active',{detail:slides[target]}));
    if(focus)index.focus({preventScroll:true});
  });
}

next.addEventListener('click',()=>showPage(current+1));
index.addEventListener('change',()=>showPage(Number(index.value)));

document.querySelectorAll('[data-slide-target]').forEach(link=>{
  link.addEventListener('click',event=>{
    event.preventDefault();
    const target=slides.findIndex(slide=>slide.id===link.dataset.slideTarget);
    if(target>=0)showPage(target);
  });
});

window.addEventListener('hashchange',()=>showPage(pageFromHash(),{updateHash:false}));
showPage(pageFromHash(),{updateHash:false});
