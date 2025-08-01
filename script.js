function login() {
  const code = document.getElementById("code").value.trim().toUpperCase();
  const studentClass = document.getElementById("class").value.trim();

  if (!code || !studentClass) {
    alert("يرجى إدخال الكود واختيار الصف.");
    return;
  }

  const dataFile = `student_data_files/data_${studentClass.replace(" ", "_")}.js`;

  const script = document.createElement("script");
  script.src = dataFile;
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