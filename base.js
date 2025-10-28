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
  
  // Create ripple effect at the toggle position (CSS handles the animation)
  const ripple = document.createElement('div');
  ripple.className = 'dark-mode-ripple-global';
  
  // Try to find the dark mode toggle button position
  const toggleBtn = document.querySelector('.dark-mode-toggle') || 
                    document.getElementById('darkModeToggle') ||
                    document.getElementById('darkToggle') ||
                    document.querySelector('[data-dark-toggle]');
  
  if (toggleBtn) {
    const rect = toggleBtn.getBoundingClientRect();
    // Position the center of the ripple at the center of the toggle button
    ripple.style.left = `${rect.left + rect.width / 2}px`;
    ripple.style.top = `${rect.top + rect.height / 2}px`;
  } else {
    // Default position if button not found
    ripple.style.left = '50px';
    ripple.style.top = '50px';
  }
  
  document.body.appendChild(ripple);
  
  // Toggle dark mode classes
  // We keep both classes for maximum compatibility, but primarily use 'dark'
  body.classList.toggle("dark");
  
  // Save preference
  const isDark = body.classList.contains("dark");
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
    // We only need to add the 'dark' class now, as it's the main reference in CSS
    document.body.classList.add("dark");
    // If you need the old class for legacy components, keep this line:
    // document.body.classList.add("dark-mode");
  }
}

// Apply dark mode as early as possible to prevent flash
applySavedDarkMode();

// ============================================
// MESSAGE NOTIFICATION SYSTEM
// ============================================

/**
 * SVG icons using a single function to avoid repetition
 */
const getIcon = (type) => {
    const icons = {
        success: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`,
        error: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`,
        warning: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
        info: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>`,
        loading: `<svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" style="animation: spin 1s linear infinite;">
          <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" fill="none" stroke-dasharray="31.415, 31.415" stroke-dashoffset="0"/>
        </svg>`
    };
    return icons[type] || icons['info'];
};

const closeIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`;


/**
 * Show a beautiful animated message notification (supports loading type)
 * @param {string} text - Message text to display
 * @param {string} type - Message type: 'success', 'error', 'warning', 'info', 'loading'
 * @param {number} duration - Duration in milliseconds (default: 4000). Set to 0 for permanent.
 * @returns {HTMLElement} The created message box element.
 */
function showMessage(text, type = "info", duration = 4000) {
    // Remove any existing messages of the same type if it's not loading
    if (type !== 'loading') {
        const existing = document.querySelectorAll(`.message-box.${type}`);
        existing.forEach(msg => msg.remove());
    }
  
    // Create message box
    const box = document.createElement("div");
    box.className = `message-box ${type}`;
  
    const isClosable = type !== 'loading' || duration > 0;

    box.innerHTML = `
        <div class="message-icon">${getIcon(type)}</div>
        <div class="message-text">${text}</div>
        ${isClosable ? `<button class="message-close" aria-label="إغلاق">${closeIcon}</button>` : ''}
    `;
  
    document.body.appendChild(box);
  
    // Animate in
    requestAnimationFrame(() => box.classList.add("show"));
  
    // Close button functionality
    const closeBtn = box.querySelector(".message-close");
    if (closeBtn) {
        closeBtn.addEventListener("click", () => hideMessage(box));
    }
  
    // Auto hide after duration
    if (duration > 0) {
        setTimeout(() => hideMessage(box), duration);
    }
  
    return box;
}

/**
 * Hide a message box with animation
 * @param {HTMLElement} box - The message box element to hide
 */
function hideMessage(box) {
  box.classList.remove("show");
  box.classList.add("hide");
  // Ensure that the box is an element before removing
  if (box && typeof box.remove === 'function') {
    setTimeout(() => box.remove(), 300);
  }
}

/**
 * Helper function to show a dedicated loading message (shorthand for showMessage)
 * @param {string} text - Loading message (default: 'جاري التحميل...')
 * @returns {HTMLElement} The created loading message box.
 */
function showLoading(text = "جاري التحميل...") {
  // Duration is set to 0 (permanent) since the caller must explicitly hide it
  return showMessage(text, 'loading', 0);
}


// ============================================
// CONFIRMATION DIALOG
// ============================================

/**
 * Show a custom confirmation dialog
 * @param {string} message - Confirmation message
 * @param {function} onConfirm - Callback when confirmed (Yes)
 * @param {function} onCancel - Callback when cancelled (No) (optional)
 */
function showConfirm(message, onConfirm, onCancel) {
  // Use a Promise to make the showConfirm call cleaner and asynchronous
  return new Promise((resolve) => {
    const overlay = document.createElement("div");
    overlay.className = "confirm-overlay";
    
    const dialog = document.createElement("div");
    dialog.className = "confirm-dialog";
    
    // Check if the message contains HTML, otherwise, use textContent
    const messageContent = message.includes('<') ? message : `<div>${message}</div>`;

    dialog.innerHTML = `
      <div class="confirm-icon">
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="8" x2="12" y2="12"></line>
          <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>
      </div>
      <div class="confirm-message">${messageContent}</div>
      <div class="confirm-buttons">
        <button class="confirm-btn confirm-yes">تأكيد</button>
        <button class="confirm-btn confirm-no">إلغاء</button>
      </div>
    `;
    
    overlay.appendChild(dialog);
    document.body.appendChild(overlay);
    
    // Animate in
    requestAnimationFrame(() => {
      overlay.classList.add("show");
      dialog.classList.add("show");
    });
    
    // Button handlers
    const yesBtn = dialog.querySelector(".confirm-yes");
    const noBtn = dialog.querySelector(".confirm-no");
    
    const close = (result) => {
      overlay.classList.remove("show");
      dialog.classList.remove("show");
      setTimeout(() => overlay.remove(), 300);
      resolve(result); // Resolve the promise
    };
    
    yesBtn.addEventListener("click", () => {
      close(true);
      if (onConfirm) onConfirm();
    });
    
    noBtn.addEventListener("click", () => {
      close(false);
      if (onCancel) onCancel();
    });
    
    // Close on overlay click
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) {
        close(false);
        if (onCancel) onCancel();
      }
    });
  });
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Smooth scroll to element
 * @param {string} selector - CSS selector of the target element
 * @param {number} offset - Offset from the top in pixels (default: 80)
 */
