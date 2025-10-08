// فتح / غلق القائمة الجانبية
const menuBtn = document.getElementById("menuBtn");
const sidebar = document.getElementById("sidebar");
menuBtn.onclick = () => sidebar.classList.toggle("active");

// تفعيل الوضع المظلم
document.getElementById("darkToggle").onclick = () => {
  document.body.classList.toggle("dark");
};

// التنقل بين الصفحات
document.querySelectorAll(".sidebar nav ul li[data-section]").forEach(item => {
  item.addEventListener("click", () => {
    document.querySelectorAll(".page").forEach(sec => sec.classList.remove("active"));
    document.getElementById(item.dataset.section).classList.add("active");
    sidebar.classList.remove("active");
  });
});

// تحميل بيانات الطالب
const student = JSON.parse(localStorage.getItem("studentData"));
if (student) {
  document.getElementById("student-info").innerHTML = `
    <strong>الاسم:</strong> ${student["الاسم"]}<br>
    <strong>الصف:</strong> ${student["الصف"]}<br>
    <strong>الشعبة:</strong> ${student["الشعبة"]}
  `;
  document.getElementById("admin-message").textContent = student["رسالة"] || "نتمنى لكم دوام التوفيق.";

  // عرض الجداول (الدرجات + النشاطات + الجدول)
  const renderTable = (id, headers, rows) => {
    const container = document.getElementById(id);
    container.innerHTML = `
      <div class="table-container">
        <table>
          <thead><tr>${headers.map(h => `<th>${h}</th>`).join("")}</tr></thead>
          <tbody>${rows.map(r => `<tr>${r.map(c => `<td>${c}</td>`).join("")}</tr>`).join("")}</tbody>
        </table>
      </div>`;
  };

  // حذف الحصة الأولى والثانية من الدرجات وإعادة تنسيقها
  const c1 = Object.entries(student["الدرجات"]).map(([sub, d]) => [
    sub, d["الشهر الأول"], d["الشهر الثاني"], d["السعي الأول"], d["نصف السنة"]
  ]);
  const c2 = Object.entries(student["الدرجات"]).map(([sub, d]) => [
    sub, d["الكورس الثاني - الشهر الأول"], d["الكورس الثاني - الشهر الثاني"],
    d["السعي الثاني"], d["الدرجة النهائية"], d["الدرجة النهائية بعد الإكمال"]
  ]);

  renderTable("course1", ["المادة", "شهر 1", "شهر 2", "سعي 1", "نصف السنة"], c1);
  renderTable("course2", ["المادة", "شهر 1", "شهر 2", "سعي 2", "النهائي", "بعد الإكمال"], c2);

  // الجدول الأسبوعي
  const week = student["الجدول"];
  const scheduleRows = Object.entries(week).map(([day, p]) => [day, ...p]);
  renderTable("schedule-table", ["اليوم", "1", "2", "3", "4", "5", "6"], scheduleRows);

  // سجل النشاطات (من نفس التنسيق)
  const activities = student["النشاطات"] || [];
  const actRows = activities.map(a => [a["الاسم"], a["الصف"], a["الشعبة"], a["النشاط"]]);
  renderTable("activities-list", ["الاسم", "الصف", "الشعبة", "النشاط"], actRows);
}

// الأخبار
fetch("news.json")
  .then(res => res.json())
  .then(data => {
    const homeNews = document.getElementById("home-news");
    const allNews = document.getElementById("news-list");

    const renderNews = arr =>
      arr.map(n => `
        <div class="news-item">
          <h4>${n.title}</h4>
          <small>${n.date}</small>
          <p>${n.description}</p>
        </div>`).join("");

    homeNews.innerHTML = renderNews(data.slice(0, 3));
    allNews.innerHTML = renderNews(data);
  })
  .catch(() => {
    document.getElementById("home-news").textContent = "تعذر تحميل الأخبار.";
  });
