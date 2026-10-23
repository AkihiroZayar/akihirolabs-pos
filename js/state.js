/*!
 * AkihiroLabs POS — js/state.js
 * App state, seed data, helpers, cart and customer tabs.
 * https://github.com/AkihiroZayar/POS-SYTEM
 */
// ── State ───────────────────────────────────────────────────
var S={busy:false,shifts:[],invQ:'',invCat:'All',invFilter:'all',products:[],sales:[],staff:[],tabs:[],cart:[],search:'',cat:'All',cashReceived:0,user:null,lstep:'select',lstaff:null,lpin:'',view:'dash',modal:null,from:'',to:'',tabMode:false,editingTab:null};

// ── Seed ────────────────────────────────────────────────────
async function seed(){
  S.products=await dbAll('products');
  if(!S.products.length){
    var items=[
      {name:'Alpine Purified Water',price:500,stock:96,category:'Drinks',sizes:[],minStock:10},
      {name:'Aythaya Red Wine',price:30000,stock:15,category:'Drinks',sizes:[],minStock:3},
      {name:'Coca-Cola / Sprite',price:3200,stock:319,category:'Drinks',sizes:[],minStock:20},
      {name:'Geon-Bae Soju',price:7800,stock:47,category:'Drinks',sizes:[],minStock:5},
      {name:'Grand Royal Smooth',price:9000,stock:19,category:'Drinks',sizes:[{label:'L',price:9000,stock:10,minStock:3},{label:'M',price:4800,stock:9,minStock:3}],minStock:3},
      {name:'Heineken',price:6800,stock:10,category:'Drinks',sizes:[{label:'L',price:6800,stock:5,minStock:3},{label:'M',price:5500,stock:5,minStock:3}],minStock:5},
      {name:'Ice Cubes (ရေခဲ)',price:1000,stock:998,category:'Drinks',sizes:[],minStock:50},
      {name:'Mandalay Rum Red',price:7400,stock:49,category:'Drinks',sizes:[],minStock:5},
      {name:'Myanmar Beer (Large Bottle)',price:3600,stock:97,category:'Drinks',sizes:[{label:'S',price:3600,stock:40,minStock:5},{label:'M',price:4800,stock:30,minStock:5},{label:'L',price:6000,stock:27,minStock:5}],minStock:10},
      {name:'Shark Energy Drink',price:3300,stock:296,category:'Drinks',sizes:[],minStock:20},
      {name:'Signature Whisky',price:12500,stock:99,category:'Drinks',sizes:[],minStock:5},
      {name:'Soda Water',price:1500,stock:78,category:'Drinks',sizes:[],minStock:10},
      {name:'Yoma Beer',price:3500,stock:4,category:'Drinks',sizes:[{label:'S',price:3500,stock:2,minStock:3},{label:'M',price:4500,stock:1,minStock:3},{label:'L',price:5800,stock:1,minStock:3}],minStock:10},
      {name:'ကြက်ကင် (Grilled Chicken - Half)',price:7500,stock:0,category:'Bar Snacks',sizes:[],minStock:0},
      {name:'ကြက်ကင် (Grilled Chicken - Whole)',price:14000,stock:0,category:'Bar Snacks',sizes:[],minStock:0},
      {name:'ကြက်တောင်ပံကြော်',price:6000,stock:0,category:'Bar Snacks',sizes:[],minStock:0},
      {name:'ချဉ်စပ်ပုစွန်သုပ် (Spicy Shrimp Salad)',price:8000,stock:0,category:'Bar Snacks',sizes:[],minStock:0},
      {name:'ဖရုံစေ့ (Pumpkin Seeds)',price:1800,stock:20,category:'Bar Snacks',sizes:[],minStock:5},
      {name:'မြေပဲလှော်',price:500,stock:28,category:'Bar Snacks',sizes:[],minStock:5},
      {name:'အမဲခြောက်ဖုတ်',price:5000,stock:18,category:'Bar Snacks',sizes:[],minStock:3},
      {name:'အာလူးကြော်',price:800,stock:79,category:'Bar Snacks',sizes:[{label:'တိုးတိုး',price:800,stock:40,minStock:5},{label:'လျှာကျွမ်းထိုး',price:500,stock:39,minStock:5}],minStock:10},
    ];
    for(var i=0;i<items.length;i++)await dbAdd('products',items[i]);
    S.products=await dbAll('products');
  }
  await migrateSizes();
  S.staff=await dbAll('staff');
  if(!S.staff.length){
    await dbAdd('staff',{name:'Admin',role:'admin',pin:'1234',initials:'AD'});
    await dbAdd('staff',{name:'Cashier 1',role:'cashier',pin:'1111',initials:'C1'});
    S.staff=await dbAll('staff');
  }
  S.sales=await dbAll('sales');
  S.tabs=await dbAll('tabs');
  S.shifts=await dbAll('shifts');
}

