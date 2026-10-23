/*!
 * AkihiroLabs POS — js/export.js
 * Backup / restore (JSON), CSV export and PDF export.
 * https://github.com/AkihiroZayar/POS-SYTEM
 */
// ── Backup / Restore ────────────────────────────────────────
function doBackup(){
  var data={products:S.products,sales:S.sales,staff:S.staff,tabs:S.tabs,settings:CFG,exportedAt:new Date().toISOString()};
  var blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'});
  var a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='pos_backup_'+ymd()+'.json';a.click();setTimeout(function(){URL.revokeObjectURL(a.href);},1000);
}
async function doRestore(file){
  try{
    var text=await file.text();var data=JSON.parse(text);
    if(!data||typeof data!=='object'||!(data.products||data.sales||data.staff||data.settings)){alert(t('rsBad'));return;}
    if(!confirm(t('cfRestore')))return;
    if(data.products){for(var i=0;i<S.products.length;i++)await dbDel('products',S.products[i].id);for(var i=0;i<data.products.length;i++){var p=Object.assign({},data.products[i]);delete p.id;await dbAdd('products',p);}S.products=await dbAll('products');await migrateSizes();}
    if(data.sales){for(var i=0;i<S.sales.length;i++)await dbDel('sales',S.sales[i].id);for(var i=0;i<data.sales.length;i++){var s=Object.assign({},data.sales[i]);delete s.id;await dbAdd('sales',s);}S.sales=await dbAll('sales');}
    if(data.staff){for(var i=0;i<S.staff.length;i++)await dbDel('staff',S.staff[i].id);for(var i=0;i<data.staff.length;i++){var sf=Object.assign({},data.staff[i]);delete sf.id;await dbAdd('staff',sf);}S.staff=await dbAll('staff');}
    if(data.tabs){var curTabs=await dbAll('tabs');for(var i=0;i<curTabs.length;i++)await dbDel('tabs',curTabs[i].id);for(var i=0;i<data.tabs.length;i++){var tb=Object.assign({},data.tabs[i]);delete tb.id;await dbAdd('tabs',tb);}}
    if(data.settings){var st=Object.assign({},data.settings);delete st.id;CFG=Object.assign({},DEF_CFG,st);await saveCFG();}
    S.tabs=await dbAll('tabs');
    // Staff IDs/PINs may have changed: sign out so everyone logs in with the restored accounts.
    S.user=null;S.lstep='select';S.cart=[];S.cashReceived=0;S.tabMode=false;S.editingTab=null;S.modal=null;
    alert(t('rsOk'));render();
  }catch(e){alert(t('rsFail')+e.message);}
}

