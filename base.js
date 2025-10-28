// ============================================
// ⚙️ ENHANCED BASE.JS - GLOBAL UTILITIES
// ============================================

// ============================================
// DARK MODE FUNCTIONALITY
// ============================================

/**
 * Toggle dark mode with smooth ripple animation
 */
function toggleDarkMode() {
  const body = document.body;
  
  // Create ripple effect at the toggle position
  const ripple = document.createElement('div');
  ripple.className = 'dark-mode-ripple-global';
  
  // Try to find the dark mode toggle button position
  const toggleBtn = document.querySelector('.dark-mode-toggle') || 
                    document.getElementById('darkModeToggle') ||
                    document.getElementById('darkToggle');
  
  if (toggleBtn) {
    const rect = toggleBtn.getBoundingClientRect();
    ripple.style.left = `${rect.left + rect.width / 2}px`;
    ripple.style.top = `${rect.top + rect.height / 2}px`;
  } else {
    // Default position if button not found
    ripple.style.left = '50px';
    ripple.style.top = '50px';
  }
  
  document.body.appendChild(ripple);
  
  // Toggle dark mode
  body.classList.toggle("dark-mode");
  body.classList.toggle("dark");
  
  // Save preference
  const isDark = body.classList.contains("dark-mode") || body.classList.contains("dark");
  localStorage.setItem("darkMode", isDark);
  localStorage.setItem("theme", isDark ? "dark" : "light");
  
  // Remove ripple after animation
  setTimeout(() => ripple.remove(), 800);
  
  // Trigger custom event for other components
  window.dispatchEvent(new CustomEvent('darkModeChanged', { detail: { isDark } }));
}

/**
 * Apply saved dark mode on page load
 */
function applySavedDarkMode() {
  const savedMode = localStorage.getItem("darkMode") === "true" || 
                    localStorage.getItem("theme") === "dark";
  
  if (savedMode) {
    document.body.classList.add("dark-mode");
    document.body.classList.add("dark");
  }
}

// Apply dark mode as early as possible to prevent flash
applySavedDarkMode();

// ============================================
// MESSAGE NOTIFICATION SYSTEM
// ============================================

/**
 * Show a beautiful animated message notification
 * @param {string} text - Message text to display
 * @param {string} type - Message type: 'success', 'error', 'warning', 'info'
 * @param {number} duration - Duration in milliseconds (default: 4000)
 */
function showMessage(text, type = "info", duration = 4000) {
  // Remove any existing messages of the same type
  const existing = document.querySelectorAll(`.message-box.${type}`);
  existing.forEach(msg => msg.remove());
  
  // Create message box
  const box = document.createElement("div");
  box.className = `message-box ${type}`;
  
  // Get icon based on type
  const icons = {
    success: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
      <polyline points="22 4 12 14.01 9 11.01"></polyline>
    </svg>`,
    error: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="12" cy="12" r="10"></circle>
      <line x1="15" y1="9" x2="9" y2="15"></line>
      <line x1="9" y1="9" x2="15" y2="15"></line>
    </svg>`,
    warning: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
      <line x1="12" y1="9" x2="12" y2="13"></line>
      <line x1="12" y1="17" x2="12.01" y2="17"></line>
    </svg>`,
    info: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="12" cy="12" r="10"></circle>
      <line x1="12" y1="16" x2="12" y2="12"></line>
      <line x1="12" y1="8" x2="12.01" y2="8"></line>
    </svg>`
  };
  
  box.innerHTML = `
    <div class="message-icon">${icons[type]}</div>
    <div class="message-text">${text}</div>
    <button class="message-close" aria-label="إغلاق">
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <line x1="18" y1="6" x2="6" y2="18"></line>
        <line x1="6" y1="6" x2="18" y2="18"></line>
      </svg>
    </button>
  `;
  
  document.body.appendChild(box);
  
  // Animate in
  setTimeout(() => box.classList.add("show"), 10);
  
  // Close button functionality
  const closeBtn = box.querySelector(".message-close");
  closeBtn.addEventListener("click", () => hideMessage(box));
  
  // Auto hide after duration
  if (duration > 0) {
    setTimeout(() => hideMessage(box), duration);
  }
  
  return box;
}

