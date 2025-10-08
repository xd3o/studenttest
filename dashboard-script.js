// ====== القائمة الجانبية ======
const menuBtn = document.querySelector(".menu-btn");
const sidebar = document.querySelector(".sidebar");

if (menuBtn && sidebar) {
  menuBtn.addEventListener("click", () => {
    sidebar.classList.toggle("open");
  });
}

// ====== الوضع المظلم ======
const darkModeToggle = document.getElementById("darkModeToggle");
if (darkModeToggle) {
  darkModeToggle.addEventListener("click", () => {
    document.body.classList.toggle("dark-mode");
  });
}

// ====== عرض الأخبار ======
fetch("news.json")
  .then((res) => res.json())
  .then((data) => {
    const newsContainer = document.getElementById("newsContainer");
    if (!newsContainer) return;

    newsContainer.innerHTML = "";
    data.forEach((item) => {
      newsContainer.innerHTML += `
        <div class="news-card">
          <h3>${item.title}</h3>
          <p class="date">${item.date}</p>
          <p>${item.description}</p>
        </div>
      `;
    });
  });

// ====== عرض الدرجات ======
function renderGrades(data) {
  const container = document.getElementById("gradesContainer");
  if (!container) return;

  let html = `
    <table class="grades-table">
      <thead>
        <tr>
          <th>المادة</th>
          <th>شهر 1</th>
          <th>شهر 2</th>
          <th>شهر 3</th>
          <th>السعي 2</th>
          <th>السنوي</th>
          <th>النهائي</th>
          <th>بعد الإكمال</th>
        </tr>
      </thead>
      <tbody>
  `;

  data.forEach((row) => {
    html += `
      <tr>
        <td>${row.subject}</td>
        <td>${row.m1}</td>
        <td>${row.m2}</td>
        <td>${row.m3}</td>
        <td>${row.sa2}</td>
        <td>${row.annual}</td>
        <td>${row.final}</td>
        <td>${row.after}</td>
      </tr>
    `;
  });

  html += `</tbody></table>`;
  container.innerHTML = html;
}

// ====== توحيد الجداول ======
function renderWeeklyTable(weeklyData) {
  const container = document.getElementById("weeklyContainer");
  if (!container) return;

  let html = `
    <table class="weekly-table">
      <thead>
        <tr>
          <th>اليوم</th>
          <th>الحصة 1</th>
          <th>الحصة 2</th>
          <th>الحصة 3</th>
          <th>الحصة 4</th>
          <th>الحصة 5</th>
        </tr>
      </thead>
      <tbody>
  `;

  weeklyData.forEach((d) => {
    html += `
      <tr>
        <td>${d.day}</td>
        <td>${d.h1}</td>
        <td>${d.h2}</td>
        <td>${d.h3}</td>
        <td>${d.h4}</td>
        <td>${d.h5}</td>
      </tr>
    `;
  });

  html += `</tbody></table>`;
  container.innerHTML = html;
}

// ====== الأنشطة ======
function renderActivities(data) {
  const container = document.getElementById("activitiesContainer");
  if (!container) return;

  let html = `
    <table class="activity-table">
      <thead>
        <tr>
          <th>الاسم</th>
          <th>الصف</th>
          <th>الشعبة</th>
          <th>نوع النشاط</th>
        </tr>
      </thead>
      <tbody>
  `;

  data.forEach((a) => {
    html += `
      <tr>
        <td>${a.name}</td>
        <td>${a.grade}</td>
        <td>${a.section}</td>
        <td>${a.activity}</td>
      </tr>
    `;
  });

  html += `</tbody></table>`;
  container.innerHTML = html;
}
