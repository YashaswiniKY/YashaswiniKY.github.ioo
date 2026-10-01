/**
 * YASHASWINI K Y — PORTFOLIO JAVASCRIPT
 * =======================================
 * Modules:
 *  1. DOM Ready Initialiser
 *  2. Navigation — Sticky, Scroll Highlight, Active Link
 *  3. Mobile Menu (Hamburger)
 *  4. Scroll Reveal Animations
 *  5. Back-to-Top Button
 *  6. Contact Form Validation
 *  7. Dynamic Copyright Year
 *  8. Smooth Scroll for Anchor Links
 *  9. Keyboard Accessibility Helpers
 */

'use strict';

/* ============================================================
   1. DOM READY INITIALISER
================================================================ */
document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initMobileMenu();
  initScrollReveal();
  initBackToTop();
  initContactForm();
  initCopyrightYear();
  initSmoothScroll();
  initKeyboardAccessibility();
});

/* ============================================================
   2. NAVIGATION — Sticky + Active link on scroll
================================================================ */
function initNavbar() {
  const navbar  = document.getElementById('navbar');
  const navLinks = document.querySelectorAll('.nav-link[data-section]');

  if (!navbar) return;

  // Build an ordered list of [sectionId, navLink] pairs
  const sections = [];
  navLinks.forEach(link => {
    const id = link.getAttribute('data-section');
    const el = document.getElementById(id);
    if (el) sections.push({ id, el, link });
  });

  let ticking = false;

  function onScroll() {
    if (!ticking) {
      requestAnimationFrame(() => {
        updateNavbarStyle(navbar);
        updateActiveLink(sections);
        ticking = false;
      });
      ticking = true;
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });

  // Run once on load to set initial state
  updateNavbarStyle(navbar);
  updateActiveLink(sections);
}

/**
 * Toggles the `.scrolled` class on the navbar based on scroll position.
 */
function updateNavbarStyle(navbar) {
  if (window.scrollY > 20) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
}

/**
 * Highlights the nav link corresponding to the section currently in view.
 * Uses a top-biased threshold so the link activates before the section
 * fully scrolls into view.
 */
function updateActiveLink(sections) {
  const scrollY    = window.scrollY;
  const navHeight  = parseInt(
    getComputedStyle(document.documentElement).getPropertyValue('--nav-height') || '70',
    10
  );
  const threshold  = navHeight + 80;

  let current = sections[0]; // default to first section

  sections.forEach(section => {
    const top = section.el.getBoundingClientRect().top + scrollY - threshold;
    if (scrollY >= top) {
      current = section;
    }
  });

  sections.forEach(({ link }) => link.classList.remove('active'));
  if (current) current.link.classList.add('active');
}

/* ============================================================
   3. MOBILE MENU (Hamburger)
================================================================ */
function initMobileMenu() {
  const hamburger = document.getElementById('nav-hamburger');
  const navMenu   = document.getElementById('nav-menu');
  const navLinks  = document.querySelectorAll('.nav-link');

  if (!hamburger || !navMenu) return;

  /**
   * Toggle the mobile menu open/closed.
   * @param {boolean} forceClose - if true, always close the menu
   */
  function toggleMenu(forceClose = false) {
    const isCurrentlyOpen = navMenu.classList.contains('open');

    // If forcing close, only act if menu is open
    if (forceClose) {
      if (!isCurrentlyOpen) return;
      navMenu.classList.remove('open');
      hamburger.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
      return;
    }

    // Regular toggle
    if (isCurrentlyOpen) {
      navMenu.classList.remove('open');
      hamburger.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    } else {
      navMenu.classList.add('open');
      hamburger.classList.add('open');
      hamburger.setAttribute('aria-expanded', 'true');
      document.body.style.overflow = 'hidden'; // prevent background scroll
    }
  }

  hamburger.addEventListener('click', () => toggleMenu());

  // Close menu when any nav link is clicked
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      if (navMenu.classList.contains('open')) {
        toggleMenu(true);
      }
    });
  });

  // Close menu on Escape key
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && navMenu.classList.contains('open')) {
      toggleMenu(true);
      hamburger.focus();
    }
  });

  // Close menu when clicking outside the nav area
  document.addEventListener('click', e => {
    if (
      navMenu.classList.contains('open') &&
      !navMenu.contains(e.target) &&
      !hamburger.contains(e.target)
    ) {
      toggleMenu(true);
    }
  });

  // Close menu on window resize to desktop width
  window.addEventListener('resize', debounce(() => {
    if (window.innerWidth > 768 && navMenu.classList.contains('open')) {
      toggleMenu(true);
    }
  }, 200));
}

