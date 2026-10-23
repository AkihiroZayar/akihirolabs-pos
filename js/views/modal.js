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
      var ep=effPrice(p,sz);
      var b=div('size-btn',[span('size-btn-lbl',sz.label),span('size-btn-price',ks(ep))]);
      b.onclick=function(){addToCart(p.name+' ('+sz.label+')',ep,p.id);};sb.appendChild(b);
    });
    box.appendChild(sb);box.appendChild(btn('btn',t('cn'),function(){S.modal=null;render();}));ov.appendChild(box);return ov;
  }
  // new tab
  if(S.modal.type==='newTab'){
    box.appendChild(h('h3',{},t('newTab')));
    var f=div('field');f.appendChild(h('label',{},t('tabName')));
    var ni=inp({type:'text',placeholder:'e.g. Table 3, John...'});f.appendChild(ni);box.appendChild(f);
    box.appendChild(div('mbtns',[btn('btn',t('cn'),function(){S.modal=null;render();}),btn('btn btnpr',t('openTab'),function(){S.modal=null;openNewTab(ni.value||'Guest');})]));
    ov.appendChild(box);setTimeout(function(){ni.focus();},50);return ov;
  }
  // success
  if(S.modal.type==='ok'){
    var s=S.modal.sale;
    box.appendChild(div('sucmod',[span('sucico',icon('checkCircle',44)),div('sucamt',ks(s.total)),div('sucsub',t('cashRec')+': '+ks(s.cashReceived)),div('suc-lbl',t('change')),div('suc-change',ks(s.change||0)),btn('btn btnpr','OK',function(){S.modal=null;render();})]));
    ov.appendChild(box);return ov;
  }
  // logout
  if(S.modal.type==='lgo'){
    box.appendChild(h('h3',{},t('lgo')+'?'));
    box.appendChild(div('mbtns',[btn('btn',t('cn'),function(){S.modal=null;render();}),btn('btn btndg',t('lgo'),function(){S.user=null;S.modal=null;S.lstep='select';S.cart=[];S.cashReceived=0;S.tabMode=false;S.editingTab=null;render();})]));
    ov.appendChild(box);return ov;
  }
  // product / staff forms
  var isStaff=S.modal.type==='astf'||S.modal.type==='estf';
  var isEdit=S.modal.type==='eprod'||S.modal.type==='estf';
  box.appendChild(h('h3',{},isStaff?(isEdit?t('estf'):t('nstf')):(isEdit?t('eprod'):t('nprod'))));
  function field(lbl,key,type,ph){var f=div('field');f.appendChild(h('label',{},lbl));var i=inp({type:type||'text',value:S.modal.data[key]||'',placeholder:ph||''});i.oninput=function(e){S.modal.data[key]=e.target.value;};f.appendChild(i);return f;}
  if(isStaff){
    box.appendChild(field(t('nm'),'name','text'));box.appendChild(field(t('ini'),'initials','text'));
    if(!isEdit)box.appendChild(field(t('pin'),'pin','password'));
    if(isEdit)box.appendChild(field(t('cpin'),'npin','password'));
    var rf=div('field');rf.appendChild(h('label',{},t('rl')));
    var sel=h('select');['cashier','admin'].forEach(function(r){var o=h('option',{value:r},t(r==='admin'?'adm':'cas'));if(S.modal.data.role===r)o.selected=true;sel.appendChild(o);});
    sel.onchange=function(e){S.modal.data.role=e.target.value;};rf.appendChild(sel);box.appendChild(rf);
  }else{
    box.appendChild(field(t('nm'),'name','text'));
    box.appendChild(field(t('cat'),'category','text',t('catex')));
    box.appendChild(field(t('st'),'stock','number'));
    box.appendChild(field(t('minStk')+' (alert below this)','minStock','number'));
    var tog=div('has-sizes-tog');var togBox=div('tbox'+(S.modal.data.hasSizes?' on':''));togBox.appendChild(div('tknob'));tog.appendChild(togBox);tog.appendChild(span('',t('hasSizes')));
    tog.onclick=function(){S.modal.data.hasSizes=!S.modal.data.hasSizes;if(!S.modal.data.hasSizes)S.modal.data.sizes=[];togBox.className='tbox'+(S.modal.data.hasSizes?' on':'');sizeSec.style.display=S.modal.data.hasSizes?'block':'none';bpf.style.display=S.modal.data.hasSizes?'none':'block';};
    box.appendChild(tog);
    var bpf=field(t('pr'),'price','number');bpf.style.display=S.modal.data.hasSizes?'none':'block';box.appendChild(bpf);
    var sizeSec=div('',null,S.modal.data.hasSizes?'display:block':'display:none');var srw=div('');
    function renderSizeRows(){srw.innerHTML='';(S.modal.data.sizes||[]).forEach(function(sz,i){var row=div('size-row');var li=inp({placeholder:t('sizeName'),value:sz.label||''});li.oninput=function(e){S.modal.data.sizes[i].label=e.target.value;};var pi=inp({type:'number',placeholder:t('sizePrice'),value:sz.price||''});pi.oninput=function(e){S.modal.data.sizes[i].price=parseInt(e.target.value)||0;};var db2=btn('size-del',icon('x',13),function(){S.modal.data.sizes.splice(i,1);renderSizeRows();});row.appendChild(li);row.appendChild(pi);row.appendChild(db2);srw.appendChild(row);});}
    renderSizeRows();sizeSec.appendChild(srw);
    var asb=btn('size-add-btn',t('addSize'),function(){if(!S.modal.data.sizes)S.modal.data.sizes=[];S.modal.data.sizes.push({label:'',price:0});renderSizeRows();});
    sizeSec.appendChild(asb);box.appendChild(sizeSec);
  }
  var btns=div('mbtns',[btn('btn',t('cn'),function(){S.modal=null;render();})]);
  if(isEdit){btns.appendChild(btn('btn btndg',t('dl'),async function(){if(isStaff){await dbDel('staff',S.modal.data.id);S.staff=await dbAll('staff');}else{await dbDel('products',S.modal.data.id);S.products=await dbAll('products');}S.modal=null;render();}));}
  btns.appendChild(btn('btn btnpr',t('sv'),async function(){
    var d=S.modal.data;
    if(isStaff){
      if(!d.name)return;if(!isEdit&&!d.pin)return;
      var item=Object.assign({},d);if(isEdit&&d.npin&&d.npin.length===4)item.pin=d.npin;delete item.npin;
      if(item.id)await dbPut('staff',item);else await dbAdd('staff',item);S.staff=await dbAll('staff');
    }else{
      if(!d.name)return;
      var sizes=d.hasSizes?(d.sizes||[]).filter(function(s){return s.label&&s.price;}):[];
      var basePrice=d.hasSizes&&sizes.length?sizes[0].price:parseInt(d.price)||0;
      var item2=Object.assign({},d,{price:basePrice,stock:parseInt(d.stock)||0,minStock:parseInt(d.minStock)||0,sizes:sizes});
      delete item2.hasSizes;
      if(item2.id)await dbPut('products',item2);else await dbAdd('products',item2);S.products=await dbAll('products');
    }
    S.modal=null;render();
  }));
  box.appendChild(btns);ov.appendChild(box);return ov;
}