function scrollToElement(selector, offset = 80) {
  const element = document.querySelector(selector);
  if (element) {
    const top = element.getBoundingClientRect().top + window.pageYOffset - offset;
    window.scrollTo({ top, behavior: 'smooth' });
  }
}

/**
 * Copy text to clipboard
 * @param {string} text - The text to copy
 * @returns {Promise<boolean>} True if successful, false otherwise
 */
async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    showMessage("تم النسخ بنجاح!", "success", 2000);
    return true;
  } catch (err) {
    // Fallback for older browsers or restricted environments
    try {
      const tempInput = document.createElement('textarea');
      tempInput.value = text;
      document.body.appendChild(tempInput);
      tempInput.select();
      document.execCommand('copy');
      document.body.removeChild(tempInput);
      showMessage("تم النسخ بنجاح (طريقة بديلة)!", "success", 2000);
      return true;
    } catch (fallbackErr) {
      showMessage("فشل النسخ", "error", 3000);
      return false;
    }
  }
}

/**
 * Format date to Arabic
 * @param {Date|string} date - Date object or date string
 * @returns {string} Arabic formatted date string
 */
function formatArabicDate(date) {
  const d = new Date(date);
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  // Using 'ar-SA' (Saudi Arabia) or 'ar-EG' (Egypt) is common, 'ar-IQ' is good too.
  return d.toLocaleDateString('ar-SA', options);
}

/**
 * Debounce function to limit the rate of function execution
 * @param {function} func - The function to debounce
 * @param {number} wait - The delay in milliseconds
 * @returns {function} The debounced function
 */
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const context = this;
    const later = () => {
      clearTimeout(timeout);
      func.apply(context, args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttle function to ensure a function is executed at most once every specified period
 * @param {function} func - The function to throttle
 * @param {number} limit - The limit in milliseconds
 * @returns {function} The throttled function
 */
function throttle(func, limit) {
  let inThrottle;
  return function() {
    const context = this;
    const args = arguments;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}


// ============================================
// INITIALIZE ON DOM LOAD
// ============================================

window.addEventListener("DOMContentLoaded", () => {
  
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
      if (target && target !== '#') {
        // Use the common offset (80px) for fixed headers
        scrollToElement(target, 80); 
      }
    });
  });
  
  // Initialize tooltips (if elements have data-tooltip)
  document.querySelectorAll('[data-tooltip]').forEach(el => {
    let tooltip = null;

    const showTooltip = function() {
      const text = this.getAttribute('data-tooltip');
      if (!text || tooltip) return;

      tooltip = document.createElement('div');
      tooltip.className = 'tooltip';
      tooltip.textContent = text;
      
      // Append to body to avoid clipping issues with parent elements
      document.body.appendChild(tooltip); 
      
      // Calculate position (must be done after appending)
      const rect = this.getBoundingClientRect();
      const scrollY = window.scrollY;
      
      tooltip.style.left = `${rect.left + rect.width / 2}px`;
      // Position the tooltip above the element
      tooltip.style.top = `${rect.top + scrollY - tooltip.offsetHeight - 8}px`; 

      requestAnimationFrame(() => tooltip.classList.add('show'));
    };

    const hideTooltip = function() {
      if (tooltip) {
        tooltip.classList.remove('show');
        setTimeout(() => {
          if (tooltip && tooltip.parentElement) {
            tooltip.remove();
          }
          tooltip = null;
        }, 200);
      }
    };

    el.addEventListener('mouseenter', showTooltip);
    el.addEventListener('mouseleave', hideTooltip);
    // Hide tooltip on scroll to prevent detachment issues
    window.addEventListener('scroll', throttle(hideTooltip, 100));
  });
});

// ============================================
// EXPORT FOR GLOBAL ACCESS
// ============================================

window.toggleDarkMode = toggleDarkMode;
window.showMessage = showMessage;
window.showLoading = showLoading;
window.hideMessage = hideMessage;
window.showConfirm = showConfirm;
window.scrollToElement = scrollToElement;
window.copyToClipboard = copyToClipboard;
window.formatArabicDate = formatArabicDate;
window.debounce = debounce;
window.throttle = throttle;


// ============================================
// INJECT GLOBAL STYLES (REMOVED)
// ============================================

// تم إزالة كتلة حقن الأنماط بالكامل
// (const globalStyles = document.createElement('style'); ... document.head.appendChild(globalStyles);)
// لضمان الاعتماد الكلي على ملف base.css الخارجي الذي تم تعديله مسبقاً.