/**
 * Hide a message box with animation
 */
function hideMessage(box) {
  box.classList.remove("show");
  box.classList.add("hide");
  setTimeout(() => box.remove(), 300);
}

/**
 * Show loading message
 */
function showLoading(text = "جاري التحميل...") {
  const box = document.createElement("div");
  box.className = "message-box loading";
  box.innerHTML = `
    <div class="message-spinner">
      <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" fill="none" stroke-dasharray="31.415, 31.415" stroke-dashoffset="0">
          <animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="1s" repeatCount="indefinite"/>
        </circle>
      </svg>
    </div>
    <div class="message-text">${text}</div>
  `;
  
  document.body.appendChild(box);
  setTimeout(() => box.classList.add("show"), 10);
  
  return box;
}

// ============================================
// CONFIRMATION DIALOG
// ============================================

/**
 * Show a custom confirmation dialog
 * @param {string} message - Confirmation message
 * @param {function} onConfirm - Callback when confirmed
 * @param {function} onCancel - Callback when cancelled
 */
function showConfirm(message, onConfirm, onCancel) {
  const overlay = document.createElement("div");
  overlay.className = "confirm-overlay";
  
  const dialog = document.createElement("div");
  dialog.className = "confirm-dialog";
  dialog.innerHTML = `
    <div class="confirm-icon">
      <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="12" y1="8" x2="12" y2="12"></line>
        <line x1="12" y1="16" x2="12.01" y2="16"></line>
      </svg>
    </div>
    <div class="confirm-message">${message}</div>
    <div class="confirm-buttons">
      <button class="confirm-btn confirm-yes">تأكيد</button>
      <button class="confirm-btn confirm-no">إلغاء</button>
    </div>
  `;
  
  overlay.appendChild(dialog);
  document.body.appendChild(overlay);
  
  // Animate in
  setTimeout(() => {
    overlay.classList.add("show");
    dialog.classList.add("show");
  }, 10);
  
  // Button handlers
  const yesBtn = dialog.querySelector(".confirm-yes");
  const noBtn = dialog.querySelector(".confirm-no");
  
  const close = () => {
    overlay.classList.remove("show");
    dialog.classList.remove("show");
    setTimeout(() => overlay.remove(), 300);
  };
  
  yesBtn.addEventListener("click", () => {
    close();
    if (onConfirm) onConfirm();
  });
  
  noBtn.addEventListener("click", () => {
    close();
    if (onCancel) onCancel();
  });
  
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) {
      close();
      if (onCancel) onCancel();
    }
  });
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Smooth scroll to element
 */
function scrollToElement(selector, offset = 0) {
  const element = document.querySelector(selector);
  if (element) {
    const top = element.getBoundingClientRect().top + window.pageYOffset - offset;
    window.scrollTo({ top, behavior: 'smooth' });
  }
}

/**
 * Copy text to clipboard
 */
async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    showMessage("تم النسخ بنجاح!", "success", 2000);
    return true;
  } catch (err) {
    showMessage("فشل النسخ", "error", 2000);
    return false;
  }
}

/**
 * Format date to Arabic
 */
function formatArabicDate(date) {
  const d = new Date(date);
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return d.toLocaleDateString('ar-IQ', options);
}

/**
 * Debounce function
 */
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// ============================================
// INITIALIZE ON DOM LOAD
// ============================================

