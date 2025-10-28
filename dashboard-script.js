// ============================================
// SESSION MANAGEMENT
// ============================================
const sessionKeyCandidates = ["studentData", "studentSession", "student"];

function readStudentSession() {
  for (const k of sessionKeyCandidates) {
    const raw = localStorage.getItem(k);
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch (e) {
        console.error("Error parsing session:", e);
      }
    }
  }
  return null;
}

// ============================================
// DARK MODE FUNCTIONALITY
// ============================================
const darkModeToggle = document.getElementById('darkModeToggle');
const body = document.body;

function applyDarkFromStorage() {
  const savedTheme = localStorage.getItem('theme') || localStorage.getItem('darkMode');
  if (savedTheme === 'dark' || savedTheme === 'on') {
    body.classList.add('dark');
  }
}

function toggleDark() {
  // Create ripple effect
  const ripple = document.createElement('div');
  ripple.classList.add('dark-mode-ripple');
  ripple.style.cssText = `
    position: fixed;
    top: 115px;
    left: 45px;
    width: 50px;
    height: 50px;
    border-radius: 50%;
    background: radial-gradient(circle, var(--primary) 0%, transparent 70%);
    pointer-events: none;
    z-index: 9999;
    animation: rippleExpand 0.8s ease-out forwards;
  `;
  document.body.appendChild(ripple);

  // Toggle dark mode
  body.classList.toggle('dark');

  // Save preference
  const isDark = body.classList.contains('dark');
  localStorage.setItem('theme', isDark ? 'dark' : 'light');
  localStorage.setItem('darkMode', isDark ? 'on' : 'off');

  // Remove ripple after animation
  setTimeout(() => ripple.remove(), 800);
}

// Add ripple animation
const style = document.createElement('style');
style.textContent = `
  @keyframes rippleExpand {
    0% {
      width: 50px;
      height: 50px;
      opacity: 0.8;
    }
    100% {
      width: 3000px;
      height: 3000px;
      opacity: 0;
    }
  }
`;
document.head.appendChild(style);

