'use strict';
const SB_URL='https://biyksknrwuwxnciiaeqa.supabase.co';
const SB_KEY='sb_publishable__CdHDA8msHTV7dznSlARNg_HYtE2Tkx';
const sb=supabase.createClient(SB_URL,SB_KEY);
const ICON='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMAAAADACAIAAADdvvtQAAAEN0lEQVR4nO3dMXLjNgCGUWxmU6+bvUvqNDlDLrHu1mdw6VPkDNukzl3SuE+TQjOaHVumKP0gSADvlRp7RACfQVoW5U9fvn8rcK9f9j4A+iYgIgIiIiAiAiIiICICIiIgIgIiIiAiAiIiICICIiIgIgIiIiAiAiIiICICIiIgIgIiIiAiAiIiICICIvJ57wO42evzy/sHH54e2x9JboCxdLYDXZzxhcePbIyx9BTQ8sz2Ne/DjKWbgNbMaS/zPtJYugmIYxIQEQERERARAREREBEBEREQEQERERARARFp+naOX3//bYCnaCYZy39//1PxSBbYgYgIiIiAiAiIiICICIiIgIgIiEg3AX398VeVrzmCkcbSTUDl2pz2MuMnw4ylp4DKxzPb0YyfjTGW/m5t7mt+lw0wls52II5GQEQERERARAREREBEBEREQEQERERARAREREBEBEREQEQERERARAREREBEmr6l9d8//mz5dDN78PEudEFARAREREBEBEREQEQERERARAREREBEBEREQEQEtIOHp8e9D6EaAbV2qmeYhgTU1M/dPDw9DpCRgNq5mEvvDQlof103JKBGlivptyEBtbCmj04viQS0uZuy6K4hAW3r1iBen182OpKNCGhDw9dTBLSdGeopAtpId5cydxPQIXS6/RQBbWGSk9eJgCqbqp4ioLpmq6cIqKIJ6ykCqmXOeoqAqpi2niKg3Dwv+VwkoNZG2n6KgEIzn7xOBHQ/9ZSRAmp8LaKek0ECanyvjHrORgjozb0yLZ9ujYHrKQME9H45N21IPW90H9BFGzU0+Us+F/Ud0MKKHmGxh99+StcBXU2k7o0yTl4X9RrQ+uWs0pB6PtJlQLcuZ9iQehZ0GdAdK3R3Q+pZ1mVApVVD6rmq14DK9g2pZ42OAypbNnSEVwG60HdApe31UN3DGEP3AZVSXp9fbl2/up/WM209ZYyATmo1pJ6bjBNQqdGQem41VEAla0g9d2j6X5vbeH1+afChYOo5GW0HOtl6ddVzNmZAxRq3MmxAZbOGpPmzkQMqGyy2et4YPKBSdcnV8974AZVKC6+ei6YIqMTLr56PzBJQuetPZudvrH4ww5gooJNba1DPsukCKpqoasaAyuqGpHbVpAGVFXGoZ415AyqLiahnpakDKpdCufuXtTkN+HaOW8klMfsOREhARAREREBEBESkaUDuF26j5TzbgYgIiEjrgJzFttZ4hu1ARHYIyCa0nfZzu88OpKEt7DKru53CNFTXXvO55zWQhmrZcSZ3vojWUG7fOfz05fu3HZ/+zJty7nCEH7+jBHSmpKuO0M3Z4QKiL15IJCIgIgIiIiAiAiIiICICIiIgIgIiIiAiAiIiICICIiIgIgIiIiAiAiIiICICIiIgIgIiIiAiAiIiICICIiIgIgIiIiAiAiIiICICIiIgIv8DYHgnt9MLFdkAAAAASUVORK5CYII=';
const S={profile:null,courses:[],tab:null};
const ST={present:'حاضر',late:'متأخر',absent:'غائب',excused:'بعذر'};
const ROLE={admin:'مدير',teacher:'دكتور',student:'طالب'};
const DAYN=['الأحد','الاثنين','الثلاثاء','الأربعاء','الخميس','الجمعة','السبت'];
const $=(s,r=document)=>r.querySelector(s);

function h(tag,attrs,...kids){
  const e=document.createElement(tag);
  for(const [k,v] of Object.entries(attrs||{})){
    if(v==null||v===false)continue;
    if(k==='class')e.className=v;
    else if(k[0]==='.')e[k.slice(1)]=v;
    else if(k.startsWith('on'))e.addEventListener(k.slice(2),v);
    else e.setAttribute(k,v===true?'':v);
  }
  for(const c of kids.flat(Infinity)){if(c==null||c===false)continue;e.append(c.nodeType?c:document.createTextNode(String(c)));}
  return e;
}
function toast(m){const t=$('#toast');t.textContent=m;t.hidden=false;clearTimeout(toast.t);toast.t=setTimeout(()=>t.hidden=true,2600);}
const today=()=>new Date().toLocaleDateString('en-CA',{timeZone:'Africa/Cairo'});
const dowOf=d=>new Date(d+'T00:00:00Z').getUTCDay();
const fmtD=d=>{const [y,m,dd]=d.split('-');return `${dd}/${m}`;};
function beep(ok){try{const a=new (window.AudioContext||window.webkitAudioContext)();const o=a.createOscillator(),g=a.createGain();o.connect(g);g.connect(a.destination);o.frequency.value=ok?880:220;g.gain.value=.15;o.start();o.stop(a.currentTime+(ok?.12:.35));}catch(e){}if(navigator.vibrate)navigator.vibrate(ok?40:[80,60,80]);}
async function fetchAll(build){let out=[],from=0;for(;;){const {data,error}=await build().range(from,from+999);if(error)throw error;out=out.concat(data);if(data.length<1000)break;from+=1000;}return out;}
const chunk=(a,n)=>{const r=[];for(let i=0;i<a.length;i+=n)r.push(a.slice(i,i+n));return r;};


