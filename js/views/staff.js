/*!
 * AkihiroLabs POS — js/views/staff.js
 * Staff management.
 * https://github.com/AkihiroZayar/POS-SYTEM
 */
// ── Staff ───────────────────────────────────────────────────
function renderStaff(){
  var wrap=div('fullcol');var sc=div('scroll');
  var hd=div('sechd',[span('sectit',t('stf')),btn('addbtn','+ '+t('astf'),function(){S.modal={type:'astf',data:{name:'',pin:'',role:'cashier',initials:''}};render();})]);
  sc.appendChild(hd);
  var sg=div('staffgrid');
  S.staff.forEach(function(s){
    var card=div('staffcard',[div('scavatar',s.initials||(s.name.slice(0,2).toUpperCase())),div('scinfo',[div('scname',s.name),span('badge '+roleBadge(s.role),roleLabel(s.role))]),btn('scedit',t('edit'),function(){S.modal={type:'estf',data:Object.assign({},s,{npin:''})};render();})]);
    sg.appendChild(card);
  });
  sc.appendChild(sg);wrap.appendChild(sc);return[wrap];
}
