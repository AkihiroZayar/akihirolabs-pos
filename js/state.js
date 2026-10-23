/*!
 * AkihiroLabs POS — js/state.js
 * App state, seed data, helpers, cart and customer tabs.
 * https://github.com/AkihiroZayar/POS-SYTEM
 */
// ── State ───────────────────────────────────────────────────
var S={busy:false,products:[],sales:[],staff:[],tabs:[],cart:[],search:'',cat:'All',cashReceived:0,user:null,lstep:'select',lstaff:null,lpin:'',view:'dash',modal:null,from:'',to:'',tabMode:false,editingTab:null};

// ── Seed ────────────────────────────────────────────────────
async function seed(){
  S.products=await dbAll('products');
  if(!S.products.length){
    var items=[
      {name:'Alpine Purified Water',price:500,stock:96,category:'Drinks',sizes:[],minStock:10},
      {name:'Aythaya Red Wine',price:30000,stock:15,category:'Drinks',sizes:[],minStock:3},
      {name:'Coca-Cola / Sprite',price:3200,stock:319,category:'Drinks',sizes:[],minStock:20},
      {name:'Geon-Bae Soju',price:7800,stock:47,category:'Drinks',sizes:[],minStock:5},
      {name:'Grand Royal Smooth',price:9000,stock:19,category:'Drinks',sizes:[{label:'L',price:9000},{label:'M',price:4800}],minStock:3},
      {name:'Heineken',price:6800,stock:10,category:'Drinks',sizes:[{label:'L',price:6800},{label:'M',price:5500}],minStock:5},
      {name:'Ice Cubes (ရေခဲ)',price:1000,stock:998,category:'Drinks',sizes:[],minStock:50},
      {name:'Mandalay Rum Red',price:7400,stock:49,category:'Drinks',sizes:[],minStock:5},
      {name:'Myanmar Beer (Large Bottle)',price:3600,stock:97,category:'Drinks',sizes:[{label:'S',price:3600},{label:'M',price:4800},{label:'L',price:6000}],minStock:10},
      {name:'Shark Energy Drink',price:3300,stock:296,category:'Drinks',sizes:[],minStock:20},
      {name:'Signature Whisky',price:12500,stock:99,category:'Drinks',sizes:[],minStock:5},
      {name:'Soda Water',price:1500,stock:78,category:'Drinks',sizes:[],minStock:10},
      {name:'Yoma Beer',price:3500,stock:4,category:'Drinks',sizes:[{label:'S',price:3500},{label:'M',price:4500},{label:'L',price:5800}],minStock:10},
      {name:'ကြက်ကင် (Grilled Chicken - Half)',price:7500,stock:0,category:'Bar Snacks',sizes:[],minStock:0},
      {name:'ကြက်ကင် (Grilled Chicken - Whole)',price:14000,stock:0,category:'Bar Snacks',sizes:[],minStock:0},
      {name:'ကြက်တောင်ပံကြော်',price:6000,stock:0,category:'Bar Snacks',sizes:[],minStock:0},
      {name:'ချဉ်စပ်ပုစွန်သုပ် (Spicy Shrimp Salad)',price:8000,stock:0,category:'Bar Snacks',sizes:[],minStock:0},
      {name:'ဖရုံစေ့ (Pumpkin Seeds)',price:1800,stock:20,category:'Bar Snacks',sizes:[],minStock:5},
      {name:'မြေပဲလှော်',price:500,stock:28,category:'Bar Snacks',sizes:[],minStock:5},
      {name:'အမဲခြောက်ဖုတ်',price:5000,stock:18,category:'Bar Snacks',sizes:[],minStock:3},
      {name:'အာလူးကြော်',price:800,stock:79,category:'Bar Snacks',sizes:[{label:'တိုးတိုး',price:800},{label:'လျှာကျွမ်းထိုး',price:500}],minStock:10},
    ];
    for(var i=0;i<items.length;i++)await dbAdd('products',items[i]);
    S.products=await dbAll('products');
  }
  S.staff=await dbAll('staff');
  if(!S.staff.length){
    await dbAdd('staff',{name:'Admin',role:'admin',pin:'1234',initials:'AD'});
    await dbAdd('staff',{name:'Cashier 1',role:'cashier',pin:'1111',initials:'C1'});
    S.staff=await dbAll('staff');
  }
  S.sales=await dbAll('sales');
  S.tabs=await dbAll('tabs');
}

// ── Helpers ─────────────────────────────────────────────────
function cats(){var a=['All'],seen={};S.products.forEach(function(p){if(!seen[p.category]){seen[p.category]=1;a.push(p.category);}});return a.sort(function(a,b){return a==='All'?-1:b==='All'?1:a.localeCompare(b);});}
function fprods(){return S.products.filter(function(p){return(S.cat==='All'||p.category===S.cat)&&p.name.toLowerCase().indexOf(S.search.toLowerCase())>=0;});}
function cartTotal(){return S.cart.reduce(function(a,i){return a+i.price*i.qty;},0);}
function fsales(){return S.sales.filter(function(s){var d=new Date(s.time);if(S.from){var f=parseYmd(S.from);if(d<f)return false;}if(S.to){var f2=parseYmd(S.to);f2.setHours(23,59,59,999);if(d>f2)return false;}return true;});}
function qAmts(total){if(total<=0)return[];var a=[];[1000,2000,5000,10000,20000,50000].forEach(function(u){var v=Math.ceil(total/u)*u;if(v>=total)a.push(v);});if(a.indexOf(total)<0)a.push(total);return a.filter(function(x){return x>=total;}).filter(function(x,i,arr){return arr.indexOf(x)===i;}).sort(function(a,b){return a-b;}).slice(0,3);}
function todaySales(){var td=new Date().toDateString();return S.sales.filter(function(s){return new Date(s.time).toDateString()===td;});}
function lowStk(){return S.products.filter(function(p){var m=p.minStock||0;return p.stock<=0||(m>0&&p.stock<=m);}).sort(function(a,b){return a.stock-b.stock;});}
function topProds(n){var pm={};todaySales().forEach(function(s){s.items.forEach(function(i){if(!pm[i.name])pm[i.name]={q:0,r:0};pm[i.name].q+=i.qty;pm[i.name].r+=i.price*i.qty;});});return Object.entries(pm).sort(function(a,b){return b[1].r-a[1].r;}).slice(0,n||5);}

