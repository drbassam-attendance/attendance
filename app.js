'use strict';
const SB_URL='https://biyksknrwuwxnciiaeqa.supabase.co';
const SB_KEY='sb_publishable__CdHDA8msHTV7dznSlARNg_HYtE2Tkx';
const sb=supabase.createClient(SB_URL,SB_KEY);
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
  const tabs=S.profile.role==='student'?[['mine','حضوري']]:
    S.profile.role==='teacher'?[['scan','تسجيل الحضور'],['review','مراجعة'],['reports','التقارير']]:
    [['scan','تسجيل الحضور'],['review','مراجعة'],['reports','التقارير'],['manage','الإدارة']];
  if(!tabs.find(t=>t[0]===S.tab))S.tab=tabs[0][0];
  const main=h('main');
  app.append(
    h('header',{class:'top'},h('div',{class:'who'},h('b',{},S.profile.full_name),h('span',{},ROLE[S.profile.role])),
      h('button',{onclick:()=>sb.auth.signOut()},'خروج')),
    h('nav',{class:'tabs'},tabs.map(([k,l])=>h('button',{class:k===S.tab?'on':'',onclick:()=>{S.tab=k;render();}},l))),
    main);
  ({scan:scanView,review:reviewView,reports:reportsView,manage:manageView,mine:mineView})[S.tab](main);
}