// ── Sizes (variants) ────────────────────────────────────────
// Like real POS variants: every size has its own price, stock and low-stock alert.
// For a product with sizes, p.stock is always the total of its sizes.
function hasSz(p){return !!(p&&p.sizes&&p.sizes.length);}
function findSz(p,label){return hasSz(p)?p.sizes.find(function(s){return s.label===label;}):null;}
function syncStock(p){if(hasSz(p))p.stock=p.sizes.reduce(function(a,s){return a+(Number(s.stock)||0);},0);return p;}
// Old data: sizes had no stock of their own. Start each size at 0 and flag the product for a stock count.
async function migrateSizes(){
  for(var i=0;i<S.products.length;i++){var p=S.products[i];if(!hasSz(p))continue;
    if(p.sizes.some(function(s){return s.stock==null;})){
      p.sizes.forEach(function(s){if(s.stock==null)s.stock=0;if(s.minStock==null)s.minStock=p.minStock||0;});
      syncStock(p);p.needsCount=true;await dbPut('products',p);}
  }
  S.products=await dbAll('products');
}
// Size label from an old cart/sale line like "Yoma Beer (S)"
function sizeFromName(p,name){if(!hasSz(p))return null;var m=/\(([^()]*)\)\s*$/.exec(name||'');return m&&findSz(p,m[1])?m[1]:null;}

// ── Helpers ─────────────────────────────────────────────────
function cats(){var a=['All'],seen={};S.products.forEach(function(p){if(!seen[p.category]){seen[p.category]=1;a.push(p.category);}});return a.sort(function(a,b){return a==='All'?-1:b==='All'?1:a.localeCompare(b);});}
function fprods(){return S.products.filter(function(p){return(S.cat==='All'||p.category===S.cat)&&p.name.toLowerCase().indexOf(S.search.toLowerCase())>=0;});}
function cartTotal(){return S.cart.reduce(function(a,i){return a+i.price*i.qty;},0);}
function inRange(time){var d=new Date(time);if(S.from){var f=parseYmd(S.from);if(d<f)return false;}if(S.to){var f2=parseYmd(S.to);f2.setHours(23,59,59,999);if(d>f2)return false;}return true;}
function fsales(){return S.sales.filter(function(s){return inRange(s.time);});}
function isToday(time){return new Date(time).toDateString()===new Date().toDateString();}
function qAmts(total){if(total<=0)return[];var a=[];[1000,2000,5000,10000,20000,50000].forEach(function(u){var v=Math.ceil(total/u)*u;if(v>=total)a.push(v);});if(a.indexOf(total)<0)a.push(total);return a.filter(function(x){return x>=total;}).filter(function(x,i,arr){return arr.indexOf(x)===i;}).sort(function(a,b){return a-b;}).slice(0,3);}
function todaySales(){var td=new Date().toDateString();return S.sales.filter(function(s){return new Date(s.time).toDateString()===td;});}
// Low-stock list. Products with sizes are checked size by size: [{name, stock, prod, size}]
function lowStk(){var out=[];S.products.forEach(function(p){
  if(hasSz(p)){p.sizes.forEach(function(s){var m=s.minStock||0,st=Number(s.stock)||0;if(st<=0||(m>0&&st<=m))out.push({name:p.name+' ('+s.label+')',stock:st,prod:p,size:s.label});});}
  else{var m=p.minStock||0;if(p.stock<=0||(m>0&&p.stock<=m))out.push({name:p.name,stock:p.stock,prod:p,size:null});}
});return out.sort(function(a,b){return a.stock-b.stock;});}
function topProds(n){var pm={};todaySales().forEach(function(s){netItems(s).forEach(function(i){if(!pm[i.name])pm[i.name]={q:0,r:0};pm[i.name].q+=i.qty;pm[i.name].r+=i.price*i.qty;});});return Object.entries(pm).sort(function(a,b){return b[1].r-a[1].r;}).slice(0,n||5);}

