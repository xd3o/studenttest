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
  const newsList = document.getElementById('home-news');

fetch('news.json')
  .then(res => res.json())
  .then(data => {
    newsList.innerHTML = data.map(item => `
      <div class="news-item">
        <h3>${item.title}</h3>
        <p class="news-date">${item.date}</p>
        <p class="news-desc">${item.description}</p>
      </div>
    `).join('');
  });
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
  if(!student || !student["الدرجات"]){ c1.innerHTML = "<div class='card'>لا توجد درجات.</div>"; c2.innerHTML = "<div class='card'>لا توجد درجات.</div>"; return; }

  const grades = student["الدرجات"];
  // كورس1
  let html1 = "<table><thead><tr><th>المادة</th><th>شهر 1</th><th>شهر 2</th><th>حصة 1</th><th>نصف السنة</th></tr></thead><tbody>";
  for(const subj in grades){
    const d = grades[subj];
    html1 += `<tr><td>${subj}</td><td>${d["الشهر الأول"] ?? d["شهر1"] ?? ""}</td><td>${d["الشهر الثاني"] ?? d["شهر2"] ?? ""}</td><td>${d["الحصة الأولى"] ?? d["حصة1"] ?? ""}</td><td>${d["نصف السنة"] ?? d["نصف"] ?? ""}</td></tr>`;
  }
  html1 += "</tbody></table>";
  c1.innerHTML = html1;

  // كورس2
  let html2 = "<table><thead><tr><th>المادة</th><th>شهر 1</th><th>شهر 2</th><th>حصة 2</th><th>السعي السنوي</th><th>النهائي</th><th>بعد الإكمال</th></tr></thead><tbody>";
  for(const subj in grades){
    const d = grades[subj];
    html2 += `<tr><td>${subj}</td><td>${d["الكورس الثاني - الشهر الأول"] ?? d["شهر1_2"] ?? ""}</td><td>${d["الكورس الثاني - الشهر الثاني"] ?? d["شهر2_2"] ?? ""}</td><td>${d["الحصة الثانية"] ?? d["حصة2"] ?? ""}</td><td>${d["السعي السنوي"] ?? d["سعي_سنوي"] ?? ""}</td><td>${d["الدرجة النهائية"] ?? d["نهائي"] ?? ""}</td><td>${d["الدرجة النهائية بعد الإكمال"] ?? d["بعد_الإكمال"] ?? ""}</td></tr>`;
  }
  html2 += "</tbody></table>";
  c2.innerHTML = html2;
}

/* عرض الجدول الأسبوعي من بيانات الطالب */
function renderSchedule(student){
  const el = document.getElementById("schedule-table");
  if(!student || !student["الجدول"]){ el.innerHTML = "<div class='card'>لا يوجد جدول أسبوعي.</div>"; return; }
  const week = student["الجدول"];
  // رؤوس الأيام
  const days = Object.keys(week);
  // بناء جدول: أعمدة: اليوم + 6 حصص
  let html = "<table><thead><tr><th>اليوم</th><th>حصة1</th><th>حصة2</th><th>حصة3</th><th>حصة4</th><th>حصة5</th><th>حصة6</th></tr></thead><tbody>";
  for(const day of days){
    const row = week[day] || [];
    // ضمان 6 خلايا
    const cells = [];
    for(let i=0;i<6;i++) cells.push(`<td>${row[i] ?? ""}</td>`);
    html += `<tr><td>${day}</td>` + cells.join("") + `</tr>`;
  }
  html += "</tbody></table>";
  el.innerHTML = html;
}

/* عرض معلومات الطالب ورسالة الإدارة */
function renderStudentHome(student){
  const si = document.getElementById("student-info");
  if(!student){ si.innerHTML = "<div>لا توجد بيانات.</div>"; return; }
  const name = student["الاسم"] || student.name || student.fullname || "";
  const cls = student["الصف"] || student.class || "";
  const sec = student["الشعبة"] || student.section || "";
  si.innerHTML = `<p><strong>الاسم:</strong> ${name}</p><p><strong>الصف:</strong> ${cls} - ${sec}</p>`;
  const admin = document.getElementById("admin-message");
  const msg = student["رسالة"] || student["adminMessage"] || student.message || "";
  admin.innerHTML = msg ? `<div>${msg}</div>` : `<div>لا توجد رسالة من الإدارة.</div>`;
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