/* ---------- helpers: qr + camera ---------- */
function loadScript(src){return new Promise((ok,no)=>{const s=document.createElement('script');s.src=src;s.onload=ok;s.onerror=no;document.head.append(s);});}
async function loadQR(){if(!window.qrcode)await loadScript('https://cdn.jsdelivr.net/npm/qrcode-generator@1.4.4/qrcode.js');}
function makeQR(text,cell){const q=qrcode(0,'M');q.addData(text);q.make();return q.createSvgTag(cell||6,8);}
async function loadXLSX(){if(!window.XLSX)await loadScript('https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js');}
async function startCam(box,onCode){
  const last={c:'',t:0};
  const fire=v=>{const n=Date.now();if(v===last.c&&n-last.t<3000)return;last.c=v;last.t=n;onCode(v);};
  if('BarcodeDetector' in window){
    const video=h('video',{class:'video',playsinline:true,muted:true,autoplay:true});
    const stream=await navigator.mediaDevices.getUserMedia({video:{facingMode:'environment'}});
    video.srcObject=stream;await video.play();box.replaceChildren(video);
    const det=new BarcodeDetector();
    const iv=setInterval(async()=>{try{const r=await det.detect(video);if(r[0])fire(r[0].rawValue);}catch(e){}},300);
    return {stop(){clearInterval(iv);stream.getTracks().forEach(t=>t.stop());box.replaceChildren();}};
  }
  if(!window.Html5Qrcode)await loadScript('https://unpkg.com/html5-qrcode@2.3.8/html5-qrcode.min.js');
  const id='rd'+Math.floor(Math.random()*1e6);
  box.replaceChildren(h('div',{id,style:'margin-top:10px'}));
  const q=new Html5Qrcode(id);
  await q.start({facingMode:'environment'},{fps:10,qrbox:{width:240,height:240}},fire);
  return {stop(){q.stop().catch(()=>{});box.replaceChildren();}};
}

/* ---------- boot ---------- */
async function loadProfile(){
  const {data:{session}}=await sb.auth.getSession();
  if(!session){S.profile=null;return;}
  const {data}=await sb.from('profiles').select('*').eq('id',session.user.id).maybeSingle();
  S.profile=data;
  const {data:cs}=await sb.from('courses').select('*').order('name');
  S.courses=cs||[];
}
async function boot(){
  await loadProfile();render();
  sb.auth.onAuthStateChange(async ev=>{if(ev==='SIGNED_OUT'){S.profile=null;S.courses=[];render();}});
  if('serviceWorker' in navigator)navigator.serviceWorker.register('sw.js').catch(()=>{});
}
function render(){
  const app=$('#app');app.replaceChildren();
  if(!S.profile){app.append(loginView());return;}
  const tabs=S.profile.role==='student'?[['mine','حضوري'],['checkin','تسجيل حضور'],['card','كارتي']]:
    S.profile.role==='teacher'?[['scan','تسجيل الحضور'],['review','مراجعة'],['reports','التقارير']]:
    [['scan','تسجيل الحضور'],['review','مراجعة'],['reports','التقارير'],['manage','الإدارة']];
  if(!tabs.find(t=>t[0]===S.tab))S.tab=tabs[0][0];
  const main=h('main');
  app.append(
    h('header',{class:'top'},h('div',{class:'who'},h('b',{},S.profile.full_name),h('span',{},ROLE[S.profile.role])),
      h('button',{onclick:()=>sb.auth.signOut()},'خروج')),
    h('nav',{class:'tabs'},tabs.map(([k,l])=>h('button',{class:k===S.tab?'on':'',onclick:()=>{S.tab=k;render();}},l))),
    main);
  ({scan:scanView,review:reviewView,reports:reportsView,manage:manageView,mine:mineView,card:cardView,checkin:checkinView})[S.tab](main);
}

/* ---------- login ---------- */
function loginView(){
  let mode='in';
  const wrap=h('div',{class:'login'});
  const draw=()=>{
    const err=h('div',{class:'err',hidden:true});
    const em=h('input',{type:'email',autocomplete:'username',dir:'ltr',required:true});
    const pw=h('input',{type:'password',autocomplete:mode==='in'?'current-password':'new-password',dir:'ltr',required:true,minlength:mode==='in'?null:6});
    const code=h('input',{dir:'ltr',autocomplete:'off',required:true});
    const btn=h('button',{class:'btn block',type:'submit'},mode==='in'?'دخول':'تفعيل الحساب');
    const f=h('form',{onsubmit:async e=>{
      e.preventDefault();err.hidden=true;btn.disabled=true;
      if(mode==='in'){
        const {error}=await sb.auth.signInWithPassword({email:em.value.trim(),password:pw.value});
        btn.disabled=false;
        if(error){err.textContent='البريد أو كلمة المرور غير صحيحة';err.hidden=false;return;}
      }else{
        const {data,error}=await sb.auth.signUp({email:em.value.trim(),password:pw.value,options:{data:{invite:code.value.trim()}}});
        btn.disabled=false;
        if(error||!data.session){err.textContent=error&&/already/i.test(error.message)?'هذا البريد مفعّل بالفعل، سجّل الدخول':'البيانات غير مطابقة للسجل أو الحساب مفعّل. راجع الإدارة.';err.hidden=false;return;}
      }
      await loadProfile();render();
    }},h('label',{},'البريد الإلكتروني'),em,
      mode==='in'?null:[h('label',{},'كود التفعيل (رقمك الجامعي أو الكود الذي أعطاك إياه المدير)'),code],
      h('label',{},mode==='in'?'كلمة المرور':'اختر كلمة مرور (٦ أحرف على الأقل)'),pw,err,btn);
    wrap.replaceChildren(h('img',{class:'logo',src:ICON,alt:''}),h('h1',{},'نظام الحضور'),
      h('p',{class:'sub'},mode==='in'?'سجّل الدخول للمتابعة':'تفعيل حساب جديد'),f,
      h('p',{style:'text-align:center;margin-top:18px'},h('a',{href:'#',style:'color:var(--p);font-weight:700',onclick:e=>{e.preventDefault();mode=mode==='in'?'up':'in';draw();}},mode==='in'?'أول مرة؟ فعّل حسابك':'لديّ حساب، تسجيل الدخول')));
  };
  draw();return wrap;
}

/* ---------- sessions helper ---------- */
async function ensureSession(courseId,date){
  let {data}=await sb.from('sessions').select('*').eq('course_id',courseId).eq('session_date',date).maybeSingle();
  if(data)return data;
  const c=S.courses.find(x=>x.id===courseId);
  const r=await sb.from('sessions').insert({course_id:courseId,session_date:date,is_off_day:!c.days.includes(dowOf(date))}).select().single();
  if(r.error)throw r.error;return r.data;
}

