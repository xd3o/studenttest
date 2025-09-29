(function(){
  const root = window;

  /* ---------- Helpers ---------- */
  function qs(sel){ return document.querySelector(sel); }
  function qsa(sel){ return Array.from(document.querySelectorAll(sel)); }
  function isArrayOfObjects(v){ return Array.isArray(v) && v.length && typeof v[0]==='object'; }
  function findStudentsFromGlobals(beforeKeys){
    const after = Object.keys(root);
    for(const k of after){
      if(beforeKeys.has(k)) continue;
      try{
        const val = root[k];
        if(isArrayOfObjects(val)){
          // detect student-like objects by fields
          const sample = val[0];
          const hasName = ('الاسم' in sample) || ('name' in sample) || ('fullName' in sample);
          const hasCode = ('الكود' in sample) || ('code' in sample) || ('id' in sample);
          if(hasName && hasCode) return val;
        }
      }catch(e){}
    }
    // fallback to common vars
    if(Array.isArray(root.students)) return root.students;
    if(Array.isArray(root.StudentData)) return root.StudentData;
    return null;
  }

  /* ---------- INDEX LOGIN ---------- */
  if(location.pathname.endsWith('index.html') || location.pathname.endsWith('/') || /index\.html$/.test(location.pathname) ){
    const stageEl = qs('#stage');
    const groupEl = qs('#group');
    const codeEl = qs('#code');
    const btn = qs('#login');
    const msg = qs('#msg');

    btn.addEventListener('click', ()=>{
      msg.textContent = '';
      const stage = stageEl.value; // R4 R5 R6
      const grp = groupEl.value;   // a..f
      const code = (codeEl.value||'').trim();
      if(!stage || !grp || !code){ msg.textContent = 'يرجى ملء الحقول كاملة.'; return; }

      // build file path: student_data_files/data_r4_a.js
      const num = stage.replace('R',''); // 4 5 6
      const file = `student_data_files/data_r${num}_${grp}.js`;

      // snapshot globals
      const before = new Set(Object.keys(root));

      // load script
      const s = document.createElement('script');
      s.src = file;
      s.async = true;
      s.onload = function(){
        // find students array exported by that file
        const studentsArr = findStudentsFromGlobals(before);
        if(!studentsArr){
          msg.textContent = 'تعذر قراءة ملف الشعبة. تأكد أن الملف يعرض مصفوفة الطلاب (students).';
          s.remove();
          return;
        }
        // find student by code (try multiple keys)
        const codeKeys = ['الكود','code','id','studentCode','كود'];
        const student = studentsArr.find(st=>{
          for(const k of codeKeys) if(k in st) if(String(st[k]).trim().toUpperCase()===code.toUpperCase()) return true;
          // also try name+class composite (fallback)
          return false;
        });
        if(!student){
          msg.textContent = 'الكود غير صحيح أو غير موجود في هذه الشعبة.';
          s.remove();
          return;
        }
        // normalize store
        student._meta = { stage, group, file };
        try{ localStorage.setItem('studentData', JSON.stringify(student)); }
        catch(e){ console.error(e); msg.textContent='فشل حفظ بيانات الجلسة.'; s.remove(); return; }
        s.remove();
        location.href = 'dashboard.html';
      };
      s.onerror = function(){
        msg.textContent = 'تعذر تحميل ملف الشعبة. تأكد من أن المسار والاسم صحيحان.';
        s.remove();
      };
      document.body.appendChild(s);
    });
    return;
  }

  /* ---------- DASHBOARD ---------- */
  if(location.pathname.endsWith('dashboard.html')){
    // elements
    const menuBtn = qs('#menuBtn');
    const sidebar = qs('#sidebar');
    const navBtns = qsa('.nav-btn');
    const panels = qsa('.panel');
    const contactToggle = qs('#contactToggle');
    const contactMenu = qs('#contactMenu');
    const darkBtn = qs('#darkBtn');
    const logoutBtn = qs('#logoutBtn');

    const studentNameEl = qs('#studentName');
    const studentClassEl = qs('#studentClass');
    const studentSectionEl = qs('#studentSection');
    const adminMsgEl = qs('#adminMsg');
    const newsContainer = qs('#newsContainer');
    const gradesContainer = qs('#gradesContainer');
    const scheduleContainer = qs('#scheduleContainer');
    const activitiesTbody = qs('#activitiesTable tbody');
    const allNews = qs('#allNews');
    const fbLink = qs('#facebookLink');
    const tgLink = qs('#telegramLink');

    // load student from localStorage
    const raw = localStorage.getItem('studentData');
    if(!raw){ alert('لم يتم العثور على بيانات الطالب. الرجاء تسجيل الدخول.'); location.href='index.html'; return; }
    const student = JSON.parse(raw);

    // render basic
    studentNameEl.textContent = student['الاسم'] || student.name || student.fullName || '—';
    studentClassEl.textContent = student['الصف'] || student.class || student._meta && student._meta.stage || '—';
    studentSectionEl.textContent = student['الشعبة'] || student.section || (student._meta && student._meta.group) || '—';

    // admin message (from student or meta)
    const adminMsg = student['رسالة_الإدارة'] || student['رسالة'] || student.adminMessage || '';
    if(adminMsg){ adminMsgEl.hidden = false; adminMsgEl.textContent = adminMsg; }

    // sidebar toggle
    menuBtn.addEventListener('click', ()=>{
      const visible = sidebar.getAttribute('aria-hidden') === 'false';
      sidebar.setAttribute('aria-hidden', visible ? 'true' : 'false');
    });

    // nav buttons
    navBtns.forEach(b=>{
      b.addEventListener('click', ()=> {
        const id = b.dataset.section;
        panels.forEach(p=>p.classList.remove('active'));
        const panel = qs(`#${id}`);
        if(panel) panel.classList.add('active');
        sidebar.setAttribute('aria-hidden','true');
      });
    });

    // contact submenu
    contactToggle.addEventListener('click', ()=> {
      const show = contactMenu.hasAttribute('hidden');
      if(show) contactMenu.removeAttribute('hidden'); else contactMenu.setAttribute('hidden','');
    });

    // dark mode
    (function(){
      const saved = localStorage.getItem('darkMode');
      if(saved==='on') document.body.classList.add('dark');
    })();
    darkBtn.addEventListener('click', ()=>{
      document.body.classList.toggle('dark');
      localStorage.setItem('darkMode', document.body.classList.contains('dark') ? 'on' : 'off');
    });

    // logout
    logoutBtn.addEventListener('click', ()=>{
      localStorage.removeItem('studentData');
      location.href='index.html';
    });

    // ---------- render grades ----------
    function renderGrades(gr){
      gradesContainer.innerHTML = '';
      if(!gr || (Object.keys(gr||{}).length===0 && !Array.isArray(gr)) ){
        gradesContainer.innerHTML = '<div>لا توجد درجات.</div>'; return;
      }

      // support shapes:
      // 1) gr = { "الكورس الأول": { subj:{month1:..,...}, ... }, "الكورس الثاني": {...} }
      // 2) gr = { subj: {month1:.., ...}, ... } -> treat as course1
      // 3) gr = [ {courseName:'كورس 1', subjects:[{name,month1,...}]}, ... ]
      if(Array.isArray(gr)){
        gr.forEach(course=>{
          const wrapper = document.createElement('div');
          wrapper.className = 'table-wrap';
          const title = document.createElement('h4'); title.textContent = course.courseName || course.name || 'الكورس';
          wrapper.appendChild(title);
          const table = buildTableFromSubjects(course.subjects || []);
          wrapper.appendChild(table);
          gradesContainer.appendChild(wrapper);
        });
        return;
      }

      // if object with explicit keys for courses
      const possibleCourseKeys = Object.keys(gr).filter(k=>/كورس|كور|course|كورس/i.test(k) || /الأول|الثاني|first|second/i.test(k));
      if(possibleCourseKeys.length){
        possibleCourseKeys.forEach(k=>{
          const wrapper = document.createElement('div');
          wrapper.className = 'table-wrap';
          const title = document.createElement('h4'); title.textContent = k;
          wrapper.appendChild(title);
          const subjObj = gr[k];
          if(subjObj && typeof subjObj === 'object' && !Array.isArray(subjObj)){
            const subjects = Object.keys(subjObj).map(s => {
              const row = subjObj[s];
              return {
                name: s,
                month1: row.month1 ?? row['الشهر الأول'] ?? row['m1'] ?? row.m1 ?? '—',
                month2: row.month2 ?? row['الشهر الثاني'] ?? row['m2'] ?? row.m2 ?? '—',
                month3: row.month3 ?? row['الشهر الثالث'] ?? row['m3'] ?? row.m3 ?? '—',
                term: row.term ?? row['السعي'] ?? row['السعي الأول'] ?? row.s1 ?? '—',
                final: row.final ?? row['نصف السنة'] ?? row['النهائي'] ?? '—'
              };
            });
            wrapper.appendChild(buildTableFromSubjects(subjects));
          } else {
            wrapper.appendChild(document.createTextNode('لا توجد بيانات لعرضها'));
          }
          gradesContainer.appendChild(wrapper);
        });
        return;
      }

      // fallback: treat gr as mapping subject->values
      const subjects = Object.keys(gr).map(s=>{
        const row = gr[s];
        return {
          name: s,
          month1: row.month1 ?? row['الشهر الأول'] ?? '—',
          month2: row.month2 ?? row['الشهر الثاني'] ?? '—',
          month3: row.month3 ?? row['الشهر الثالث'] ?? '—',
          term: row.term ?? row['السعي'] ?? '—',
          final: row.final ?? row['النهائي'] ?? '—'
        };
      });
      const wrap = document.createElement('div'); wrap.className='table-wrap';
      wrap.appendChild(buildTableFromSubjects(subjects));
      gradesContainer.appendChild(wrap);
    }

    function buildTableFromSubjects(subjects){
      const table = document.createElement('table');
      const thead = document.createElement('thead');
      thead.innerHTML = `<tr><th>المادة</th><th>الشهر 1</th><th>الشهر 2</th><th>الشهر 3</th><th>السعي</th><th>نهاية الكورس</th></tr>`;
      table.appendChild(thead);
      const tbody = document.createElement('tbody');
      subjects.forEach(s=>{
        const tr = document.createElement('tr');
        const low = (v)=> (typeof v==='number' && v<50) || (String(v).match(/^\d+$/) && parseInt(v,10)<50);
        tr.innerHTML = `<td>${s.name||'—'}</td>
          <td ${low(s.month1)?'class="low"':''}>${s.month1||'—'}</td>
          <td ${low(s.month2)?'class="low"':''}>${s.month2||'—'}</td>
          <td ${low(s.month3)?'class="low"':''}>${s.month3||'—'}</td>
          <td ${low(s.term)?'class="low"':''}>${s.term||'—'}</td>
          <td ${low(s.final)?'class="low"':''}>${s.final||'—'}</td>`;
        tbody.appendChild(tr);
      });
      table.appendChild(tbody);
      return table;
    }

    // ---------- schedule ----------
    function renderSchedule(sch){
      scheduleContainer.innerHTML = '';
      if(!sch){ scheduleContainer.innerHTML = '<div>لا يوجد جدول.</div>'; return; }
      const table = document.createElement('table');
      const thead = document.createElement('thead');
      thead.innerHTML = `<tr><th>اليوم</th><th>الحصة1</th><th>الحصة2</th><th>الحصة3</th><th>الحصة4</th><th>الحصة5</th><th>الحصة6</th></tr>`;
      table.appendChild(thead);
      const tbody = document.createElement('tbody');

      if(Array.isArray(sch)){
        sch.forEach(row=>{
          const lessons = row.lessons || row.periods || row.courses || [];
          const tr = document.createElement('tr');
          tr.innerHTML = `<td>${row.day||row.name||'—'}</td>` + Array.from({length:6},(_,i)=>`<td>${lessons[i]||'—'}</td>`).join('');
          tbody.appendChild(tr);
        });
      } else {
        for(const day in sch){
          const lessons = Array.isArray(sch[day])? sch[day] : (sch[day].lessons || []);
          const tr = document.createElement('tr');
          tr.innerHTML = `<td>${day}</td>` + Array.from({length:6},(_,i)=>`<td>${lessons[i]||'—'}</td>`).join('');
          tbody.appendChild(tr);
        }
      }
      table.appendChild(tbody);
      scheduleContainer.appendChild(table);
    }

    // ---------- activities & news ----------
    (function loadActivities(){
      const paths = ['student/ac.json','ac.json','student/ac.js'];
      (async function tryLoad(i){
        if(i>=paths.length) { /* nothing */ return; }
        try{
          const res = await fetch(paths[i]);
          if(!res.ok) throw 0;
          const data = await res.json();
          const list = Array.isArray(data)? data : (data.activities || []);
          activitiesTbody.innerHTML = '';
          (list || []).forEach(a=>{
            const tr = document.createElement('tr');
            tr.innerHTML = `<td>${a.name||a.student||'—'}</td><td>${a.class||a.grade||'—'}</td><td>${a.group||a.section||'—'}</td><td>${a.type||a.activity||a.title||'—'}</td>`;
            activitiesTbody.appendChild(tr);
          });
        }catch(e){ tryLoad(i+1); }
      })(0);
    })();

    (function loadNews(){
      const paths = ['student/news.json','news.json'];
      (async function tryLoad(i){
        if(i>=paths.length){ newsContainer.innerHTML='<div>لا توجد أخبار.</div>'; return; }
        try{
          const res = await fetch(paths[i]);
          if(!res.ok) throw 0;
          const data = await res.json();
          newsContainer.innerHTML = '';
          (data || []).slice(0,10).forEach(n=>{
            const d = document.createElement('div'); d.className='news-item';
            d.innerHTML = `<strong>${n.title||n.title_ar||'خبر'}</strong><p>${n.desc||n.description||n.content||''}</p>`;
            newsContainer.appendChild(d);
            const d2 = document.createElement('div'); d2.className='news-item';
            d2.innerHTML = `<strong>${n.title||n.title_ar||'خبر'}</strong><p>${n.desc||n.description||n.content||''}</p>`;
            if(allNews) allNews.appendChild(d2);
          });
        }catch(e){ tryLoad(i+1); }
      })(0);
    })();

    // ---------- render student's own data ----------
    try{
      // 1. grades
      const gradesData = student['الدرجات'] || student.grades || student.marks || student['grades'];
      renderGrades(gradesData);

      // 2. schedule
      const sch = student['الجدول'] || student.timetable || student.schedule;
      renderSchedule(sch);

      // 3. contact links (optional fields in student)
      if(student.fb) qs('#facebookLink').href = student.fb;
      if(student.tg) qs('#telegramLink').href = student.tg;

    }catch(e){
      console.error(e);
    }

    return;
  } // end dashboard
})();
