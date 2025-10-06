/* ===========================================================
   script.js
   - ملف واحد يحتوي: تسجيل الدخول (index.html) + الداشبورد (dashboard.html)
   - مكتوب ليتعامل مع مسارات مختلفة لملفات البيانات تلقائياً
   =========================================================== */

/* ----------- إعداد مسارات بديلة (للتوافق مع بنى مجلدات مختلفة) ----------- */
const BASE_CANDIDATES = [
  "",                     // نفس المجلد
  "./",
  "student-file-data/",
  "student-file-data/student_data_files/",
  "student_data_files/",
  "student-data/",
  "data/",
];

/* -------------------- دوال مساعدة عامة -------------------- */

// يحاول جلب ملف JSON من عدة مسارات حتى يجد واحداً ناجحاً
async function fetchJsonFallback(filename) {
  for (const base of BASE_CANDIDATES) {
    const path = base + filename;
    try {
      const res = await fetch(path, {cache: "no-store"});
      if (!res.ok) continue;
      const json = await res.json();
      return {json, path};
    } catch (e) {
      // تجاهل وجرّب التالي
    }
  }
  throw new Error("لم أتمكن من جلب " + filename + " من أي مسار متوقع.");
}

// يضيف عنصر <script> ويُحلّي إذا حدّد المتغير العالمي المطلوب بعد التحميل
function loadScriptAndCheck(globalVarName, filename) {
  return new Promise((resolve, reject) => {
    let tried = 0;

    function tryNext() {
      if (tried >= BASE_CANDIDATES.length) {
        reject(new Error("فشل تحميل " + filename + " أو لم يعرف " + globalVarName));
        return;
      }
      const base = BASE_CANDIDATES[tried++];
      const src = base + filename;

      const s = document.createElement("script");
      s.src = src;
      s.async = true;
      s.onload = () => {
        // تحقق أن المتغير عرف
        setTimeout(() => {
          if (window[globalVarName] !== undefined) {
            resolve({found: true, src});
          } else {
            // أزل السكربت وحاول المسار التالي
            s.remove();
            tryNext();
          }
        }, 5);
      };
      s.onerror = () => {
        s.remove();
        tryNext();
      };
      document.head.appendChild(s);
    }

    tryNext();
  });
}

// فحص صف/سجل الطلاب للبحث عن القونة (code)
// يدعم صفوف كمصفوفة أو كائن (object)
function rowMatchesCode(row, code) {
  if (row === null || row === undefined) return false;
  // إذا كان كائن
  if (typeof row === "object" && !Array.isArray(row)) {
    for (const k in row) {
      if (!Object.prototype.hasOwnProperty.call(row, k)) continue;
      try {
        if (String(row[k]).trim() === String(code).trim()) return true;
      } catch (e) {}
    }
    return false;
  }
  // إذا كانت مصفوفة
  if (Array.isArray(row)) {
    for (const cell of row) {
      if (String(cell).trim() === String(code).trim()) return true;
    }
    return false;
  }
  // قيمة مباشرة
  return String(row).trim() === String(code).trim();
}

