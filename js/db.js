/*!
 * AkihiroLabs POS — js/db.js
 * IndexedDB wrapper, settings (CFG) and happy-hour pricing.
 * https://github.com/AkihiroZayar/POS-SYTEM
 */
// ── DB ─────────────────────────────────────────────────────
const DBN='pos_bar_v3',DBV=2; // v2 adds 'shifts'
let db;
function openDB(){
  return new Promise(function(res,rej){
    var r=indexedDB.open(DBN,DBV);
    r.onupgradeneeded=function(e){
      var d=e.target.result;
      ['products','sales','staff','tabs','settings','shifts'].forEach(function(s){
        if(!d.objectStoreNames.contains(s))d.createObjectStore(s,{keyPath:'id',autoIncrement:true});
      });
    };
    r.onsuccess=function(e){db=e.target.result;db.onversionchange=function(){db.close();location.reload();};res();};
    r.onblocked=function(){alert('Please close other tabs of this POS to finish updating, then reload.');};
    r.onerror=rej;
  });
}
function dbAll(s){return new Promise(function(r){db.transaction(s,'readonly').objectStore(s).getAll().onsuccess=function(e){r(e.target.result);};});}
function dbPut(s,v){return new Promise(function(r){db.transaction(s,'readwrite').objectStore(s).put(v).onsuccess=function(e){r(e.target.result);};});}
function dbDel(s,id){return new Promise(function(r){db.transaction(s,'readwrite').objectStore(s).delete(id).onsuccess=function(){r();};});}
function dbAdd(s,v){return new Promise(function(r){db.transaction(s,'readwrite').objectStore(s).add(v).onsuccess=function(e){r(e.target.result);};});}

// ── Settings ────────────────────────────────────────────────
var DEF_CFG={storeName:'',address:'',phone:'',happyHourOn:false,happyHourStart:'17:00',happyHourEnd:'23:00',happyHourDiscount:10,happyHourCats:['Drinks'],requireShift:true};
var CFG=JSON.parse(JSON.stringify(DEF_CFG));
async function loadCFG(){var a=await dbAll('settings');if(a.length){var d=a[0];delete d.id;CFG=Object.assign({},DEF_CFG,d);}}
async function saveCFG(){var a=await dbAll('settings');var obj=Object.assign({},CFG);if(a.length){obj.id=a[0].id;await dbPut('settings',obj);}else{await dbAdd('settings',obj);}}

// ── Happy hour ──────────────────────────────────────────────
function hhPct(){return Math.min(50,Math.max(0,Number(CFG.happyHourDiscount)||0));}
function isHH(){
  if(!CFG.happyHourOn||!hhPct())return false;
  var re=/^\d{1,2}:\d{2}$/;if(!re.test(CFG.happyHourStart||'')||!re.test(CFG.happyHourEnd||''))return false;
  var now=new Date();var h=now.getHours(),m=now.getMinutes();
  var sp=CFG.happyHourStart.split(':');var ep=CFG.happyHourEnd.split(':');
  var s=parseInt(sp[0])*60+parseInt(sp[1]);var e=parseInt(ep[0])*60+parseInt(ep[1]);
  var t=h*60+m;
  return s<=e?t>=s&&t<=e:t>=s||t<=e;
}
function effPrice(p,sz){
  var base=sz?sz.price:p.price;
  if(isHH()&&CFG.happyHourCats&&CFG.happyHourCats.indexOf(p.category)>=0){
    return Math.round(base*(1-hhPct()/100));
  }
  return base;
}
