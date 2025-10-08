// ⚙️ ملف: base.js

// تبديل الوضع المظلم
function toggleDarkMode() {
  document.body.classList.toggle("dark-mode");
  localStorage.setItem("darkMode", document.body.classList.contains("dark-mode"));
}

// تطبيق الإعداد المحفوظ عند تحميل الصفحة
window.addEventListener("DOMContentLoaded", () => {
  const savedMode = localStorage.getItem("darkMode") === "true";
  if (savedMode) document.body.classList.add("dark-mode");
});

// عرض رسالة مؤقتة
function showMessage(text, type = "info") {
  const box = document.createElement("div");
  box.className = "message-box";
  box.style.background = type === "error" ? "#ffcdd2" : "#e3f2fd";
  box.style.color = type === "error" ? "#b71c1c" : "#0d47a1";
  box.textContent = text;
  document.body.appendChild(box);
  setTimeout(() => box.remove(), 4000);
}

// مثال على استخدام:
// showMessage("تم الحفظ بنجاح!");
// toggleDarkMode();