/* ---------- scan view ---------- */
function scanView(root){
  const courses=S.courses.filter(c=>c.active);
  if(!courses.length){root.append(h('div',{class:'card empty'},'لا توجد مواد مسجّلة لك.'));return;}
  let courseId=localStorage.getItem('course');
  if(!courses.find(c=>c.id===courseId))courseId=courses[0].id;
  let date=today(),cam=null,lastCode='',lastAt=0;
  const sel=h('select',{onchange:e=>{courseId=e.target.value;localStorage.setItem('course',courseId);feed.replaceChildren();loadRoster();code.focus();}},
    courses.map(c=>h('option',{value:c.id},c.name+(c.code?` (${c.code})`:''))));
  sel.value=courseId;
  const dIn=h('input',{type:'date','.value':date,onchange:e=>{date=e.target.value||today();loadRoster();}});
  const info=h('div',{class:'muted'});
  const code=h('input',{class:'scan-input',dir:'ltr',placeholder:'امسح الكارت أو اكتب الكود',autocomplete:'off',autocapitalize:'off',enterkeyhint:'done',
    onkeydown:e=>{if(e.key==='Enter'){e.preventDefault();submit(code.value);code.value='';}}});
  const feed=h('div',{class:'feed'});
  const camBox=h('div');
  const roster=h('div',{class:'roster'});
  const sum=h('b');

  async function submit(c){
    c=(c||'').trim();if(!c)return;
    const {data,error}=await sb.rpc('record_scan',{p_course:courseId,p_code:c,p_date:date});
    let cls='bad',msg='';
    if(error){msg='خطأ في الاتصال';}
    else if(data.ok){
      if(data.duplicate){cls='warn';msg=`${data.name} · مسجّل بالفعل`;}
      else if(data.off_day){cls='warn';msg=`${data.name} · يوم غير مجدول، للمراجعة`;}
      else{cls='ok';msg=`${data.name} · تم تسجيل الحضور`;}
    }else if(data.error==='unknown_card')msg='كارت غير معروف: '+c;
    else if(data.error==='not_enrolled')msg=`${data.name} · غير مسجّل في هذه المادة`;
    else msg='غير مسموح';
    beep(cls==='ok');
    feed.prepend(h('div',{class:'item '+cls},h('span',{},msg),h('small',{},new Date().toLocaleTimeString('ar-EG',{hour:'2-digit',minute:'2-digit'}))));
    while(feed.children.length>8)feed.lastChild.remove();
    loadRoster();code.focus();
  }

  async function loadRoster(){
    const c=courses.find(x=>x.id===courseId);
    info.textContent=`أيام المحاضرات: ${c.days.map(d=>DAYN[d]).join('، ')}`+(c.days.includes(dowOf(date))?'':' · التاريخ المختار خارج الأيام المجدولة (يُسجَّل للمراجعة)');
    const {data:enr}=await sb.from('enrollments').select('student_id').eq('course_id',courseId);
    const ids=(enr||[]).map(e=>e.student_id);
    let pr=[];if(ids.length){const r=await sb.from('profiles').select('id,full_name,student_no').in('id',ids).order('full_name');pr=r.data||[];}
    const {data:ses}=await sb.from('sessions').select('id').eq('course_id',courseId).eq('session_date',date).maybeSingle();
    let att={};if(ses){const r=await sb.from('attendance').select('student_id,status,reviewed').eq('session_id',ses.id);(r.data||[]).forEach(a=>att[a.student_id]=a);}
    const here=Object.values(att).filter(a=>a.status==='present'||a.status==='late').length;
    sum.textContent=`حضر ${here} من ${pr.length}`;
    roster.replaceChildren(...pr.map(p=>{
      const a=att[p.id];
      return h('div',{class:'r'},h('div',{class:'nm'},p.full_name,h('small',{},p.student_no||'')),
        h('div',{class:'mini'},Object.keys(ST).map(k=>h('button',{class:(a&&a.status===k?'on ':'')+k,title:ST[k],onclick:()=>mark(p.id,k)},ST[k][0]==='ب'?'ع':ST[k][0]))));
    }));
    if(!pr.length)roster.append(h('div',{class:'empty'},'لا يوجد طلاب في هذه المادة'));
  }
  async function mark(sid,status){
    try{const s=await ensureSession(courseId,date);
      const r=await sb.from('attendance').upsert({session_id:s.id,student_id:sid,status,method:'manual',recorded_by:S.profile.id,reviewed:!s.is_off_day},{onConflict:'session_id,student_id'});
      if(r.error)throw r.error;loadRoster();}catch(e){toast('تعذّر الحفظ');}
  }

  async function toggleCam(){
    if(cam){cam.stop();cam=null;camBox.replaceChildren();return;}
    try{cam=await startCam(camBox,submit);}catch(e){camBox.replaceChildren(h('div',{class:'err'},'تعذّر تشغيل الكاميرا. تأكد من السماح بالكاميرا للموقع.'));cam=null;}
  }
  async function toggleCamOld(){
    const onCode=v=>{const n=Date.now();if(v===lastCode&&n-lastAt<3000)return;lastCode=v;lastAt=n;submit(v);};
    try{
      if('BarcodeDetector' in window){
        const video=h('video',{class:'video',playsinline:true,muted:true,autoplay:true});
        const stream=await navigator.mediaDevices.getUserMedia({video:{facingMode:'environment'}});
        video.srcObject=stream;await video.play();camBox.replaceChildren(video);
        const det=new BarcodeDetector();
        const iv=setInterval(async()=>{try{const r=await det.detect(video);if(r[0])onCode(r[0].rawValue);}catch(e){}},300);
        cam={stop(){clearInterval(iv);stream.getTracks().forEach(t=>t.stop());}};
      }else{
        if(!window.Html5Qrcode)await new Promise((ok,no)=>{const s=document.createElement('script');s.src='https://unpkg.com/html5-qrcode@2.3.8/html5-qrcode.min.js';s.onload=ok;s.onerror=no;document.head.append(s);});
        camBox.replaceChildren(h('div',{id:'rd',style:'margin-top:10px'}));
        const q=new Html5Qrcode('rd');
        await q.start({facingMode:'environment'},{fps:10,qrbox:{width:240,height:160}},onCode);
        cam={stop(){q.stop().catch(()=>{});}};
      }
    }catch(e){camBox.replaceChildren(h('div',{class:'err'},'تعذّر تشغيل الكاميرا. تأكد من السماح بالكاميرا للموقع.'));cam=null;}
  }

  const liveBox=h('div');
  async function openLive(){
    try{await loadQR();}catch(e){toast('تعذّر تحميل مكتبة الـQR');return;}
    const {data,error}=await sb.rpc('open_live',{p_course:courseId,p_date:date});
    if(error||!data||!data.ok){toast('تعذّر فتح الجلسة');return;}
    let tok=data.token;const sid=data.session;
    const qr=h('div',{class:'qrbig'}),cnt=h('b',{},'0');
    const draw=()=>{qr.innerHTML=makeQR(`ATT|${sid}|${tok}`,6);};draw();
    const wrap=h('div',{class:'livebox'},
      h('div',{class:'muted',style:'text-align:center'},'اعرض هذا الكود على الداتا شو. يتغيّر كل ١٠ ثوانٍ. الطلاب يفتحون التطبيق ثم «تسجيل حضور» ويمسحونه.'+(data.off_day?' (يوم غير مجدول: يُسجَّل للمراجعة)':'')),
      qr,h('div',{style:'text-align:center;font-size:18px;margin:8px 0'},'عدد الحاضرين: ',cnt),
      h('div',{class:'row'},h('button',{class:'btn sec',onclick:()=>{(qr.requestFullscreen||qr.webkitRequestFullscreen||(()=>{})).call(qr);}},'ملء الشاشة'),
        h('button',{class:'btn bad',onclick:async()=>{stop();await sb.rpc('close_live',{p_session:sid});liveBox.replaceChildren();toast('تم إنهاء الجلسة');loadRoster();}},'إنهاء الجلسة')));
    liveBox.replaceChildren(wrap);
    const count=async()=>{const r=await sb.from('attendance').select('id',{count:'exact',head:true}).eq('session_id',sid).in('status',['present','late']);if(r.count!=null)cnt.textContent=r.count;loadRoster();};
    const t1=setInterval(async()=>{if(!document.body.contains(qr)){stop();return;}const {data:t}=await sb.rpc('rotate_token',{p_session:sid});if(t){tok=t;draw();}},10000);
    const t2=setInterval(count,5000);
    function stop(){clearInterval(t1);clearInterval(t2);}
    count();
  }
  root.append(
    h('div',{class:'card'},h('h2',{},'١. اختر المادة'),h('div',{class:'row'},sel,dIn),info),
    h('div',{class:'card'},h('h2',{},'تسجيل جماعي بالـQR'),h('p',{class:'muted'},'افتح جلسة واعرض الكود، والطلاب يمسحونه بكاميرا موبايلاتهم.'),
      h('button',{class:'btn block',style:'margin-top:0',onclick:openLive},'فتح الجلسة وعرض الكود'),liveBox),
    h('div',{class:'card'},h('h2',{},'٢. أو امسح كروت الطلاب'),
      h('div',{class:'scanbox'},code,h('button',{class:'btn',onclick:()=>{submit(code.value);code.value='';}},'تسجيل'),h('button',{class:'btn sec',onclick:toggleCam},'📷')),
      h('div',{class:'muted',style:'margin-top:6px'},'قارئ الباركود USB يكتب الكود ويضغط Enter تلقائياً. أو استخدم الكاميرا.'),
      camBox,feed),
    h('div',{class:'card'},h('h2',{},'كشف اليوم ',sum),roster));
  loadRoster();setTimeout(()=>code.focus(),100);
  const obs=new MutationObserver(()=>{if(!document.body.contains(root)){if(cam)cam.stop();obs.disconnect();}});
  obs.observe(document.body,{childList:true,subtree:true});
}