// ── Refunds ─────────────────────────────────────────────────
// A refund is stored on its sale: sale.refunds=[{time,staffName,items:[{idx,name,price,qty,prodId,size}],amount,restock}]
// Reports count a refund on the day it was given (like a real POS).
function lineRefunded(s,idx){return (s.refunds||[]).reduce(function(a,r){return a+r.items.reduce(function(b,x){return b+(x.idx===idx?x.qty:0);},0);},0);}
function saleRefunded(s){return (s.refunds||[]).reduce(function(a,r){return a+(r.amount||0);},0);}
function netItems(s){return s.items.map(function(i,idx){return Object.assign({},i,{qty:i.qty-lineRefunded(s,idx)});}).filter(function(i){return i.qty>0;});}
function allRefunds(){var out=[];S.sales.forEach(function(s){(s.refunds||[]).forEach(function(r){out.push(Object.assign({saleId:s.id},r));});});return out;}
function sumRefunds(list){return list.reduce(function(a,r){return a+(r.amount||0);},0);}
function todayRefundAmt(){return sumRefunds(allRefunds().filter(function(r){return isToday(r.time);}));}
function periodRefundAmt(){return sumRefunds(allRefunds().filter(function(r){return inRange(r.time);}));}
async function returnStock(items){
  var touched={};
  items.forEach(function(i){var p=S.products.find(function(x){return x.id===i.prodId;});if(!p)return;
    var size=i.size||sizeFromName(p,i.name);var sz=size!=null?findSz(p,size):null;
    if(sz){sz.stock=(Number(sz.stock)||0)+i.qty;syncStock(p);}else if(!hasSz(p)){p.stock=(Number(p.stock)||0)+i.qty;}
    touched[p.id]=p;});
  for(var id in touched)await dbPut('products',touched[id]);
}
async function refundSale(saleId,lines,restock){
  if(S.busy||!isAdmin())return false;
  var s=S.sales.find(function(x){return x.id===saleId;});if(!s)return false;
  var items=[];
  lines.forEach(function(l){var it=s.items[l.idx];if(!it)return;var q=Math.min(l.qty,it.qty-lineRefunded(s,l.idx));if(q>0)items.push({idx:l.idx,name:it.name,price:it.price,qty:q,prodId:it.prodId,size:it.size||null});});
  if(!items.length)return false;
  S.busy=true;
  try{
    var amount=items.reduce(function(a,i){return a+i.price*i.qty;},0);
    s.refunds=(s.refunds||[]).concat([{time:new Date().toISOString(),staffId:S.user?S.user.id:null,staffName:S.user?S.user.name:'',items:items,amount:amount,restock:!!restock,shiftId:curShiftId()}]);
    await dbPut('sales',s);
    if(restock)await returnStock(items);
    S.sales=await dbAll('sales');S.products=await dbAll('products');
  }finally{S.busy=false;}
  return true;
}

// ── Shifts (cash drawer) ────────────────────────────────────
// One open shift per device (it belongs to the drawer, not to a cashier). All payments are cash, so
// expected cash = starting cash + cash sales in the shift − refunds paid during the shift.
function openShiftRec(){return (S.shifts||[]).find(function(x){return x.status==='open';})||null;}
function curShiftId(){var o=openShiftRec();return o?o.id:null;}
function shiftNeeded(){return CFG.requireShift!==false&&!openShiftRec();}
function shiftStats(sh){
  var sales=S.sales.filter(function(s){return s.shiftId===sh.id;});
  var cashSales=sales.reduce(function(a,s){return a+s.total;},0);
  var cashRefunds=sumRefunds(allRefunds().filter(function(r){return r.shiftId===sh.id;}));
  var expected=(sh.openingCash||0)+cashSales-cashRefunds;
  return{orders:sales.length,cashSales:cashSales,cashRefunds:cashRefunds,expected:expected};
}
async function startShift(amount){
  if(openShiftRec())return;
  await dbAdd('shifts',{status:'open',openedAt:new Date().toISOString(),openedBy:S.user?S.user.name:'',openingCash:Math.max(0,parseInt(amount)||0)});
  S.shifts=await dbAll('shifts');
}
async function endShift(counted,note){
  var sh=openShiftRec();if(!sh)return null;
  var st=shiftStats(sh);
  var done=Object.assign({},sh,st,{status:'closed',closedAt:new Date().toISOString(),closedBy:S.user?S.user.name:'',countedCash:Math.max(0,parseInt(counted)||0),note:note||''});
  done.difference=done.countedCash-done.expected;
  await dbPut('shifts',done);S.shifts=await dbAll('shifts');
  return S.shifts.find(function(x){return x.id===done.id;});
}

// ── Cart ────────────────────────────────────────────────────
// Take sold items out of stock. Sized items come out of their own size only.
async function deductStock(items){
  var touched={};
  items.forEach(function(i){var p=S.products.find(function(x){return x.id===i.prodId;});if(!p)return;
    var size=i.size||sizeFromName(p,i.name);var sz=size!=null?findSz(p,size):null;
    if(sz){sz.stock=Math.max(0,(Number(sz.stock)||0)-i.qty);syncStock(p);}else if(!hasSz(p)){p.stock=Math.max(0,p.stock-i.qty);}
    touched[p.id]=p;});
  for(var id in touched)await dbPut('products',touched[id]);
}
function tryAdd(p){if(hasSz(p)){S.modal={type:'sizePick',product:p};render();return;}addToCart(p.name,effPrice(p,null),p.id,null);}
function cartQtyFor(prodId,size){return S.cart.reduce(function(a,i){return a+(i.prodId===prodId&&(size==null||i.size===size)?i.qty:0);},0);}
function atStockLimit(prodId,size){var p=S.products.find(function(x){return x.id===prodId;});if(!p)return false;
  if(size!=null){var sz=findSz(p,size);return !sz||cartQtyFor(prodId,size)>=(Number(sz.stock)||0);}
  return cartQtyFor(prodId)>=p.stock;}
