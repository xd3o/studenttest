// زر القائمة الجانبية
const menuToggle = document.getElementById("menu-toggle");
const sidebar = document.getElementById("sidebar");
const sections = document.querySelectorAll(".section");
const menuItems = document.querySelectorAll(".sidebar ul li");

// تفعيل / إخفاء القائمة
menuToggle.addEventListener("click", () => {
  sidebar.classList.toggle("active");
});

// التنقل بين الأقسام
menuItems.forEach(item => {
  item.addEventListener("click", () => {
    const sectionId = item.getAttribute("data-section");

    if (sectionId === "darkmode") {
      document.body.classList.toggle("dark");
      return;
    }

    sections.forEach(sec => sec.classList.remove("active"));
    document.getElementById(sectionId).classList.add("active");

    sidebar.classList.remove("active");
  });
});

// تحميل بيانات الطالب (نفس آلية النظام السابق)
function loadStudentData() {
  if (typeof studentData !== "undefined") {
    const studentInfo = document.getElementById("student-info");
    studentInfo.innerHTML = `
      <p><strong>الاسم:</strong> ${studentData.name}</p>
      <p><strong>الصف:</strong> ${studentData.class}</p>
      <p><strong>القونة:</strong> ${studentData.id}</p>
      <p><strong>الشعبة:</strong> ${studentData.section}</p>
    `;

    const adminMsg = document.getElementById("admin-message");
    adminMsg.innerHTML = <p>${studentData.adminMessage || "لا توجد رسالة"}</p>;
  }
}

// تحميل الدرجات (الآلية السابقة)
function loadGrades() {
  if (typeof gradesData !== "undefined") {
    const gradesTable = document.getElementById("grades-table");
    gradesTable.innerHTML = createTable(gradesData);
  }
}

// تحميل الجدول الأسبوعي (الآلية السابقة)
function loadSchedule() {
  if (typeof scheduleData !== "undefined") {
    const scheduleTable = document.getElementById("schedule-table");
    scheduleTable.innerHTML = createTable(scheduleData);
  }
}

// تحميل جدول النشاطات من ac.json
async function loadActivities() {
  try {
    const res = await fetch("ac.json");
    const data = await res.json();
    const activitiesTable = document.getElementById("activities-table");
    activitiesTable.innerHTML = createTable(data);
  } catch (e) {
    console.error("خطأ بتحميل النشاطات:", e);
  }
}

// تحميل الأخبار من news.json
async function loadNews() {
  try {
    const res = await fetch("news.json");
    const data = await res.json();
    const newsList = document.getElementById("news-list");
    const homeNews = document.getElementById("home-news");

    let newsHtml = "";
    data.forEach(news => {
      newsHtml += <div class="card"><h4>${news.title}</h4><p>${news.content}</p></div>;
    });

    newsList.innerHTML = newsHtml;
    homeNews.innerHTML = newsHtml;
  } catch (e) {
    console.error("خطأ بتحميل الأخبار:", e);
  }
}

// إنشاء جدول من البيانات
function createTable(data) {
  let html = "<table border='1' style='width:100%; border-collapse: collapse;'>";
  data.forEach(row => {
    html += "<tr>";
    row.forEach(cell => {
      html += <td style="padding:8px; text-align:center;">${cell}</td>;
    });
    html += "</tr>";
  });
  html += "</table>";
  return html;
}

// عند تحميل الصفحة
window.addEventListener("DOMContentLoaded", () => {
  loadStudentData();
  loadGrades();
  loadSchedule();
  loadActivities();
  loadNews();
});
