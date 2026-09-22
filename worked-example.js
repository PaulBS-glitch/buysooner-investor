/* Five-year illustration. The pricing formula and inputs are unchanged. */
(()=>{
  const root=document.querySelector('#appendix-6');
  const workedGrowth=root?.querySelector('#worked-growth');
  if(!root||!workedGrowth)return;
  const currency=new Intl.NumberFormat('en-AU',{style:'currency',currency:'AUD',maximumFractionDigits:0});
  const purchasePrice=1000000;
  const buySoonerCapital=100000;
  const buySoonerContributionRate=.10;
  const pricingK=4.75;
  const years=5;
  const annualParticipationRate=(1/pricingK)*buySoonerContributionRate;
  const motion=matchMedia('(prefers-reduced-motion: reduce)');
  const allowedGrowth=new Set([3,4,5,6,7]);
  let initial=true;

  function setWorkedValue(key,value){
    root.querySelectorAll(`[data-worked="${key}"]`).forEach(element=>{
      element.dataset.value=String(value);
      element.textContent=currency.format(value);
      element.setAttribute('aria-label',currency.format(value));
      if(!initial&&!motion.matches&&element.animate){
        element.getAnimations().forEach(animation=>animation.cancel());
        element.animate([{opacity:.55},{opacity:1}],{duration:350,easing:'ease-out'});
      }
    });
  }

  function updateWorkedExample(){
    const selected=Number(workedGrowth.value);
    const growth=allowedGrowth.has(selected)?selected:5;
    if(growth!==selected)workedGrowth.value='5';
    const annualGrowth=growth/100;
    const propertyValue=purchasePrice*(1+annualGrowth)**years;
    const propertyGrowth=propertyValue-purchasePrice;
    const participation=propertyValue*annualParticipationRate*years;
    const payout=buySoonerCapital+participation;
    const retainedGrowth=propertyGrowth-participation;

    setWorkedValue('value',propertyValue);
    setWorkedValue('growth',propertyGrowth);
    setWorkedValue('participation',participation);
    setWorkedValue('payout',payout);
    setWorkedValue('retained',retainedGrowth);
    const status=root.querySelector('#worked-scenario-status');
    if(status)status.textContent=`At ${growth}% annual property growth over five years, growth retained after participation is ${currency.format(retainedGrowth)} and total BuySooner payout is ${currency.format(payout)}.`;
  }

  motion.addEventListener('change',()=>{
    if(motion.matches)root.querySelectorAll('[data-worked]').forEach(element=>element.getAnimations().forEach(animation=>animation.cancel()));
  });
  workedGrowth.addEventListener('change',updateWorkedExample);
  updateWorkedExample();
  initial=false;
})();