// ── Cart ────────────────────────────────────────────────────
function tryAdd(p){if(p.sizes&&p.sizes.length>0){S.modal={type:'sizePick',product:p};render();return;}addToCart(p.name,effPrice(p,null),p.id);}
function cartQtyFor(prodId){return S.cart.reduce(function(a,i){return a+(i.prodId===prodId?i.qty:0);},0);}
function atStockLimit(prodId){var p=S.products.find(function(x){return x.id===prodId;});return !!p&&cartQtyFor(prodId)>=p.stock;}
function addToCart(name,price,prodId){var key=name+'__'+price;var ex=S.cart.find(function(i){return i.key===key;});if(atStockLimit(prodId)){S.modal=null;render();return;}if(ex)ex.qty++;else S.cart.push({key:key,name:name,price:price,prodId:prodId,qty:1});S.modal=null;render();}
function chqty(key,d){var i=S.cart.find(function(x){return x.key===key;});if(!i)return;if(d>0&&atStockLimit(i.prodId))return;i.qty+=d;if(i.qty<=0)S.cart=S.cart.filter(function(x){return x.key!==key;});render();}

async function checkout(){
  if(S.busy||!S.cart.length)return;
  var total=cartTotal();var change=S.cashReceived-total;if(change<0)return;
  S.busy=true;try{
  var sale={items:S.cart.map(function(i){return{name:i.name,price:i.price,qty:i.qty,prodId:i.prodId};}),total:total,cashReceived:S.cashReceived,change:change,method:'Cash',time:new Date().toISOString(),staffId:S.user?S.user.id:null,staffName:S.user?S.user.name:''};
  await dbAdd('sales',sale);
  var deduct={};S.cart.forEach(function(i){deduct[i.prodId]=(deduct[i.prodId]||0)+i.qty;});
  for(var id in deduct){var p=S.products.find(function(x){return x.id===parseInt(id);});if(p){p.stock=Math.max(0,p.stock-deduct[id]);await dbPut('products',p);}}
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
  var tab=Object.assign({},S.editingTab,{items:S.cart.map(function(i){return{name:i.name,price:i.price,qty:i.qty,prodId:i.prodId};}),total:cartTotal()});
  await dbPut('tabs',tab);S.tabs=await dbAll('tabs');
}
async function exitTabMode(){await persistTab();S.editingTab=null;S.tabMode=false;S.cart=[];S.cashReceived=0;}
async function saveTab(){
  if(!S.editingTab)return;
  await exitTabMode();S.view='tabs';render();
}
async function loadTab(tab){await exitTabMode();S.editingTab=Object.assign({},tab);S.cart=tab.items.map(function(i){return Object.assign({},i,{key:i.name+'__'+i.price});});S.cashReceived=0;S.tabMode=true;S.view='pos';render();}
async function chargeTab(){
  if(S.busy||!S.editingTab||!S.cart.length)return;
  var total=cartTotal();var change=S.cashReceived-total;if(change<0)return;
  S.busy=true;try{
  var sale={items:S.cart.map(function(i){return{name:i.name,price:i.price,qty:i.qty,prodId:i.prodId};}),total:total,cashReceived:S.cashReceived,change:change,method:'Cash',time:new Date().toISOString(),staffId:S.user?S.user.id:null,staffName:S.user?S.user.name:'',tabName:S.editingTab.name};
  await dbAdd('sales',sale);
  if(S.editingTab.id)await dbDel('tabs',S.editingTab.id);
  var deduct={};S.cart.forEach(function(i){deduct[i.prodId]=(deduct[i.prodId]||0)+i.qty;});
  for(var id in deduct){var p=S.products.find(function(x){return x.id===parseInt(id);});if(p){p.stock=Math.max(0,p.stock-deduct[id]);await dbPut('products',p);}}
  S.sales=await dbAll('sales');S.tabs=await dbAll('tabs');S.products=await dbAll('products');
  S.modal={type:'ok',sale:sale};S.cart=[];S.cashReceived=0;S.editingTab=null;S.tabMode=false;
  }finally{S.busy=false;}
  render();
}
async function delTab(tab){if(!confirm(t('cfDelTab',{n:tab.name})))return;await dbDel('tabs',tab.id);S.tabs=await dbAll('tabs');render();}
async function adjStock(id,delta){var p=S.products.find(function(x){return x.id===id;});if(!p)return;p.stock=Math.max(0,p.stock+delta);await dbPut('products',p);S.products=await dbAll('products');render();}
