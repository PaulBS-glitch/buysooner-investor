/* Page-scoped explanatory sequences. Layout and financial calculations are independent. */
(()=>{
  const media=matchMedia('(prefers-reduced-motion: reduce)');
  const compactMotion=matchMedia('(max-width:620px)');
  const sections=[...document.querySelectorAll('.enhanced-slide')];
  const NS='http://www.w3.org/2000/svg';
  const state=new WeakMap();
  const diagrams=[];
  let active=null;
  const q=(root,s)=>root?.querySelector(s)||null, all=(root,s)=>root?[...root.querySelectorAll(s)]:[];
  function stop(page){(state.get(page)||[]).forEach(a=>a.cancel());state.set(page,[]);}
  function animate(page,node,frames,delay=0,duration=480){
    if(!page||!node||media.matches||!node.animate)return;
    if(!state.has(page))state.set(page,[]);
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
    // Rebuilt main pages use native layout instead of obsolete SVG geometry.
    if(!root||root.closest('.main-slide'))return [];
    specs=specs.filter(spec=>spec.from&&spec.to);
    if(!specs.length)return [];
    all(root,':scope > svg.diagram-links').forEach(svg=>svg.remove());
    root.classList.add('diagram-surface');
    const svg=document.createElementNS(NS,'svg');svg.classList.add('diagram-links');svg.setAttribute('aria-hidden','true');
    const markerId='flow-arrow-'+diagrams.length;
    svg.innerHTML=`<defs><marker id="${markerId}" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0 0 L6 3 L0 6 Z" fill="#159f86"/></marker></defs>`;
    const paths=specs.map(spec=>{const p=document.createElementNS(NS,'path');p.setAttribute('class','diagram-link '+(spec.kind||''));p.setAttribute('marker-end',`url(#${markerId})`);p.setAttribute('pathLength','1');svg.append(p);return p;});
    root.prepend(svg);
    function layout(){
      if(!root.offsetWidth||!root.offsetHeight)return;
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
  const a4=q(document,'#appendix-4'),exitStages=all(a4,'.exit-process-stage'),exitArrows=all(a4,'.exit-process-arrow'),exitClasses=all(a4,'.exit-class-card');
  const a3=q(document,'#appendix-3'),gates=all(a3,'.risk-row');
  const gatePaths=diagram(q(a3,'.risk-layout'),[
    ...gates.slice(0,3).map((card,i)=>({from:card,to:gates[i+1]})),
    {from:gates[3],to:q(a3,'.risk-panel'),kind:'classification'}
  ]);
  const p4=q(document,'#page-4'),product=all(p4,'.grid>.card'),productArrows=all(p4,'.flow-arrow');
  function layoutProduct(){
    const root=q(p4,'.slide-body');if(!root||!root.offsetWidth)return;
    const r=root.getBoundingClientRect(),scale=r.width/root.offsetWidth||1;
    productArrows.forEach((arrow,i)=>{
      const a=product[i].getBoundingClientRect(),b=product[i+1].getBoundingClientRect();
      const vertical=b.top>=a.bottom;
      const x=vertical?(a.left+a.width/2):((a.right+b.left)/2);
      const y=vertical?((a.bottom+b.top)/2):(a.top+a.height/2);
      arrow.style.left=((x-r.left)/scale-arrow.offsetWidth/2)+'px';arrow.style.top=((y-r.top)/scale-arrow.offsetHeight/2)+'px';
      arrow.style.transform=vertical?'rotate(90deg)':'none';
    });
  }
  diagrams.push({root:q(p4,'.slide-body'),layout:layoutProduct});
  function group(page,selector,start=300,stagger=200){all(page,selector).forEach((node,i)=>reveal(page,node,start+i*stagger));}
  function finish(page,time){reveal(page,q(page,'.callout'),time);}
  const pageSequences={
    'appendix-4':page=>{
      animate(page,q(page,'.slide-head>.eyebrow'),[{opacity:0,transform:'translateY(6px)'},{opacity:1,transform:'none'}],0,250);
      animate(page,q(page,'h1'),[{opacity:0,transform:'translateY(10px)'},{opacity:1,transform:'none'}],80,330);
      animate(page,q(page,'.intro'),[{opacity:0,transform:'translateY(8px)'},{opacity:1,transform:'none'}],210,310);
      exitStages.forEach((stage,i)=>{
        const t=480+i*310;
        animate(page,stage,[{opacity:0,transform:'translateY(12px)'},{opacity:1,transform:'none'}],t,360);
        if(exitArrows[i])animate(page,exitArrows[i],[{opacity:0,transform:'scaleX(.2)'},{opacity:1,transform:'scaleX(1)'}],t+180,220);
      });
      animate(page,q(page,'.exit-classification-block'),[{opacity:0,transform:'translateY(10px)'},{opacity:1,transform:'none'}],1760,350);
      exitClasses.forEach((card,i)=>reveal(page,card,1870+i*110));
      reveal(page,q(page,'.exit-governance-footer'),2400);
    },
    'appendix-6':page=>{
      reveal(page,q(page,'.worked-setup-strip'),180);
      all(page,'.worked-outcome').forEach((panel,i)=>reveal(page,panel,360+i*180));
      reveal(page,q(page,'.worked-rent-context'),740);
      reveal(page,q(page,'.worked-tradeoff'),940);
    },
    'appendix-7':page=>{
      animate(page,q(page,'.slide-head>.eyebrow'),[{opacity:0,transform:'translateY(6px)'},{opacity:1,transform:'none'}],0,260);
      animate(page,q(page,'h1'),[{opacity:0,transform:'translateY(10px)'},{opacity:1,transform:'none'}],80,340);
      animate(page,q(page,'.intro'),[{opacity:0,transform:'translateY(8px)'},{opacity:1,transform:'none'}],210,320);
      const stages=all(page,'.lifecycle-stage');
      const arrows=all(page,'.lifecycle-arrow');
      stages.forEach((stage,i)=>{
        const t=480+i*280;
        animate(page,stage,[{opacity:0,transform:'translateY(12px)'},{opacity:1,transform:'none'}],t,360);
        if(arrows[i])animate(page,arrows[i],[{opacity:0,transform:'scaleX(.2)'},{opacity:1,transform:'scaleX(1)'}],t+170,220);
      });
      animate(page,q(page,'.institutional-mechanics'),[{opacity:0,transform:'translateY(10px)'},{opacity:1,transform:'none'}],2280,360);
      all(page,'.mechanic').forEach((card,i)=>reveal(page,card,2380+i*100));
      reveal(page,q(page,'.appendix7-takeaway'),2860);
    }
  };

  Object.assign(pageSequences,{
    'page-21':page=>{reveal(page,q(page,'.intro'),350);group(page,'.metrics>article',800,200);},
    'appendices':page=>group(page,'.appendix-link',250,180),
    'appendix-1':page=>{reveal(page,q(page,'.waiting-inputs'),250);reveal(page,q(page,'.waiting-maths'),650);reveal(page,q(page,'.waiting-costs'),1100);reveal(page,q(page,'.waiting-choice'),1550);reveal(page,q(page,'.appendix-takeaway'),2050);},
    'appendix-2':page=>{group(page,'.eligibility-row',250,250);reveal(page,q(page,'.eligibility-panel'),1400);group(page,'.eligibility-summary',1600,150);reveal(page,q(page,'.exclusion-box'),2400);reveal(page,q(page,'.appendix-takeaway'),2800);},
    'appendix-3':page=>{gates.forEach((gate,i)=>{const t=250+i*450;reveal(page,gate,t);light(page,gate,t);flow(page,gatePaths[i],t+200);});reveal(page,q(page,'.risk-panel'),2100);group(page,'.risk-control',2250,150);reveal(page,q(page,'.risk-exit'),2800);reveal(page,q(page,'.risk-takeaway'),3200);},
    'appendix-5':page=>{group(page,'.portfolio-matrix-row',250,200);reveal(page,q(page,'.portfolio-governance'),1150);reveal(page,q(page,'.portfolio-footer'),1450);},
    'page-22':page=>reveal(page,q(page,'.legal'),300)
  });

  // Current main-deck structures; layout-independent animations cancel on
  // navigation, calculator input and reduced-motion preference changes.
  const mainGroups={
    1:['.slide-head>.eyebrow','.slide-head h1','.intro','.hero-panel>.eyebrow','.metrics>article'],
    2:['.metrics>article','.grid.three>.card'],
    3:['.page3-traditional','.page3-buysooner'],
    4:['.page4-stage','.flow-arrow','.page4-economics'],
    5:['.purchase','.stack-diagram','.funding-cards>.card','.transaction-lifecycle>.card','.callout'],
    6:['.metrics>article','.grid.two'],
    7:['tr','.callout'],
    8:['.refinance-column','.refinance-arrow','.callout'],
    9:['.grid.three>.card','.callout'],
    10:['.capital-economics-driver','.capital-economics-exit'],
    11:['.economics-exit-summary','.economics-step-row','.callout'],
    12:['.grid.three>.card','.thesis-conclusion'],
    13:['.grid.three>.card','.callout'],
    14:['.market-metrics>article','.market-wedge-panel','.slide-body>p'],
    15:['.grid.five>.card','.grid.two>.card'],
    16:['.grid.three>.card','.callout'],
    17:['.person'],
    18:['.slide-body>.eyebrow','.architecture-stack-linear','.slide-body>p:not(.eyebrow)'],
    19:['.opportunity-row','.callout'],
    20:['.grid.two>.card','.callout']
  };
  Object.entries(mainGroups).forEach(([n,selectors])=>{
    pageSequences['page-'+n]=page=>{
      const seen=new Set();let t=120;
      selectors.forEach(selector=>all(page,selector).forEach(node=>{
        if(seen.has(node))return;seen.add(node);
        animate(page,node,[{opacity:0},{opacity:1}],t,420);
        t+=100;
      }));
      if(n==='6')all(page,'.column i').forEach((bar,i)=>animate(page,bar,[{transform:'scaleY(0)'},{transform:'scaleY(1)'}],430+i*100,550));
      if(n==='5')all(page,'.stack-diagram i').forEach((bar,i)=>animate(page,bar,[{transform:'scaleX(0)'},{transform:'scaleX(1)'}],240+i*100,500));
    };
  });
  function play(page){
    if(!page?.classList.contains('enhanced-slide'))return false;
    stop(page);diagrams.filter(d=>page.contains(d.root)).forEach(d=>d.layout());
    if(media.matches)return true;
    if(page.id!=='page-1')reveal(page,q(page,'.slide-head'),0);pageSequences[page.id]?.(page);return true;
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
  const layout=()=>{cancelAnimationFrame(layoutFrame);layoutFrame=requestAnimationFrame(()=>diagrams.filter(d=>d.root&&!d.root.closest('.slide')?.hidden).forEach(d=>d.layout()));};
  window.addEventListener('resize',layout);
  if('ResizeObserver' in window){const ro=new ResizeObserver(layout);diagrams.filter(d=>d.root).forEach(d=>ro.observe(d.root));}
  document.fonts.ready.then(layout);
  activate(document.getElementById(location.hash.slice(1)||'page-1'));
})();
