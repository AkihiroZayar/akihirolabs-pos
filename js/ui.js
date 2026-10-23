/*!
 * AkihiroLabs POS — js/ui.js
 * DOM helpers (h, div, btn…), top bar and footer.
 * https://github.com/AkihiroZayar/POS-SYTEM
 */
// ── DOM helpers ─────────────────────────────────────────────
function h(tag,props,children){
  var e=document.createElement(tag);
  if(props)Object.keys(props).forEach(function(k){
    if(k==='cls')e.className=props[k];
    else if(k==='style')e.style.cssText=props[k];
    else if(k.indexOf('on')===0)e[k]=props[k];
    else e.setAttribute(k,props[k]);
  });
  if(children!=null)(Array.isArray(children)?children:[children]).forEach(function(c){
    if(c==null)return;
    e.appendChild(typeof c==='string'||typeof c==='number'?document.createTextNode(String(c)):c);
  });
  return e;
}
function div(cls,children,style){return h('div',style?{cls:cls,style:style}:{cls:cls},children);}
function btn(cls,label,onclick){return h('button',{cls:cls,onclick:onclick},label);}
function span(cls,label){return h('span',{cls:cls},label);}
function inp(props){return h('input',props);}
function txt(s){return document.createTextNode(s);}

// ── Icons (Lucide, ISC license — inline so the app works offline) ──
var ICONS={
  search:'<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
  clipboard:'<rect width="8" height="4" x="8" y="2" rx="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="M12 11h4"/><path d="M12 16h4"/><path d="M8 11h.01"/><path d="M8 16h.01"/>',
  chart:'<path d="M3 3v16a2 2 0 0 0 2 2h16"/><path d="M18 17V9"/><path d="M13 17V5"/><path d="M8 17v-3"/>',
  percent:'<line x1="19" x2="5" y1="5" y2="19"/><circle cx="6.5" cy="6.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/>',
  receipt:'<path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z"/><path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"/><path d="M12 17.5v-11"/>',
  save:'<path d="M15.2 3a2 2 0 0 1 1.4.6l3.8 3.8a2 2 0 0 1 .6 1.4V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z"/><path d="M17 21v-7a1 1 0 0 0-1-1H8a1 1 0 0 0-1 1v7"/><path d="M7 3v4a1 1 0 0 0 1 1h7"/>',
  wallet:'<path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1"/><path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4"/>',
  store:'<path d="M3 9h18l-1.6-5.2A1 1 0 0 0 18.4 3H5.6a1 1 0 0 0-1 .8z"/><path d="M5 9v11a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V9"/><path d="M10 21v-6h4v6"/>',
  alert:'<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><path d="M12 9v4"/><path d="M12 17h.01"/>',
  check:'<path d="M20 6 9 17l-5-5"/>',
  checkCircle:'<circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/>',
  x:'<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
  plus:'<path d="M5 12h14"/><path d="M12 5v14"/>',
  minus:'<path d="M5 12h14"/>',
  del:'<path d="M10 5a2 2 0 0 0-1.344.519l-6.328 5.74a1 1 0 0 0 0 1.481l6.328 5.741A2 2 0 0 0 10 19h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2z"/><path d="m12 9 6 6"/><path d="m18 9-6 6"/>',
  back:'<path d="m12 19-7-7 7-7"/><path d="M19 12H5"/>',
  download:'<path d="M12 15V3"/><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m7 10 5 5 5-5"/>',
  chat:'<path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/>',
  chev:'<path d="m9 18 6-6-6-6"/>'
};
// icon('check',14) → <svg class="ico">. Pass extra class as 3rd arg.
function icon(name,size,cls){
  size=size||14;
  var w=document.createElement('span');
  w.innerHTML='<svg class="ico'+(cls?' '+cls:'')+'" width="'+size+'" height="'+size+'" viewBox="0 0 24 24" aria-hidden="true">'+(ICONS[name]||'')+'</svg>';
  return w.firstChild;
}
// label with a leading icon: [svg, ' text']
function il(name,label,size){return [icon(name,size),txt(' '+label)];}
var DISCORD_URL='https://discord.gg/HSuaC72xMD';

// ── Roles ───────────────────────────────────────────────────
// admin: everything · cashier: selling · inventory: stock counts only
var ROLE_VIEWS={admin:['dash','pos','tabs','inv','rep','stf','sett'],cashier:['pos','tabs','inv'],inventory:['inv']};
function role(){return S.user?S.user.role:null;}
function allowedViews(){return ROLE_VIEWS[role()]||ROLE_VIEWS.cashier;}
function isAdmin(){return role()==='admin';}
function canEditStock(){return role()==='admin'||role()==='inventory';}
function roleLabel(r){return t(r==='admin'?'adm':r==='inventory'?'invRole':'cas');}
function navLabel(v){return v==='inv'?(role()==='inventory'?t('stockNav'):t('items')):t(v);}
function roleBadge(r){return r==='admin'?'badm':r==='inventory'?'binv':'bcas';}

// ── Topbar ──────────────────────────────────────────────────
function mkTopbar(){
  var tb=div('topbar');
  tb.appendChild(span('brand',CFG.storeName||t('app')));
  tb.appendChild(div('sp'));
  var lt=div('langt');
  ['en','my'].forEach(function(l){lt.appendChild(btn('langb'+(lang===l?' on':''),l==='en'?'EN':'\u1019\u103c\u1014\u103a\u1019\u102c',function(){setLang(l);}));});
  tb.appendChild(lt);
  var tabs=allowedViews();
  tabs.forEach(function(v){tb.appendChild(btn('nb'+(S.view===v?' on':''),navLabel(v),async function(){if(S.tabMode&&(v!=='pos'||S.view==='pos'))await exitTabMode();S.view=v;render();}));});
  var chip=div('uchip',[div('udot'),span('',S.user?S.user.name:'')]);
  chip.onclick=function(){S.modal={type:'lgo'};render();};
  tb.appendChild(chip);
  return tb;
}
function mkFooter(){return div('footer',[span('',['Developed by ',h('b',{},'AkihiroLabs'),' \xb7 POS System v'+APP_VERSION]),h('a',{cls:'discord-link',href:DISCORD_URL,target:'_blank',rel:'noopener'},il('chat','Join our Discord',12))]);}
