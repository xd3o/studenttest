// ============================================
// DARK MODE FUNCTIONALITY
// ============================================
const darkModeToggle = document.getElementById('darkModeToggle');
const body = document.body;

// Load saved theme preference
const savedTheme = localStorage.getItem('theme');
if (savedTheme === 'dark') {
  body.classList.add('dark-mode');
}

// Dark mode toggle with animation
darkModeToggle.addEventListener('click', () => {
  // Create ripple effect
  const ripple = document.createElement('div');
  ripple.classList.add('dark-mode-ripple');
  document.body.appendChild(ripple);
  
  // Toggle dark mode
  body.classList.toggle('dark-mode');
  
  // Save preference
  if (body.classList.contains('dark-mode')) {
    localStorage.setItem('theme', 'dark');
  } else {
    localStorage.setItem('theme', 'light');
  }
  
  // Remove ripple after animation
  setTimeout(() => {
    ripple.remove();
  }, 800);
});

// ============================================
// LOGIN FUNCTIONALITY
// ============================================
const loginBtn = document.getElementById("login-btn");
const codeInput = document.getElementById("code");
const classSelect = document.getElementById("class");
const loadingSpinner = document.getElementById("loadingSpinner");

// Class mapping
const classMap = {
  "رابع أ": "r4_a", "رابع ب": "r4_b", "رابع ج": "r4_c", "رابع د": "r4_d", "رابع هـ": "r4_e", "رابع و": "r4_f",
  "خامس أ": "r5_a", "خامس ب": "r5_b", "خامس ج": "r5_c", "خامس د": "r5_d", "خامس هـ": "r5_e", "خامس و": "r5_f",
  "سادس أ": "r6_a", "سادس ب": "r6_b", "سادس ج": "r6_c", "سادس د": "r6_d", "سادس هـ": "r6_e", "سادس و": "r6_f"
};

// Login button click event
loginBtn.addEventListener("click", login);

// Enter key press on inputs
codeInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") login();
});

classSelect.addEventListener("keypress", (e) => {
  if (e.key === "Enter") login();
});

// ============================================
// INPUT ANIMATIONS
// ============================================
// Add focus animations to inputs
const inputs = document.querySelectorAll('input, select');
inputs.forEach(input => {
  input.addEventListener('focus', function() {
    this.parentElement.classList.add('focused');
    this.parentElement.classList.remove('error');
  });
  
  input.addEventListener('blur', function() {
    if (!this.value) {
      this.parentElement.classList.remove('focused');
    }
  });
});

// ============================================
// CUSTOM ALERT FUNCTION
// ============================================
function showAlert(message, type = 'error') {
  // Remove existing alerts
  const existingAlert = document.querySelector('.custom-alert');
  if (existingAlert) existingAlert.remove();
  
  // Create alert element
  const alert = document.createElement('div');
  alert.className = `custom-alert ${type}`;
  alert.innerHTML = `
    <div class="alert-content">
      <svg class="alert-icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        ${type === 'error' ? 
          '<circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line>' :
          '<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline>'
        }
      </svg>
      <span>${message}</span>
    </div>
    <button class="alert-close">&times;</button>
  `;
  
  document.body.appendChild(alert);
  
  // Animate in
  setTimeout(() => alert.classList.add('show'), 10);
  
  // Close button
  alert.querySelector('.alert-close').addEventListener('click', () => {
    alert.classList.remove('show');
    setTimeout(() => alert.remove(), 300);
  });
  
  // Auto close after 4 seconds
  setTimeout(() => {
    alert.classList.remove('show');
    setTimeout(() => alert.remove(), 300);
  }, 4000);
}

// ============================================
// SHAKE ANIMATION FOR ERRORS
// ============================================
function shakeElement(element) {
  element.classList.add('shake');
  setTimeout(() => element.classList.remove('shake'), 500);
}

// ============================================
// MAIN LOGIN FUNCTION
// ============================================
function login() {
  const code = codeInput.value.trim().toUpperCase();
  const studentClass = classSelect.value.trim();

  // Validation
  if (!code || !studentClass) {
    showAlert("يرجى إدخال الكود واختيار الصف.", 'error');
    
    if (!code) {
      codeInput.parentElement.classList.add('error');
      shakeElement(codeInput.parentElement);
    }
    if (!studentClass) {
      classSelect.parentElement.classList.add('error');
      shakeElement(classSelect.parentElement);
    }
    return;
  }

  const key = classMap[studentClass];
  if (!key) {
    showAlert("الصف غير معروف.", 'error');
    classSelect.parentElement.classList.add('error');
    shakeElement(classSelect.parentElement);
    return;
  }

  // Show loading spinner
  loadingSpinner.classList.add('show');
  loginBtn.disabled = true;
  loginBtn.style.opacity = '0.6';

  // Load student data
  const script = document.createElement("script");
  script.src = `student_data_files/data_${key}.js`;
  
  script.onload = function () {
    if (typeof students === "undefined") {
      hideLoading();
      showAlert("تعذر تحميل بيانات الطلاب.", 'error');
      return;
    }

    const student = students.find(s => s["الكود"] === code);
    
    if (!student) {
      hideLoading();
      showAlert("الكود غير صحيح أو لا ينتمي للصف المحدد.", 'error');
      codeInput.parentElement.classList.add('error');
      shakeElement(codeInput.parentElement);
      return;
    }

    // Success! Save data and redirect
    localStorage.setItem("studentData", JSON.stringify(student));
    
    // Success message
    showAlert("تم تسجيل الدخول بنجاح! جاري التحويل...", 'success');
    
    // Add success animation to container
    const container = document.querySelector('.login-container');
    container.classList.add('success');
    
    // Redirect after animation
    setTimeout(() => {
      window.location.href = "dashboard.html";
    }, 1500);
  };
  
  script.onerror = function () {
    hideLoading();
    showAlert("تعذر تحميل بيانات الصف المحدد.", 'error');
  };

  document.body.appendChild(script);
}

// Hide loading spinner
function hideLoading() {
  loadingSpinner.classList.remove('show');
  loginBtn.disabled = false;
  loginBtn.style.opacity = '1';
}

// ============================================
// PAGE LOAD ANIMATIONS
// ============================================
window.addEventListener('load', () => {
  // Animate container on load
  const container = document.querySelector('.login-container');
  container.classList.add('loaded');
  
  // Animate title words
  const titleWords = document.querySelectorAll('.title-word');
  titleWords.forEach((word, index) => {
    setTimeout(() => {
      word.classList.add('animate');
    }, index * 150);
  });
  
  // Animate inputs
  const inputGroups = document.querySelectorAll('.input-group');
  inputGroups.forEach((group, index) => {
    setTimeout(() => {
      group.classList.add('animate');
    }, 300 + (index * 100));
  });
  
  // Animate button
  setTimeout(() => {
    loginBtn.classList.add('animate');
  }, 600);
});

// ============================================
// PARTICLE ANIMATION
// ============================================
const particles = document.querySelectorAll('.particle');
particles.forEach(particle => {
  // Random animation duration
  const duration = 15 + Math.random() * 10;
  particle.style.animationDuration = `${duration}s`;
  
  // Random delay
  const delay = Math.random() * 5;
  particle.style.animationDelay = `${delay}s`;
});

// ============================================
// BUTTON HOVER EFFECT
// ============================================
loginBtn.addEventListener('mousemove', (e) => {
  const rect = loginBtn.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  
  loginBtn.style.setProperty('--mouse-x', `${x}px`);
  loginBtn.style.setProperty('--mouse-y', `${y}px`);
});