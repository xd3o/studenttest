// عناصر أساسية
const sections = document.querySelectorAll(".section");
const navButtons = document.querySelectorAll(".nav-btn");
const toggleDarkMode = document.getElementById("toggleDarkMode");
const sidebar = document.querySelector(".sidebar");
const submenuToggle = document.querySelector(".submenu-toggle");

// إظهار القسم المطلوب
navButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    const target = btn.getAttribute("data-target");
    sections.forEach(section => {
      section.classList.remove("active");
    });
    document.getElementById(target).classList.add("active");
  });
});

// الوضع المظلم
toggleDarkMode.addEventListener("click", () => {
  document.body.classList.toggle("dark");
});

// القائمة الجانبية (في الموبايل)
function toggleSidebar() {
  sidebar.classList.toggle("active");
}

// القائمة الفرعية (تواصل معنا)
submenuToggle.addEventListener("click", () => {
  submenuToggle.parentElement.classList.toggle("active");
});

// =======================
// جلب بيانات الطالب من ملفات JSON
// =======================

// الكود المخزن من تسجيل الدخول
const studentCode = localStorage.getItem("studentCode");
const studentClass = localStorage.getItem("studentClass");
const studentGroup = localStorage.getItem("studentGroup");

if (studentCode && studentClass && studentGroup) {
  loadStudentData(studentClass, studentGroup, studentCode);
}

// دالة تحميل بيانات الطالب
function loadStudentData(studentClass, studentGroup, studentCode) {
  const filePath = `Student-Data-File/Data-${studentClass}-${studentGroup}.js`;

  fetch(filePath)
    .then(response => response.json())
    .then(data => {
      const student = data.find(s => s.code === studentCode);

      if (student) {
        // عرض اسم الطالب والصف والشعبة
        document.getElementById("studentName").innerText = student.name;
        document.getElementById("studentClass").innerText = studentClass;
        document.getElementById("studentGroup").innerText = studentGroup;

        // عرض رسالة الإدارة
        document.getElementById("adminMessage").innerText = student.message || "لا توجد رسالة حالياً";

        // عرض الدرجات
        renderGrades(student.grades);

        // عرض الجدول الأسبوعي
        renderSchedule(student.schedule);
      } else {
        alert("الكود غير صحيح أو غير موجود في هذه الشعبة");
      }
    })
    .catch(error => console.error("خطأ في تحميل بيانات الطالب:", error));
}

// دالة عرض الدرجات
function renderGrades(grades) {
  const container = document.getElementById("gradesContent");
  container.innerHTML = "";

  for (const course in grades) {
    let html = `
      <h3>درجات ${course}</h3>
      <table>
        <thead>
          <tr>
            <th>المادة</th>
            <th>الدرجة</th>
          </tr>
        </thead>
        <tbody>
    `;

    grades[course].forEach(subject => {
      const color = subject.score < 50 ? "style='color:red;'" : "";
      html += `<tr><td>${subject.name}</td><td ${color}>${subject.score}</td></tr>`;
    });

    html += `</tbody></table>`;
    container.innerHTML += html;
  }
}

// دالة عرض الجدول الأسبوعي
function renderSchedule(schedule) {
  const container = document.getElementById("scheduleContent");
  container.innerHTML = `
    <table>
      <thead>
        <tr>
          <th>اليوم</th>
          <th>الحصة 1</th>
          <th>الحصة 2</th>
          <th>الحصة 3</th>
          <th>الحصة 4</th>
          <th>الحصة 5</th>
          <th>الحصة 6</th>
        </tr>
      </thead>
      <tbody>
  `;

  schedule.forEach(day => {
    container.innerHTML += `
      <tr>
        <td>${day.day}</td>
        <td>${day.periods[0]}</td>
        <td>${day.periods[1]}</td>
        <td>${day.periods[2]}</td>
        <td>${day.periods[3]}</td>
        <td>${day.periods[4]}</td>
        <td>${day.periods[5]}</td>
      </tr>
    `;
  });

  container.innerHTML += `</tbody></table>`;
}

// =======================
// الأخبار + النشاطات
// =======================

// جلب الأخبار
fetch("news.json")
  .then(response => response.json())
  .then(news => {
    const newsContainer = document.getElementById("newsContent");
    news.forEach(item => {
      newsContainer.innerHTML += `<p>📢 ${item.text}</p>`;
    });
  })
  .catch(err => console.error("خطأ في تحميل الأخبار:", err));

// جلب النشاطات
fetch("ac.json")
  .then(response => response.json())
  .then(activities => {
    const acContainer = document.getElementById("activitiesContent");
    activities.forEach(act => {
      acContainer.innerHTML += `<p>✅ ${act.student} - ${act.class} - ${act.group}: ${act.activity}</p>`;
    });
  })
  .catch(err => console.error("خطأ في تحميل النشاطات:", err));
