/*!
 * AkihiroLabs POS — js/views/inventory.js
 * Items (admin / cashier) and Stock count (inventory role).
 * Real-POS style: simple list, tap a row to open it. Stock is read-only here.
 * https://github.com/AkihiroZayar/akihirolabs-pos
 */
// ── Items / Stock ───────────────────────────────────────────
function invStatus(p,low){if(p.stock<=0)return 'no';return low.some(function(e){return e.prod.id===p.id;})?'lo':'ok';}
function priceRange(p){if(!hasSz(p))return ks(p.price);var a=p.sizes.map(function(s){return s.price;});var mn=Math.min.apply(null,a),mx=Math.max.apply(null,a);return mn===mx?ks(mn):(mn.toLocaleString()+'–'+ks(mx));}
function sizeSummary(p){return p.sizes.map(function(s){return s.label+' '+(Number(s.stock)||0);}).join(' \xb7 ');}
function openItem(p){S.modal={type:'eprod',data:Object.assign({},p,{hasSizes:hasSz(p),sizes:hasSz(p)?p.sizes.map(function(s){return Object.assign({},s);}):[]})};render();}
function openCount(p){S.modal={type:'count',data:{id:p.id,name:p.name,stock:p.stock,minStock:p.minStock||0,sizes:hasSz(p)?p.sizes.map(function(s){return{label:s.label,stock:Number(s.stock)||0,minStock:s.minStock||0};}):null}};render();}

function renderInv(){
  var wrap=div('fullcol');var sc=div('scroll inv-scroll');
  var countMode=role()==='inventory';
  var low=lowStk();
  var nLow=S.products.filter(function(p){return invStatus(p,low)==='lo';}).length;
  var nOut=S.products.filter(function(p){return p.stock<=0;}).length;

  // search + add
  var top=div('inv-top');
  var sw=div('swrap inv-search');sw.appendChild(icon('search',13,'sico'));
  var si=inp({cls:'sbar',type:'text',value:S.invQ,placeholder:countMode?t('srch'):t('srch')});
  si.oninput=function(e){S.invQ=e.target.value;refresh();};sw.appendChild(si);top.appendChild(sw);
  if(isAdmin())top.appendChild(btn('addbtn',il('plus',t('addItem'),13),function(){S.modal={type:'aprod',data:{name:'',price:'',stock:'',category:'',minStock:'5',hasSizes:false,sizes:[]}};render();}));
  sc.appendChild(top);

  // chips
  var chips=div('inv-chips');
  function chip(lbl,on,fn,n){var b=btn('catb'+(on?' on':''),n!=null?[txt(lbl),span('chip-n',String(n))]:lbl,fn);return b;}
  if(!countMode){var cg=div('catrow');cats().forEach(function(c){cg.appendChild(chip(c==='All'?t('fAll'):c,S.invCat===c,function(){S.invCat=c;render();}));});chips.appendChild(cg);}
  var fg=div('catrow');
  if(countMode)fg.appendChild(chip(t('fAll'),S.invFilter==='all',function(){S.invFilter='all';render();}));
  fg.appendChild(chip(t('fLow'),S.invFilter==='low',function(){S.invFilter=S.invFilter==='low'?'all':'low';render();},nLow));
  fg.appendChild(chip(t('fOut'),S.invFilter==='out',function(){S.invFilter=S.invFilter==='out'?'all':'out';render();},nOut));
  chips.appendChild(fg);sc.appendChild(chips);

  var nc=S.products.filter(function(p){return p.needsCount;}).length;
  if(nc&&canEditStock())sc.appendChild(div('count-banner',[icon('alert',16),span('',t('needCount',{n:nc}))]));

  var list=div('inv-list');sc.appendChild(list);
  function refresh(){
    list.innerHTML='';
    var q=S.invQ.toLowerCase();
    var items=S.products.filter(function(p){
      if(q&&p.name.toLowerCase().indexOf(q)<0)return false;
      if(!countMode&&S.invCat!=='All'&&p.category!==S.invCat)return false;
      var st=invStatus(p,low);
      if(S.invFilter==='low'&&st!=='lo')return false;
      if(S.invFilter==='out'&&st!=='no')return false;
      return true;
    }).sort(function(a,b){return a.name.localeCompare(b.name);});
    if(!items.length){list.appendChild(div('inv-empty',t('noItems')));return;}
    items.forEach(function(p){
      var st=invStatus(p,low);
      var sub=[span('',p.category+(hasSz(p)?' \xb7 '+p.sizes.map(function(s){return s.label;}).join(' / '):''))];
      if(p.needsCount)sub.push(span('badge bcount',t('setCounts')));
      var left=div('inv-l',[div('inv-nm',p.name),div('inv-sub',sub)]);
      var row;
      if(countMode){
        var sum=hasSz(p)?sizeSummary(p):String(p.stock);
        row=div('inv-row click',[left,div('inv-r inv-r-count',[span('inv-sum '+st,sum),icon('chev',16,'inv-chev')])]);
        row.onclick=function(){openCount(p);};
      }else{
        var stTxt=st==='no'?t('oos'):(st==='lo'?p.stock+' \xb7 '+t('lowTag'):String(p.stock));
        row=div('inv-row'+(isAdmin()?' click':''),[left,div('inv-r',[div('inv-pr',priceRange(p)),div('inv-st '+st,[span('dot '+st),txt(stTxt)])])]);
        if(isAdmin())row.onclick=function(){openItem(p);};
      }
      list.appendChild(row);
    });
  }
  refresh();
  wrap.appendChild(sc);return[wrap];
}
