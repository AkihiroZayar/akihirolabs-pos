/*!
 * AkihiroLabs POS — js/views/modal.js
 * Modals: size picker, new tab, success, logout, product/staff forms.
 * https://github.com/AkihiroZayar/POS-SYTEM
 */
// ── Modal ───────────────────────────────────────────────────
function renderModal(){
  var ov=div('overlay');ov.onclick=function(e){if(e.target===ov){S.modal=null;render();}};var box=div('mbox');
  // size picker
  if(S.modal.type==='sizePick'){
    var p=S.modal.product;box.appendChild(div('size-picker-title',p.name));box.appendChild(div('size-picker-sub',t('pickSize')));
    var sb=div('size-btns');
    p.sizes.forEach(function(sz){
      var ep=effPrice(p,sz);var left=(Number(sz.stock)||0)-cartQtyFor(p.id,sz.label);var out=left<=0;
      var lo=!out&&(sz.minStock||0)>0&&(Number(sz.stock)||0)<=sz.minStock;
      var b=div('size-btn'+(out?' off':''),[span('size-btn-lbl',sz.label),span('size-btn-price',ks(ep)),span('size-btn-stock'+(out?' no':lo?' lo':''),out?((Number(sz.stock)||0)<=0?t('oos'):t('left',{n:0})):t('left',{n:left}))]);
      if(!out)b.onclick=function(){addToCart(p.name+' ('+sz.label+')',ep,p.id,sz.label);};sb.appendChild(b);
    });
    box.appendChild(sb);box.appendChild(btn('btn',t('cn'),function(){S.modal=null;render();}));ov.appendChild(box);return ov;
  }
  // new tab
  if(S.modal.type==='newTab'){
    box.appendChild(h('h3',{},t('newTab')));
    var f=div('field');f.appendChild(h('label',{},t('tabName')));
    var ni=inp({type:'text',placeholder:t('tabPh')});ni.onkeydown=function(e){if(e.key==='Enter'){S.modal=null;openNewTab(ni.value.trim()||'Guest');}};f.appendChild(ni);box.appendChild(f);
    box.appendChild(div('mbtns',[btn('btn',t('cn'),function(){S.modal=null;render();}),btn('btn btnpr',t('openTab'),function(){S.modal=null;openNewTab(ni.value.trim()||'Guest');})]));
    ov.appendChild(box);setTimeout(function(){ni.focus();},50);return ov;
  }
  // success
  if(S.modal.type==='ok'){
    var s=S.modal.sale;
    box.appendChild(div('sucmod',[span('sucico',icon('checkCircle',44)),div('sucamt',ks(s.total)),div('sucsub',t('cashRec')+': '+ks(s.cashReceived)),div('suc-lbl',t('change')),div('suc-change',ks(s.change||0)),btn('btn btnpr',t('ok'),function(){S.modal=null;render();})]));
    ov.appendChild(box);return ov;
  }
  // logout
  if(S.modal.type==='lgo'){
    box.appendChild(h('h3',{},t('lgo')+'?'));
    box.appendChild(div('mbtns',[btn('btn',t('cn'),function(){S.modal=null;render();}),btn('btn btndg',t('lgo'),async function(){await exitTabMode();S.user=null;S.modal=null;S.lstep='select';S.cart=[];S.cashReceived=0;render();})]));
    ov.appendChild(box);return ov;
  }
  // product / staff forms
  var isStaff=S.modal.type==='astf'||S.modal.type==='estf';
  var isEdit=S.modal.type==='eprod'||S.modal.type==='estf';
  if(!isStaff)box.classList.add('wide');
  box.appendChild(h('h3',{},isStaff?(isEdit?t('estf'):t('nstf')):(isEdit?t('eprod'):t('nprod'))));
  function field(lbl,key,type,ph){var f=div('field');f.appendChild(h('label',{},lbl));var i=inp({type:type||'text',value:S.modal.data[key]||'',placeholder:ph||''});i.oninput=function(e){S.modal.data[key]=e.target.value;};f.appendChild(i);return f;}
  if(isStaff){
    box.appendChild(field(t('nm'),'name','text'));box.appendChild(field(t('ini'),'initials','text'));
    if(!isEdit)box.appendChild(field(t('pin'),'pin','password'));
    if(isEdit)box.appendChild(field(t('cpin'),'npin','password'));
    var rf=div('field');rf.appendChild(h('label',{},t('rl')));
    var sel=h('select');['cashier','inventory','admin'].forEach(function(r){var o=h('option',{value:r},roleLabel(r));if(S.modal.data.role===r)o.selected=true;sel.appendChild(o);});
    sel.onchange=function(e){S.modal.data.role=e.target.value;};rf.appendChild(sel);box.appendChild(rf);
  }else{
    var lock=!isAdmin(); // inventory role: counts & alert levels only
    if(lock)box.appendChild(div('lock-note',[icon('alert',14),span('',t('invOnly'))]));
    var nmf=field(t('nm'),'name','text'),ctf=field(t('cat'),'category','text',t('catex'));
    if(lock){nmf.querySelector('input').disabled=true;ctf.querySelector('input').disabled=true;}
    box.appendChild(nmf);box.appendChild(ctf);
    var stf=field(t('st'),'stock','number');var mnf=field(t('minStkHint'),'minStock','number');
    stf.style.display=mnf.style.display=S.modal.data.hasSizes?'none':'block';box.appendChild(stf);box.appendChild(mnf);
    var tog=div('has-sizes-tog');var togBox=div('tbox'+(S.modal.data.hasSizes?' on':''));togBox.appendChild(div('tknob'));tog.appendChild(togBox);tog.appendChild(span('',t('hasSizes')));
    if(lock)tog.classList.add('locked');
    tog.onclick=function(){if(lock)return;S.modal.data.hasSizes=!S.modal.data.hasSizes;if(!S.modal.data.hasSizes)S.modal.data.sizes=[];togBox.className='tbox'+(S.modal.data.hasSizes?' on':'');sizeSec.style.display=S.modal.data.hasSizes?'block':'none';bpf.style.display=stf.style.display=mnf.style.display=S.modal.data.hasSizes?'none':'block';if(S.modal.data.hasSizes&&!(S.modal.data.sizes||[]).length){S.modal.data.sizes=[{label:'',price:0,stock:0,minStock:0}];renderSizeRows();}};
    box.appendChild(tog);
    var bpf=field(t('pr'),'price','number');if(lock)bpf.querySelector('input').disabled=true;bpf.style.display=S.modal.data.hasSizes?'none':'block';box.appendChild(bpf);
    var sizeSec=div('',null,S.modal.data.hasSizes?'display:block':'display:none');sizeSec.appendChild(div('size-head',t('szHead')));var srw=div('');
    function renderSizeRows(){srw.innerHTML='';(S.modal.data.sizes||[]).forEach(function(sz,i){var row=div('size-row');var li=inp({placeholder:t('sizeName'),value:sz.label||''});li.oninput=function(e){S.modal.data.sizes[i].label=e.target.value;};var pi=inp({type:'number',placeholder:t('sizePrice'),value:sz.price||''});pi.oninput=function(e){S.modal.data.sizes[i].price=parseInt(e.target.value)||0;};var si2=inp({type:'number',min:'0',placeholder:t('szStock'),value:sz.stock!=null?sz.stock:''});si2.oninput=function(e){S.modal.data.sizes[i].stock=Math.max(0,parseInt(e.target.value)||0);};var ai=inp({type:'number',min:'0',placeholder:t('szAlert'),value:sz.minStock||''});ai.oninput=function(e){S.modal.data.sizes[i].minStock=Math.max(0,parseInt(e.target.value)||0);};var db2=btn('size-del',icon('x',13),function(){S.modal.data.sizes.splice(i,1);renderSizeRows();});if(lock){li.disabled=pi.disabled=true;db2.style.visibility='hidden';}row.appendChild(li);row.appendChild(pi);row.appendChild(si2);row.appendChild(ai);row.appendChild(db2);srw.appendChild(row);});}
    renderSizeRows();sizeSec.appendChild(srw);
    var asb=btn('size-add-btn',t('addSize'),function(){if(!S.modal.data.sizes)S.modal.data.sizes=[];S.modal.data.sizes.push({label:'',price:0,stock:0,minStock:0});renderSizeRows();});
    if(lock)asb.style.display='none';
    sizeSec.appendChild(asb);box.appendChild(sizeSec);
  }
  var btns=div('mbtns',[btn('btn',t('cn'),function(){S.modal=null;render();})]);
  if(isEdit&&isAdmin()){btns.appendChild(btn('btn btndg',t('dl'),async function(){
    var d0=S.modal.data;
    if(isStaff){
      if(S.user&&d0.id===S.user.id){alert(t('selfDel'));return;}
      var orig=S.staff.find(function(x){return x.id===d0.id;});
      if(orig&&orig.role==='admin'&&S.staff.filter(function(x){return x.role==='admin';}).length<=1){alert(t('lastAdm'));return;}
      if(!confirm(t('cfDelStaff',{n:d0.name})))return;
      await dbDel('staff',d0.id);S.staff=await dbAll('staff');
    }else{
      if(!confirm(t('cfDelProd',{n:d0.name})))return;
      await dbDel('products',d0.id);S.products=await dbAll('products');
      S.cart=S.cart.filter(function(i){return i.prodId!==d0.id;});
    }
    S.modal=null;render();}));}
  btns.appendChild(btn('btn btnpr',t('sv'),async function(){
    var d=S.modal.data;
    if(isStaff){
      d.name=(d.name||'').trim();if(!d.name){alert(t('needName'));return;}
      if(!isEdit&&!/^\d{4}$/.test(d.pin||'')){alert(t('pinBad'));return;}
      if(isEdit&&d.npin&&!/^\d{4}$/.test(d.npin)){alert(t('pinBad'));return;}
      var origS=isEdit?S.staff.find(function(x){return x.id===d.id;}):null;
      if(origS&&origS.role==='admin'&&d.role!=='admin'&&S.staff.filter(function(x){return x.role==='admin';}).length<=1){alert(t('lastAdm'));return;}
      var item=Object.assign({},d);if(isEdit&&d.npin)item.pin=d.npin;delete item.npin;
      if(item.id)await dbPut('staff',item);else await dbAdd('staff',item);S.staff=await dbAll('staff');
      if(S.user&&item.id===S.user.id){S.user=S.staff.find(function(x){return x.id===item.id;})||S.user;if(allowedViews().indexOf(S.view)<0)S.view=allowedViews()[0];}
    }else if(!isAdmin()){
      // Inventory role: only stock counts and alert levels are taken from the form.
      var orig=S.products.find(function(x){return x.id===d.id;});if(!orig||!canEditStock())return;
      var up=JSON.parse(JSON.stringify(orig));
      if(hasSz(up)){up.sizes.forEach(function(s){var f=(d.sizes||[]).find(function(x){return x.label===s.label;});if(f){s.stock=Math.max(0,parseInt(f.stock)||0);s.minStock=Math.max(0,parseInt(f.minStock)||0);}});syncStock(up);}
      else{up.stock=Math.max(0,parseInt(d.stock)||0);up.minStock=Math.max(0,parseInt(d.minStock)||0);}
      delete up.needsCount;await dbPut('products',up);S.products=await dbAll('products');
    }else{
      d.name=(d.name||'').trim();if(!d.name){alert(t('needName'));return;}
      d.category=(d.category||'').trim()||'Other';
      var sizes=d.hasSizes?(d.sizes||[]).map(function(s){return{label:String(s.label||'').trim(),price:parseInt(s.price)||0,stock:Math.max(0,parseInt(s.stock)||0),minStock:Math.max(0,parseInt(s.minStock)||0)};}).filter(function(s){return s.label&&s.price;}):[];
      var basePrice=d.hasSizes&&sizes.length?sizes[0].price:parseInt(d.price)||0;
      var item2=Object.assign({},d,{price:basePrice,stock:Math.max(0,parseInt(d.stock)||0),minStock:parseInt(d.minStock)||0,sizes:sizes});
      syncStock(item2);delete item2.hasSizes;delete item2.needsCount;
      if(item2.id)await dbPut('products',item2);else await dbAdd('products',item2);S.products=await dbAll('products');
    }
    S.modal=null;render();
  }));
  box.appendChild(btns);ov.appendChild(box);return ov;
}
