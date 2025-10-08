// قراءة جلسة الطالب (key: studentData أو studentSession)
const sessionKeyCandidates = ["studentData","studentSession","student"];
function readStudentSession(){
  for(const k of sessionKeyCandidates){
    const raw = localStorage.getItem(k);
    if(raw){
      try { return JSON.parse(raw); } catch(e){}
    }
  }
  return null;
}

/* تنقل بين الصفحات داخل الداشبورد */
function showPage(id){
  document.querySelectorAll(".page").forEach(p=>p.classList.remove("active"));
  const el = document.getElementById(id);
  if(el) el.classList.add("active");
}

/* تحميل الأخبار من news.json */
async function loadNews(){
  const target = document.getElementById("news-list");
  const homeTarget = document.getElementById("home-news");
  try{
    const res = await fetch("news.json",{cache:"no-store"});
    if(!res.ok) throw new Error("no news");
    const data = await res.json();
    // عرض كامل للأخبار في صفحة الأخبار
    if(target) target.innerHTML = data.map(n=>`<div class="news-item"><h4>${n.title||''}</h4><p>${n.content||''}</p></div>`).join("");
    // عرض مختصر (أول 3) في الرئيسية
    if(homeTarget) homeTarget.innerHTML = (data.slice(0,3).map(n=>`<div class="news-item"><h4>${n.title||''}</h4><p>${n.content||''}</p></div>`)).join("");
  }catch(e){
    if(target) target.innerHTML = "<div class='card'>تعذر تحميل الأخبار.</div>";
    if(homeTarget) homeTarget.innerHTML = "<div class='card'>تعذر تحميل الأخبار.</div>";
  }
}

/* تحميل النشاطات من ac.json */
async function loadActivities(){
  const el = document.getElementById("activities-list");
  try{
    const res = await fetch("ac.json",{cache:"no-store"});
    if(!res.ok) throw new Error("no activities");
    const data = await res.json();
    if(!Array.isArray(data)) throw new Error("bad activities");
    el.innerHTML = `<table><thead><tr><th>الاسم</th><th>الصف</th><th>الشعبة</th><th>نوع النشاط</th></tr></thead><tbody>` +
      data.map(a=>`<tr><td>${a.name||a.الاسم||""}</td><td>${a.class||a.الصف||""}</td><td>${a.section||a.الشعبة||""}</td><td>${a.type||a.نوع||""}</td></tr>`).join("") +
      `</tbody></table>`;
  }catch(e){
    el.innerHTML = "<div class='card'>تعذر تحميل جدول النشاطات.</div>";
  }
}

/* عرض الدرجات من بيانات الطالب (بنية مرنة) */
function renderGrades(student){
  const c1 = document.getElementById("course1");
  const c2 = document.getElementById("course2");
  if(!student || !student["الدرجات"]){ 
    c1.innerHTML = "<div class='card'>لا توجد درجات.</div>"; 
    c2.innerHTML = "<div class='card'>لا توجد درجات.</div>"; 
    return; 
  }

  const grades = student["الدرجات"];

  // الكورس الأول
  let html1 = `
  <table>
    <thead>
      <tr>
        <th>المادة</th>
        <th>شهر 1</th>
        <th>شهر 2</th>
        <th>سعي 1</th>
        <th>نصف السنة</th>
      </tr>
    </thead>
    <tbody>`;
  for(const subj in grades){
    const d = grades[subj];
    html1 += `
      <tr>
        <td>${subj}</td>
        <td>${d["الكورس الأول - الشهر الأول"] ?? d["شهر1_1"] ?? d["شهر1"] ?? ""}</td>
        <td>${d["الكورس الأول - الشهر الثاني"] ?? d["شهر2_1"] ?? d["شهر2"] ?? ""}</td>
        <td>${d["سعي1"] ?? d["السعي الأول"] ?? ""}</td>
        <td>${d["نصف السنة"] ?? d["نصف"] ?? ""}</td>
      </tr>`;
  }
  html1 += "</tbody></table>";
  c1.innerHTML = html1;

  // الكورس الثاني
  let html2 = `
  <table>
    <thead>
      <tr>
        <th>المادة</th>
        <th>شهر 1</th>
        <th>شهر 2</th>
        <th>سعي 2</th>
        <th>السعي السنوي</th>
        <th>الدرجة النهائية</th>
        <th>بعد الإكمال</th>
      </tr>
    </thead>
    <tbody>`;
  for(const subj in grades){
    const d = grades[subj];
    html2 += `
      <tr>
        <td>${subj}</td>
        <td>${d["الكورس الثاني - الشهر الأول"] ?? d["شهر1_2"] ?? ""}</td>
        <td>${d["الكورس الثاني - الشهر الثاني"] ?? d["شهر2_2"] ?? ""}</td>
        <td>${d["سعي2"] ?? d["السعي الثاني"] ?? ""}</td>
        <td>${d["السعي السنوي"] ?? d["سعي_سنوي"] ?? ""}</td>
        <td>${d["الدرجة النهائية"] ?? d["نهائي"] ?? ""}</td>
        <td>${d["الدرجة النهائية بعد الإكمال"] ?? d["بعد_الإكمال"] ?? ""}</td>
      </tr>`;
  }
  html2 += "</tbody></table>";
  c2.innerHTML = html2;
}

/* تفعيل الوضع المظلم */
function applyDarkFromStorage(){
  if(localStorage.getItem("darkMode")==="on") document.body.classList.add("dark");
}
function toggleDark(){
  document.body.classList.toggle("dark");
  localStorage.setItem("darkMode", document.body.classList.contains("dark") ? "on" : "off");
}

/* تهيئة الواجهة */
document.addEventListener("DOMContentLoaded", async () => {
  // Sidebar toggle
  const menuBtn = document.getElementById("menuBtn");
  const sidebar = document.getElementById("sidebar");
  menuBtn.addEventListener("click", ()=> {
    const open = sidebar.classList.toggle("active");
    sidebar.setAttribute("aria-hidden", !open);
  });

  // sidebar navigation
  document.querySelectorAll(".sidebar nav li[data-section]").forEach(li=>{
    li.addEventListener("click", ()=> {
      showPage(li.getAttribute("data-section"));
      sidebar.classList.remove("active");
      sidebar.setAttribute("aria-hidden", true);
    });
  });

  // dark toggle
  const darkToggle = document.getElementById("darkToggle");
  if(darkToggle) darkToggle.addEventListener("click", toggleDark);
  applyDarkFromStorage();

  // روابط التواصل بالفعل موجودة في HTML (تم وضعها حسب طلبك)

  // جلب جلسة الطالب
  const student = readStudentSession();
  if(!student){
    // لو ما فيه جلسة نرجع index
    window.location.href = "index.html";
    return;
  }

  // عرض معلومات المنزل
  renderStudentHome(student);

  // جلب الأخبار والنشاطات ودرجات وجدول
  await loadNews();
  await loadActivities();
  renderGrades(student);
  renderSchedule(student);
});
