// الصفوف
const classMap = {
  "رابع أ":"r4_a","رابع ب":"r4_b","رابع ج":"r4_c","رابع د":"r4_d","رابع هـ":"r4_e","رابع و":"r4_f",
  "خامس أ":"r5_a","خامس ب":"r5_b","خامس ج":"r5_c","خامس د":"r5_d","خامس هـ":"r5_e","خامس و":"r5_f",
  "سادس أ":"r6_a","سادس ب":"r6_b","سادس ج":"r6_c","سادس د":"r6_d","سادس هـ":"r6_e","سادس و":"r6_f"
};

// تسجيل الدخول
function login(){
  const code = document.getElementById("code").value.trim().toUpperCase();
  const studentClass = document.getElementById("class").value.trim();
  if(!code||!studentClass){ alert("يرجى إدخال الكود واختيار الصف."); return; }
  const key = classMap[studentClass];
  if(!key){ alert("الصف غير معروف."); return; }

  const script = document.createElement("script");
  script.src = `student_data_files/data_${key}.js`;
  script.onload = function(){
    if(typeof students==="undefined"){ alert("تعذر تحميل بيانات الطلاب."); return; }
    const student = students.find(s=>s["الكود"]===code);
    if(!student){ alert("الكود غير صحيح أو لا ينتمي للصف المحدد."); return; }
    localStorage.setItem("studentData",JSON.stringify(student));
    window.location.href="dashboard.html";
  };
  script.onerror=function(){ alert("تعذر تحميل بيانات الصف المحدد. تأكد من اختيار الصف الصحيح."); };
  document.body.appendChild(script);
}

// Dashboard
const student = JSON.parse(localStorage.getItem("studentData")||'null');
if(!student){ alert("لم يتم العثور على بيانات الطالب. الرجاء تسجيل الدخول."); window.location.href='index.html'; }
else{
  document.getElementById("student-name").textContent = student["الاسم"];
  document.getElementById("student-class").textContent = student["الصف"];
  document.getElementById("student-section").textContent = student["الشعبة"];
  const adminMsg = student["رسالة"]||"نتمنى لكم النجاح والتوفيق.";
  const adminEl = document.getElementById("admin-msg");
  if(adminMsg){ adminEl.style.display="block"; adminEl.textContent=adminMsg; }

  // الأخبار
  fetch('/student/news.json').then(r=>r.json()).then(list=>{
    const container = document.getElementById("news-container");
    container.innerHTML="";
    list.sort((a,b)=> new Date(b.date||b.created_at)-new Date(a.date||a.created_at));
    list.slice(0,3).forEach(n=>{
      const card=document.createElement("div");
      card.className="news-card";
      const h4=document.createElement("h4"); h4.textContent=n.title||n.title_ar||'خبر'; card.appendChild(h4);
      if(n.date){ const time=document.createElement("time"); time.textContent=n.date; card.appendChild(time); }
      if(n.description){ const p=document.createElement("p"); p.textContent=n.description; card.appendChild(p); }
      container.appendChild(card);
    });
  }).catch(e=>console.warn(e));
}

// الهامبرغر sidebar
const sidebar=document.getElementById("sidebar");
document.getElementById("menu-btn").addEventListener("click",()=>{ sidebar.classList.toggle("active"); });

// أزرار القائمة
document.getElementById("btn-home").addEventListener("click",()=>{ showSection("home-section"); });
document.getElementById("btn-grades").addEventListener("click",()=>{ showSection("grades-section"); });
document.getElementById("btn-timetable").addEventListener("click",()=>{ showSection("timetable-section"); });
document.getElementById("btn-activities").addEventListener("click",()=>{ showSection("activities-section"); });
document.getElementById("logoutBtn").addEventListener("click",()=>{ localStorage.removeItem("studentData"); window.location.href='index.html'; });

// إظهار القسم المطلوب
function showSection(id){
  document.querySelectorAll('main section').forEach(s=>s.classList.add('hidden'));
  document.getElementById(id).classList.remove('hidden');
  document.querySelectorAll('.sidebar button').forEach(b=>b.classList.remove('active'));
  const map={"home-section":"btn-home","grades-section":"btn-grades","timetable-section":"btn-timetable","activities-section":"btn-activities"};
  const btn=document.getElementById(map[id]);
  if(btn) btn.classList.add('active');
  window.scrollTo({top:0,behavior:'smooth'});
}

// الوضع المظلم
const darkBtn=document.getElementById("btn-dark");
darkBtn.addEventListener("click",()=>{
  document.body.classList.toggle("dark");
  darkBtn.classList.toggle("active");
  localStorage.setItem("darkMode",document.body.classList.contains("dark")?'1':'0');
});
if(localStorage.getItem("darkMode")==='1'){ document.body.classList.add("dark"); darkBtn.classList.add("active"); }