/* ---------- review view (off-day attendance) ---------- */
async function reviewView(root){
  const box=h('div',{class:'card'},h('h2',{},'حضور في أيام غير مجدولة'),h('p',{class:'muted'},'هذه التسجيلات تمّت في يوم ليس من أيام المحاضرة. وافق أو ارفض.'));
  root.append(box);
  const {data:att,error}=await sb.from('attendance').select('id,student_id,status,sessions!inner(session_date,is_off_day,course_id)').eq('reviewed',false).order('recorded_at');
  if(error){box.append(h('div',{class:'err'},'تعذّر التحميل'));return;}
  if(!att.length){box.append(h('div',{class:'empty'},'لا توجد تسجيلات للمراجعة ✓'));return;}
  const ids=[...new Set(att.map(a=>a.student_id))];
  const {data:pr}=await sb.from('profiles').select('id,full_name,student_no').in('id',ids);
  const pm=Object.fromEntries((pr||[]).map(p=>[p.id,p]));
  const cm=Object.fromEntries(S.courses.map(c=>[c.id,c]));
  const act=async(list,ok)=>{
    const idl=list.map(a=>a.id);
    const r=ok?await sb.from('attendance').update({reviewed:true}).in('id',idl):await sb.from('attendance').delete().in('id',idl);
    if(r.error)toast('تعذّر التنفيذ');else{toast(ok?'تمت الموافقة':'تم الرفض');S.tab='review';render();}
  };
  box.append(h('div',{class:'row noprint',style:'margin-bottom:8px'},
    h('button',{class:'btn',onclick:()=>act(att,true)},`موافقة على الكل (${att.length})`)));
  const t=h('table',{},h('tr',{},h('th',{},'الطالب'),h('th',{},'المادة'),h('th',{},'التاريخ'),h('th',{},'')),
    att.map(a=>h('tr',{},h('td',{},(pm[a.student_id]||{}).full_name||'—'),h('td',{},(cm[a.sessions.course_id]||{}).name||''),h('td',{},fmtD(a.sessions.session_date)),
      h('td',{},h('div',{class:'acts'},h('button',{class:'btn sm',onclick:()=>act([a],true)},'موافقة'),h('button',{class:'btn sm bad',onclick:()=>act([a],false)},'رفض'))))));
  box.append(h('div',{class:'scroll'},t));
}

