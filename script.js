const classMap = {
  "رابع أ": "r4_a", "رابع ب": "r4_b", "رابع ج": "r4_c", "رابع د": "r4_d", "رابع هـ": "r4_e", "رابع و": "r4_f",
  "خامس أ": "r5_a", "خامس ب": "r5_b", "خامس ج": "r5_c", "خامس د": "r5_d", "خامس هـ": "r5_e", "خامس و": "r5_f",
  "سادس أ": "r6_a", "سادس ب": "r6_b", "سادس ج": "r6_c", "سادس د": "r6_d", "سادس هـ": "r6_e", "سادس و": "r6_f"
};

function login() {
  const code = document.getElementById("code").value.trim().toUpperCase();
  const studentClass = document.getElementById("class").value.trim();

  if (!code || !studentClass) {
    alert("يرجى إدخال الكود واختيار الصف.");
    return;
  }

  const key = classMap[studentClass];
  if (!key) {
    alert("الصف غير معروف.");
    return;
  }

  const script = document.createElement("script");
  script.src = `student_data_files/data_${key}.js`;
  script.onload = function () {
    if (typeof students === "undefined") {
      alert("تعذر تحميل بيانات الطلاب.");
      return;
    }

    const student = students.find(s => s["الكود"] === code);
    if (!student) {
      alert("الكود غير صحيح أو لا ينتمي للصف المحدد.");
      return;
    }

    localStorage.setItem("studentData", JSON.stringify(student));
    window.location.href = "dashboard.html";
  };
  script.onerror = function () {
    alert("تعذر تحميل بيانات الصف المحدد. تأكد من اختيار الصف الصحيح.");
  };

  document.body.appendChild(script);
}
