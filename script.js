// وظائف لوحة التحكم
document.addEventListener("DOMContentLoaded", () => {
  const menuBtn = document.getElementById("menuBtn");
  const sidebar = document.getElementById("sidebar");
  const navBtns = Array.from(document.querySelectorAll(".nav-btn"));
  const pages = Array.from(document.querySelectorAll(".page"));
  const darkToggle = document.getElementById("darkToggle");

  // فتح/إغلاق القائمة
  function toggleSidebar() {
    const open = sidebar.classList.toggle("open");
    sidebar.setAttribute("aria-hidden", !open);
  }
  menuBtn.addEventListener("click", toggleSidebar);

  // التنقل بين الصفحات
  function showPage(id) {
    pages.forEach(p => p.classList.remove("active"));
    const target = document.getElementById(id);
    if (target) target.classList.add("active");
    window.scrollTo(0, 0);
  }

  // التعامل مع الأزرار
  navBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      const target = btn.dataset.target;
      if (target) showPage(target);
      if (btn.id !== "darkToggle") {
        sidebar.classList.remove("open");
        sidebar.setAttribute("aria-hidden", "true");
      }
    });
  });

  // الوضع المظلم
  function applyDarkMode(on) {
    if (on) document.body.classList.add("dark");
    else document.body.classList.remove("dark");
    localStorage.setItem("darkMode", on ? "1" : "0");
  }
  const storedDark = localStorage.getItem("darkMode");
  applyDarkMode(storedDark === "1");
  darkToggle.addEventListener("click", () => {
    const isDark = document.body.classList.toggle("dark");
    localStorage.setItem("darkMode", isDark ? "1" : "0");
  });

  // بيانات الطالب
  let student = null;
  try {
    student = JSON.parse(localStorage.getItem("studentData"));
  } catch (e) { student = null; }

  function renderStudentCard() {
    const nameEl = document.getElementById("stuName");
    const infoEl = document.getElementById("stuInfo");
    const messageEl = document.getElementById("messageText");

    if (!student) {
      nameEl.textContent = "لم يتم العثور على بيانات الطالب.";
      infoEl.textContent = "";
      messageEl.textContent = "لا توجد رسائل.";
      return;
    }

    nameEl.textContent = student["الاسم"] || "اسم غير معروف";
    infoEl.textContent = `${student["الصف"] || ""} - شعبة ${student["الشعبة"] || ""}`;
    messageEl.textContent = student["رسالة_الإدارة"] || "لا توجد رسائل من الإدارة.";
  }
  renderStudentCard();

  // عرض الدرجات
  function renderGrades() {
    const container = document.getElementById("gradesContent");
    if (!student) { container.innerHTML = "<p>لا توجد بيانات.</p>"; return; }
    const grades = student["الدرجات"] || {};
    let html = "";
    for (const subj in grades) {
      html += `<h3>${subj}</h3><table class="data-table"><tbody>`;
      for (const key in grades[subj]) {
        html += `<tr><td>${key}</td><td>${grades[subj][key]}</td></tr>`;
      }
      html += "</tbody></table>";
    }
    container.innerHTML = html || "<p>لا توجد درجات.</p>";
  }
  renderGrades();

  // عرض الجدول
  function renderTimetable() {
    const container = document.getElementById("timetableContent");
    const tableData = student && student["الجدول"];
    if (!tableData) {
      container.innerHTML = "<p>لا يوجد جدول.</p>";
      return;
    }
    let html = "<table class='data-table'><tbody>";
    for (const day in tableData) {
      html += `<tr><td>${day}</td><td>${tableData[day].join(" ، ")}</td></tr>`;
    }
    html += "</tbody></table>";
    container.innerHTML = html;
  }
  renderTimetable();

  // الأخبار
  async function loadNewsList(selector) {
    try {
      const res = await fetch("news.json");
      const data = await res.json();
      document.getElementById(selector).innerHTML =
        data.map(n => `<div><strong>${n.title}</strong> - ${n.excerpt}</div>`).join("");
    } catch {
      document.getElementById(selector).innerHTML = "<p>لا توجد أخبار.</p>";
    }
  }
  loadNewsList("newsList");
  loadNewsList("newsPageList");

  // النشاطات
  async function loadActivities() {
    try {
      const res = await fetch("ac.json");
      const data = await res.json();
      document.getElementById("activitiesList").innerHTML =
        `<table class="data-table"><tbody>${
          data.map(a => `<tr><td>${a.name}</td><td>${a.grade}</td><td>${a.section}</td><td>${a.type}</td></tr>`).join("")
        }</tbody></table>`;
    } catch {
      document.getElementById("activitiesList").innerHTML = "<p>لا توجد نشاطات.</p>";
    }
  }
  loadActivities();

  // روابط التواصل
  document.getElementById("fbLink").href = "https://facebook.com/yourpage";
  document.getElementById("tgLink").href = "https://t.me/yourchannel";
});
