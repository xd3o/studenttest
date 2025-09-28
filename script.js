// تسجيل الدخول
if(document.getElementById('loginBtn')){
  document.getElementById('loginBtn').addEventListener('click', function(){
    const code = document.getElementById('code').value.trim();
    const cls = document.getElementById('class').value;
    if(!code || !cls){ alert('يرجى إدخال الكود واختيار الصف'); return; }

    fetch(`data.storage.data.file/${cls}.json`)
      .then(res => res.json())
      .then(data => {
        const student = data.students.find(s => s.code === code || s.الكود === code);
        if(!student){ alert('الكود غير موجود في هذا الصف.'); return; }
        localStorage.setItem('studentCode', code);
        localStorage.setItem('studentClass', cls);
        localStorage.setItem('studentData', JSON.stringify(student));
        window.location.href = 'dashboard.html';
      })
      .catch(err => { console.error(err); alert('حدث خطأ أثناء التحقق من بيانات الطالب.'); });
  });
}

// داشبورد
if(document.querySelector('.main')){
  const student = JSON.parse(localStorage.getItem('studentData'));
  if(!student){ alert('لم يتم العثور على بيانات الطالب.'); window.location.href='index.html'; }
  else{
    document.getElementById('studentName').textContent = "مرحباً " + (student.name || student.الاسم);

    // عرض الدرجات
    const gradesTable = document.getElementById('gradesTable');
    if(student.grades || student.الدرجات){
      const g = student.grades || student.الدرجات;
      gradesTable.innerHTML = '<tr><th>المادة</th><th>الدرجة</th></tr>';
      for(let key in g){
        gradesTable.innerHTML += `<tr><td>${key}</td><td>${g[key]}</td></tr>`;
      }
    }

    // عرض الجدول الأسبوعي
    const scheduleTable = document.getElementById('scheduleTable');
    if(student.schedule || student.الجدول){
      const tt = student.schedule || student.الجدول;
      let html = '<tr><th>اليوم</th><th>الحصة 1</th><th>الحصة 2</th><th>الحصة 3</th><th>الحصة 4</th><th>الحصة 5</th><th>الحصة 6</th></tr>';
      for(let day in tt){
        html += `<tr><td>${day}</td>`;
        tt[day].forEach(p=>{ html+=`<td>${p}</td>`; });
        html += '</tr>';
      }
      scheduleTable.innerHTML = html;
    }
  }

  // أزرار جانبية
  document.getElementById('btn-home').addEventListener('click', ()=>showSection('home-section'));
  document.getElementById('btn-grades').addEventListener('click', ()=>showSection('grades-section'));
  document.getElementById('btn-timetable').addEventListener('click', ()=>showSection('timetable-section'));
  document.getElementById('btn-dark').addEventListener('click', ()=>{
    document.body.classList.toggle('dark');
    localStorage.setItem('theme', document.body.classList.contains('dark')?'dark':'light');
  });
  document.getElementById('logoutBtn').addEventListener('click', ()=>{
    localStorage.removeItem('studentCode');
    localStorage.removeItem('studentClass');
    localStorage.removeItem('studentData');
    window.location.href='index.html';
  });

  function showSection(id){
    document.querySelectorAll('.main section').forEach(s=>s.classList.add('hidden'));
    document.getElementById(id).classList.remove('hidden');
    document.querySelectorAll('.sidebar button').forEach(b=>b.classList.remove('active'));
    if(id==='home-section') document.getElementById('btn-home').classList.add('active');
    if(id==='grades-section') document.getElementById('btn-grades').classList.add('active');
    if(id==='timetable-section') document.getElementById('btn-timetable').classList.add('active');
  }

  // استرجاع الوضع المظلم
  if(localStorage.getItem('theme')==='dark'){ document.body.classList.add('dark'); }
}