// ============================================
// PAGE NAVIGATION
// ============================================
function showPage(id) {
  // Remove active from all pages
  document.querySelectorAll(".page").forEach(p => p.classList.remove("active"));
  
  // Remove active from all sidebar items
  document.querySelectorAll(".sidebar-menu li").forEach(li => li.classList.remove("active"));
  
  // Add active to selected page
  const el = document.getElementById(id);
  if (el) {
    el.classList.add("active");
    
    // Add active to corresponding sidebar item
    const menuItem = document.querySelector(`[data-section="${id}"]`);
    if (menuItem) menuItem.classList.add("active");
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

// ============================================
// CUSTOM ALERT FUNCTION
// ============================================
function showAlert(message, type = 'info') {
  // Remove existing alert
  const existing = document.querySelector('.dashboard-alert');
  if (existing) existing.remove();

  const alert = document.createElement('div');
  alert.className = `dashboard-alert ${type}`;
  alert.innerHTML = `
    <div class="alert-content">
      <svg class="alert-icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        ${type === 'error' ? 
          '<circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line>' :
          type === 'success' ?
          '<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline>' :
          '<circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line>'
        }
      </svg>
      <span>${message}</span>
    </div>
    <button class="alert-close">&times;</button>
  `;
  
  // Add styles
  alert.style.cssText = `
    position: fixed;
    top: 90px;
    left: 50%;
    transform: translateX(-50%) translateY(-100px);
    background: var(--card);
    padding: 16px 20px;
    border-radius: 12px;
    box-shadow: 0 10px 30px var(--shadow-hover);
    display: flex;
    align-items: center;
    gap: 12px;
    max-width: 500px;
    z-index: 10000;
    opacity: 0;
    transition: all 0.3s ease;
    border: 1px solid var(--border);
  `;
  
  document.body.appendChild(alert);
  
  // Animate in
  setTimeout(() => {
    alert.style.opacity = '1';
    alert.style.transform = 'translateX(-50%) translateY(0)';
  }, 10);
  
  // Close button
  alert.querySelector('.alert-close').addEventListener('click', () => {
    alert.style.opacity = '0';
    alert.style.transform = 'translateX(-50%) translateY(-100px)';
    setTimeout(() => alert.remove(), 300);
  });
  
  // Auto close
  setTimeout(() => {
    alert.style.opacity = '0';
    alert.style.transform = 'translateX(-50%) translateY(-100px)';
    setTimeout(() => alert.remove(), 300);
  }, 4000);
}

// ============================================
// LOAD NEWS FROM JSON
// ============================================
async function loadNews() {
  const target = document.getElementById('news-list');
  const homeTarget = document.getElementById('home-news');
  const newsBadge = document.getElementById('newsBadge');

  try {
    const res = await fetch('news.json', { cache: 'no-store' });
    const data = await res.json();

    // Update badge
    if (newsBadge) {
      newsBadge.textContent = data.length;
    }

    // Display all news
    if (target) {
      if (data.length === 0) {
        target.innerHTML = '<div class="empty-state">📰 لا توجد أخبار حالياً</div>';
      } else {
        target.innerHTML = data.map(item => `
          <div class="news-item" style="animation: slideInRight 0.4s ease forwards; opacity: 0;">
            <h3 style="color: var(--text); font-size: 18px; margin-bottom: 8px; font-weight: 700;">
              ${item.title || item.عنوان || 'بدون عنوان'}
            </h3>
            <p class="news-date">
              ${item.date || item.التاريخ || ''}
            </p>
            <p class="news-desc">
              ${item.description || item.الوصف || item.desc || ''}
            </p>
          </div>
        `).join('');
        
        // Animate items
        document.querySelectorAll('#news-list .news-item').forEach((item, index) => {
          setTimeout(() => {
            item.style.opacity = '1';
          }, index * 100);
        });
      }
    }

    // Display first 3 in home
    if (homeTarget) {
      if (data.length === 0) {
        homeTarget.innerHTML = '<div class="empty-state">📰 لا توجد أخبار حالياً</div>';
      } else {
        homeTarget.innerHTML = data.slice(0, 3).map(n => `
          <div class="news-item">
            <h4 style="color: var(--text); font-size: 16px; margin-bottom: 6px; font-weight: 600;">
              ${n.title || n.عنوان || 'بدون عنوان'}
            </h4>
            <p class="news-date">${n.date || n.التاريخ || ''}</p>
            <p class="news-desc">${n.description || n.الوصف || n.desc || ''}</p>
          </div>
        `).join('');
      }
    }
  } catch (e) {
    console.error("خطأ في تحميل الأخبار:", e);
    if (target) target.innerHTML = '<div class="error-state">⚠️ تعذر تحميل الأخبار</div>';
    if (homeTarget) homeTarget.innerHTML = '<div class="error-state">⚠️ تعذر تحميل الأخبار</div>';
  }
}

// ============================================
// LOAD ACTIVITIES FROM JSON
// ============================================
async function loadActivities() {
  const el = document.getElementById("activities-list");
  
  try {
    const res = await fetch("ac.json", { cache: "no-store" });
    if (!res.ok) throw new Error("no activities");
    
    const data = await res.json();
    if (!Array.isArray(data) || data.length === 0) {
      el.innerHTML = '<div class="empty-state">🎯 لا توجد نشاطات مسجلة حالياً</div>';
      return;
    }

    el.innerHTML = `
      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th>الاسم</th>
              <th>الصف</th>
              <th>الشعبة</th>
              <th>نوع النشاط</th>
            </tr>
          </thead>
          <tbody>
            ${data.map(a => `
              <tr>
                <td>${a.name || a.الاسم || ""}</td>
                <td>${a.class || a.الصف || ""}</td>
                <td>${a.section || a.الشعبة || ""}</td>
                <td>${a.type || a.نوع || a.النوع || ""}</td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      </div>
    `;
  } catch (e) {
    console.error("خطأ في تحميل النشاطات:", e);
    el.innerHTML = '<div class="error-state">⚠️ تعذر تحميل جدول النشاطات</div>';
  }
}

// ============================================
// RENDER GRADES
// ============================================
function renderGrades(student) {
  const c1 = document.getElementById("course1");
  const c2 = document.getElementById("course2");
  
  if (!student || !student["الدرجات"]) {
    const emptyMsg = '<div class="empty-state">📚 لا توجد درجات مسجلة</div>';
    c1.innerHTML = emptyMsg;
    c2.innerHTML = emptyMsg;
    return;
  }

  const grades = student["الدرجات"];

  // Course 1
  let html1 = `
    <div class="table-container">
      <table>
        <thead>
          <tr>
            <th>المادة</th>
            <th>شهر 1</th>
            <th>شهر 2</th>
            <th>نصف السنة</th>
          </tr>
        </thead>
        <tbody>
  `;

  for (const subj in grades) {
    const d = grades[subj];
    html1 += `
      <tr>
        <td><strong>${subj}</strong></td>
        <td>${d["الشهر الأول"] ?? d["شهر1"] ?? "-"}</td>
        <td>${d["الشهر الثاني"] ?? d["شهر2"] ?? "-"}</td>
        <td>${d["نصف السنة"] ?? d["نصف"] ?? "-"}</td>
      </tr>
    `;
  }

  html1 += "</tbody></table></div>";
  c1.innerHTML = html1;

  // Course 2
  let html2 = `
    <div class="table-container">
      <table>
        <thead>
          <tr>
            <th>المادة</th>
            <th>شهر 1</th>
            <th>شهر 2</th>
            <th>السعي السنوي</th>
            <th>النهائي</th>
            <th>بعد الإكمال</th>
          </tr>
        </thead>
        <tbody>
  `;

  for (const subj in grades) {
    const d = grades[subj];
    html2 += `
      <tr>
        <td><strong>${subj}</strong></td>
        <td>${d["الكورس الثاني - الشهر الأول"] ?? d["شهر1_2"] ?? "-"}</td>
        <td>${d["الكورس الثاني - الشهر الثاني"] ?? d["شهر2_2"] ?? "-"}</td>
        <td>${d["السعي السنوي"] ?? d["سعي_سنوي"] ?? "-"}</td>
        <td>${d["الدرجة النهائية"] ?? d["نهائي"] ?? "-"}</td>
        <td>${d["الدرجة النهائية بعد الإكمال"] ?? d["بعد_الإكمال"] ?? "-"}</td>
      </tr>
    `;
  }

  html2 += "</tbody></table></div>";
  c2.innerHTML = html2;
}

// ============================================
// RENDER SCHEDULE
// ============================================
function renderSchedule(student) {
  const el = document.getElementById("schedule-table");
  
  if (!student || !student["الجدول"]) {
    el.innerHTML = '<div class="empty-state">📅 لا يوجد جدول أسبوعي</div>';
    return;
  }

  const week = student["الجدول"];
  const days = Object.keys(week);

  let html = `
    <div class="table-container">
      <table>
        <thead>
          <tr>
            <th>اليوم</th>
            <th>حصة 1</th>
            <th>حصة 2</th>
            <th>حصة 3</th>
            <th>حصة 4</th>
            <th>حصة 5</th>
            <th>حصة 6</th>
          </tr>
        </thead>
        <tbody>
  `;

  for (const day of days) {
    const row = week[day] || [];
    const cells = [];
    for (let i = 0; i < 6; i++) {
      cells.push(`<td>${row[i] ?? "-"}</td>`);
    }
    html += `<tr><td><strong>${day}</strong></td>${cells.join("")}</tr>`;
  }

  html += "</tbody></table></div>";
  el.innerHTML = html;
}

// ============================================
// RENDER STUDENT HOME INFO
// ============================================
function renderStudentHome(student) {
  const si = document.getElementById("student-info");
  
  if (!student) {
    si.innerHTML = '<div class="error-state">⚠️ لا توجد بيانات</div>';
    return;
  }

  const name = student["الاسم"] || student.name || student.fullname || "غير محدد";
  const cls = student["الصف"] || student.class || "غير محدد";
  const sec = student["الشعبة"] || student.section || "";
  const code = student["الكود"] || student.code || "";

  si.innerHTML = `
    <div class="info-row">
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
        <circle cx="12" cy="7" r="4"></circle>
      </svg>
      <span><strong>الاسم:</strong> ${name}</span>
    </div>
    <div class="info-row">
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
      </svg>
      <span><strong>الصف:</strong> ${cls} ${sec ? `- ${sec}` : ''}</span>
    </div>
    ${code ? `
      <div class="info-row">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
          <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
        </svg>
        <span><strong>الكود:</strong> ${code}</span>
      </div>
    ` : ''}
  `;

  // Admin message
  const admin = document.getElementById("admin-message");
  const msg = student["رسالة"] || student["adminMessage"] || student.message || "";
  
  if (msg) {
    admin.innerHTML = `
      <div class="admin-msg-content">
        <p>${msg}</p>
      </div>
    `;
  } else {
    admin.innerHTML = '<div class="empty-state">✉️ لا توجد رسالة من الإدارة</div>';
  }
}

// ============================================
// LOGOUT FUNCTIONALITY
// ============================================
function handleLogout() {
  if (confirm('هل أنت متأكد من تسجيل الخروج؟')) {
    // Clear session
    sessionKeyCandidates.forEach(key => localStorage.removeItem(key));
    
    // Show success message
    showAlert('تم تسجيل الخروج بنجاح', 'success');
    
    // Redirect after delay
    setTimeout(() => {
      window.location.href = 'index.html';
    }, 1000);
  }
}

// ============================================
// INITIALIZATION
// ============================================
document.addEventListener("DOMContentLoaded", async () => {
  // Apply dark mode
  applyDarkFromStorage();

  // Dark mode toggle
  if (darkModeToggle) {
    darkModeToggle.addEventListener('click', toggleDark);
  }

  // Logout button
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', handleLogout);
  }

  // Sidebar toggle
  const menuBtn = document.getElementById("menuBtn");
  const sidebar = document.getElementById("sidebar");
  const sidebarOverlay = document.getElementById("sidebarOverlay");
  const sidebarClose = document.getElementById("sidebarClose");

  function closeSidebar() {
    sidebar.classList.remove("active");
    sidebar.setAttribute("aria-hidden", true);
    sidebarOverlay.classList.remove("active");
  }

  function openSidebar() {
    sidebar.classList.add("active");
    sidebar.setAttribute("aria-hidden", false);
    sidebarOverlay.classList.add("active");
  }

  if (menuBtn) {
    menuBtn.addEventListener("click", () => {
      if (sidebar.classList.contains("active")) {
        closeSidebar();
      } else {
        openSidebar();
      }
    });
  }

  if (sidebarClose) {
    sidebarClose.addEventListener("click", closeSidebar);
  }

  if (sidebarOverlay) {
    sidebarOverlay.addEventListener("click", closeSidebar);
  }

  // Sidebar navigation
  document.querySelectorAll(".sidebar-menu li[data-section]").forEach(li => {
    li.addEventListener("click", () => {
      const section = li.getAttribute("data-section");
      showPage(section);
      closeSidebar();
    });
  });

  // Back buttons
  document.querySelectorAll(".back-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const target = btn.getAttribute("data-back");
      if (target) showPage(target);
    });
  });

  // Grades tabs
  const tabBtns = document.querySelectorAll(".tab-btn");
  tabBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      // Remove active from all tabs
      tabBtns.forEach(t => t.classList.remove("active"));
      document.querySelectorAll(".course-content").forEach(c => c.classList.remove("active"));
      
      // Add active to clicked tab
      btn.classList.add("active");
      const course = btn.getAttribute("data-course");
      const content = document.getElementById(`course${course}`);
      if (content) content.classList.add("active");
    });
  });

  // Check student session
  const student = readStudentSession();
  if (!student) {
    showAlert('الجلسة منتهية، يرجى تسجيل الدخول مرة أخرى', 'error');
    setTimeout(() => {
      window.location.href = "index.html";
    }, 2000);
    return;
  }

  // Show loading state
  showAlert('جاري تحميل البيانات...', 'info');

  // Render student home
  renderStudentHome(student);

  // Load all data
  try {
    await Promise.all([
      loadNews(),
      loadActivities()
    ]);
    renderGrades(student);
    renderSchedule(student);
    
    // Remove skeletons
    document.querySelectorAll('.skeleton').forEach(s => s.remove());
    
    showAlert('تم تحميل جميع البيانات بنجاح', 'success');
  } catch (error) {
    console.error('Error loading data:', error);
    showAlert('حدث خطأ أثناء تحميل البيانات', 'error');
  }

  // Add smooth scroll behavior
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });
});

// Add CSS for empty and error states
const additionalStyles = document.createElement('style');
additionalStyles.textContent = `
  .empty-state, .error-state {
    text-align: center;
    padding: 40px 20px;
    color: var(--text-light);
    font-size: 16px;
  }
  
  .error-state {
    color: var(--danger);
  }
  
  .info-row {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px;
    background: var(--bg);
    border-radius: 8px;
    margin-bottom: 10px;
    transition: var(--transition);
  }
  
  .info-row:hover {
    transform: translateX(-4px);
    box-shadow: 0 2px 8px var(--shadow);
  }
  
  .info-row svg {
    color: var(--primary);
    flex-shrink: 0;
  }
  
  .admin-msg-content {
    background: var(--bg);
    padding: 16px;
    border-radius: 12px;
    border-right: 4px solid var(--primary);
    line-height: 1.8;
  }
  
  .table-container {
    overflow-x: auto;
    border-radius: 12px;
  }
  
  @keyframes slideInRight {
    from {
      opacity: 0;
      transform: translateX(30px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }
  
  .dashboard-alert .alert-content {
    display: flex;
    align-items: center;
    gap: 12px;
    flex: 1;
  }
  
  .dashboard-alert .alert-icon {
    color: var(--primary);
    flex-shrink: 0;
  }
  
  .dashboard-alert.error .alert-icon {
    color: var(--danger);
  }
  
  .dashboard-alert.success .alert-icon {
    color: var(--success);
  }
  
  .dashboard-alert .alert-close {
    background: none;
    border: none;
    font-size: 24px;
    color: var(--text-light);
    cursor: pointer;
    padding: 0;
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 4px;
    transition: var(--transition);
  }
  
  .dashboard-alert .alert-close:hover {
    background: var(--border);
    color: var(--text);
  }
`;
document.head.appendChild(additionalStyles);