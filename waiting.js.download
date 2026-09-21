const waitingCalculator=document.querySelector('#waiting-calculator');
if(waitingCalculator){
  const inputs={property:document.querySelector('#wait-property'),rent:document.querySelector('#wait-rent'),growth:document.querySelector('#wait-growth'),years:document.querySelector('#wait-years')};
  const currency=new Intl.NumberFormat('en-AU',{style:'currency',currency:'AUD',maximumFractionDigits:0});
  const reducedMotion=matchMedia('(prefers-reduced-motion: reduce)');
  const error=document.querySelector('#waiting-error');
  reducedMotion.addEventListener('change',()=>{
    if(reducedMotion.matches)document.querySelectorAll('#appendix-1 .calculator-value,#wait-cost-path i').forEach(element=>element.getAnimations().forEach(animation=>animation.cancel()));
  });

  function animateValue(id,value,prefix=''){
    const element=document.querySelector(`#${id}`);
    element._numericValue=value;
    element.textContent=prefix+currency.format(value);
    if(!reducedMotion.matches&&element.animate){
      element.getAnimations().forEach(animation=>animation.cancel());
      element.animate([{opacity:.6},{opacity:1}],{duration:420,easing:'ease-out'});
    }
  }

  function update(){
    const property=Number(inputs.property.value);
    const weeklyRent=Number(inputs.rent.value);
    const growth=Number(inputs.growth.value)/100;
    const years=Number(inputs.years.value);
    if(![property,weeklyRent,growth,years].every(Number.isFinite)||property<=0||weeklyRent<0||growth<.03||growth>.09||![3,4,5].includes(years)){
      error.hidden=false;
      error.textContent='Enter a valid property value and weekly rent, then select a market outlook and waiting period.';
      return;
    }
    error.hidden=true;
    const projected=property*(1+growth)**years;
    const priceIncrease=projected-property;
    const totalRent=weeklyRent*52*years;

    animateValue('wait-out-today',property);
    animateValue('wait-out-increase',priceIncrease);
    animateValue('wait-out-projected',projected);
    animateValue('wait-out-delay',priceIncrease);
    animateValue('wait-out-rent',totalRent);
    if(!reducedMotion.matches){document.querySelectorAll('#wait-cost-path i').forEach(line=>{line.getAnimations().forEach(animation=>animation.cancel());line.animate([{opacity:.4},{opacity:1}],{duration:450,easing:'ease-out'});});}
    const writtenYears={3:'Three',4:'Four',5:'Five'}[years];
    const lowerYears=writtenYears.toLowerCase();
    document.querySelector('#wait-future-label').textContent=`After ${lowerYears} years`;
    document.querySelector('#wait-year-end').textContent=`Year ${years}`;
    document.querySelector('#wait-cost-path').setAttribute('aria-label',`${writtenYears}-year waiting period`);
    document.querySelector('#wait-choice-title').textContent=`Wait ${lowerYears} years`;
    document.querySelector('#wait-rent-copy').textContent=`Your rent is ${currency.format(weeklyRent)} per week. ${writtenYears} years of renting costs ${currency.format(totalRent)}.`;
    document.querySelector('#waiting-scenario').textContent=`Illustrative ${currency.format(property)} property scenario based on ${inputs.growth.value}% annual market growth, weekly rent of ${currency.format(weeklyRent)} and a ${years}-year waiting period.`;
    document.querySelector('#waiting-takeaway').innerHTML=`<strong>Investor takeaway:</strong> a ${lowerYears}-year wait can increase both the target purchase price and the customer’s rent outlay, widening the capital gap BuySooner is designed to bridge.`;
  }

  let scheduled=false;
  waitingCalculator.addEventListener('input',()=>{
    if(scheduled)return;
    scheduled=true;
    requestAnimationFrame(()=>{scheduled=false;update();});
  });
  update();
}
