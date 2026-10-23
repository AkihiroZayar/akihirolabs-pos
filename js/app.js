/*!
 * AkihiroLabs POS — js/app.js
 * Main render loop and app boot.
 * https://github.com/AkihiroZayar/POS-SYTEM
 */
// ── Main render ─────────────────────────────────────────────
function render(){
  var root=document.getElementById('root');root.innerHTML='';
  if(!S.user){root.appendChild(renderLogin());return;}
  var shell=div('shell');var main=div('main');var views=[];
  if(S.view==='dash')views=renderDash();
  else if(S.view==='pos')views=renderPOS();
  else if(S.view==='tabs')views=renderTabs();
  else if(S.view==='inv')views=renderInv();
  else if(S.view==='rep')views=renderRep();
  else if(S.view==='stf')views=renderStaff();
  else if(S.view==='sett')views=renderSett();
  views.forEach(function(v){main.appendChild(v);});
  shell.appendChild(main);
  if(S.view!=='pos'&&S.view!=='dash')shell.appendChild(mkFooter());
  root.appendChild(shell);
  if(S.modal)root.appendChild(renderModal());
}

// ── Boot ────────────────────────────────────────────────────
(async function(){
  try{
    await openDB();
    await loadCFG();
    await seed();
    render();
  }catch(err){
    document.getElementById('root').innerHTML='<div style="color:#B91C1C;padding:30px;font-family:monospace;font-size:13px;">Error: '+err.message+'<br><br>'+err.stack+'</div>';
    console.error(err);
  }
})();
