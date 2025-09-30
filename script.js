// تحميل بيانات الطالب من ملف JSON
async function loadStudentData() {
  const res = await fetch("student.file.data");
  const student = await res.json();

  // تعبئة بيانات الطالب
  document.getElementById("student-name").textContent = student.name;
  document.getElementById("student-class").textContent = student.class;
  document.getElementById("student-section").textContent = student.section;

  renderGrades(student.grades);
  renderSchedule(student.schedule);
  renderMessages(student.messages);
}

// عرض الدرجات
function renderGrades(grades) {
  let html = "<table><tr><th>المادة</th><th>الكورس الأول</th><th>الكورس الثاني</th><th>السعي السنوي</th><th>الامتحان النهائي</th><th>الإكمال</th><th>المعدل</th></tr>";

  grades.forEach(subject => {
    let avg = (subject.course1 + subject.course2 + subject.final) / 3;
    let className = avg < 50 ? "low-grade" : "";

    html += `
      <tr>
        <td>${subject.name}</td>
        <td>${subject.course1}</td>
        <td>${subject.course2}</td>
        <td>${subject.yearly}</td>
        <td>${subject.final}</td>
        <td>${subject.makeup ?? "-"}</td>
        <td class="${className}">${avg.toFixed(1)}</td>
      </tr>
    `;
  });

  html += "</table>";
  document.getElementById("grades-table").innerHTML = html;
}

// عرض الجدول الأسبوعي
function renderSchedule(schedule) {
  let html = "<table><tr><th>اليوم</th><th>الدروس</th></tr>";

  schedule.forEach(day => {
    html += `<tr><td>${day.day}</td><td>${day.subjects.join(" - ")}</td></tr>`;
  });

  html += "</table>";
  document.getElementById("schedule-table").innerHTML = html;
}

// عرض الرسائل
function renderMessages(messages) {
  let html = "";
  messages.forEach(msg => {
    html += `<p>📢 ${msg}</p>`;
  });
  document.getElementById("admin-messages").innerHTML = html;
}

// تحميل الأخبار
async function loadNews() {
  const res = await fetch("news.json");
  const news = await res.json();
  let html = "";

  news.forEach(n => {
    html += `<li>${n.date} - ${n.title}</li>`;
  });

  document.getElementById("news-list").innerHTML = html;
}

// بدء التشغيل
loadStudentData();
loadNews();
