/*!
 * AkihiroLabs POS — js/views/settings.js
 * Settings: business info, happy hour, backup / restore.
 * https://github.com/AkihiroZayar/POS-SYTEM
 */
// ── Settings ────────────────────────────────────────────────
function renderSett(){
  var wrap=div('fullcol');var sc=div('scroll');
  sc.appendChild(div('sechd',[span('sectit',t('sett'))]));
  function sInp(key,ph,type){
    var i=inp({cls:'sinp',type:type||'text',value:CFG[key]||'',placeholder:ph||''});if(key==='happyHourDiscount'){i.min='0';i.max='50';i.onblur=function(){CFG[key]=hhPct();i.value=CFG[key];saveCFG();};}
    i.oninput=async function(e){CFG[key]=type==='number'?parseFloat(e.target.value)||0:e.target.value;await saveCFG();};
    return i;
  }
  // Business
  var biz=div('set-sec');biz.appendChild(div('set-sec-title',il('store',t('bizSet'))));
  [{k:'storeName',l:t('storeName')},{k:'address',l:t('addr')},{k:'phone',l:t('phone')}].forEach(function(x){
    var row=div('set-row',[div('set-lbl',x.l),sInp(x.k,x.l)]);biz.appendChild(row);
  });
  sc.appendChild(biz);
  // Happy hour
  var hh=div('set-sec');hh.appendChild(div('set-sec-title',il('percent',t('hhSet'))));
  var hhTogRow=div('set-row',[div('',[div('set-lbl',t('hhOn')),div('set-sub',t('hhSub'))])]);
  var hhTog=div('tbox'+(CFG.happyHourOn?' on':''));hhTog.appendChild(div('tknob'));
  hhTog.onclick=async function(){CFG.happyHourOn=!CFG.happyHourOn;hhTog.className='tbox'+(CFG.happyHourOn?' on':'');await saveCFG();render();};
  hhTogRow.appendChild(hhTog);hh.appendChild(hhTogRow);
  [{k:'happyHourStart',l:t('hhStart'),t:'time'},{k:'happyHourEnd',l:t('hhEnd'),t:'time'},{k:'happyHourDiscount',l:t('hhDiscount')+' (1-50)',t:'number'}].forEach(function(x){
    hh.appendChild(div('set-row',[div('set-lbl',x.l),sInp(x.k,'',x.t)]));
  });
  var catLbl=div('set-lbl',t('hhCats'));catLbl.style.marginBottom='8px';hh.appendChild(div('set-row',[catLbl]));
  var uniqueCats=[];var seen={};S.products.forEach(function(p){if(!seen[p.category]){seen[p.category]=1;uniqueCats.push(p.category);}});
  var catRow=div('catrow',null,'margin-bottom:0');
  uniqueCats.forEach(function(c){
    var on=CFG.happyHourCats&&CFG.happyHourCats.indexOf(c)>=0;
    var cb=btn('catb'+(on?' on':''),c,async function(){
      if(!CFG.happyHourCats)CFG.happyHourCats=[];
      var idx=CFG.happyHourCats.indexOf(c);
      if(idx>=0)CFG.happyHourCats.splice(idx,1);else CFG.happyHourCats.push(c);
      await saveCFG();render();
    });
    catRow.appendChild(cb);
  });
  hh.appendChild(catRow);sc.appendChild(hh);
  // Backup
  var bkp=div('set-sec');bkp.appendChild(div('set-sec-title',il('save',t('bkpSet'))));
  var bRow=div('set-row',[div('',[div('set-lbl',t('backupData')),div('set-sub',t('bkSub'))])]);
  var bb=btn('btn btnsm',t('backupData'),doBackup);bb.style.fontSize='11px';bRow.appendChild(bb);bkp.appendChild(bRow);
  var rRow=div('set-row',[div('',[div('set-lbl',t('restoreData')),div('set-sub',t('rsSub'))])]);
  var fi=inp({type:'file',accept:'.json',style:'display:none'});
  fi.onchange=async function(e){var f=e.target.files[0];e.target.value='';if(f)await doRestore(f);};
  var rb=btn('btn',t('restoreData'),function(){fi.click();});rb.style.fontSize='11px';
  rRow.appendChild(fi);rRow.appendChild(rb);bkp.appendChild(rRow);sc.appendChild(bkp);
  wrap.appendChild(sc);return[wrap];
}