window.addEventListener("DOMContentLoaded", () => {
  // Apply saved dark mode
  applySavedDarkMode();
  
  // Setup all dark mode toggle buttons
  const darkModeToggles = document.querySelectorAll(
    '.dark-mode-toggle, #darkModeToggle, #darkToggle, [data-dark-toggle]'
  );
  
  darkModeToggles.forEach(toggle => {
    toggle.addEventListener('click', toggleDarkMode);
  });
  
  // Add smooth scroll to all anchor links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const target = this.getAttribute('href');
      if (target !== '#') {
        scrollToElement(target, 80);
      }
    });
  });
  
  // Initialize tooltips (if elements have data-tooltip)
  document.querySelectorAll('[data-tooltip]').forEach(el => {
    el.addEventListener('mouseenter', function() {
      const text = this.getAttribute('data-tooltip');
      const tooltip = document.createElement('div');
      tooltip.className = 'tooltip';
      tooltip.textContent = text;
      this.appendChild(tooltip);
      setTimeout(() => tooltip.classList.add('show'), 10);
    });
    
    el.addEventListener('mouseleave', function() {
      const tooltip = this.querySelector('.tooltip');
      if (tooltip) {
        tooltip.classList.remove('show');
        setTimeout(() => tooltip.remove(), 200);
      }
    });
  });
});

// ============================================
// INJECT GLOBAL STYLES
// ============================================

