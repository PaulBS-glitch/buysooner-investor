/* Page-scoped explanatory sequences. Layout and financial calculations are independent. */
(()=>{
  const media=matchMedia('(prefers-reduced-motion: reduce)');
  const compactMotion=matchMedia('(max-width:620px)');
  const sections=[...document.querySelectorAll('.enhanced-slide')];
  const NS='http://www.w3.org/2000/svg';
  const state=new WeakMap();
  const diagrams=[];
  let active=null;
  const q=(root,s)=>root.querySelector(s), all=(root,s)=>[...root.querySelectorAll(s)];
  function stop(page){(state.get(page)||[]).forEach(a=>a.cancel());state.set(page,[]);}
  function animate(page,node,frames,delay=0,duration=480){
    if(!node||media.matches||!node.animate)return;
    const isMain=/^page-(?:[1-9]|1\\d|2[01])$/.test(page?.id||'');
    const pace=isMain&&compactMotion.matches?.72:1;
    const a=node.animate(frames,{duration:Math.round(duration*pace),delay:Math.round(delay*pace),easing:'cubic-bezier(.2,.65,.25,1)',fill:'backwards'});
    state.get(page).push(a);
    a.finished.then(()=>a.cancel()).catch(()=>{});
  }
  const reveal=(page,node,delay)=>animate(page,node,[{opacity:0},{opacity:1}],delay);
  const light=(page,node,delay)=>animate(page,node,[{boxShadow:'inset 0 0 0 2px transparent'},{boxShadow:'inset 0 0 0 2px #35bf9e',offset:.35},{boxShadow:'inset 0 0 0 2px transparent'}],delay,650);
  const flow=(page,node,delay)=>animate(page,node,[{strokeDasharray:'1',strokeDashoffset:1,opacity:.3},{strokeDasharray:'1',strokeDashoffset:0,opacity:1}],delay,400);
  function diagram(root,specs){
    root.classList.add('diagram-surface');
    const svg=document.createElementNS(NS,'svg');svg.classList.add('diagram-links');svg.setAttribute('aria-hidden','true');
    const markerId='flow-arrow-'+diagrams.length;
    svg.innerHTML=`<defs><marker id="${markerId}" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0 0 L6 3 L0 6 Z" fill="#159f86"/></marker></defs>`;
    const paths=specs.map(spec=>{const p=document.createElementNS(NS,'path');p.setAttribute('class','diagram-link '+(spec.kind||''));p.setAttribute('marker-end',`url(#${markerId})`);p.setAttribute('pathLength','1');svg.append(p);return p;});
    root.prepend(svg);
    function layout(){
      const r=root.getBoundingClientRect(),scale=r.width/root.offsetWidth||1;
      const width=root.clientWidth,height=root.clientHeight;svg.setAttribute('viewBox',`0 0 ${width} ${height}`);
      const box=node=>{const b=node.getBoundingClientRect();return {x:(b.left-r.left)/scale,y:(b.top-r.top)/scale,w:b.width/scale,h:b.height/scale};};
      specs.forEach((spec,i)=>{
        const a=box(spec.from),b=box(spec.to);let d;
        if(spec.kind==='opportunity-return'){
          if(Math.abs(a.x-b.x)<3 && window.innerWidth>700){d=`M${a.x+a.w/2} ${a.y-2} L${b.x+b.w/2} ${b.y+b.h+7}`;}
          else{d=`M${a.x-2} ${a.y+a.h/2} H4 V${b.y+b.h/2} H${b.x-7}`;}
        }else if(spec.kind==='amount' && b.y>a.y+a.h && b.x<a.x+a.w){
          d='';
        }else if(spec.kind==='join' && b.x<a.x+a.w){
          d=`M${a.x-2} ${a.y+a.h/2} H4 V${b.y+b.h/2} H${b.x-7}`;
        }else if(spec.kind==='join' && b.x>a.x+a.w){
          d=`M${a.x+a.w/2} ${a.y-2} V4 H${b.x+b.w/2} V${b.y-7}`;
        }else if(spec.kind==='cycle-return' && b.y<a.y){
          if(b.x===a.x){d=`M${a.x+a.w/2} ${a.y-2} L${b.x+b.w/2} ${b.y+b.h+7}`;}
          else{d=`M${a.x-2} ${a.y+a.h/2} H4 V${b.y+b.h/2} H${b.x-7}`;}
        }else if(spec.kind==='recycle'||spec.kind==='branch'||(spec.kind==='classification'&&b.x<a.x+a.w)){
          const x=spec.kind==='branch'?2:6;
          d=`M${a.x} ${a.y+a.h/2} H${x} V${b.y+b.h/2} H${b.x-5}`;
        }else if(b.x>=a.x+a.w-2){
          const x=a.x+a.w+2,y=a.y+a.h/2,end=b.x-7,ey=b.y+b.h/2,mid=(x+end)/2;
          d=`M${x} ${y} C${mid} ${y} ${mid} ${ey} ${end} ${ey}`;
        }else if(a.x>=b.x+b.w-2){
          const x=a.x-2,y=a.y+a.h/2,end=b.x+b.w+7,ey=b.y+b.h/2,mid=(x+end)/2;
          d=`M${x} ${y} C${mid} ${y} ${mid} ${ey} ${end} ${ey}`;
        }else{
          const x=a.x+a.w/2,y=a.y+a.h+2,ex=b.x+b.w/2,ey=b.y-7,mid=(y+ey)/2;
          d=`M${x} ${y} C${x} ${mid} ${ex} ${mid} ${ex} ${ey}`;
        }
        paths[i].setAttribute('d',d);
      });
    }
    diagrams.push({layout,root});layout();return paths;
  }
  const p11=q(document,'#page-11'),water=all(p11,'.waterfall .card'),amounts=all(p11,'.exit-item');
  const waterfallPaths=diagram(q(p11,'.grid.two'),[
    ...water.slice(0,3).map((card,i)=>({from:card,to:amounts[i],kind:'amount'})),
    ...water.slice(0,3).map((card,i)=>({from:card,to:water[i+1]})),
    {from:water[3],to:water[0],kind:'recycle'}
  ]);
  const p8=q(document,'#page-8'),planA=q(p8,'.plan-a'),planEnd=q(p8,'.plan-endpoint'),planB=q(p8,'.plan-b'),later=q(p8,'.plan-later');
  const planPaths=diagram(q(p8,'.refinance-pathways'),[{from:planA,to:planEnd},{from:planA,to:planB,kind:'branch'},{from:planB,to:later,kind:'secondary'}]);
  const p5=q(document,'#page-5'),life=all(p5,'.transaction-lifecycle .card');
  const lifePaths=diagram(q(p5,'.transaction-lifecycle'),life.slice(0,2).map((card,i)=>({from:card,to:life[i+1]})));
  const a4=q(document,'#appendix-4'),controls=all(a4,'.exit-risk-row'),outcomes=all(a4,'.exit-class-row');
  const controlPaths=diagram(q(a4,'.exit-risk-layout'),[
    ...controls.slice(0,3).map((card,i)=>({from:card,to:controls[i+1]})),
    {from:controls[2],to:q(a4,'.exit-risk-panel'),kind:'classification'}
  ]);

  // Additional process geometry is derived from the final responsive card positions.
  const processes=new Map();
  [9,10,14,15].forEach(n=>{
    const page=q(document,'#page-'+n),root=q(page,n===15?'.grid.five':'.slide-body>.grid');
    const cards=all(root,':scope>.card');
    processes.set(page.id,{cards,paths:diagram(root,cards.slice(0,-1).map((card,i)=>({from:card,to:cards[i+1]})))});
  });
  const p12=q(document,'#page-12'),housing=all(p12,'.grid>.card');
  const housingPaths=diagram(q(p12,'.grid'),[{from:housing[0],to:housing[2],kind:'join'},{from:housing[1],to:housing[2]}]);
  const p19=q(document,'#page-19'),cycleCards=all(p19,'.grid>.card');
  const opportunityPaths=diagram(q(p19,'.grid'),cycleCards.map((card,i)=>({from:card,to:cycleCards[(i+1)%4],kind:i===3?'opportunity-return':''})));
  const a3=q(document,'#appendix-3'),gates=all(a3,'.risk-row');
  const gatePaths=diagram(q(a3,'.risk-layout'),[
    ...gates.slice(0,3).map((card,i)=>({from:card,to:gates[i+1]})),
    {from:gates[3],to:q(a3,'.risk-panel'),kind:'classification'}
  ]);
  const p4=q(document,'#page-4'),product=all(p4,'.grid>.card'),productArrows=all(p4,'.flow-arrow');
  function layoutProduct(){
    const root=q(p4,'.slide-body'),r=root.getBoundingClientRect(),scale=r.width/root.offsetWidth||1;
    productArrows.forEach((arrow,i)=>{
      const a=product[i].getBoundingClientRect(),b=product[i+1].getBoundingClientRect();
      const vertical=b.top>=a.bottom;
      const x=vertical?(a.left+a.width/2):((a.right+b.left)/2);
      const y=vertical?((a.bottom+b.top)/2):(a.top+a.height/2);
      arrow.style.left=((x-r.left)/scale-12)+'px';arrow.style.top=((y-r.top)/scale-12)+'px';
      arrow.style.transform=vertical?'rotate(90deg)':'none';
    });
  }
  diagrams.push({root:q(p4,'.slide-body'),layout:layoutProduct});
  function group(page,selector,start=300,stagger=200){all(page,selector).forEach((node,i)=>reveal(page,node,start+i*stagger));}
  function finish(page,time){reveal(page,q(page,'.callout'),time);}
  function process(page,start=350){
    const item=processes.get(page.id);
    item.cards.forEach((card,i)=>{const t=start+i*500;reveal(page,card,t);light(page,card,t);if(item.paths[i])flow(page,item.paths[i],t+250);});
    return start+item.cards.length*500;
  }
  const pageSequences={
    'page-11':page=>{
      water.forEach((card,i)=>{
        const t=300+i*600;reveal(page,card,t);light(page,card,t);
        if(i<3){flow(page,waterfallPaths[i],t+150);reveal(page,amounts[i],t+150);light(page,amounts[i],t+200);animate(page,q(amounts[i],'.amount-track i'),[{transform:'scaleX(0)'},{transform:'scaleX(1)'}],t+150,550);flow(page,waterfallPaths[i+3],t+350);}
      });
      flow(page,waterfallPaths[6],2400);reveal(page,q(page,'.callout'),2900);
    },
    'page-8':page=>{
      reveal(page,planA,300);light(page,planA,300);flow(page,planPaths[0],600);reveal(page,planEnd,850);
      flow(page,planPaths[1],1250);reveal(page,planB,1500);light(page,planB,1650);
      flow(page,planPaths[2],1950);reveal(page,later,2200);light(page,later,2350);reveal(page,q(page,'.callout'),2850);
    },
    'page-7':page=>{
      all(page,'tr').slice(1).forEach((row,i)=>{const t=300+i*250;reveal(page,row,t);light(page,row.lastElementChild,t+150);});reveal(page,q(page,'.callout'),1950);
    },
    'page-18':page=>{
      reveal(page,q(page,'.slide-body>.eyebrow'),150);
      const layers=all(page,'.stack-diagram i'),labels=all(page,'.architecture-labels .card');
      layers.forEach((layer,i)=>{const t=400+i*450;animate(page,layer,[{transform:'scaleY(0)'},{transform:'scaleY(1)'}],t,500);reveal(page,labels[i],t+150);});
      light(page,layers[2],1950);light(page,labels[2],1950);reveal(page,q(page,'.callout'),2450);
    },
    'page-5':page=>{
      reveal(page,q(page,'.purchase'),150);
      all(page,'.stack-diagram i').forEach((layer,i)=>animate(page,layer,[{transform:'scaleX(0)'},{transform:'scaleX(1)'}],350+i*250,500));
      all(page,'.funding-cards .card').forEach((card,i)=>reveal(page,card,1000+i*150));
      life.forEach((card,i)=>{reveal(page,card,1600+i*400);light(page,card,1600+i*400);if(i<2)flow(page,lifePaths[i],1800+i*400);});
      reveal(page,q(page,'.callout'),2900);
    },
    'appendix-4':page=>{
      controls.slice(0,3).forEach((card,i)=>{reveal(page,card,300+i*450);light(page,card,300+i*450);if(i<2)flow(page,controlPaths[i],550+i*450);});
      flow(page,controlPaths[3],1350);reveal(page,q(page,'.exit-risk-panel'),1550);
      outcomes.forEach((card,i)=>reveal(page,card,1650+i*180));
      flow(page,controlPaths[2],2400);reveal(page,controls[3],2600);reveal(page,q(page,'.fallback-note'),2850);reveal(page,q(page,'.exit-risk-takeaway'),3150);
    },
    'appendix-6':page=>{
      reveal(page,q(page,'.worked-section-heading'),200);
      all(page,'.worked-panel').forEach((panel,i)=>reveal(page,panel,350+i*250));
      reveal(page,q(page,'.worked-strap'),900);reveal(page,q(page,'.investment-split'),1100);
      all(page,'.tradeoff-grid article').forEach((card,i)=>reveal(page,card,1500+i*180));
      reveal(page,q(page,'.worked-bottom-line'),2400);reveal(page,q(page,'.calculator-caveat'),2800);reveal(page,q(page,'.appendix-takeaway'),3000);
    },
    'appendix-7':page=>{
      animate(page,q(page,'.slide-head>.eyebrow'),[{opacity:0,transform:'translateY(6px)'},{opacity:1,transform:'none'}],0,320);
      animate(page,q(page,'h1'),[{opacity:0,transform:'translateY(10px)'},{opacity:1,transform:'none'}],90,380);
      animate(page,q(page,'.intro'),[{opacity:0,transform:'translateY(8px)'},{opacity:1,transform:'none'}],240,360);
      const paths=all(page,'.cycle-connector');
      all(page,'.cycle-stage').forEach((card,i)=>{
        const t=520+i*300;
        reveal(page,card,t);
        light(page,card,t);
        flow(page,paths[i],t+150);
      });
      reveal(page,q(page,'.cycle-centre'),2350);
      light(page,q(page,'.capital-recycled'),2550);
      all(page,'.investor-callout').forEach((card,i)=>reveal(page,card,2800+i*140));
      reveal(page,q(page,'.appendix-takeaway'),3420);
    }
  };

  Object.assign(pageSequences,{
    'page-1':page=>{
      animate(page,q(page,'.slide-head>.eyebrow'),[{opacity:0,transform:'translateY(8px)'},{opacity:1,transform:'none'}],0,420);
      animate(page,q(page,'h1'),[{opacity:0,transform:'translateY(16px)'},{opacity:1,transform:'none'}],160,520);
      animate(page,q(page,'.intro'),[{opacity:0,transform:'translateY(12px)'},{opacity:1,transform:'none'}],400,480);
      animate(page,q(page,'.slide-head>.caption'),[{opacity:0},{opacity:1}],620,360);
      animate(page,q(page,'.hero-panel>.eyebrow'),[{opacity:0,transform:'translateY(8px)'},{opacity:1,transform:'none'}],700,380);
      all(page,'.metrics>article').forEach((node,i)=>animate(page,node,[{opacity:0,transform:'translateY(14px)'},{opacity:1,transform:'none'}],850+i*220,480));
    },
    'page-2':page=>{
      animate(page,q(page,'.slide-head>.eyebrow'),[{opacity:0,transform:'translateY(7px)'},{opacity:1,transform:'none'}],0,380);
      animate(page,q(page,'h1'),[{opacity:0,transform:'translateY(12px)'},{opacity:1,transform:'none'}],120,460);
      animate(page,q(page,'.intro'),[{opacity:0,transform:'translateY(10px)'},{opacity:1,transform:'none'}],340,430);
      all(page,'.metrics>article').forEach((node,i)=>animate(page,node,[{opacity:0,transform:'translateY(12px)'},{opacity:1,transform:'none'}],620+i*160,420));
      all(page,'.grid>.card').forEach((node,i)=>animate(page,node,[{opacity:0,transform:'translateY(14px)'},{opacity:1,transform:'none'}],1350+i*220,460));
    },
    'page-3':page=>{
      animate(page,q(page,'.slide-head>.eyebrow'),[{opacity:0,transform:'translateY(7px)'},{opacity:1,transform:'none'}],0,360);
      animate(page,q(page,'h1'),[{opacity:0,transform:'translateY(12px)'},{opacity:1,transform:'none'}],120,450);
      animate(page,q(page,'.intro'),[{opacity:0,transform:'translateY(10px)'},{opacity:1,transform:'none'}],330,420);
      animate(page,q(page,'.page3-traditional'),[{opacity:0,transform:'translateX(-18px)'},{opacity:1,transform:'none'}],650,500);
      animate(page,q(page,'.page3-buysooner'),[{opacity:0,transform:'translateX(18px)'},{opacity:1,transform:'none'}],1050,500);
      animate(page,q(page,'.page3-buysooner .callout'),[{opacity:0,transform:'translateY(10px)'},{opacity:1,transform:'none'}],1500,420);
    },
    'page-4':page=>{
      animate(page,q(page,'.slide-head>.eyebrow'),[{opacity:0,transform:'translateY(7px)'},{opacity:1,transform:'none'}],0,360);
      animate(page,q(page,'h1'),[{opacity:0,transform:'translateY(12px)'},{opacity:1,transform:'none'}],120,450);
      animate(page,q(page,'.intro'),[{opacity:0,transform:'translateY(10px)'},{opacity:1,transform:'none'}],330,420);
      product.forEach((card,i)=>{
        const t=620+i*520;
        animate(page,card,[{opacity:0,transform:'translateY(14px)'},{opacity:1,transform:'none'}],t,470);
        light(page,card,t+80);
        if(productArrows[i])animate(page,productArrows[i],[{opacity:0,transform:'scale(.65)'},{opacity:1,transform:'scale(1)'}],t+340,300);
      });
      animate(page,q(page,'.page4-economics'),[{opacity:0,transform:'translateY(10px)'},{opacity:1,transform:'none'}],2200,430);
    },
    'page-6':page=>{group(page,'.metrics>article',200,150);all(page,'.column').forEach((column,i)=>{const t=950+i*240;reveal(page,column,t);animate(page,q(column,'i'),[{transform:'scaleY(0)'},{transform:'scaleY(1)'}],t,500);});reveal(page,q(page,'.grid.two>.card'),2400);},
    'page-9':page=>finish(page,process(page)+200),
    'page-10':page=>{const end=process(page);reveal(page,q(page,'.slide-body>h3'),end);finish(page,end+250);},
    'page-12':page=>{reveal(page,housing[0],300);reveal(page,housing[1],650);flow(page,housingPaths[0],1050);flow(page,housingPaths[1],1150);reveal(page,housing[2],1400);reveal(page,q(page,'.slide-body>h3'),2050);finish(page,2200);},
    'page-13':page=>{group(page,'.grid>.card',300,450);finish(page,2000);},
    'page-14':page=>{group(page,'.metrics>article',200,150);reveal(page,q(page,'.slide-body>.eyebrow'),900);const end=process(page,1100);reveal(page,q(page,'.slide-body>p:not(.eyebrow):not(.footnote)'),end+150);},
    'page-15':page=>{const end=process(page,300);group(page,'.grid.two>.card',end,200);},
    'page-16':page=>{group(page,'.grid>.card',350,350);finish(page,1750);},
    'page-17':page=>{const rows=[];all(page,'.person').forEach(card=>{let row=rows.find(r=>Math.abs(r.top-card.offsetTop)<3);if(!row){row={top:card.offsetTop,nodes:[]};rows.push(row);}row.nodes.push(card);});rows.forEach((row,i)=>row.nodes.forEach(card=>reveal(page,card,300+i*220)));},
    'page-19':page=>{cycleCards.forEach((card,i)=>{const t=300+i*600;reveal(page,card,t);light(page,card,t);flow(page,opportunityPaths[i],t+300);});finish(page,3000);},
    'page-20':page=>{group(page,'.card:first-child .check',300,160);group(page,'.card:last-child .check',1500,160);finish(page,2900);},
    'page-21':page=>{reveal(page,q(page,'.intro'),350);group(page,'.metrics>article',800,200);},
    'appendices':page=>group(page,'.appendix-link',250,180),
    'appendix-1':page=>{reveal(page,q(page,'.waiting-inputs'),250);reveal(page,q(page,'.waiting-maths'),650);reveal(page,q(page,'.waiting-costs'),1100);reveal(page,q(page,'.waiting-choice'),1550);reveal(page,q(page,'.appendix-takeaway'),2050);},
    'appendix-2':page=>{group(page,'.eligibility-row',250,250);reveal(page,q(page,'.eligibility-panel'),1400);group(page,'.eligibility-summary',1600,150);reveal(page,q(page,'.exclusion-box'),2400);reveal(page,q(page,'.appendix-takeaway'),2800);},
    'appendix-3':page=>{gates.forEach((gate,i)=>{const t=250+i*450;reveal(page,gate,t);light(page,gate,t);flow(page,gatePaths[i],t+200);});reveal(page,q(page,'.risk-panel'),2100);group(page,'.risk-control',2250,150);reveal(page,q(page,'.risk-exit'),2800);reveal(page,q(page,'.risk-takeaway'),3200);},
    'appendix-5':page=>{group(page,'.portfolio-control-row',250,200);reveal(page,q(page,'.portfolio-action-panel'),1100);group(page,'.portfolio-action-table>div',1250,250);reveal(page,q(page,'.portfolio-discipline'),2650);reveal(page,q(page,'.appendix-takeaway'),3100);},
    'page-22':page=>reveal(page,q(page,'.legal'),300)
  });
  function play(page){
    if(!page?.classList.contains('enhanced-slide'))return false;
    stop(page);diagrams.filter(d=>page.contains(d.root)).forEach(d=>d.layout());
    if(media.matches)return true;
    reveal(page,q(page,'.slide-head'),0);pageSequences[page.id]?.(page);return true;
  }
  function activate(page){if(active===page)return;if(active)stop(active);active=page;play(page);}
  window.replayPresentation=play;
  sections.forEach(page=>{
    page.addEventListener('input',()=>stop(page));
    page.addEventListener('change',()=>stop(page));
  });
  window.addEventListener('presentation-active',e=>activate(e.detail));
  media.addEventListener('change',()=>sections.forEach(stop));
  let layoutFrame;
  const layout=()=>{cancelAnimationFrame(layoutFrame);layoutFrame=requestAnimationFrame(()=>diagrams.forEach(d=>d.layout()));};
  window.addEventListener('resize',layout);
  if('ResizeObserver' in window){const ro=new ResizeObserver(layout);diagrams.forEach(d=>ro.observe(d.root));}
  document.fonts.ready.then(layout);
  activate(document.getElementById(location.hash.slice(1)||'page-1'));
})();