/* ============================================================
   4. SCROLL REVEAL ANIMATIONS
================================================================ */
function initScrollReveal() {
  const revealElements = document.querySelectorAll('.reveal');

  if (!revealElements.length) return;

  // If the browser doesn't support IntersectionObserver, show all elements immediately
  if (!('IntersectionObserver' in window)) {
    revealElements.forEach(el => el.classList.add('visible'));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          // Once revealed, stop observing to free up resources
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.12,         // trigger when 12% of element is visible
      rootMargin: '0px 0px -40px 0px', // slight offset from viewport bottom
    }
  );

  revealElements.forEach(el => observer.observe(el));
}

/* ============================================================
   5. BACK-TO-TOP BUTTON
================================================================ */
function initBackToTop() {
  const btn = document.getElementById('back-to-top');

  if (!btn) return;

  // Show/hide based on scroll position
  function toggleVisibility() {
    if (window.scrollY > 400) {
      btn.removeAttribute('hidden');
      // Use rAF to allow hidden removal to render before adding class
      requestAnimationFrame(() => btn.classList.add('visible'));
    } else {
      btn.classList.remove('visible');
      // Re-add hidden after transition completes (matches --transition-base 0.28s)
      setTimeout(() => {
        if (!btn.classList.contains('visible')) {
          btn.setAttribute('hidden', '');
        }
      }, 300);
    }
  }

  window.addEventListener('scroll', debounce(toggleVisibility, 100), { passive: true });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    // Return focus to top of page for accessibility
    document.getElementById('navbar')?.focus();
  });
}

/* ============================================================
   6. CONTACT FORM VALIDATION
================================================================ */
function initContactForm() {
  const form       = document.getElementById('contact-form');
  const successBox = document.getElementById('form-success');

  if (!form) return;

  /**
   * Validation rules: each field id mapped to its constraints and error messages.
   */
  const rules = {
    'form-name': {
      errorId:  'name-error',
      validate: (val) => {
        if (!val) return 'Please enter your full name.';
        if (val.length < 2) return 'Name must be at least 2 characters.';
        if (val.length > 100) return 'Name is too long.';
        return '';
      },
    },
    'form-email': {
      errorId:  'email-error',
      validate: (val) => {
        if (!val) return 'Please enter your email address.';
        // RFC-5322 simplified pattern
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
        if (!emailPattern.test(val)) return 'Please enter a valid email address.';
        return '';
      },
    },
    'form-subject': {
      errorId:  'subject-error',
      validate: (val) => {
        if (!val) return 'Please enter a subject.';
        if (val.length < 3) return 'Subject is too short.';
        if (val.length > 200) return 'Subject is too long.';
        return '';
      },
    },
    'form-message': {
      errorId:  'message-error',
      validate: (val) => {
        if (!val) return 'Please enter your message.';
        if (val.length < 10) return 'Message is too short (minimum 10 characters).';
        if (val.length > 2000) return 'Message is too long (maximum 2000 characters).';
        return '';
      },
    },
  };

  /**
   * Show or clear an error message for a field.
   * @param {string} fieldId
   * @param {string} message - empty string clears the error
   */
  function setFieldError(fieldId, message) {
    const input     = document.getElementById(fieldId);
    const errorSpan = document.getElementById(rules[fieldId].errorId);

    if (!input || !errorSpan) return;

    if (message) {
      input.classList.add('invalid');
      input.setAttribute('aria-invalid', 'true');
      errorSpan.textContent = message;
    } else {
      input.classList.remove('invalid');
      input.setAttribute('aria-invalid', 'false');
      errorSpan.textContent = '';
    }
  }

  /**
   * Validate a single field and return true if valid.
   */
  function validateField(fieldId) {
    const input = document.getElementById(fieldId);
    if (!input) return true;

    const val   = input.value.trim();
    const error = rules[fieldId].validate(val);
    setFieldError(fieldId, error);
    return error === '';
  }

  /**
   * Validate all fields and return true if all pass.
   */
  function validateAll() {
    let allValid = true;
    Object.keys(rules).forEach(id => {
      if (!validateField(id)) allValid = false;
    });
    return allValid;
  }

  // Real-time validation: clear error on input after first submit attempt
  let hasSubmitted = false;

  Object.keys(rules).forEach(id => {
    const input = document.getElementById(id);
    if (!input) return;

    input.addEventListener('input', () => {
      if (hasSubmitted) validateField(id);
    });

    input.addEventListener('blur', () => {
      if (hasSubmitted) validateField(id);
    });
  });

  // Form submit handler
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    hasSubmitted = true;

    if (!validateAll()) {
      // Focus the first invalid field
      const firstInvalid = form.querySelector('.invalid');
      if (firstInvalid) firstInvalid.focus();
      return;
    }

    // All fields valid — show success state
    // (No backend: this is a frontend-only portfolio)
    showFormSuccess();
  });

  /**
   * Reset form and display a success confirmation message.
   */
  function showFormSuccess() {
    form.reset();
    hasSubmitted = false;

    // Clear all validation states
    Object.keys(rules).forEach(id => setFieldError(id, ''));

    if (successBox) {
      successBox.removeAttribute('hidden');
      successBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      // Hide success message after 6 seconds
      setTimeout(() => {
        successBox.setAttribute('hidden', '');
      }, 6000);
    }
  }
}

