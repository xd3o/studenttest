/* ======= script.js =======
   شغل واحد لكل الصفحات: index.html و dashboard.html
   - يتعرف على ملفات الصف автоматически من النص "رابع أ" -> data_r4_a.js
   - يدعم ملفات .js (تعريف global `students`) أو .json (object { students: [...] })
   - يبحث عن الطالب بمفاتيح متعددة (code, الكود, id, رقم)
   - يخزن studentData في localStorage ويعرضها في dashboard
   - dark mode محفوظ
   - رسائل خطأ واضحة للـ debug
===========================*/

/* ---------- Utilities ---------- */
function q(sel){ return document.querySelector(sel); }
function safeHtmlFromText(txt){
  const div = document.createElement('div');
  div.textContent = txt;
  return div.innerHTML.replace(/\n/g,'<br>');
}
function normalizeStr(s){ return (''+ (s||'')).trim(); }

/* تحويل اسم الصف (مثال: "رابع أ") إلى اسم ملف مثل data_r4_a.js */
function classToFileName(cls){
  if(!cls) return null;
  cls = normalizeStr(cls);
  // خرائط الكلمات
  const gradeMap = { 'رابع': 'r4', 'الرابع': 'r4', 'خامس': 'r5', 'الخامس':'r5', 'سادس':'r6','السادس':'r6' };
  const letterMap = { 'أ':'a','ا':'a','أ':'a','أَ':'a','ب':'b','ج':'c','د':'d','هـ':'e','ه':'e','و':'f' };
  // نفصل الكلمات
  const parts = cls.split(/\s+/);
  let gradeWord = parts[0] || parts.slice(0,1).join('');
  let letter = parts[1] || ''; // ممكن يكون "أ" أو "أ" مدموجة
  // بعض المستخدمين يكتب "رابعأ" بدون مسافة -> نحاول استخلاص آخر حرف
  if(!letter && gradeWord.length>5){
    // last char might be letter
    const maybeLetter = gradeWord.slice(-1);
    if(letterMap[maybeLetter]){ letter = maybeLetter; gradeWord = gradeWord.slice(0,-1); }
  }
  const gradePrefix = gradeMap[gradeWord] || (gradeWord.includes('4')?'r4': gradeWord.includes('5')?'r5': gradeWord.includes('6')?'r6': null);
  const letterChar = letterMap[letter] || (letter ? letter.toLowerCase() : null);
  if(!gradePrefix || !letterChar) return null;
  return `data_${gradePrefix}_${letterChar}.js`; // مثال: data_r4_a.js
}

/* يحاول جلب ملف الصف: إن كان JSON يعالجه، وإن كان JS يحقنه */
function loadClassFile(filePath){
  return new Promise((resolve, reject) => {
    // نجرب fetch أولاً لنتثبت من وجود الملف ونشوف النوع
    fetch(filePath, { cache: "no-store" }).then(resp=>{
      if(!resp.ok) throw new Error('HTTP ' + resp.status);
      const ct = resp.headers.get('content-type') || '';
      // لو JSON أو نص يبدأ بـ { أو [
      if(ct.includes('application/json') || ct.includes('text/json')){
        return resp.json().then(json=>{
          // بعض ملفات قد تكون مباشرة مصفوفة students
          if(Array.isArray(json)) return resolve({ students: json });
          return resolve(json);
        });
      } else {
        // ليس JSON — سنقوم بحقن سكربت .js لتنفيذ تعريف المتغير global
        // لكن لو السيرفر لا يسمح بالحقن (CSP) فسنسقط بالخطأ
        const script = document.createElement('script');
        script.src = filePath;
        script.onload = ()=>{
          // بعد التحميل، نتوقع وجود متغير global 'students' أو 'studentsList' أو window.<filename-based>
          let students = window.students || window.studentsList || window._students || null;
          // إذا لم نلقَ students، نحاول استخراج اسم من ملفPath: data_r4_a.js -> window.data_r4_a .
          if(!students){
            try{
              const base = filePath.split('/').pop().replace(/\.[^.]+$/, ''); // data_r4_a
              students = window[base] || null;
            }catch(e){}
          }
          if(!students) {
            // ننظف السكربت المحقون لمنع تكرار
            script.remove();
            reject(new Error('ملف الصف تم تحميله لكن لم يُعرّف متغير students فيه.'));
            return;
          }
          // إن كانت قيمة واحدة: إذا هو كائن { students: [...] }
          if(students && !Array.isArray(students) && Array.isArray(students.students)) students = students.students;
          resolve({ students });
          // لا نزيل السكربت لأن قد يحتاجه لاحقاً، لكن لو تحب يمكن إزالته.
        };
        script.onerror = ()=> {
          reject(new Error('فشل تحميل ملف الصف (script load error)'));
        };
        document.head.appendChild(script);
      }
    }).catch(err=>{
      reject(err);
    });
  });
}

