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
  // open shift
  if(S.modal.type==='openShift'){
    box.classList.add('count-box');
    box.appendChild(div('mhead',[h('h3',{},t('openShift')),btn('mclose',icon('x',18),function(){S.modal=null;render();})]));
    var oa=inp({cls:'cnum wide',type:'number',min:'0',inputmode:'numeric',placeholder:'0'});
    box.appendChild(div('cnote rf-meta',t('startCashHint')));
    box.appendChild(div('field',[h('label',{},t('startCash')),oa]));
    box.appendChild(btn('pay-btn',t('openShift'),async function(){await startShift(oa.value);S.modal=null;render();}));
    ov.appendChild(box);setTimeout(function(){oa.focus();},60);return ov;
  }
  // close shift
  if(S.modal.type==='closeShift'){
    var sh=openShiftRec();if(!sh){S.modal=null;return div('');}
    var st=shiftStats(sh);box.classList.add('count-box');
    box.appendChild(div('mhead',[h('h3',{},t('closeShift')),btn('mclose',icon('x',18),function(){S.modal=null;render();})]));
    box.appendChild(shiftRows(sh,st));
    var ca=inp({cls:'cnum wide',type:'number',min:'0',inputmode:'numeric',placeholder:'0'});
    var dEl=span('badge bcas','—');
    ca.oninput=function(){if(ca.value===''){dEl.className='badge bcas';dEl.textContent='—';return;}var d=(parseInt(ca.value)||0)-st.expected;dEl.className='badge '+diffCls(d);dEl.textContent=diffLabel(d);};
    box.appendChild(div('field',[h('label',{},t('counted')),ca,div('cnote shint',t('countHint'))]));
    box.appendChild(div('sum-row rf-tot',[span('',t('diff')),dEl]));
    var nt=inp({type:'text',placeholder:t('shiftNote')});box.appendChild(div('field',[nt]));
    box.appendChild(btn('pay-btn',t('closeShift'),async function(){
      if(ca.value===''){ca.focus();return;}
      if(!confirm(t('cfClose',{a:ks(parseInt(ca.value)||0)})))return;
      var done=await endShift(ca.value,nt.value.trim());S.modal=done?{type:'shiftReport',id:done.id}:null;render();
    }));
    ov.appendChild(box);setTimeout(function(){ca.focus();},60);return ov;
  }
  // shift report (Z-report)
  if(S.modal.type==='shiftReport'){
    var rs=S.shifts.find(function(x){return x.id===S.modal.id;});if(!rs){S.modal=null;return div('');}
    box.classList.add('count-box');
    box.appendChild(div('mhead',[h('h3',{},t('shiftReport')+' #'+rs.id),btn('mclose',icon('x',18),function(){S.modal=null;render();})]));
    box.appendChild(shiftRows(rs,rs));
    box.appendChild(div('stock-sum shift-sum',[div('sum-row strong',[span('',t('counted')),h('b',{},ks(rs.countedCash))]),div('sum-row',[span('',t('diff')),span('badge '+diffCls(rs.difference),diffLabel(rs.difference))])]));
    if(rs.note)box.appendChild(div('cnote rf-meta',rs.note));
    box.appendChild(div('mbtns mbtns-split',[btn('btn',il('download',t('savePdf'),13),function(){doShiftPDF(rs);}),btn('btn btnpr',t('ok'),function(){S.modal=null;render();})]));
    ov.appendChild(box);return ov;
  }
  // refund (admin)
  if(S.modal.type==='refund'){
    var R=S.modal,sale=S.sales.find(function(x){return x.id===R.saleId;});
    if(!sale||!isAdmin()){S.modal=null;return div('');}
    box.classList.add('count-box');
    box.appendChild(div('mhead',[h('h3',{},t('refundTitle',{n:sale.id})),btn('mclose',icon('x',18),function(){S.modal=null;render();})]));
    box.appendChild(div('cnote rf-meta',new Date(sale.time).toLocaleString()+(sale.staffName?' \xb7 '+sale.staffName:'')+' \xb7 '+ks(sale.total)));
    var totEl=h('b',{},ks(0));var confirmB;
    function amt(){return sale.items.reduce(function(a,i,idx){return a+i.price*(R.lines[idx]||0);},0);}
    function upd(){var a=amt();totEl.textContent=ks(a);confirmB.disabled=a<=0;confirmB.textContent=t('confirmRefund',{a:ks(a)});}
    sale.items.forEach(function(it,idx){
      var max=it.qty-lineRefunded(sale,idx);if(max<=0)return;
      var n=span('rf-q',String(R.lines[idx]||0));
      function step(d){R.lines[idx]=Math.max(0,Math.min(max,(R.lines[idx]||0)+d));n.textContent=String(R.lines[idx]);upd();}
      box.appendChild(div('crow',[div('cl',[div('rf-nm',it.name),div('cl-a',ks(it.price)+' \xb7 '+t('maxN',{n:max}))]),div('cstep',[btn('sbtn sm',icon('minus',16),function(){step(-1);}),n,btn('sbtn sm',icon('plus',16),function(){step(1);})])]));
    });
    box.appendChild(btn('size-add-btn rf-all',t('refundAll'),function(){sale.items.forEach(function(i,idx){R.lines[idx]=i.qty-lineRefunded(sale,idx);});render();}));
    var ck=h('input',{type:'checkbox'});ck.checked=R.restock!==false;ck.onchange=function(e){R.restock=e.target.checked;};
    box.appendChild(h('label',{cls:'rf-ck'},[ck,txt(' '+t('returnStock'))]));
    box.appendChild(div('sum-row rf-tot',[span('',t('refundAmt')),totEl]));
    confirmB=btn('pay-btn rf-go',t('confirmRefund',{a:ks(0)}),async function(){
      var a=amt();if(a<=0)return;if(!confirm(t('cfRefund',{a:ks(a)})))return;
      var lines=Object.keys(R.lines).map(function(k){return{idx:parseInt(k),qty:R.lines[k]};}).filter(function(l){return l.qty>0;});
      var ok=await refundSale(R.saleId,lines,R.restock!==false);if(ok){S.modal=null;render();}
    });
    box.appendChild(confirmB);upd();
    ov.appendChild(box);return ov;
  }
  // stock count (inventory role) — counts only, no prices
  if(S.modal.type==='count'){
    var C=S.modal.data;box.classList.add('count-box');
    box.appendChild(div('mhead',[h('h3',{},C.name),btn('mclose',icon('x',18),function(){S.modal=null;render();})]));
    function stepRow(lbl,obj){
      var n=inp({cls:'cnum',type:'number',min:'0',inputmode:'numeric',value:String(obj.stock)});
      n.oninput=function(e){obj.stock=Math.max(0,parseInt(e.target.value)||0);};
      function step(d){obj.stock=Math.max(0,(parseInt(obj.stock)||0)+d);n.value=obj.stock;}
      var al=inp({cls:'calert',type:'number',min:'0',value:String(obj.minStock||0)});al.oninput=function(e){obj.minStock=Math.max(0,parseInt(e.target.value)||0);};
      return div('crow',[div('cl',[div('cl-n',lbl),div('cl-a',[span('',t('alertAt')+' '),al])]),div('cstep',[btn('sbtn',icon('minus',20),function(){step(-1);}),n,btn('sbtn',icon('plus',20),function(){step(1);})])]);
    }
    if(C.sizes)C.sizes.forEach(function(s){box.appendChild(stepRow(s.label,s));});
    else box.appendChild(stepRow(t('st'),C));
    box.appendChild(btn('pay-btn csave',t('saveCount'),async function(){
      if(!canEditStock())return;
      var orig=S.products.find(function(x){return x.id===C.id;});if(!orig)return;
      var up=JSON.parse(JSON.stringify(orig));
      if(hasSz(up)&&C.sizes){up.sizes.forEach(function(s){var f=C.sizes.find(function(x){return x.label===s.label;});if(f){s.stock=Math.max(0,parseInt(f.stock)||0);s.minStock=Math.max(0,parseInt(f.minStock)||0);}});syncStock(up);}
      else{up.stock=Math.max(0,parseInt(C.stock)||0);up.minStock=Math.max(0,parseInt(C.minStock)||0);}
      delete up.needsCount;await dbPut('products',up);S.products=await dbAll('products');S.modal=null;render();
    }));
    box.appendChild(div('cnote',t('countsOnly')));
    ov.appendChild(box);return ov;
  }
  // product / staff forms
  var isStaff=S.modal.type==='astf'||S.modal.type==='estf';
  var isEdit=S.modal.type==='eprod'||S.modal.type==='estf';
  if(!isStaff)box.classList.add('wide');
  if(isStaff)box.appendChild(h('h3',{},isEdit?t('estf'):t('nstf')));
  else box.appendChild(div('mhead',[h('h3',{},isEdit?(S.modal.data.name||t('eprod')):t('newItem')),btn('mclose',icon('x',18),function(){S.modal=null;render();})]));
  function field(lbl,key,type,ph){var f=div('field');f.appendChild(h('label',{},lbl));var i=inp({type:type||'text',value:S.modal.data[key]||'',placeholder:ph||''});i.oninput=function(e){S.modal.data[key]=e.target.value;};f.appendChild(i);return f;}
  if(isStaff){
    box.appendChild(field(t('nm'),'name','text'));box.appendChild(field(t('ini'),'initials','text'));
    if(!isEdit)box.appendChild(field(t('pin'),'pin','password'));
    if(isEdit)box.appendChild(field(t('cpin'),'npin','password'));
    var rf=div('field');rf.appendChild(h('label',{},t('rl')));
    var sel=h('select');['cashier','inventory','admin'].forEach(function(r){var o=h('option',{value:r},roleLabel(r));if(S.modal.data.role===r)o.selected=true;sel.appendChild(o);});
    sel.onchange=function(e){S.modal.data.role=e.target.value;};rf.appendChild(sel);box.appendChild(rf);
  }else{
    // Admin item editor: Details · Price & sizes · Stock (real-POS style sections)
    var D=S.modal.data;
    function sec(title,kids){return div('fsec',[div('fsec-t',title)].concat(kids));}
    function fld(lbl,key,type,ph){var f=div('field');f.appendChild(h('label',{},lbl));var i=inp({type:type||'text',value:D[key]!=null?D[key]:'',placeholder:ph||''});i.oninput=function(e){D[key]=e.target.value;};f.appendChild(i);return f;}
    box.appendChild(sec(t('secDetails'),[div('fgrid',[fld(t('nm'),'name','text'),fld(t('cat'),'category','text',t('catex'))])]));
    var tog=div('has-sizes-tog');var togBox=div('tbox'+(D.hasSizes?' on':''));togBox.appendChild(div('tknob'));tog.appendChild(togBox);tog.appendChild(span('',t('hasSizes')));
    tog.onclick=function(){D.hasSizes=!D.hasSizes;if(D.hasSizes&&!(D.sizes||[]).length)D.sizes=[{label:'',price:D.price||0,stock:D.stock||0,minStock:D.minStock||0}];if(!D.hasSizes)D.sizes=[];render();};
    var pk=[tog];
    var sumBox=div('stock-sum');
    function updSum(){sumBox.innerHTML='';var tot=(D.sizes||[]).reduce(function(a,s){return a+(parseInt(s.stock)||0);},0);
      var lows=(D.sizes||[]).filter(function(s){var st=parseInt(s.stock)||0,m=parseInt(s.minStock)||0;return s.label&&(st<=0||(m>0&&st<=m));}).map(function(s){return s.label;});
      sumBox.appendChild(div('sum-row',[span('',t('totalStock')),h('b',{},String(tot))]));
      if(lows.length)sumBox.appendChild(div('sum-row lo',[span('',t('lowSizes')),h('b',{},lows.join(', '))]));}
    if(D.hasSizes){
      pk.push(div('size-row size-hrow',[span('',t('sizeName')),span('',t('sizePrice')),span('',t('szStock')),span('',t('szAlert')),span('','')]));
      (D.sizes||[]).forEach(function(sz,i){
        function num(key,ph){var x=inp({type:'number',min:'0',placeholder:ph,value:sz[key]!=null&&sz[key]!==''?sz[key]:''});x.oninput=function(e){D.sizes[i][key]=e.target.value;updSum();};return x;}
        var li=inp({placeholder:t('sizeName'),value:sz.label||''});li.oninput=function(e){D.sizes[i].label=e.target.value;updSum();};
        pk.push(div('size-row',[li,num('price',t('sizePrice')),num('stock',t('szStock')),num('minStock',t('szAlert')),btn('size-del',icon('x',13),function(){D.sizes.splice(i,1);if(!D.sizes.length)D.hasSizes=false;render();})]));
      });
      pk.push(btn('size-add-btn',t('addSize'),function(){D.sizes.push({label:'',price:'',stock:0,minStock:0});render();}));
      box.appendChild(sec(t('secPrice'),pk));
      updSum();box.appendChild(sec(t('secStock'),[sumBox]));
    }else{
      pk.push(fld(t('pr'),'price','number'));
      box.appendChild(sec(t('secPrice'),pk));
      box.appendChild(sec(t('secStock'),[div('fgrid',[fld(t('st'),'stock','number'),fld(t('minStkHint'),'minStock','number')])]));
    }
  }
  var btns=div('mbtns mbtns-split');var rightB=div('mbtns-r',[btn('btn',t('cn'),function(){S.modal=null;render();})]);
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
  btns.appendChild(rightB);
  rightB.appendChild(btn('btn btnpr',t('sv'),async function(){
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
      return;
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
