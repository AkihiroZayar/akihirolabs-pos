/*!
 * AkihiroLabs POS — js/views/login.js
 * Staff selection + PIN login screen.
 * https://github.com/AkihiroZayar/POS-SYTEM
 */
// ── Login ───────────────────────────────────────────────────
function renderLogin(){
  var wrap=div('loginsc');
  wrap.appendChild(div('loginlogo',CFG.storeName||t('app')));
  wrap.appendChild(div('loginsub',t('posSub')));
  var card=div('logincard');
  var lt=div('langt',null,'margin-bottom:16px');
  ['en','my'].forEach(function(l){lt.appendChild(btn('langb'+(lang===l?' on':''),l==='en'?'EN':'\u1019\u103c\u1014\u103a\u1019\u102c',function(){setLang(l);}));});
  card.appendChild(lt);
  if(S.lstep==='select'){
    card.appendChild(div('',t('sel'),'font-size:13px;color:var(--muted);margin-bottom:12px'));
    var list=div('slist');
    S.staff.forEach(function(s){
      var item=div('sitem',[div('savatar',s.initials||(s.name.slice(0,2).toUpperCase())),div('',[div('sname',s.name),div('srole',t(s.role==='admin'?'adm':'cas'))])]);
      item.onclick=function(){S.lstaff=s;S.lstep='pin';S.lpin='';render();};
      list.appendChild(item);
    });
    card.appendChild(list);
  }else{
    card.appendChild(btn('backbtn',il('back',t('bk')),function(){S.lstep='select';S.lpin='';render();}));
    card.appendChild(div('',t('epin')+' '+S.lstaff.name,'font-size:13px;color:var(--muted);margin-bottom:4px'));
    var pg=div('pingrid');
    for(var i=0;i<4;i++){
      (function(i){
        var d=inp({cls:'pindot',type:'password',maxlength:'1',inputmode:'numeric'});
        d.value=S.lpin[i]||'';
        d.oninput=function(e){
          var v=e.target.value.replace(/\D/g,'').slice(0,1);e.target.value=v;
          S.lpin=S.lpin.slice(0,i)+v+S.lpin.slice(i+1);
          if(v&&i<3)pg.children[i+1].focus();
          if(S.lpin.length===4){
            if(S.lpin===String(S.lstaff.pin)){S.user=S.lstaff;S.lstep='select';S.lpin='';S.view=S.lstaff.role==='admin'?'dash':'pos';render();}
            else{S.lpin='';var err=document.getElementById('perr');if(err)err.textContent=t('wpin');Array.from(pg.children).forEach(function(c){c.value='';});pg.children[0].focus();}
          }
        };
        d.onkeydown=function(e){if(e.key==='Backspace'&&!e.target.value&&i>0){S.lpin=S.lpin.slice(0,i-1);pg.children[i-1].focus();}};
        pg.appendChild(d);
      })(i);
    }
    card.appendChild(pg);
    card.appendChild(h('div',{id:'perr',cls:'pinerr'}));
    setTimeout(function(){if(pg.children[0])pg.children[0].focus();},60);
  }
  wrap.appendChild(card);
  var ft=mkFooter();ft.style.cssText='position:fixed;bottom:0;left:0;right:0;';wrap.appendChild(ft);
  return wrap;
}