function addToCart(name,price,prodId,size){var key=name+'__'+price;var ex=S.cart.find(function(i){return i.key===key;});if(atStockLimit(prodId,size)){S.modal=null;render();return;}if(ex)ex.qty++;else S.cart.push({key:key,name:name,price:price,prodId:prodId,size:size||null,qty:1});S.modal=null;render();}
function chqty(key,d){var i=S.cart.find(function(x){return x.key===key;});if(!i)return;if(d>0&&atStockLimit(i.prodId,i.size))return;i.qty+=d;if(i.qty<=0)S.cart=S.cart.filter(function(x){return x.key!==key;});render();}

async function checkout(){
  if(S.busy||!S.cart.length)return;
  var total=cartTotal();var change=S.cashReceived-total;if(change<0)return;
  S.busy=true;try{
  var sale={items:S.cart.map(function(i){return{name:i.name,price:i.price,qty:i.qty,prodId:i.prodId,size:i.size||null};}),total:total,cashReceived:S.cashReceived,change:change,method:'Cash',time:new Date().toISOString(),staffId:S.user?S.user.id:null,staffName:S.user?S.user.name:'',shiftId:curShiftId()};
  await dbAdd('sales',sale);
  await deductStock(S.cart);
  S.sales=await dbAll('sales');S.products=await dbAll('products');S.modal={type:'ok',sale:sale};S.cart=[];S.cashReceived=0;
  }finally{S.busy=false;}
  render();
}

// ── Tabs ────────────────────────────────────────────────────
async function openNewTab(name){
  var tab={name:name||'Guest',items:[],createdAt:new Date().toISOString(),status:'open',total:0};
  var id=await dbAdd('tabs',tab);tab.id=id;
  S.tabs=await dbAll('tabs');S.editingTab=tab;S.cart=[];S.cashReceived=0;S.tabMode=true;S.view='pos';render();
}
// Write the tab being edited back to the DB (used by Save Tab, and when leaving POS / logging out so nothing is lost).
async function persistTab(){
  if(!S.tabMode||!S.editingTab)return;
  var tab=Object.assign({},S.editingTab,{items:S.cart.map(function(i){return{name:i.name,price:i.price,qty:i.qty,prodId:i.prodId,size:i.size||null};}),total:cartTotal()});
  await dbPut('tabs',tab);S.tabs=await dbAll('tabs');
}
async function exitTabMode(){await persistTab();S.editingTab=null;S.tabMode=false;S.cart=[];S.cashReceived=0;}
async function saveTab(){
  if(!S.editingTab)return;
  await exitTabMode();S.view='tabs';render();
}
async function loadTab(tab){await exitTabMode();S.editingTab=Object.assign({},tab);S.cart=tab.items.map(function(i){var p=S.products.find(function(x){return x.id===i.prodId;});return Object.assign({},i,{key:i.name+'__'+i.price,size:i.size||sizeFromName(p,i.name)});});S.cashReceived=0;S.tabMode=true;S.view='pos';render();}
async function chargeTab(){
  if(S.busy||!S.editingTab||!S.cart.length)return;
  var total=cartTotal();var change=S.cashReceived-total;if(change<0)return;
  S.busy=true;try{
  var sale={items:S.cart.map(function(i){return{name:i.name,price:i.price,qty:i.qty,prodId:i.prodId,size:i.size||null};}),total:total,cashReceived:S.cashReceived,change:change,method:'Cash',time:new Date().toISOString(),staffId:S.user?S.user.id:null,staffName:S.user?S.user.name:'',tabName:S.editingTab.name,shiftId:curShiftId()};
  await dbAdd('sales',sale);
  if(S.editingTab.id)await dbDel('tabs',S.editingTab.id);
  await deductStock(S.cart);
  S.sales=await dbAll('sales');S.tabs=await dbAll('tabs');S.products=await dbAll('products');
  S.modal={type:'ok',sale:sale};S.cart=[];S.cashReceived=0;S.editingTab=null;S.tabMode=false;
  }finally{S.busy=false;}
  render();
}
async function delTab(tab){if(!confirm(t('cfDelTab',{n:tab.name})))return;await dbDel('tabs',tab.id);S.tabs=await dbAll('tabs');render();}
