// فتح/إغلاق القائمة الجانبية
function toggleSidebar() {
  document.getElementById("sidebar").classList.toggle("active");
}

// إظهار قسم معين وإخفاء البقية
function showSection(sectionId) {
  document.getElementById("gradesSection").style.display = "none";
  document.getElementById("honorSection").style.display = "none";
  document.getElementById("scheduleSection").style.display = "none";

  document.getElementById(sectionId).style.display = "block";
  toggleSidebar();
}

// الوضع المظلم (يحفظ في localStorage)
function toggleDarkMode() {
  document.body.classList.toggle("dark");
  if (document.body.classList.contains("dark")) {
    localStorage.setItem("theme", "dark");
  } else {
    localStorage.setItem("theme", "light");
  }
}

// عند تحميل الصفحة، تأكد من استرجاع الوضع
window.onload = function () {
  if (localStorage.getItem("theme") === "dark") {
    document.body.classList.add("dark");
  }
  loadStudentData();
};

// تحميل بيانات الطالب من ملف JSON
function loadStudentData() {
  // الكود المفترض أنه مأخوذ من تسجيل الدخول
  const studentCode = localStorage.getItem("studentCode") || "1234"; 

  // تحديد ملف الشعبة (مؤقتًا ملف عام واحد)
  fetch("data.json")
    .then(response => response.json())
    .then(data => {
      const student = data.students.find(s => s.code === studentCode);
      if (student) {
        document.getElementById("studentName").textContent = "مرحباً " + student.name;
        loadGrades(student.grades);
      }
      if (data.schedule) {
        loadSchedule(data.schedule);
      }
    })
    .catch(err => console.error("خطأ في تحميل البيانات:", err));
}

// عرض الدرجات في جدول
function loadGrades(grades) {
  const table = document.getElementById("gradesTable");
  table.innerHTML = `
    <tr><th>المادة</th><th>الدرجة</th></tr>
  `;
  for (let subject in grades) {
    table.innerHTML += `
      <tr><td>${subject}</td><td>${grades[subject]}</td></tr>
    `;
  }
}

// عرض الجدول الأسبوعي في جدول
function loadSchedule(schedule) {
  const table = document.getElementById("scheduleTable");
  table.innerHTML = `
    <tr>
      <th>اليوم</th>
      <th>الحصة 1</th>
      <th>الحصة 2</th>
      <th>الحصة 3</th>
      <th>الحصة 4</th>
      <th>الحصة 5</th>
      <th>الحصة 6</th>
    </tr>
  `;
  for (let day in schedule) {
    let row = <tr><td>${day}</td>;
    schedule[day].forEach(period => {
      row += <td>${period}</td>;
    });
    row += "</tr>";
    table.innerHTML += row;
  }
}

// تحميل الصفحة كـ PDF
function downloadPDF() {
  const element = document.body;
  const opt = {
    margin:       0.5,
    filename:     'student-report.pdf',
    image:        { type: 'jpeg', quality: 0.98 },
    html2canvas:  { scale: 2 },
    jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
  };
  html2pdf().from(element).set(opt).save();
}