// ── CSV ─────────────────────────────────────────────────────
function doCSV(){
  var rows=[['ID','Date','Time','Staff','Tab','Product','Qty','Price','Line Total','Sale Total','Cash','Change','Refunded','Net']];
  fsales().forEach(function(s){var d=new Date(s.time);s.items.forEach(function(i,idx){rows.push(idx===0?[s.id,d.toLocaleDateString(),d.toLocaleTimeString(),s.staffName||'',s.tabName||'',i.name,i.qty,i.price,i.price*i.qty,s.total,s.cashReceived,s.change,saleRefunded(s),s.total-saleRefunded(s)]:['','','','','',i.name,i.qty,i.price,i.price*i.qty,'','','','','']);});});
  allRefunds().filter(function(r){return inRange(r.time);}).forEach(function(r){var d=new Date(r.time);r.items.forEach(function(i,idx){rows.push(['R'+r.saleId,d.toLocaleDateString(),d.toLocaleTimeString(),r.staffName||'','REFUND',i.name,-i.qty,i.price,-i.price*i.qty,'','','',idx===0?r.amount:'','']);});});
  var csv=rows.map(function(r){return r.map(function(v){return'"'+String(v).replace(/"/g,'""')+'"';}).join(',');}).join('\n');
  var a=document.createElement('a');a.href=URL.createObjectURL(new Blob(['\uFEFF'+csv],{type:'text/csv;charset=utf-8;'}));a.download='pos_report.csv';a.click();
}

// ── PDF ─────────────────────────────────────────────────────
async function doPDF(){
  var sales=fsales();var ts=todaySales();var period=S.from&&S.to?S.from+' \u2192 '+S.to:S.from?'From '+S.from:S.to?'To '+S.to:'All time';
  var pm={};sales.forEach(function(s){netItems(s).forEach(function(i){if(!pm[i.name])pm[i.name]={q:0,r:0};pm[i.name].q+=i.qty;pm[i.name].r+=i.price*i.qty;});});
  var ld=document.createElement('div');ld.className='pdf-loading';ld.innerHTML='<div class="pdf-spinner"></div><div class="pdf-loading-text">Generating PDF\u2026</div>';document.body.appendChild(ld);
  var wrap=document.createElement('div');
  wrap.style.cssText='position:fixed;top:-99999px;left:-99999px;width:794px;background:#fff;color:#1F2937;font-family:"Noto Sans Myanmar",-apple-system,sans-serif;font-size:13px;line-height:1.6;';
  var _g=sales.reduce(function(a,s){return a+s.total;},0),_r=periodRefundAmt();var mCards=[["Period Sales",ks(_g)],["Refunds",(_r?'\u2212':'')+ks(_r)],["Net Revenue",ks(_g-_r)],["Period Orders",sales.length]].map(function(m){return '<div style="background:#F7F8FA;border:1px solid #E5E7EB;border-radius:10px;padding:14px 16px;"><div style="font-size:10px;color:#888;text-transform:uppercase;margin-bottom:5px;">'+m[0]+'</div><div style="font-size:20px;font-weight:800;color:#1E3A8A;">'+m[1]+'</div></div>';}).join('');
  var pRows=Object.entries(pm).sort(function(a,b){return b[1].r-a[1].r;}).map(function(e,i){return '<tr style="background:'+(i%2?'#F9FAFB':'#fff')+'"><td style="padding:9px 14px;border-bottom:1px solid #eee;">'+esc(e[0])+'</td><td style="padding:9px 14px;text-align:center;border-bottom:1px solid #eee;">'+e[1].q+'</td><td style="padding:9px 14px;text-align:right;border-bottom:1px solid #eee;font-weight:700;color:#1E3A8A;">'+ks(e[1].r)+'</td></tr>';}).join('')||'<tr><td colspan="3" style="padding:16px;text-align:center;color:#aaa;">No sales</td></tr>';
  var sRows=[].concat(sales).reverse().map(function(s,i){var d=new Date(s.time);return '<tr style="background:'+(i%2?'#F9FAFB':'#fff')+'"><td style="padding:8px 10px;border-bottom:1px solid #eee;color:#888;">#'+s.id+'</td><td style="padding:8px 10px;border-bottom:1px solid #eee;">'+d.toLocaleDateString()+'<br><span style="color:#aaa">'+hm(d)+'</span></td><td style="padding:8px 10px;border-bottom:1px solid #eee;">'+esc(s.staffName||'')+(s.tabName?' ['+esc(s.tabName)+']':'')+'</td><td style="padding:8px 10px;border-bottom:1px solid #eee;">'+s.items.map(function(x){return esc(x.name)+' \xd7'+x.qty;}).join(', ')+'</td><td style="padding:8px 10px;text-align:right;font-weight:700;color:#1E3A8A;border-bottom:1px solid #eee;">'+ks(s.total-saleRefunded(s))+(saleRefunded(s)?'<br><span style="color:#B91C1C;font-weight:400;font-size:10px">refunded \u2212'+ks(saleRefunded(s))+'</span>':'')+'</td><td style="padding:8px 10px;text-align:right;border-bottom:1px solid #eee;">'+ks(s.cashReceived)+'</td><td style="padding:8px 10px;text-align:right;color:#15803D;font-weight:600;border-bottom:1px solid #eee;">'+ks(s.change||0)+'</td></tr>';}).join('')||'<tr><td colspan="7" style="padding:16px;text-align:center;color:#aaa;">No sales</td></tr>';
  wrap.innerHTML='<div style="padding:44px 50px;"><div style="display:flex;justify-content:space-between;margin-bottom:30px;padding-bottom:20px;border-bottom:3px solid #1E3A8A;"><div><div style="font-size:26px;font-weight:800;color:#1E3A8A;margin-bottom:4px;">'+esc(CFG.storeName||'POS')+' \u2014 Sales Report</div><div style="font-size:12px;color:#777;">Generated: '+new Date().toLocaleString()+'</div></div><div style="text-align:right;font-size:12px;color:#777;line-height:1.8;"><div><b>Period:</b> '+period+'</div>'+(S.user?'<div><b>By:</b> '+esc(S.user.name)+'</div>':'')+'</div></div><div style="display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin-bottom:30px;">'+mCards+'</div><div style="font-size:11px;font-weight:700;color:#888;text-transform:uppercase;margin-bottom:10px;padding-bottom:6px;border-bottom:2px solid #f0f0f0;">Product Breakdown</div><table style="width:100%;border-collapse:collapse;font-size:12px;margin-bottom:28px;"><thead><tr style="background:#1E3A8A;color:#fff;"><th style="padding:10px 14px;text-align:left;">Product</th><th style="padding:10px 14px;text-align:center;">Qty</th><th style="padding:10px 14px;text-align:right;">Revenue</th></tr></thead><tbody>'+pRows+'</tbody></table><div style="font-size:11px;font-weight:700;color:#888;text-transform:uppercase;margin-bottom:10px;padding-bottom:6px;border-bottom:2px solid #f0f0f0;">Sales Log</div><table style="width:100%;border-collapse:collapse;font-size:12px;"><thead><tr style="background:#1E3A8A;color:#fff;"><th style="padding:8px 10px;text-align:left;">#</th><th style="padding:8px 10px;text-align:left;">Date/Time</th><th style="padding:8px 10px;text-align:left;">Staff</th><th style="padding:8px 10px;text-align:left;">Items</th><th style="padding:8px 10px;text-align:right;">Total</th><th style="padding:8px 10px;text-align:right;">Received</th><th style="padding:8px 10px;text-align:right;">Change</th></tr></thead><tbody>'+sRows+'</tbody></table><div style="margin-top:28px;padding-top:14px;border-top:1px solid #eee;display:flex;justify-content:space-between;font-size:11px;color:#aaa;"><span>POS System \u2014 Developed by <b style="color:#1E3A8A">AkihiroLabs</b> \u00b7 v'+APP_VERSION+'</span><span>'+new Date().toLocaleDateString()+'</span></div></div>';
  document.body.appendChild(wrap);
  try{
    await document.fonts.ready;
    var canvas=await html2canvas(wrap,{scale:2,useCORS:true,backgroundColor:'#ffffff',logging:false});
    document.body.removeChild(wrap);document.body.removeChild(ld);
    var jsPDF=window.jspdf.jsPDF;var pdf=new jsPDF({orientation:'portrait',unit:'mm',format:'a4'});
    var pw=pdf.internal.pageSize.getWidth(),ph=pdf.internal.pageSize.getHeight();
    var imgH=(canvas.height/canvas.width)*pw;var imgData=canvas.toDataURL('image/jpeg',0.92);
    var hl=imgH,pos=0;pdf.addImage(imgData,'JPEG',0,pos,pw,imgH);hl-=ph;
    while(hl>0){pos-=ph;pdf.addPage();pdf.addImage(imgData,'JPEG',0,pos,pw,imgH);hl-=ph;}
    pdf.save('pos_report.pdf');
  }catch(err){
    if(document.body.contains(wrap))document.body.removeChild(wrap);
    if(document.body.contains(ld))document.body.removeChild(ld);
    alert('PDF failed: '+err.message);
  }
}
