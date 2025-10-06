/* ==========================================================
   القسم الأول : تسجيل الدخول (index.html)
========================================================== */
function login() {
  const code = document.getElementById("code").value.trim();
  const studentClass = document.getElementById("class").value;

  if (!code || !studentClass) {
    alert("⚠️ الرجاء إدخال الكود واختيار الصف/الشعبة");
    return;
  }

  // اسم الملف بناءً على الصف والشعبة
  const fileMap = {
    "رابع أ": "data_r4_a.js", "رابع ب": "data_r4_b.js", "رابع ج": "data_r4_c.js",
    "رابع د": "data_r4_d.js", "رابع هـ": "data_r4_e.js", "رابع و": "data_r4_f.js",
    "خامس أ": "data_r5_a.js", "خامس ب": "data_r5_b.js", "خامس ج": "data_r5_c.js",
    "خامس د": "data_r5_d.js", "خامس هـ": "data_r5_e.js", "خامس و": "data_r5_f.js",
    "سادس أ": "data_r6_a.js", "سادس ب": "data_r6_b.js", "سادس ج": "data_r6_c.js",
    "سادس د": "data_r6_d.js", "سادس هـ": "data_r6_e.js", "سادس و": "data_r6_f.js"
  };

  const fileName = fileMap[studentClass];
  if (!fileName) {
    alert("⚠️ الشعبة غير صحيحة");
    return;
  }

  // تحميل بيانات الصف
  fetch(`student_data_files/${fileName}`)
    .then(res => res.text())
    .then(jsContent => {
      eval(jsContent); // يعرّف studentData

      const student = studentData.find(s => s.id == code);
      if (student) {
        // حفظ بيانات الطالب
        localStorage.setItem("student", JSON.stringify(student));
        localStorage.setItem("darkMode", "off"); // افتراضي
        window.location.href = "dashboard.html";
      } else {
        alert("❌ الكود غير صحيح لهذا الصف/الشعبة");
      }
    })
    .catch(err => {
      console.error(err);
      alert("⚠️ لم يتم العثور على ملف بيانات الصف");
    });
}

/* ==========================================================
   القسم الثاني : الداشبورد (dashboard.html)
========================================================== */
window.addEventListener("DOMContentLoaded", () => {
  const student = JSON.parse(localStorage.getItem("student"));
  if (!student && window.location.pathname.includes("dashboard.html")) {
    window.location.href = "index.html";
    return;
  }

  if (student) {
    // تعبئة بيانات الطالب في الرئيسية
    const studentInfo = document.getElementById("student-info");
    if (studentInfo) {
      studentInfo.innerHTML = `
        <p><strong>الاسم:</strong> ${student.name}</p>
        <p><strong>الصف:</strong> ${student.class}</p>
        <p><strong>القونة:</strong> ${student.id}</p>
        <p><strong>الشعبة:</strong> ${student.section}</p>
      `;
    }

    // رسالة الإدارة (مخزنة بنفس ملف الطالب)
    const adminMsg = document.getElementById("admin-message");
    if (adminMsg) {
      adminMsg.innerHTML = `<div class="card">${student.adminMessage || "لا توجد رسالة من الإدارة"}</div>`;
    }
  }

  // تفعيل القائمة الجانبية
  const sidebar = document.getElementById("sidebar");
  const menuToggle = document.getElementById("menu-toggle");
  const sections = document.querySelectorAll(".section");
  const menuItems = document.querySelectorAll(".sidebar ul li");

  if (menuToggle) {
    menuToggle.addEventListener("click", () => {
      sidebar.classList.toggle("active");
    });
  }

  menuItems.forEach(item => {
    item.addEventListener("click", () => {
      const sectionId = item.getAttribute("data-section");

      if (sectionId === "darkmode") {
        toggleDarkMode();
        return;
      }

      sections.forEach(sec => sec.classList.remove("active"));
      document.getElementById(sectionId).classList.add("active");

      sidebar.classList.remove("active");
    });
  });

  // تحميل الأخبار
  fetch("news.json")
    .then(res => res.json())
    .then(data => {
      const newsList = document.getElementById("news-list");
      const homeNews = document.getElementById("home-news");
      if (newsList && homeNews) {
        let html = "";
        data.forEach(n => {
          html += `<div class="card"><h4>${n.title}</h4><p>${n.content}</p></div>`;
        });
        newsList.innerHTML = html;
        homeNews.innerHTML = html;
      }
    });

  // تحميل النشاطات
  fetch("ac.json")
    .then(res => res.json())
    .then(data => {
      const activitiesTable = document.getElementById("activities-table");
      if (activitiesTable) {
        activitiesTable.innerHTML = createTable(data);
      }
    });

  // تحميل درجات وجدول أسبوعي (بنفس آلية النظام القديم)
  if (typeof gradesData !== "undefined") {
    const gradesTable = document.getElementById("grades-table");
    if (gradesTable) gradesTable.innerHTML = createTable(gradesData);
  }

  if (typeof scheduleData !== "undefined") {
    const scheduleTable = document.getElementById("schedule-table");
    if (scheduleTable) scheduleTable.innerHTML = createTable(scheduleData);
  }

  // وضع مظلم حسب التخزين
  if (localStorage.getItem("darkMode") === "on") {
    document.body.classList.add("dark");
  }

  // زر تسجيل الخروج
  const logoutBtn = document.getElementById("logout");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      localStorage.clear();
      window.location.href = "index.html";
    });
  }
});

/* ==========================================================
   دوال مساعدة
========================================================== */
function createTable(data) {
  let html = "<table><tbody>";
  data.forEach(row => {
    html += "<tr>";
    row.forEach(cell => {
      html += `<td>${cell}</td>`;
    });
    html += "</tr>";
  });
  html += "</tbody></table>";
  return html;
}

function toggleDarkMode() {
  document.body.classList.toggle("dark");
  if (document.body.classList.contains("dark")) {
    localStorage.setItem("darkMode", "on");
  } else {
    localStorage.setItem("darkMode", "off");
  }
}