/* ---------- reports ---------- */
async function buildReport(courseId,from,to){
  const sessions=await fetchAll(()=>sb.from('sessions').select('id,session_date,is_off_day').eq('course_id',courseId).gte('session_date',from).lte('session_date',to).order('session_date'));
  const reg=sessions.filter(s=>!s.is_off_day);
  const {data:enr}=await sb.from('enrollments').select('student_id').eq('course_id',courseId);
  const ids=(enr||[]).map(e=>e.student_id);
  let pr=[];if(ids.length){const r=await sb.from('profiles').select('id,full_name,student_no').in('id',ids).order('full_name');pr=r.data||[];}
  let att=[];
  for(const part of chunk(reg.map(s=>s.id),80))att=att.concat(await fetchAll(()=>sb.from('attendance').select('session_id,student_id,status').in('session_id',part)));
  const map={};att.forEach(a=>{(map[a.student_id]??={})[a.session_id]=a.status;});
  const rows=pr.map(p=>{
    const m=map[p.id]||{};let pre=0,late=0,exc=0;
    reg.forEach(s=>{const v=m[s.id];if(v==='present')pre++;else if(v==='late')late++;else if(v==='excused')exc++;});
    const abs=reg.length-pre-late-exc;
    return {p,m,pre,late,exc,abs,pct:reg.length?Math.round((pre+late)*100/reg.length):0};
  });
  return {reg,rows};
}
function reportsView(root){
  const courses=S.courses;
  if(!courses.length){root.append(h('div',{class:'card empty'},'لا توجد مواد.'));return;}
  const yr=c=>{const y=parseInt(c.academic_year)||new Date().getFullYear();return [`${y}-09-01`,`${y+1}-08-31`];};
  let c0=courses.find(c=>c.id===localStorage.getItem('course'))||courses[0];
  const sel=h('select',{},courses.map(c=>h('option',{value:c.id},c.name+(c.code?` (${c.code})`:''))));sel.value=c0.id;
  const [f0,t0]=yr(c0);
  const from=h('input',{type:'date','.value':f0}),to=h('input',{type:'date','.value':t0});
  const det=h('input',{type:'checkbox',style:'width:auto;min-height:0'});
  const out=h('div',{id:'report'});
  let last=null;
  sel.onchange=()=>{const c=courses.find(x=>x.id===sel.value);const [a,b]=yr(c);from.value=a;to.value=b;run();};
  async function run(){
    out.replaceChildren(h('div',{class:'empty'},'جارٍ الحساب…'));
    const c=courses.find(x=>x.id===sel.value);
    const r=await buildReport(c.id,from.value,to.value);last={c,r};
    const avg=r.rows.length?Math.round(r.rows.reduce((s,x)=>s+x.pct,0)/r.rows.length):0;
    const head=[h('h2',{},`تقرير الحضور: ${c.name}`),h('div',{class:'muted'},`\u2066${from.value}\u2069 إلى \u2066${to.value}\u2069 · العام الدراسي ${c.academic_year} · عدد المحاضرات ${r.reg.length}`),
      h('div',{class:'kpi'},h('div',{},h('b',{},r.rows.length),'طالب'),h('div',{},h('b',{},r.reg.length),'محاضرة'),h('div',{},h('b',{},avg+'%'),'متوسط الحضور'))];
    const sumT=h('table',{},h('tr',{},['الطالب','الرقم','حاضر','متأخر','بعذر','غائب','النسبة'].map(x=>h('th',{},x))),
      r.rows.map(x=>h('tr',{},h('td',{},x.p.full_name),h('td',{},x.p.student_no||''),h('td',{},x.pre),h('td',{},x.late),h('td',{},x.exc),h('td',{},x.abs),h('td',{style:x.pct<75?'color:#dc2626;font-weight:700':''},x.pct+'%'))));
    const kids=[...head,h('div',{class:'scroll'},sumT)];
    if(det.checked){
      const sym={present:'ح',late:'م',excused:'ع',absent:'غ'};
      kids.push(h('h2',{style:'margin-top:18px'},'التفصيل بالتاريخ'),h('div',{class:'scroll'},h('table',{},
        h('tr',{},h('th',{},'الطالب'),r.reg.map(s=>h('th',{},fmtD(s.session_date)))),
        r.rows.map(x=>h('tr',{},h('td',{},x.p.full_name),r.reg.map(s=>h('td',{},sym[x.m[s.id]]||'غ')))))));
    }
    out.replaceChildren(...kids);
  }
  function csv(){
    if(!last)return;const {c,r}=last;
    const lines=[['الطالب','الرقم','حاضر','متأخر','بعذر','غائب','النسبة']].concat(r.rows.map(x=>[x.p.full_name,x.p.student_no||'',x.pre,x.late,x.exc,x.abs,x.pct+'%']));
    const blob=new Blob(['\ufeff'+lines.map(l=>l.map(v=>`"${String(v).replace(/"/g,'""')}"`).join(',')).join('\n')],{type:'text/csv'});
    const a=h('a',{href:URL.createObjectURL(blob),download:`attendance-${c.code||'course'}.csv`});document.body.append(a);a.click();a.remove();
  }
  root.append(h('div',{class:'card noprint'},h('h2',{},'التقارير'),
    h('label',{},'المادة'),sel,
    h('div',{class:'row'},h('div',{},h('label',{},'من'),from),h('div',{},h('label',{},'إلى'),to)),
    h('label',{style:'display:flex;gap:8px;align-items:center'},det,'إظهار التفصيل بالتاريخ'),
    h('div',{class:'row',style:'margin-top:12px'},
      h('button',{class:'btn',onclick:run},'عرض التقرير'),
      h('button',{class:'btn sec',onclick:()=>{const [a,b]=yr(courses.find(x=>x.id===sel.value));from.value=a;to.value=b;run();}},'تقرير نهاية العام'),
      h('button',{class:'btn sec',onclick:async()=>{await run();window.print();}},'طباعة / PDF'),
      h('button',{class:'btn sec',onclick:async()=>{await run();csv();}},'تصدير Excel (CSV)'))),
    h('div',{class:'card'},out));
  run();
}

/* ---------- student view ---------- */
async function mineView(root){
  if(!S.courses.length){root.append(h('div',{class:'card empty'},'لست مسجلاً في أي مادة بعد.'));return;}
  for(const c of S.courses){
    const card=h('div',{class:'card'},h('h2',{},c.name),h('div',{class:'muted'},'جارٍ التحميل…'));root.append(card);
    (async()=>{
      const ses=await fetchAll(()=>sb.from('sessions').select('id,session_date,is_off_day').eq('course_id',c.id).order('session_date',{ascending:false}));
      const {data:att}=await sb.from('attendance').select('session_id,status,reviewed').eq('student_id',S.profile.id).in('session_id',ses.length?ses.map(s=>s.id).slice(0,300):['00000000-0000-0000-0000-000000000000']);
      const am=Object.fromEntries((att||[]).filter(a=>a.reviewed).map(a=>[a.session_id,a]));
      const reg=ses.filter(s=>!s.is_off_day);
      let pre=0,late=0,exc=0;reg.forEach(s=>{const v=(am[s.id]||{}).status;if(v==='present')pre++;else if(v==='late')late++;else if(v==='excused')exc++;});
      const abs=reg.length-pre-late-exc,pct=reg.length?Math.round((pre+late)*100/reg.length):0;
      card.replaceChildren(h('h2',{},c.name,' ',h('span',{class:'muted'},c.code||'')),
        h('div',{class:'bar'},h('i',{class:pct<75?'low':'',style:`width:${pct}%`})),
        h('div',{class:'kpi'},h('div',{},h('b',{},pct+'%'),'نسبة الحضور'),h('div',{},h('b',{},pre+late),'حضور'),h('div',{},h('b',{},abs),'غياب'),h('div',{},h('b',{},reg.length),'محاضرات')),
        h('div',{class:'chips'},ses.filter(s=>am[s.id]||!s.is_off_day).slice(0,24).map(s=>{
          const st=(am[s.id]||{}).status||'absent';
          return h('span',{class:'chip '+st,title:ST[st]},fmtD(s.session_date)+' '+ST[st]);})));
    })();
  }
}