/* ============================================================
   7. DYNAMIC COPYRIGHT YEAR
================================================================ */
function initCopyrightYear() {
  const yearEl = document.getElementById('footer-year');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }
}

/* ============================================================
   8. SMOOTH SCROLL FOR ANCHOR LINKS
================================================================ */
function initSmoothScroll() {
  // CSS `scroll-behavior: smooth` handles most cases, but this JS version
  // gives us precise control over offset (accounting for the sticky nav).
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const href = anchor.getAttribute('href');

      // Skip if it's just "#"
      if (!href || href === '#') return;

      const target = document.querySelector(href);
      if (!target) return;

      e.preventDefault();

      const navHeight = parseInt(
        getComputedStyle(document.documentElement).getPropertyValue('--nav-height') || '70',
        10
      );

      const targetTop = target.getBoundingClientRect().top + window.scrollY - navHeight;

      window.scrollTo({
        top: targetTop,
        behavior: 'smooth',
      });

      // Update URL hash without jumping
      // Skip on file:// protocol — pushState is blocked by browser security
      if (location.protocol !== 'file:') {
        history.pushState(null, '', href);
      }
    });
  });
}

/* ============================================================
   9. KEYBOARD ACCESSIBILITY HELPERS
================================================================ */
function initKeyboardAccessibility() {
  // Trap focus inside mobile menu when open
  const navMenu   = document.getElementById('nav-menu');
  const hamburger = document.getElementById('nav-hamburger');

  if (navMenu && hamburger) {
    navMenu.addEventListener('keydown', (e) => {
      if (!navMenu.classList.contains('open')) return;
      if (e.key !== 'Tab') return;

      // Collect all focusable elements within the nav menu
      const focusable = navMenu.querySelectorAll(
        'a[href], button, input, textarea, select, [tabindex]:not([tabindex="-1"])'
      );
      const focusArray  = Array.from(focusable);
      const firstEl     = focusArray[0];
      const lastEl      = focusArray[focusArray.length - 1];

      if (e.shiftKey) {
        // Shift+Tab: if focus is on first item, wrap to last
        if (document.activeElement === firstEl) {
          e.preventDefault();
          lastEl.focus();
        }
      } else {
        // Tab: if focus is on last item, wrap to first
        if (document.activeElement === lastEl) {
          e.preventDefault();
          firstEl.focus();
        }
      }
    });
  }

  // Add skip-to-content link behaviour (if present)
  const skipLink = document.querySelector('.skip-link');
  if (skipLink) {
    skipLink.addEventListener('click', () => {
      const main = document.querySelector('main');
      if (main) {
        main.setAttribute('tabindex', '-1');
        main.focus();
      }
    });
  }

  // Improve button keyboard activation (Enter key on custom buttons)
  document.querySelectorAll('[role="button"]').forEach(el => {
    el.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        el.click();
      }
    });
  });
}

/* ============================================================
   UTILITY FUNCTIONS
================================================================ */

/**
 * Debounce: delay execution of a function until after `wait` ms of inactivity.
 * @param {Function} fn
 * @param {number} wait - milliseconds
 * @returns {Function}
 */
function debounce(fn, wait) {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), wait);
  };
}