/* ---------- login ---------- */
function loginView(){
  const err=h('div',{class:'err',hidden:true});
  const em=h('input',{type:'email',autocomplete:'username',dir:'ltr',required:true});
  const pw=h('input',{type:'password',autocomplete:'current-password',dir:'ltr',required:true});
  const f=h('form',{onsubmit:async e=>{
    e.preventDefault();err.hidden=true;btn.disabled=true;
    const {error}=await sb.auth.signInWithPassword({email:em.value.trim(),password:pw.value});
    btn.disabled=false;
    if(error){err.textContent='البريد أو كلمة المرور غير صحيحة';err.hidden=false;return;}
    await loadProfile();render();
  }},h('label',{},'البريد الإلكتروني'),em,h('label',{},'كلمة المرور'),pw,err);
  const btn=h('button',{class:'btn block',type:'submit'},'دخول');f.append(btn);
  return h('div',{class:'login'},h('img',{class:'logo',src:'icon-192.png',alt:''}),h('h1',{},'نظام الحضور'),h('p',{class:'sub'},'سجّل الدخول للمتابعة'),f);
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

  root.append(
    h('div',{class:'card'},h('h2',{},'١. اختر المادة'),h('div',{class:'row'},sel,dIn),info),
    h('div',{class:'card'},h('h2',{},'٢. امسح الكارت'),
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
      h('td',{},h('div',{class:'mini'},h('button',{class:'btn sm',onclick:()=>act([a],true)},'موافقة'),h('button',{class:'btn sm bad',onclick:()=>act([a],false)},'رفض'))))));
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
    const head=[h('h2',{},`تقرير الحضور: ${c.name}`),h('div',{class:'muted'},`${from.value} إلى ${to.value} · العام الدراسي ${c.academic_year} · عدد المحاضرات ${r.reg.length}`),
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
      const am=Object.fromEntries((att||[]).map(a=>[a.session_id,a]));
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

/* ---------- admin manage ---------- */
async function manageView(root){
  const {data:profs}=await sb.from('profiles').select('*').order('full_name');
  const teachers=(profs||[]).filter(p=>p.role==='teacher'||p.role==='admin'),students=(profs||[]).filter(p=>p.role==='student');
  const reload=()=>{S.tab='manage';loadProfile().then(render);};

  // add course
  const nm=h('input',{placeholder:'اسم المادة'}),cd=h('input',{placeholder:'الكود (مثال ANA101)',dir:'ltr'}),yrIn=h('input',{'.value':'2026-2027',dir:'ltr'});
  const tsel=h('select',{},teachers.map(t=>h('option',{value:t.id},t.full_name)));
  const dchk=DAYN.map((d,i)=>h('input',{type:'checkbox',value:i,style:'width:auto;min-height:0'}));
  root.append(h('div',{class:'card'},h('h2',{},'إضافة مادة'),
    h('div',{class:'row'},nm,cd),h('div',{class:'row',style:'margin-top:8px'},tsel,yrIn),
    h('label',{},'أيام المحاضرات'),h('div',{class:'days'},DAYN.map((d,i)=>h('label',{},dchk[i],d))),
    h('button',{class:'btn block',onclick:async()=>{
      const days=dchk.filter(x=>x.checked).map(x=>+x.value);
      if(!nm.value.trim()||!days.length){toast('اكتب الاسم واختر الأيام');return;}
      const r=await sb.from('courses').insert({name:nm.value.trim(),code:cd.value.trim()||null,teacher_id:tsel.value,academic_year:yrIn.value.trim(),days});
      if(r.error)toast('تعذّر الحفظ');else{toast('تمت الإضافة');reload();}
    }},'حفظ المادة')));

  // courses list + enrolment
  const list=h('div');
  root.append(h('div',{class:'card'},h('h2',{},'المواد والتسجيل'),list));
  for(const c of S.courses){
    const t=teachers.find(x=>x.id===c.teacher_id);
    const det=h('details',{style:'border-top:1px solid var(--bd);padding:8px 0'},h('summary',{style:'cursor:pointer;font-weight:700'},`${c.name} `,h('span',{class:'muted'},`${c.code||''} · ${t?t.full_name:''} · ${c.days.map(d=>DAYN[d]).join('،')}`)));
    det.addEventListener('toggle',async()=>{
      if(!det.open||det.dataset.l)return;det.dataset.l=1;
      const {data:en}=await sb.from('enrollments').select('student_id').eq('course_id',c.id);
      const have=new Set((en||[]).map(e=>e.student_id));
      const boxes=students.map(s=>({s,i:h('input',{type:'checkbox','.checked':have.has(s.id),style:'width:auto;min-height:0'})}));
      det.append(h('div',{style:'margin-top:8px'},boxes.map(b=>h('label',{style:'display:flex;gap:8px;align-items:center;font-weight:500;margin:6px 0'},b.i,b.s.full_name,h('span',{class:'muted'},b.s.student_no||''))),
        h('button',{class:'btn sm',onclick:async()=>{
          const add=boxes.filter(b=>b.i.checked&&!have.has(b.s.id)).map(b=>({course_id:c.id,student_id:b.s.id}));
          const del=boxes.filter(b=>!b.i.checked&&have.has(b.s.id)).map(b=>b.s.id);
          if(add.length){const r=await sb.from('enrollments').insert(add);if(r.error){toast('تعذّر الحفظ');return;}}
          if(del.length){await sb.from('enrollments').delete().eq('course_id',c.id).in('student_id',del);}
          toast('تم حفظ التسجيل');}},'حفظ التسجيل')));
    });
    list.append(det);
  }
  if(!S.courses.length)list.append(h('div',{class:'empty'},'لا توجد مواد'));

  // students & card codes
  const tb=h('table',{},h('tr',{},['الطالب','الرقم','كود الكارت',''].map(x=>h('th',{},x))));
  students.forEach(s=>{
    const ci=h('input',{'.value':s.card_code||'',dir:'ltr',style:'min-height:36px;padding:6px 8px'});
    tb.append(h('tr',{},h('td',{},s.full_name),h('td',{},s.student_no||''),h('td',{},ci),h('td',{},h('button',{class:'btn sm sec',onclick:async()=>{
      const r=await sb.from('profiles').update({card_code:ci.value.trim()||null}).eq('id',s.id);
      toast(r.error?'الكود مستخدم أو خطأ':'تم الحفظ');}},'حفظ'))));
  });
  root.append(h('div',{class:'card'},h('h2',{},`الطلاب (${students.length}) وأكواد الكروت`),
    h('p',{class:'muted'},'لإضافة طالب أو دكتور جديد: يُنشأ الحساب من لوحة Supabase (Authentication ثم Add user)، ثم يُضاف صفّه في جدول profiles.'),
    h('div',{class:'scroll'},tb)));
}
boot();