/* ---------- student card + live check-in ---------- */
async function cardView(root){
  const p=S.profile;
  try{await loadQR();}catch(e){root.append(h('div',{class:'err'},'تعذّر تحميل مكتبة الـQR، تأكد من الاتصال.'));return;}
  const code=p.card_code||('S'+(p.student_no||''));
  const svg=makeQR(code,6);
  const row=(k,v)=>h('div',{class:'kv'},h('span',{},k),h('b',{},v||'—'));
  root.append(h('div',{class:'card idcard'},
    h('div',{class:'idh'},'بطاقة الحضور'),
    h('h2',{style:'text-align:center;margin:12px 0 6px'},p.full_name),
    row('الرقم',p.student_no),row('السكشن',p.section),row('الجروب',p.grp),
    h('div',{class:'qrwrap','.innerHTML':svg}),
    h('div',{class:'muted',style:'text-align:center;direction:ltr'},code),
    h('div',{class:'row noprint',style:'margin-top:12px'},
      h('button',{class:'btn',onclick:()=>dlCard(p,code,svg)},'تنزيل الكارت كصورة'),
      h('button',{class:'btn sec',onclick:()=>window.print()},'طباعة'))));
}
function dlCard(p,code,svg){
  const W=600,H=880,c=document.createElement('canvas');c.width=W;c.height=H;const x=c.getContext('2d');
  x.fillStyle='#fff';x.fillRect(0,0,W,H);x.fillStyle='#0f766e';x.fillRect(0,0,W,120);
  x.fillStyle='#fff';x.textAlign='center';x.direction='rtl';x.font='bold 42px sans-serif';x.fillText('بطاقة الحضور',W/2,76);
  x.fillStyle='#111';x.font='bold 38px sans-serif';x.fillText(p.full_name,W/2,200);
  x.fillStyle='#444';x.font='28px sans-serif';
  x.fillText('الرقم: '+(p.student_no||'-'),W/2,256);x.fillText('السكشن: '+(p.section||'-')+'     الجروب: '+(p.grp||'-'),W/2,302);
  const img=new Image();
  img.onload=()=>{x.drawImage(img,100,340,400,400);x.direction='ltr';x.fillStyle='#111';x.font='26px monospace';x.fillText(code,W/2,790);
    c.toBlob(b=>{const l=h('a',{href:URL.createObjectURL(b),download:`card-${p.student_no||'student'}.png`});document.body.append(l);l.click();l.remove();});};
  img.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(svg);
}
function checkinView(root){
  let cam=null;
  const box=h('div'),res=h('div');
  async function onCode(v){
    const m=/^ATT\|([0-9a-f-]{36})\|([0-9a-f]+)$/.exec((v||'').trim());
    if(!m){res.replaceChildren(h('div',{class:'item bad'},'هذا ليس كود حضور الجلسة'));return;}
    const {data,error}=await sb.rpc('student_checkin',{p_session:m[1],p_token:m[2]});
    let cls='bad',msg='تعذّر الاتصال';
    if(!error&&data){
      if(data.ok){cls=data.duplicate?'warn':'ok';msg=data.duplicate?`أنت مسجّل بالفعل في ${data.course}`:`تم تسجيل حضورك في ${data.course}`+(data.off_day?' (للمراجعة)':'');}
      else msg=({closed:'الجلسة مغلقة',bad_token:'الكود انتهى، امسح الكود الظاهر الآن',not_enrolled:'أنت غير مسجّل في هذه المادة',not_student:'للطلاب فقط'})[data.error]||'تعذّر التسجيل';
    }
    beep(cls==='ok');
    res.replaceChildren(h('div',{class:'item '+cls},h('span',{},msg)));
    if(cls!=='bad'&&cam){cam.stop();cam=null;}
  }
  root.append(h('div',{class:'card'},h('h2',{},'تسجيل الحضور'),
    h('p',{class:'muted'},'اضغط «فتح الكاميرا» ووجّهها إلى الكود الظاهر على شاشة الدكتور.'),
    h('button',{class:'btn block',style:'margin-top:0',onclick:async()=>{
      if(cam){cam.stop();cam=null;return;}
      res.replaceChildren();
      try{cam=await startCam(box,onCode);}catch(e){box.replaceChildren(h('div',{class:'err'},'تعذّر تشغيل الكاميرا. اسمح للموقع باستخدام الكاميرا.'));}
    }},'📷 فتح الكاميرا'),box,res));
  const obs=new MutationObserver(()=>{if(!document.body.contains(root)){if(cam)cam.stop();obs.disconnect();}});
  obs.observe(document.body,{childList:true,subtree:true});
}

/* ---------- admin manage ---------- */
const HDR={student_no:['id','student id','student_id','student_no','studentno','رقم','الرقم','كود','ايدي','الايدي','الأيدي','الرقم الجامعي','رقم الطالب','رقم الجلوس','id number'],
  full_name:['name','full name','full_name','student name','الاسم','اسم','اسم الطالب','الاسم بالكامل'],
  email:['email','e-mail','mail','الايميل','الإيميل','ايميل','البريد','البريد الالكتروني','البريد الإلكتروني'],
  section:['section','سيكشن','سكشن','السيكشن','السكشن','الشعبة','شعبة'],
  grp:['group','grp','جروب','الجروب','مجموعة','المجموعة'],
  course:['course','courses','course code','المادة','المواد','كورس','الكورس','الكورسات','كود المادة']};
