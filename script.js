// Mapping الصفوف إلى ملفات البيانات
const classMap = {
  "رابع أ": "r4_a", "رابع ب": "r4_b", "رابع ج": "r4_c", "رابع د": "r4_d", "رابع هـ": "r4_e", "رابع و": "r4_f",
  "خامس أ": "r5_a", "خامس ب": "r5_b", "خامس ج": "r5_c", "خامس د": "r5_d", "خامس هـ": "r5_e", "خامس و": "r5_f",
  "سادس أ": "r6_a", "سادس ب": "r6_b", "سادس ج": "r6_c", "سادس د": "r6_d", "سادس هـ": "r6_e", "سادس و": "r6_f"
};

// تسجيل الدخول
function login() {
  const code = document.getElementById("code").value.trim().toUpperCase();
  const studentClass = document.getElementById("class").value.trim();
  if(!code || !studentClass){ alert("يرجى إدخال الكود والصف"); return; }

  const key = classMap[studentClass];
  if(!key){ alert("الصف غير معروف"); return; }

  const script = document.createElement("script");
  script.src = `student_data_files/data_${key}.js`;
  script.onload = ()=>{
    if(typeof students === "undefined"){ alert("تعذر تحميل بيانات الطلاب"); return; }
    const student = students.find(s => s["الكود"]===code);
    if(!student){ alert("الكود غير صحيح"); return; }
    localStorage.setItem("studentData", JSON.stringify(student));
    window.location.href = "dashboard.html";
  };
  script.onerror = ()=>alert("تعذر تحميل بيانات الصف المحدد");
  document.body.appendChild(script);
}

// Helpers للداشبورد
function q(sel){ return document.querySelector(sel); }
function showSection(id){
  document.querySelectorAll('.main section').forEach(s=>s.classList.add('hidden'));
  const el = document.getElementById(id);
  if(el) el.classList.remove('hidden');
  document.querySelectorAll('.sidebar button').forEach(b=>b.classList.remove('active'));
  const map = { 'home-section':'btn-home','grades-section':'btn-grades','timetable-section':'btn-timetable','activities-section':'btn-activities','contact-section':'btn-contact' };
  const btn = document.getElementById(map[id]);
  if(btn) btn.classList.add('active');
  window.scrollTo({top:0,behavior:'smooth'});
}

// تحميل بيانات الطالب عند فتح الداشبورد
const student = JSON.parse(localStorage.getItem('studentData') || 'null');
if(student){
  q('#student-name').textContent = student['الاسم'];
  q('#student-class').textContent = student['الصف'];
  q('#student-section').textContent = student['الشعبة'];
  if(student['رسالة']){ q('#admin-msg').style.display='block'; q('#admin-msg').textContent = student['رسالة']; }

  // Grades
  const grades = student['الدرجات'] || {};
  let html = '<div style="overflow:auto"><table><thead><tr><th>المادة</th><th>نوع</th><th>الدرجة</th></tr></thead><tbody>';
  for(const subj in grades){ for(const k in grades[subj]){ html += `<tr><td>${subj}</td><td>${k}</td><td>${grades[subj][k]}</td></tr>`; } }
  html += '</tbody></table></div>'; q('#grades-container').innerHTML = html;

  // Timetable
  const tt = student['الجدول'] || {};
  let tthtml = '<div style="overflow:auto"><table><thead><tr><th>اليوم</th><th>الحصة 1</th><th>الحصة 2</th><th>الحصة 3</th><th>الحصة 4</th><th>الحصة 5</th><th>الحصة 6</th></tr></thead><tbody>';
  for(const d in tt){ tthtml += `<tr><td>${d}</td>`+tt[d].map(x=>`<td>${x||'—'}</td>`).join('')+'</tr>'; }
  tthtml += '</tbody></table></div>'; q('#timetable-container').innerHTML = tthtml;
}

// Sidebar buttons
q('#btn-home').addEventListener('click',()=> showSection('home-section'));
q('#btn-grades').addEventListener('click',()=> showSection('grades-section'));
q('#btn-timetable').addEventListener('click',()=> showSection('timetable-section'));
q('#btn-activities').addEventListener('click',()=> showSection('activities-section'));
q('#btn-contact').addEventListener('click',()=> showSection('contact-section'));

// Dark mode
const darkBtn = q('#btn-dark');
darkBtn.addEventListener('click',()=>{
  document.body.classList.toggle('dark');
  darkBtn.classList.toggle('active');
  localStorage.setItem('darkMode', document.body.classList.contains('dark')?'1':'0');
});
if(localStorage.getItem('darkMode')==='1'){ document.body.classList.add('dark'); darkBtn.classList.add('active'); }

// Logout
q('#logoutBtn').addEventListener('click',()=>{ localStorage.removeItem('studentData'); window.location.href='index.html'; });
