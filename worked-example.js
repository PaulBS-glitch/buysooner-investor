const workedGrowth=document.querySelector('#worked-growth');
if(workedGrowth){
  const currency=new Intl.NumberFormat('en-AU',{style:'currency',currency:'AUD',maximumFractionDigits:0});
  const purchasePrice=1000000;
  const buySoonerCapital=100000;
  const buySoonerContributionRate=.10;
  const pricingK=4.75;
  const years=5;
  const annualParticipationRate=(1/pricingK)*buySoonerContributionRate;

  const motion=matchMedia('(prefers-reduced-motion: reduce)');
  const transitions=new Map();
  const visibleValues=new WeakMap();
  let initial=true;
  function transition(element,target,render){
    const previous=transitions.get(element);
    if(previous)cancelAnimationFrame(previous.frame);
    transitions.delete(element);
    const from=visibleValues.get(element) ?? target;
    const finish=()=>{render(target);visibleValues.set(element,target);transitions.delete(element);};
    if(initial||motion.matches||from===target){finish();return;}
    const start=performance.now(),record={frame:0,finish};
    transitions.set(element,record);
    function tick(now){
      const progress=Math.min(1,(now-start)/550);
      if(progress===1){finish();return;}
      const value=from+(target-from)*(1-(1-progress)**3);
      visibleValues.set(element,value);render(value);
      record.frame=requestAnimationFrame(tick);
    }
    record.frame=requestAnimationFrame(tick);
  }
  motion.addEventListener('change',()=>{
    if(!motion.matches)return;
    [...transitions.values()].forEach(record=>{cancelAnimationFrame(record.frame);record.finish();});
    document.querySelectorAll('[data-worked]').forEach(element=>element.getAnimations().forEach(animation=>animation.cancel()));
  });
  function setWorkedValue(key,value,prefix=''){
    document.querySelectorAll(`[data-worked="${key}"]`).forEach(element=>{
      // Preserve exact displayed economics while the chart transitions independently.
      element.dataset.value=String(value);
      element.setAttribute('aria-label',prefix+currency.format(value));
      element.textContent=prefix+currency.format(value);
      if(!initial&&!motion.matches&&element.animate){element.getAnimations().forEach(animation=>animation.cancel());element.animate([{opacity:.6},{opacity:1}],{duration:420,easing:'ease-out'});}
    });
  }

  function updateWorkedExample(){
    const annualGrowth=Number(workedGrowth.value)/100;
    const propertyValue=purchasePrice*(1+annualGrowth)**years;
    const propertyGrowth=propertyValue-purchasePrice;
    const participation=propertyValue*annualParticipationRate*years;
    const payout=buySoonerCapital+participation;
    const retainedGrowth=propertyGrowth-participation;

    setWorkedValue('value',propertyValue);
    setWorkedValue('growth',propertyGrowth,'+');
    setWorkedValue('participation',participation);
    setWorkedValue('payout',payout);
    setWorkedValue('retained',retainedGrowth,'+');
    setWorkedValue('retained-plain',retainedGrowth);

    const ownership=document.querySelector('.ownership-donut');
    const customerGrowthShare=retainedGrowth/propertyGrowth*100;
    const buySoonerGrowthShare=participation/propertyGrowth*100;
    transition(ownership,customerGrowthShare,n=>ownership.style.setProperty('--split',`${n}%`));
    ownership.setAttribute('aria-label',`Customer retains ${customerGrowthShare.toFixed(1)}% and BuySooner receives ${buySoonerGrowthShare.toFixed(1)}% of property growth`);
    const partnership=document.querySelector('.partnership-donut');
    const capitalShare=buySoonerCapital/payout*100;
    transition(partnership,capitalShare,n=>partnership.style.setProperty('--split',`${n}%`));
    partnership.setAttribute('aria-label',`BuySooner payout comprises ${currency.format(buySoonerCapital)} original capital and ${currency.format(participation)} participation`);
  }

  workedGrowth.addEventListener('change',updateWorkedExample);
  updateWorkedExample();
  initial=false;
}
