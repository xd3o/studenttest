const classMap = {
  "رابع أ":"r4_a","رابع ب":"r4_b","رابع ج":"r4_c",
  "خامس أ":"r5_a","خامس ب":"r5_b","خامس ج":"r5_c",
  "سادس أ":"r6_a","سادس ب":"r6_b","سادس ج":"r6_c"
};

// تسجيل الدخول
function login() {
  const code = document.getElementById("code").value.trim().toUpperCase();
  const studentClass = document.getElementById("class").value;
  if(!code || !studentClass){ alert("يرجى إدخال الكود واختيار الصف."); return; }
  const key = classMap[studentClass];
  if(!key){ alert("الصف غير معروف."); return; }

  const script = document.createElement("script");
  script.src = `student_data_files/data_${key}.js`;
  script.onload = ()=>{
    if(typeof students==="undefined"){ alert("تعذر تحميل بيانات الطلاب."); return; }
    const student = students.find(s=>s["الكود"]===code);
    if(!student){ alert("الكود غير صحيح أو لا ينتمي للصف المحدد."); return; }
    localStorage.setItem("studentData",JSON.stringify(student));
    window.location.href="dashboard.html";
  };
  script.onerror = ()=>alert("تعذر تحميل بيانات الصف.");
  document.body.appendChild(script);
}

// Dashboard JS
document.addEventListener("DOMContentLoaded",()=>{
  const student = JSON.parse(localStorage.getItem('studentData')||'null');
  if(!student){ alert('لم يتم العثور على بيانات الطالب. الرجاء تسجيل الدخول.'); window.location.href='index.html'; return; }

  // بيانات الطالب
  document.getElementById('student-name').textContent = student['الاسم'];
  document.getElementById('student-class').textContent = student['الصف'];
  document.getElementById('student-section').textContent = student['الشعبة'];

  const adminMsg = student['رسالة_الإدارة']||student['adminMessage'];
  if(adminMsg){ const el=document.getElementById('admin-msg'); el.style.display='block'; el.innerHTML=adminMsg; }

  // Sidebar Toggle
  const sidebar = document.getElementById('sidebar');
  const menuBtn = document.getElementById('menu-btn');
  menuBtn.addEventListener('click',()=> sidebar.classList.toggle('sidebar-visible'));

  // Sidebar Buttons
  function showSection(id){
    document.querySelectorAll('.main-section').forEach(s=>s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
    sidebar.classList.remove('sidebar-visible');
  }

  document.getElementById('btn-home').addEventListener('click',()=>showSection('home-section'));
  document.getElementById('btn-grades').addEventListener('click',()=>showSection('grades-section'));
  document.getElementById('btn-timetable').addEventListener('click',()=>showSection('timetable-section'));
  document.getElementById('btn-activities').addEventListener('click',()=>showSection('activities-section'));
  document.getElementById('btn-contact').addEventListener('click',()=>showSection('contact-section'));

  // Logout
  document.getElementById('logoutBtn').addEventListener('click',()=>{
    localStorage.removeItem('studentData'); window.location.href='index.html';
  });

  // Dark mode toggle
  document.getElementById('btn-dark').addEventListener('click',()=>{
    document.body.classList.toggle('dark');
  });

  // Load News
  fetch('student/news.json')
  .then(res=>res.json())
  .then(news=>{
    const container = document.getElementById('news-container'); container.innerHTML='';
    news.forEach(n=>{
      const div=document.createElement('div'); div.className='news-item';
      div.innerHTML=`<h3>${n.title}</h3><p>${n.content}</p>`;
      container.appendChild(div);
    });
  })
  .catch(()=>console.log('تعذر تحميل الأخبار'));
});