const globalStyles = document.createElement('style');
globalStyles.textContent = `
  /* Message Box Styles */
  .message-box {
    position: fixed;
    top: 20px;
    left: 50%;
    transform: translateX(-50%) translateY(-100px);
    background: white;
    padding: 16px 20px;
    border-radius: 12px;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
    display: flex;
    align-items: center;
    gap: 12px;
    z-index: 10000;
    min-width: 300px;
    max-width: 500px;
    opacity: 0;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }
  
  .message-box.show {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }
  
  .message-box.hide {
    opacity: 0;
    transform: translateX(-50%) translateY(-50px);
  }
  
  .message-box.success {
    background: #e8f5e9;
    border-right: 4px solid #4caf50;
  }
  
  .message-box.error {
    background: #ffebee;
    border-right: 4px solid #f44336;
  }
  
  .message-box.warning {
    background: #fff3e0;
    border-right: 4px solid #ff9800;
  }
  
  .message-box.info {
    background: #e3f2fd;
    border-right: 4px solid #2196f3;
  }
  
  .message-box.loading {
    background: #f5f5f5;
    border-right: 4px solid #9e9e9e;
  }
  
  body.dark-mode .message-box,
  body.dark .message-box {
    background: #1a1f3a;
    color: #e6eef6;
  }
  
  body.dark-mode .message-box.success,
  body.dark .message-box.success {
    background: #1b3a1f;
    border-right-color: #66bb6a;
  }
  
  body.dark-mode .message-box.error,
  body.dark .message-box.error {
    background: #3a1b1b;
    border-right-color: #ef5350;
  }
  
  body.dark-mode .message-box.warning,
  body.dark .message-box.warning {
    background: #3a2f1b;
    border-right-color: #ffa726;
  }
  
  body.dark-mode .message-box.info,
  body.dark .message-box.info {
    background: #1b2a3a;
    border-right-color: #42a5f5;
  }
  
  .message-icon {
    flex-shrink: 0;
    display: flex;
    align-items: center;
  }
  
  .message-box.success .message-icon { color: #4caf50; }
  .message-box.error .message-icon { color: #f44336; }
  .message-box.warning .message-icon { color: #ff9800; }
  .message-box.info .message-icon { color: #2196f3; }
  .message-box.loading .message-icon { color: #9e9e9e; }
  
  .message-text {
    flex: 1;
    font-size: 15px;
    font-weight: 500;
    color: #333;
  }
  
  body.dark-mode .message-text,
  body.dark .message-text {
    color: #e6eef6;
  }
  
  .message-close {
    background: none;
    border: none;
    cursor: pointer;
    padding: 4px;
    display: flex;
    align-items: center;
    border-radius: 4px;
    transition: all 0.2s;
    color: #666;
  }
  
  .message-close:hover {
    background: rgba(0, 0, 0, 0.05);
    color: #333;
  }
  
  body.dark-mode .message-close,
  body.dark .message-close {
    color: #b8c5d6;
  }
  
  body.dark-mode .message-close:hover,
  body.dark .message-close:hover {
    background: rgba(255, 255, 255, 0.05);
    color: #e6eef6;
  }
  
  .message-spinner {
    animation: spin 1s linear infinite;
  }
  
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
  
  /* Dark Mode Ripple */
  .dark-mode-ripple-global {
    position: fixed;
    width: 50px;
    height: 50px;
    border-radius: 50%;
    background: radial-gradient(circle, #f4b400 0%, transparent 70%);
    transform: translate(-50%, -50%);
    pointer-events: none;
    z-index: 9999;
    animation: rippleExpandGlobal 0.8s ease-out forwards;
  }
  
  @keyframes rippleExpandGlobal {
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
  
  /* Confirmation Dialog */
  .confirm-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(4px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10001;
    opacity: 0;
    transition: opacity 0.3s ease;
  }
  
  .confirm-overlay.show {
    opacity: 1;
  }
  
  .confirm-dialog {
    background: white;
    border-radius: 16px;
    padding: 32px;
    max-width: 400px;
    width: 90%;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    text-align: center;
    transform: scale(0.9) translateY(20px);
    opacity: 0;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }
  
  .confirm-dialog.show {
    transform: scale(1) translateY(0);
    opacity: 1;
  }
  
  body.dark-mode .confirm-dialog,
  body.dark .confirm-dialog {
    background: #1a1f3a;
    color: #e6eef6;
  }
  
  .confirm-icon {
    color: #ff9800;
    margin-bottom: 20px;
  }
  
  .confirm-message {
    font-size: 18px;
    line-height: 1.6;
    margin-bottom: 24px;
    color: #333;
  }
  
  body.dark-mode .confirm-message,
  body.dark .confirm-message {
    color: #e6eef6;
  }
  
  .confirm-buttons {
    display: flex;
    gap: 12px;
    justify-content: center;
  }
  
  .confirm-btn {
    padding: 12px 24px;
    border: none;
    border-radius: 10px;
    font-size: 15px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
  }
  
  .confirm-yes {
    background: linear-gradient(135deg, #f4b400 0%, #d89e00 100%);
    color: white;
  }
  
  .confirm-yes:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(244, 180, 0, 0.4);
  }
  
  .confirm-no {
    background: #e0e0e0;
    color: #333;
  }
  
  body.dark-mode .confirm-no,
  body.dark .confirm-no {
    background: #2a3552;
    color: #e6eef6;
  }
  
  .confirm-no:hover {
    background: #d0d0d0;
  }
  
  body.dark-mode .confirm-no:hover,
  body.dark .confirm-no:hover {
    background: #3a4562;
  }
  
  /* Tooltip */
  .tooltip {
    position: absolute;
    bottom: calc(100% + 8px);
    left: 50%;
    transform: translateX(-50%) translateY(5px);
    background: #333;
    color: white;
    padding: 6px 12px;
    border-radius: 6px;
    font-size: 13px;
    white-space: nowrap;
    opacity: 0;
    pointer-events: none;
    transition: all 0.2s;
    z-index: 1000;
  }
  
  .tooltip::after {
    content: '';
    position: absolute;
    top: 100%;
    left: 50%;
    transform: translateX(-50%);
    border: 5px solid transparent;
    border-top-color: #333;
  }
  
  .tooltip.show {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }
  
  /* Responsive */
  @media (max-width: 768px) {
    .message-box {
      min-width: 280px;
      max-width: calc(100% - 40px);
    }
    
    .confirm-dialog {
      padding: 24px;
    }
    
    .confirm-buttons {
      flex-direction: column;
    }
    
    .confirm-btn {
      width: 100%;
    }
  }
`;

document.head.appendChild(globalStyles);

// ============================================
// EXPORT FOR MODULE USAGE (optional)
// ============================================

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    toggleDarkMode,
    showMessage,
    showLoading,
    hideMessage,
    showConfirm,
    scrollToElement,
    copyToClipboard,
    formatArabicDate,
    debounce
  };
}