/* -------------------- قسم التسجيل (index.html) -------------------- */
(function setupLogin() {
  const loginBtn = document.getElementById("login-btn");
  if (!loginBtn) return; // إذا هذه الصفحة مش index.html نتخطى

  const loginError = document.getElementById("login-error");
  function showError(msg) {
    if (loginError) {
      loginError.textContent = msg;
      loginError.style.display = msg ? "block" : "none";
    } else {
      alert(msg);
    }
  }

  // خريطة الصف/الشعبة إلى اسم ملف (تأكد أن ملفاتك تستخدم هذا النمط data_rX_y.js)
  const CLASS_TO_FILE = {
    "r4_a":"data_r4_a.js","r4_b":"data_r4_b.js","r4_c":"data_r4_c.js",
    "r4_d":"data_r4_d.js","r4_e":"data_r4_e.js","r4_f":"data_r4_f.js",
    "r5_a":"data_r5_a.js","r5_b":"data_r5_b.js","r5_c":"data_r5_c.js",
    "r5_d":"data_r5_d.js","r5_e":"data_r5_e.js","r5_f":"data_r5_f.js",
    "r6_a":"data_r6_a.js","r6_b":"data_r6_b.js","r6_c":"data_r6_c.js",
    "r6_d":"data_r6_d.js","r6_e":"data_r6_e.js","r6_f":"data_r6_f.js"
  };

  async function attemptLogin() {
    showError("");
    const code = (document.getElementById("code").value || "").trim();
    const cls = (document.getElementById("class").value || "").trim(); // ex: r4_a

    if (!code || !cls) {
      showError("الرجاء إدخال الكود واختيار الصف/الشعبة.");
      return;
    }

    const fileName = CLASS_TO_FILE[cls];
    if (!fileName) {
      showError("الشعبة غير مدعومة أو اسمها غير صحيح.");
      return;
    }

    const varName = "data_" + cls; // نتوقع المتغير العالمي بهذا الاسم داخل ملف .js

    try {
      // تحميل الملف (يحاول عدة مسارات)
      await loadScriptAndCheck(varName, fileName);

      const dataset = window[varName];
      if (!dataset) {
        showError("الملف حمّل لكن بنية البيانات غير متوقعه.");
        return;
      }

      // بحث عن الطالب داخل البيانات
      let found = null;
      if (Array.isArray(dataset)) {
        for (const row of dataset) {
          if (rowMatchesCode(row, code)) { found = row; break; }
        }
      } else if (typeof dataset === "object") {
        // قد يحتوي الملف على { students: [...] } أو شكل آخر
        const candidates = ["students","data","items","list"];
        for (const c of candidates) {
          if (Array.isArray(dataset[c])) {
            for (const row of dataset[c]) {
              if (rowMatchesCode(row, code)) { found = row; break; }
            }
            if (found) break;
          }
        }
        if (!found && rowMatchesCode(dataset, code)) found = dataset;
      }

      if (!found) {
        showError("لم أجد طالباً بهذا الكود في الشعبة المختارة.");
        return;
      }

      // نجمع كائن الجلسة الموحد
      const session = {
        classKey: cls,
        code: code,
        raw: found,
        name: (found.name || found.fullname || found[1] || found[0] || "") + "",
        id: (found.id || found.code || code) + ""
      };

      localStorage.setItem("studentSession", JSON.stringify(session));
      // تأكد أن وضع المظلم محفوظ دائمًا (لا نغيّره هنا)
      // انتقل للداشبورد
      window.location.href = "dashboard.html";
    } catch (err) {
      console.error(err);
      showError("خطأ بتحميل بيانات الشعبة. تأكد من وجود الملف: " + fileName);
    }
  }

  loginBtn.addEventListener("click", (e) => {
    e.preventDefault();
    attemptLogin();
  });

  // Enter key triggers login
  document.getElementById("code").addEventListener("keydown", (ev) => {
    if (ev.key === "Enter") {
      ev.preventDefault();
      attemptLogin();
    }
  });
})();

