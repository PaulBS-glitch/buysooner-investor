(()=>{
  const section=document.querySelector('#appendix-7');
  if(!section)return;
  const cycle=section.querySelector('.capital-cycle');
  const centre=cycle.querySelector('.cycle-centre');
  const cards=[...cycle.querySelectorAll('.cycle-stage')];
  const svg=cycle.querySelector('svg');
  const connectors=svg.querySelector('.cycle-connectors');
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  cards.forEach((card,i)=>card.style.setProperty('--stage',i+1));
  const layout=()=>{
    if(!cycle.offsetWidth)return;
    const desktop=matchMedia('(min-width:1000px)').matches;
    cycle.classList.toggle('cycle-desktop',desktop);
    cards.forEach(card=>{card.style.width='';card.style.left='';card.style.top='';});
    centre.style.left='';centre.style.top='';cycle.style.height='';
    if(desktop){
      const width=cycle.clientWidth,gap=38,w=(width-2*gap)/3;
      cards.forEach(card=>card.style.width=w+'px');
      const heights=cards.map(card=>card.offsetHeight),ch=centre.offsetHeight;
      const upper=Math.max(heights[5],heights[1]),lower=Math.max(heights[4],heights[2]);
      const height=Math.max(heights[0]+ch+heights[3]+36,upper+lower+42);
      const sideStart=(height-upper-lower-42)/2;
      cycle.style.height=height+'px';
      const place=(i,x,y)=>{cards[i].style.left=x+'px';cards[i].style.top=y+'px';};
      place(0,w+gap,0);place(3,w+gap,height-heights[3]);
      const leftStart=sideStart;
      const rightStart=sideStart;
      place(5,0,leftStart+(upper-heights[5])/2);place(4,0,leftStart+upper+42+(lower-heights[4])/2);
      place(1,2*(w+gap),rightStart+(upper-heights[1])/2);place(2,2*(w+gap),rightStart+upper+42+(lower-heights[2])/2);
      centre.style.left=(width-centre.offsetWidth)/2+'px';
      centre.style.top=heights[0]+(height-heights[0]-heights[3]-ch)/2+'px';
    }
    const origin=cycle.getBoundingClientRect(),scale=origin.width/cycle.offsetWidth||1;
    const boxes=cards.map(card=>{const b=card.getBoundingClientRect();return {l:(b.left-origin.left)/scale,r:(b.right-origin.left)/scale,t:(b.top-origin.top)/scale,b:(b.bottom-origin.top)/scale,x:(b.left-origin.left+b.width/2)/scale,y:(b.top-origin.top+b.height/2)/scale};});
    svg.setAttribute('viewBox',`0 0 ${cycle.clientWidth} ${cycle.offsetHeight}`);
    const horizontal=(a,b,right)=>{
      const start=right?a.r+6:a.l-6,end=right?b.l-10:b.r+10,mid=(start+end)/2;
      return `M${start} ${a.y} C${mid} ${a.y} ${mid} ${b.y} ${end} ${b.y}`;
    };
    const paths=desktop?[
      horizontal(boxes[0],boxes[1],true),
      `M${boxes[1].x} ${boxes[1].b+7} L${boxes[2].x} ${boxes[2].t-12}`,
      horizontal(boxes[2],boxes[3],false),horizontal(boxes[3],boxes[4],false),
      `M${boxes[4].x} ${boxes[4].t-7} L${boxes[5].x} ${boxes[5].b+12}`,
      horizontal(boxes[5],boxes[0],true)
    ]:boxes.map((a,i)=>i<5?`M${a.x} ${a.b+7} L${boxes[i+1].x} ${boxes[i+1].t-12}`:
      `M${a.l-5} ${a.y} H5 V${boxes[0].y} H${boxes[0].l-7}`);
    paths.forEach((d,i)=>{
      let path=connectors.children[i];
      if(!path){path=document.createElementNS('http://www.w3.org/2000/svg','path');connectors.append(path);}
      path.setAttribute('d',d);path.setAttribute('class','cycle-connector'+(i===5?' cycle-return-path':''));
      path.setAttribute('marker-end',`url(#${i===5?'cycle-recycle-arrow':'cycle-arrow'})`);
      path.setAttribute('pathLength','1');
    });
  };
  let frame;
  const schedule=()=>{cancelAnimationFrame(frame);frame=requestAnimationFrame(layout);};
  const resize=new ResizeObserver(schedule);resize.observe(cycle);cards.forEach(card=>resize.observe(card));
  window.addEventListener('resize',schedule);document.fonts.ready.then(schedule);
  layout();
})();