/* البحث عن طالب ضمن مصفوفة الطلاب مع دعم مفاتيح متعددة */
function findStudentInArray(arr, code){
  code = normalizeStr(code);
  for(const s of arr){
    const candidates = [
      s.code, s.الكود, s.id, s.ID, s.studentCode, s.student_id, s['رقم'] 
    ].map(x=> normalizeStr(x));
    for(const c of candidates){
      if(!c) continue;
      if(c === code) return s;
      // مقارنة رقمية أيضاً
      if(c.replace(/^0+/, '') === code.replace(/^0+/, '')) return s;
    }
    // أيضاً تحقق باسم إذا المستخدم أدخل اسم بدل الكود
    if((s.name && normalizeStr(s.name)===code) || (s.الاسم && normalizeStr(s.الاسم)===code)) return s;
  }
  return null;
}

/* ---------- Login flow (index.html) ---------- */
if(q('#loginBtn')){
  q('#loginBtn').addEventListener('click', async ()=>{
    const code = normalizeStr(q('#code').value);
    const cls = normalizeStr(q('#class').value);
    if(!code || !cls){ alert('يرجى إدخال الكود واختيار الصف'); return; }

    const fileName = classToFileName(cls);
    if(!fileName){
      alert('تعذر تحويل اسم الصف لاسم ملف؛ تأكد من كتابة الصف بالشكل: "رابع أ" أو "خامس ب"');
      return;
    }
    const path = `student_data_files/${fileName}`;
    try{
      const payload = await loadClassFile(path);
      const arr = payload.students || [];
      const student = findStudentInArray(arr, code);
      if(!student){ alert('الكود غير موجود في هذا الصف.'); return; }
      // تخزين كامل بيانات الطالب + صف وكود
      localStorage.setItem('studentData', JSON.stringify(student));
      localStorage.setItem('studentClass', cls);
      localStorage.setItem('studentCode', code);
      // redirect
      window.location.href = 'dashboard.html';
    }catch(err){
      console.error('Login load error:', err);
      alert('خطأ في تحميل بيانات الصف: ' + err.message + '\nتأكد من وجود الملف: ' + path);
    }
  });
}

