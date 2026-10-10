(function(){
  var KEY='rezyume-v1';
  var blank=function(){return {name:'',title:'',email:'',phone:'',city:'',summary:'',skills:'',exp:[{}],edu:[{}]};};
  var S=blank();
  try{var raw=localStorage.getItem(KEY);if(raw){S=Object.assign(blank(),JSON.parse(raw));}}catch(e){}
  var $=function(id){return document.getElementById(id);};
  var esc=function(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});};
  var EXP=[['company','Kompaniya'],['role','Lavozim'],['from','Boshlanish'],['to','Tugash'],['desc','Nima qildingiz','t']];
  var EDU=[['school','O\'quv yurti'],['degree','Yo\'nalish'],['from','Boshlanish'],['to','Tugash']];

  function save(){try{localStorage.setItem(KEY,JSON.stringify(S));}catch(e){}}
  function listHTML(name,fields){
    return S[name].map(function(it,i){
      var h='<div class="item"><button class="ghost del" data-del="'+name+':'+i+'" aria-label="O\'chirish">O\'chirish</button>';
      for(var j=0;j<fields.length;j+=1){
        var f=fields[j];
        var half=(f[0]==='from'||f[0]==='to');
        if(f[0]==='from')h+='<div class="row">';
        h+='<div><label>'+f[1]+'</label>'+(f[2]?'<textarea':'<input')+' data-l="'+name+':'+i+':'+f[0]+'"'+(f[2]?'>'+esc(it[f[0]])+'</textarea>':' value="'+esc(it[f[0]])+'">')+'</div>';
        if(f[0]==='to')h+='</div>';
      }
      return h+'</div>';
    }).join('');
  }
  function lists(){$('exp').innerHTML=listHTML('exp',EXP);$('edu').innerHTML=listHTML('edu',EDU);}
  function dates(it){var a=[it.from,it.to].filter(Boolean);return a.length?esc(a.join(' — ')):'';}
  function paper(){
    var contact=[S.email,S.phone,S.city].filter(Boolean).map(esc).join(' &nbsp;|&nbsp; ');
    var h='<h2>'+(S.name?esc(S.name):'<span class="empty">Ism Familiya</span>')+'</h2>';
    h+='<div class="role">'+(S.title?esc(S.title):'<span class="empty">Lavozim</span>')+'</div>';
    h+='<div class="contact">'+(contact||'<span class="empty">Email | Telefon | Shahar</span>')+'</div>';
    if(S.summary)h+='<h3>Men haqimda</h3><p>'+esc(S.summary)+'</p>';
    var ex=S.exp.filter(function(x){return x.company||x.role||x.desc;});
    if(ex.length){h+='<h3>Ish tajribasi</h3>'+ex.map(function(x){return '<div class="e"><b>'+esc(x.role||x.company)+'</b>'+(x.role&&x.company?' — '+esc(x.company):'')+'<div class="d">'+dates(x)+'</div>'+(x.desc?'<p>'+esc(x.desc)+'</p>':'')+'</div>';}).join('');}
    var ed=S.edu.filter(function(x){return x.school||x.degree;});
    if(ed.length){h+='<h3>Ta\'lim</h3>'+ed.map(function(x){return '<div class="e"><b>'+esc(x.school||x.degree)+'</b>'+(x.school&&x.degree?' — '+esc(x.degree):'')+'<div class="d">'+dates(x)+'</div></div>';}).join('');}
    var sk=S.skills.split(',').map(function(s){return s.trim();}).filter(Boolean);
    if(sk.length)h+='<h3>Ko\'nikmalar</h3><div class="chips">'+sk.map(function(s){return '<span>'+esc(s)+'</span>';}).join('')+'</div>';
    $('paper').innerHTML=h;
  }
  function fillBasics(){document.querySelectorAll('[data-k]').forEach(function(el){el.value=S[el.dataset.k]||'';});}

  document.addEventListener('input',function(e){
    var t=e.target;
    if(t.dataset.k){S[t.dataset.k]=t.value;}
    else if(t.dataset.l){var p=t.dataset.l.split(':');S[p[0]][+p[1]][p[2]]=t.value;}
    else return;
    save();paper();
  });
  document.addEventListener('click',function(e){
    var d=e.target.dataset&&e.target.dataset.del;
    if(d){var p=d.split(':');S[p[0]].splice(+p[1],1);if(!S[p[0]].length)S[p[0]].push({});save();lists();paper();}
  });
  $('addExp').onclick=function(){S.exp.push({});save();lists();paper();};
  $('addEdu').onclick=function(){S.edu.push({});save();lists();paper();};
  function makePdf(){
    var btn=$('pdf');
    if(!window.html2pdf){window.print();return;}
    var wrap=document.createElement('div');
    wrap.style.cssText='position:fixed;left:-10000px;top:0;width:794px';
    var c=$('paper').cloneNode(true);
    c.style.cssText='width:794px;max-width:794px;min-height:1120px;box-shadow:none;margin:0';
    wrap.appendChild(c);document.body.appendChild(wrap);
    btn.disabled=true;btn.textContent='Tayyorlanmoqda...';
    var done=function(){document.body.removeChild(wrap);btn.disabled=false;btn.textContent='PDF yuklab olish';};
    html2pdf().set({margin:0,filename:((S.name||'rezyume').replace(/\s+/g,'_'))+'.pdf',image:{type:'jpeg',quality:0.98},
      html2canvas:{scale:2,useCORS:true,backgroundColor:'#ffffff'},jsPDF:{unit:'mm',format:'a4',orientation:'portrait'}})
      .from(c).save().then(done).catch(function(){done();window.print();});
  }
  $('pdf').onclick=makePdf;
  $('reset').onclick=function(){if(confirm('Barcha ma\'lumotlar o\'chiriladi. Davom etasizmi?')){S=blank();save();fillBasics();lists();paper();}};

  fillBasics();lists();paper();
})();