function mapRows(rows){
  if(!rows.length)return [];
  const norm=s=>String(s??'').trim().toLowerCase();
  const first=rows[0].map(norm);const idx={};
  for(const [k,names] of Object.entries(HDR)){const i=first.findIndex(x=>names.includes(x));if(i>=0)idx[k]=i;}
  let body=rows.slice(1);
  if(idx.student_no==null||idx.full_name==null){ // no header: id,name,email,section,group,course
    ['student_no','full_name','email','section','grp','course'].forEach((k,i)=>idx[k]=i);body=rows;}
  const g=(r,k)=>idx[k]==null?'':String(r[idx[k]]??'').trim();
  return body.map(r=>({student_no:g(r,'student_no'),full_name:g(r,'full_name'),email:g(r,'email').toLowerCase(),section:g(r,'section'),grp:g(r,'grp'),course:g(r,'course')})).filter(x=>x.student_no&&x.full_name);
}
async function manageView(root){
  const profs=await fetchAll(()=>sb.from('profiles').select('*').order('full_name'));
  const {data:ctr}=await sb.from('course_teachers').select('*');
  const teachers=profs.filter(p=>p.role==='teacher'||p.role==='admin'),students=profs.filter(p=>p.role==='student');
  const reload=()=>{S.tab='manage';loadProfile().then(render);};
  const rnd6=()=>String(Math.floor(100000+Math.random()*900000));

  // add course
  const nm=h('input',{placeholder:'اسم المادة'}),cd=h('input',{placeholder:'الكود (مثال ANA101)',dir:'ltr'}),yrIn=h('input',{'.value':'2026-2027',dir:'ltr'});
  const tchk=teachers.map(t=>({t,i:h('input',{type:'checkbox',style:'width:auto;min-height:0'})}));
  const dchk=DAYN.map((d,i)=>h('input',{type:'checkbox',value:i,style:'width:auto;min-height:0'}));
  root.append(h('div',{class:'card'},h('h2',{},'إضافة مادة'),
    h('div',{class:'row'},nm,cd,yrIn),
    h('label',{},'الدكاترة (يمكن اختيار أكثر من دكتور)'),h('div',{class:'days'},tchk.map(x=>h('label',{},x.i,x.t.full_name))),
    h('label',{},'أيام المحاضرات'),h('div',{class:'days'},DAYN.map((d,i)=>h('label',{},dchk[i],d))),
    h('button',{class:'btn block',onclick:async()=>{
      const days=dchk.filter(x=>x.checked).map(x=>+x.value),tids=tchk.filter(x=>x.i.checked).map(x=>x.t.id);
      if(!nm.value.trim()||!days.length){toast('اكتب الاسم واختر الأيام');return;}
      const r=await sb.from('courses').insert({name:nm.value.trim(),code:cd.value.trim()||null,teacher_id:tids[0]||null,academic_year:yrIn.value.trim(),days}).select().single();
      if(r.error){toast('تعذّر الحفظ');return;}
      if(tids.length)await sb.from('course_teachers').insert(tids.map(t=>({course_id:r.data.id,teacher_id:t})));
      toast('تمت الإضافة');reload();
    }},'حفظ المادة')));

  // courses list: teachers + enrolment
  const list=h('div');
  root.append(h('div',{class:'card'},h('h2',{},'المواد والدكاترة والتسجيل'),list));
  for(const c of S.courses){
    const mine=new Set((ctr||[]).filter(x=>x.course_id===c.id).map(x=>x.teacher_id));
    const names=teachers.filter(t=>mine.has(t.id)).map(t=>t.full_name).join('، ');
    const det=h('details',{style:'border-top:1px solid var(--bd);padding:8px 0'},h('summary',{style:'cursor:pointer;font-weight:700'},`${c.name} `,h('span',{class:'muted'},`${c.code||''} · ${names||'بدون دكتور'} · ${c.days.map(d=>DAYN[d]).join('،')}`)));
    det.addEventListener('toggle',async()=>{
      if(!det.open||det.dataset.l)return;det.dataset.l=1;
      const tb=teachers.map(t=>({t,i:h('input',{type:'checkbox','.checked':mine.has(t.id),style:'width:auto;min-height:0'})}));
      det.append(h('div',{style:'margin-top:8px'},h('b',{},'دكاترة المادة'),h('div',{class:'days'},tb.map(x=>h('label',{},x.i,x.t.full_name))),
        h('button',{class:'btn sm',style:'margin-top:8px',onclick:async()=>{
          const add=tb.filter(x=>x.i.checked&&!mine.has(x.t.id)).map(x=>({course_id:c.id,teacher_id:x.t.id}));
          const del=tb.filter(x=>!x.i.checked&&mine.has(x.t.id)).map(x=>x.t.id);
          if(add.length)await sb.from('course_teachers').insert(add);
          if(del.length)await sb.from('course_teachers').delete().eq('course_id',c.id).in('teacher_id',del);
          toast('تم حفظ الدكاترة');}},'حفظ الدكاترة')));
      const {data:en}=await sb.from('enrollments').select('student_id').eq('course_id',c.id);
      const have=new Set((en||[]).map(e=>e.student_id));
      const secs=[...new Set(students.map(s=>s.section).filter(Boolean))].sort(),grps=[...new Set(students.map(s=>s.grp).filter(Boolean))].sort();
      const fs=h('select',{},h('option',{value:''},'كل السكاشن'),secs.map(x=>h('option',{value:x},'سكشن '+x))),fg=h('select',{},h('option',{value:''},'كل الجروبات'),grps.map(x=>h('option',{value:x},'جروب '+x)));
      const boxes=students.map(s=>({s,i:h('input',{type:'checkbox','.checked':have.has(s.id),style:'width:auto;min-height:0'})}));
      const rowsEl=boxes.map(b=>({b,e:h('label',{style:'display:flex;gap:8px;align-items:center;font-weight:500;margin:6px 0'},b.i,b.s.full_name,h('span',{class:'muted'},[b.s.student_no,b.s.section&&'س'+b.s.section,b.s.grp&&'ج'+b.s.grp].filter(Boolean).join(' · ')))}));
      const vis=r=>(!fs.value||r.b.s.section===fs.value)&&(!fg.value||r.b.s.grp===fg.value);
      const apply=()=>rowsEl.forEach(r=>r.e.style.display=vis(r)?'flex':'none');fs.onchange=apply;fg.onchange=apply;
      det.append(h('div',{style:'margin-top:12px'},h('b',{},'تسجيل الطلاب'),h('div',{class:'row',style:'margin:6px 0'},fs,fg,
          h('button',{class:'btn sm sec',onclick:()=>rowsEl.filter(vis).forEach(r=>r.b.i.checked=true)},'تحديد الظاهرين'),
          h('button',{class:'btn sm sec',onclick:()=>rowsEl.filter(vis).forEach(r=>r.b.i.checked=false)},'إلغاء تحديد الظاهرين')),
        h('div',{style:'max-height:320px;overflow:auto'},rowsEl.map(r=>r.e)),
        h('button',{class:'btn sm',style:'margin-top:8px',onclick:async()=>{
          const add=boxes.filter(b=>b.i.checked&&!have.has(b.s.id)).map(b=>({course_id:c.id,student_id:b.s.id}));
          const del=boxes.filter(b=>!b.i.checked&&have.has(b.s.id)).map(b=>b.s.id);
          for(const part of chunk(add,300)){const r=await sb.from('enrollments').insert(part);if(r.error){toast('تعذّر الحفظ');return;}}
          for(const part of chunk(del,100))await sb.from('enrollments').delete().eq('course_id',c.id).in('student_id',part);
          boxes.forEach(b=>{if(b.i.checked)have.add(b.s.id);else have.delete(b.s.id);});
          toast('تم حفظ التسجيل');}},'حفظ التسجيل')));
    });
    list.append(det);
  }
  if(!S.courses.length)list.append(h('div',{class:'empty'},'لا توجد مواد'));

  // add teacher (pre-registered, activates himself)
  const tn=h('input',{placeholder:'اسم الدكتور'}),te=h('input',{type:'email',placeholder:'البريد الإلكتروني',dir:'ltr'});
  const tmsg=h('div',{class:'muted',style:'margin-top:8px'});
  const tlist=h('table',{},h('tr',{},['الدكتور','البريد','الحالة'].map(x=>h('th',{},x))),
    teachers.filter(t=>t.role==='teacher').map(t=>h('tr',{},h('td',{},t.full_name),h('td',{dir:'ltr'},t.email||''),h('td',{},t.claimed?'مفعّل':'كود التفعيل: '+(t.invite_code||'')))));
  root.append(h('div',{class:'card'},h('h2',{},'إضافة دكتور'),
    h('p',{class:'muted'},'اكتب الاسم والبريد. يظهر لك كود تفعيل تعطيه للدكتور، وهو يفعّل حسابه بنفسه من شاشة الدخول ويختار كلمة السر.'),
    h('div',{class:'row'},tn,te,h('button',{class:'btn',onclick:async()=>{
      if(!tn.value.trim()||!te.value.trim()){toast('اكتب الاسم والبريد');return;}
      const code=rnd6();
      const r=await sb.from('profiles').insert({full_name:tn.value.trim(),role:'teacher',email:te.value.trim().toLowerCase(),invite_code:code,claimed:false});
      if(r.error){toast('البريد مستخدم أو خطأ');return;}
      tmsg.textContent=`تمت الإضافة. كود تفعيل ${tn.value.trim()}: ${code}`;tmsg.style.fontWeight='700';toast('تمت الإضافة');setTimeout(reload,4000);
    }},'إضافة')),tmsg,h('div',{class:'scroll',style:'margin-top:10px'},tlist)));

  // import students
  const file=h('input',{type:'file',accept:'.xlsx,.xls,.csv'});
  const cs=h('select',{},h('option',{value:''},'بدون تسجيل في مادة'),S.courses.map(c=>h('option',{value:c.id},'تسجيل الكل في: '+c.name)));
  const pv=h('div',{class:'muted',style:'margin-top:8px'});let parsed=[];
  file.onchange=async()=>{
    const f=file.files[0];if(!f)return;pv.textContent='جارٍ القراءة…';
    try{await loadXLSX();
      const wb=XLSX.read(await f.arrayBuffer(),{type:'array'});
      const rows=XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]],{header:1,defval:''});
      parsed=mapRows(rows);
      pv.textContent=parsed.length?`تم العثور على ${parsed.length} طالب. مثال: ${parsed[0].full_name} (${parsed[0].student_no})`+(parsed.some(p=>!p.email)?' · بعضهم بدون بريد (لن يستطيعوا تفعيل الحساب)':''):'لم أجد أعمدة الرقم والاسم. تأكد أن الصف الأول فيه: ID, Name, Email, Section, Group';
    }catch(e){pv.textContent='تعذّرت قراءة الملف';parsed=[];}
  };
  const up=h('button',{class:'btn block',onclick:async()=>{
    if(!parsed.length){toast('اختر ملفاً أولاً');return;}
    up.disabled=true;pv.textContent='جارٍ الرفع…';
    try{
      const have=new Set(students.map(s=>s.student_no));
      const news=parsed.filter(p=>!have.has(p.student_no)),olds=parsed.filter(p=>have.has(p.student_no));
      for(const part of chunk(news,200)){const r=await sb.from('profiles').insert(part.map(p=>({full_name:p.full_name,role:'student',student_no:p.student_no,email:p.email||null,section:p.section||null,grp:p.grp||null,card_code:'S'+p.student_no,invite_code:p.student_no,claimed:false})));if(r.error)throw r.error;}
      for(const part of chunk(olds,200)){const r=await sb.from('profiles').upsert(part.map(p=>({student_no:p.student_no,role:'student',full_name:p.full_name,email:p.email||null,section:p.section||null,grp:p.grp||null})),{onConflict:'student_no'});if(r.error)throw r.error;}
      // enrolment
      const byCode=Object.fromEntries(S.courses.filter(c=>c.code).map(c=>[c.code.toLowerCase(),c.id]));
      const want=[];
      let ids={};for(const part of chunk(parsed.map(p=>p.student_no),150)){const r=await sb.from('profiles').select('id,student_no').in('student_no',part);(r.data||[]).forEach(x=>ids[x.student_no]=x.id);}
      parsed.forEach(p=>{const sid=ids[p.student_no];if(!sid)return;const set=new Set();if(cs.value)set.add(cs.value);
        p.course.split(/[,;،|]/).map(x=>x.trim().toLowerCase()).filter(Boolean).forEach(x=>{if(byCode[x])set.add(byCode[x]);});
        set.forEach(cid=>want.push({course_id:cid,student_id:sid}));});
      for(const part of chunk(want,300)){const r=await sb.from('enrollments').upsert(part,{onConflict:'course_id,student_id',ignoreDuplicates:true});if(r.error)throw r.error;}
      toast(`تم رفع ${parsed.length} طالب`);reload();
    }catch(e){pv.textContent='تعذّر الرفع: '+(e.message||'');up.disabled=false;}
  }},'رفع الطلاب');
  root.append(h('div',{class:'card'},h('h2',{},'رفع الطلاب من Excel'),
    h('p',{class:'muted'},'ملف Excel أو CSV، الصف الأول عناوين: ID (الرقم)، Name (الاسم)، Email (البريد)، Section (السكشن)، Group (الجروب)، وعمود Course اختياري بكود المادة. الطالب الموجود يتحدّث ولا يتكرر. كل طالب يحصل على بطاقة QR، ويفعّل حسابه من شاشة الدخول بالبريد + رقمه كود التفعيل.'),
    file,h('div',{style:'margin-top:8px'},cs),pv,up));

  // students table
  const q=h('input',{placeholder:'بحث بالاسم أو الرقم أو السكشن'});
  const tb=h('table',{});
  const draw=()=>{
    const t=q.value.trim().toLowerCase();
    const rows=students.filter(s=>!t||[s.full_name,s.student_no,s.section,s.grp,s.email].some(v=>String(v||'').toLowerCase().includes(t))).slice(0,150);
    tb.replaceChildren(h('tr',{},['الطالب','الرقم','سكشن','جروب','البريد','كود الكارت','الحالة',''].map(x=>h('th',{},x))),
      rows.map(s=>{const ci=h('input',{'.value':s.card_code||'',dir:'ltr',style:'min-height:36px;padding:6px 8px;min-width:90px'});
        return h('tr',{},h('td',{},s.full_name),h('td',{},s.student_no||''),h('td',{},s.section||''),h('td',{},s.grp||''),h('td',{dir:'ltr'},s.email||''),h('td',{},ci),h('td',{},s.claimed?'مفعّل':'لم يفعّل'),
          h('td',{},h('button',{class:'btn sm sec',onclick:async()=>{const r=await sb.from('profiles').update({card_code:ci.value.trim()||null}).eq('id',s.id);toast(r.error?'الكود مستخدم أو خطأ':'تم الحفظ');}},'حفظ')));}));
  };q.oninput=draw;draw();
  root.append(h('div',{class:'card'},h('h2',{},`الطلاب (${students.length})`),q,h('div',{class:'scroll',style:'margin-top:8px'},tb),
    students.length>150?h('div',{class:'muted'},'يظهر أول ١٥٠، استخدم البحث'):null));
}
boot();