/* ---------- Dashboard flow (dashboard.html) ---------- */
if(q('.main') || q('#studentName') || q('#gradesTable')){
  (async function initDashboard(){
    // استعادة الثيم
    if(localStorage.getItem('theme')==='dark') document.body.classList.add('dark');

    // جلب بيانات الطالب من localStorage أو من ملف الصف إذا لم تكن موجودة
    let student = null;
    try {
      student = JSON.parse(localStorage.getItem('studentData') || 'null');
    } catch(e){ student = null; }

    const storedCode = normalizeStr(localStorage.getItem('studentCode')||'');
    const storedClass = normalizeStr(localStorage.getItem('studentClass')||'');

    if(!student && storedCode && storedClass){
      // حاول تحميل ملف الصف ثم إيجاد الطالب
      const fileName = classToFileName(storedClass);
      if(!fileName){ alert('خطأ: اسم الصف غير صالح.'); window.location.href='index.html'; return; }
      try{
        const payload = await loadClassFile(`student_data_files/${fileName}`);
        student = findStudentInArray(payload.students||[], storedCode);
        if(!student){ alert('الطالب غير موجود في ملف الصف.'); window.location.href='index.html'; return; }
        localStorage.setItem('studentData', JSON.stringify(student));
      }catch(err){
        console.error('Dashboard load error:', err);
        alert('خطأ في تحميل ملف الصف: ' + err.message);
        window.location.href='index.html';
        return;
      }
    }

    if(!student){ alert('لم يتم العثور على بيانات الطالب. يرجى تسجيل الدخول.'); window.location.href='index.html'; return; }

    // render
    q('#studentName') && (q('#studentName').textContent = "مرحباً " + (student.name || student.الاسم || 'طالب'));
    // admin message
    const adminMsg = student.adminMessage || student['رسالة_الإدارة'] || student['رسالة'] || (student.meta && student.meta.adminMessage) || '';
    if(adminMsg && q('#admin-msg')){
      const el = q('#admin-msg');
      el.style.display = 'block';
      el.innerHTML = safeHtmlFromText(adminMsg);
    }

    // درجات
    function renderGrades(g){
      const table = q('#gradesTable');
      if(!table) return;
      if(!g || Object.keys(g).length===0){ table.innerHTML = '<tr><td>لا توجد درجات</td></tr>'; return; }
      let html = '<tr><th>المادة</th><th>الدرجة</th></tr>';
      for(const k of Object.keys(g)){
        const val = g[k];
        const css = (typeof val === 'number' && val < 50) ? ' style="color:red;font-weight:bold"' : '';
        html += `<tr><td>${k}</td><td${css}>${(val===null||val===undefined)?'—':val}</td></tr>`;
      }
      table.innerHTML = html;
    }
    const gradesObj = student.grades || student.الدرجات || student.marks || null;
    renderGrades(gradesObj);

    // جدول أسبوعي
    function renderSchedule(tt){
      const table = q('#scheduleTable');
      if(!table) return;
      if(!tt){ table.innerHTML = '<tr><td>لا يوجد جدول</td></tr>'; return; }
      let html = '<tr><th>اليوم</th><th>الحصة 1</th><th>الحصة 2</th><th>الحصة 3</th><th>الحصة 4</th><th>الحصة 5</th><th>الحصة 6</th></tr>';
      const days = Object.keys(tt);
      for(const d of days){
        const row = tt[d] || [];
        html += `<tr><td>${d}</td>`;
        for(let i=0;i<6;i++) html += `<td>${row[i]||'—'}</td>`;
        html += `</tr>`;
      }
      table.innerHTML = html;
    }
    const timetable = student.schedule || student.الجدول || null;
    renderSchedule(timetable);

    // أخبار (news.json) إذا موجود
    (async function tryLoadNews(){
      if(!q('#news-container')) return;
      try{
        const r = await fetch('news.json', { cache: "no-store" });
        if(!r.ok) return;
        const list = await r.json();
        if(!Array.isArray(list)) return;
        list.sort((a,b)=> (new Date(b.date||b.created_at)) - (new Date(a.date||a.created_at)));
        const show = list.slice(0,3);
        const container = q('#news-container'); container.innerHTML = '';
        show.forEach(n=>{
          const card = document.createElement('article');
          card.className = 'news-card';
          const title = document.createElement('h4'); title.textContent = n.title || n.title_ar || 'خبر';
          const time = document.createElement('time'); time.textContent = n.date ? new Date(n.date).toLocaleDateString('ar-EG') : (n.created_at?new Date(n.created_at).toLocaleDateString('ar-EG'):'');
          const desc = document.createElement('div'); desc.innerHTML = safeHtmlFromText(n.description || n.desc || '');
          card.appendChild(title); if(time.textContent) card.appendChild(time); if(desc.innerHTML) card.appendChild(desc);
          container.appendChild(card);
        });
      }catch(e){}
    })();

    // sidebar buttons
    q('#btn-home') && q('#btn-home').addEventListener('click', ()=>showSection('home-section'));
    q('#btn-grades') && q('#btn-grades').addEventListener('click', ()=>showSection('grades-section'));
    q('#btn-timetable') && q('#btn-timetable').addEventListener('click', ()=>showSection('timetable-section'));
    q('#btn-dark') && q('#btn-dark').addEventListener('click', ()=>{
      document.body.classList.toggle('dark');
      localStorage.setItem('theme', document.body.classList.contains('dark') ? 'dark' : 'light');
    });
    q('#logoutBtn') && q('#logoutBtn').addEventListener('click', ()=>{
      localStorage.removeItem('studentData');
      localStorage.removeItem('studentClass');
      localStorage.removeItem('studentCode');
      window.location.href = 'index.html';
    });

    function showSection(id){
      document.querySelectorAll('.main section').forEach(s=>s.classList.add('hidden'));
      const el = document.getElementById(id);
      if(el) el.classList.remove('hidden');
      document.querySelectorAll('.sidebar button').forEach(b=>b.classList.remove('active'));
      if(id==='home-section') q('#btn-home') && q('#btn-home').classList.add('active');
      if(id==='grades-section') q('#btn-grades') && q('#btn-grades').classList.add('active');
      if(id==='timetable-section') q('#btn-timetable') && q('#btn-timetable').classList.add('active');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

  })();
}

/* ---------- Helpful debug helper (optional) ---------- */
window.__debugFetchClassFile = loadClassFile;