/* -------------------- قسم الداشبورد (dashboard.html) -------------------- */
(function setupDashboard() {
  // إذا الصفحة ليست dashboard.html لا نكمل
  if (!document.getElementById("sidebar") && !document.querySelector(".main-content")) return;

  // قراءة الجلسة
  const rawSession = localStorage.getItem("studentSession");
  if (!rawSession) {
    // إذا لا توجد جلسة نعيد للصفحة الرئيسية
    window.location.href = "index.html";
    return;
  }

  const session = JSON.parse(rawSession);
  const cls = session.classKey || "";
  const code = session.code || "";

  // دوال عرض
  function renderStudentInfo() {
    const el = document.getElementById("student-info");
    if (!el) return;
    const s = session.raw || {};
    const name = s.name || s.fullname || s[1] || "غير متوفر";
    const id = s.id || s.code || code || "غير متوفر";
    const section = cls || "";
    el.innerHTML = `
      <p><strong>الاسم:</strong> ${name}</p>
      <p><strong>القونة / الكود:</strong> ${id}</p>
      <p><strong>الشعبة:</strong> ${section}</p>
    `;
  }

  function renderAdminMessage() {
    const el = document.getElementById("admin-message");
    if (!el) return;
    const s = session.raw || {};
    const msg = s.adminMessage || s.message || s.note || s.notice || "";
    el.innerHTML = msg ? `<div class="card">${msg}</div>` : `<div class="card">لا توجد رسالة.</div>`;
  }

  // تحميل أخبار (محاولة من عدة مسارات)
  async function loadNews() {
    try {
      const {json: news} = await fetchJsonFallback("news.json");
      const newsList = document.getElementById("news-list");
      const homeNews = document.getElementById("home-news");
      if (newsList && Array.isArray(news)) {
        const html = news.map(n => `<div class="card"><h4>${n.title||"بدون عنوان"}</h4><p>${n.content||""}</p></div>`).join("");
        newsList.innerHTML = html;
      }
      if (homeNews && Array.isArray(news)) {
        const html = news.slice(0,4).map(n => `<div class="card"><h4>${n.title||"بدون عنوان"}</h4><p>${n.content||""}</p></div>`).join("");
        homeNews.innerHTML = html;
      }
    } catch (e) {
      console.warn(e);
      const n = document.getElementById("news-list");
      if (n) n.innerHTML = `<div class="card">تعذر تحميل الأخبار.</div>`;
      const hn = document.getElementById("home-news");
      if (hn) hn.innerHTML = `<div class="card">تعذر تحميل الأخبار.</div>`;
    }
  }

  // تحميل النشاطات من ac.json
  async function loadActivities() {
    try {
      const {json: activities} = await fetchJsonFallback("ac.json");
      const el = document.getElementById("activities-table");
      if (!el) return;
      el.innerHTML = createTable(activities);
    } catch (e) {
      console.warn(e);
      const el = document.getElementById("activities-table");
      if (el) el.innerHTML = `<div class="card">تعذر تحميل جدول النشاطات.</div>`;
    }
  }

  // تحميل درجات وجدول الأسبوعي (محاولات متعددة للتوافق)
  async function loadGradesAndSchedule() {
    const gradesEl = document.getElementById("grades-table");
    const scheduleEl = document.getElementById("schedule-table");

    // نبحث عن أسماء متوقعة للمتغيرات في ملفات الشعب
    const tryNames = [
      `grades_${cls}`, `schedule_${cls}`, `gradesData`, `scheduleData`,
      `grades`, `schedule`
    ];

    // Helper للبحث العالمي
    function findGlobal(nameCandidates) {
      for (const n of nameCandidates) {
        if (window[n] !== undefined) return {name:n, value: window[n]};
      }
      return null;
    }

    // إذا ملف الشعب محمّل مسبقاً قد يحتوي على بيانات داخل متغيرات مألوفة
    const foundGrades = findGlobal(tryNames.filter(n => n.includes("grades")));
    const foundSchedule = findGlobal(tryNames.filter(n => n.includes("schedule")));

    if (foundGrades && gradesEl) {
      gradesEl.innerHTML = createTable(foundGrades.value);
    } else {
      // محاولة تحميل ملف الشعب إن لم يكن محملاً (data_rX_y.js)
      const fileName = `data_${cls}.js`;
      const varName = `data_${cls}`;
      try {
        await loadScriptAndCheck(varName, fileName);
        const dataset = window[varName];
        // ابحث داخل dataset عن حقول درجات أو جدول
        let g = null, s = null;
        if (Array.isArray(dataset)) {
          // لا توجد جداول مرفقة عادة هنا
        } else if (typeof dataset === "object") {
          g = dataset.grades || dataset.Grades || dataset.درجات || null;
          s = dataset.schedule || dataset.table || null;
        }
        if (g && gradesEl) gradesEl.innerHTML = createTable(g);
        else if (gradesEl) gradesEl.innerHTML = `<div class="card">لا توجد درجات محفوظة لهذا الطالب.</div>`;

        if (s && scheduleEl) scheduleEl.innerHTML = createTable(s);
        else if (scheduleEl) scheduleEl.innerHTML = `<div class="card">لا يوجد جدول أسبوعي محفوظ.</div>`;
      } catch (e) {
        console.warn(e);
        if (gradesEl) gradesEl.innerHTML = `<div class="card">تعذّر تحميل الدرجات.</div>`;
        if (scheduleEl) scheduleEl.innerHTML = `<div class="card">تعذّر تحميل الجدول.</div>`;
      }
    }
  }

  // إنشاء جدول مرن يدعم: مصفوفة من مصفوفات، مصفوفة من كائنات، أو كائن بسيط
  function createTable(data) {
    if (!data) return "<div class='card'>لا توجد بيانات.</div>";

    // Array of arrays
    if (Array.isArray(data) && data.length && Array.isArray(data[0])) {
      let html = "<table><tbody>";
      data.forEach(row => {
        html += "<tr>";
        row.forEach(cell => html += `<td>${cell ?? ""}</td>`);
        html += "</tr>";
      });
      html += "</tbody></table>";
      return html;
    }

    // Array of objects
    if (Array.isArray(data) && data.length && typeof data[0] === "object") {
      const keys = Object.keys(data[0]);
      let html = "<table><thead><tr>";
      keys.forEach(k => html += `<th>${k}</th>`);
      html += "</tr></thead><tbody>";
      data.forEach(r => {
        html += "<tr>";
        keys.forEach(k => html += `<td>${r[k] ?? ""}</td>`);
        html += "</tr>";
      });
      html += "</tbody></table>";
      return html;
    }

    // Object
    if (typeof data === "object") {
      let html = "<table><tbody>";
      for (const k in data) {
        if (!Object.prototype.hasOwnProperty.call(data, k)) continue;
        html += `<tr><th>${k}</th><td>${JSON.stringify(data[k])}</td></tr>`;
      }
      html += "</tbody></table>";
      return html;
    }

    // Fallback
    return `<div class="card">${String(data)}</div>`;
  }

  // تهيئة القائمة الجانبية والتنقل
  const sidebar = document.getElementById("sidebar");
  const menuToggle = document.getElementById("menu-toggle");
  const menuItems = sidebar.querySelectorAll("li[data-section]");
  const sections = document.querySelectorAll(".section");

  function showSection(id) {
    sections.forEach(s => s.classList.remove("active"));
    const el = document.getElementById(id);
    if (el) el.classList.add("active");
  }

  menuToggle.addEventListener("click", () => {
    const open = sidebar.classList.toggle("active");
    sidebar.setAttribute("aria-hidden", !open);
  });

  menuItems.forEach(li => {
    li.addEventListener("click", () => {
      const section = li.getAttribute("data-section");
      if (section === "darkmode") return; // الحقل خاص بالتحكم وهو في عنصر منفصل هنا
      showSection(section);
      sidebar.classList.remove("active");
      sidebar.setAttribute("aria-hidden", true);
    });
  });

  // تفعيل الوضع المظلم من التخزين
  const darkToggle = document.getElementById("dark-toggle");
  function applyDarkFromStorage() {
    if (localStorage.getItem("darkMode") === "on") document.body.classList.add("dark");
    else document.body.classList.remove("dark");
  }
  applyDarkFromStorage();
  if (darkToggle) {
    darkToggle.addEventListener("click", () => {
      document.body.classList.toggle("dark");
      localStorage.setItem("darkMode", document.body.classList.contains("dark") ? "on" : "off");
    });
  }

  // روابط التواصل: اتركها قابلة للتعديل
  const fb = document.getElementById("fb-link");
  const tg = document.getElementById("tg-link");
  if (fb) fb.href = "#"; // غيّر الرابط هنا
  if (tg) tg.href = "#"; // غيّر الرابط هنا

  // استدعاءات التحميل
  (async function initAll() {
    renderStudentInfo();
    renderAdminMessage();
    await loadNews();
    await loadActivities();
    await loadGradesAndSchedule();
  })();

})();
