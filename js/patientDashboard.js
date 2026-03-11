// patientDashboard.js
// Dashboard-specific JS: robust selectors and small UI behaviors
(function () {
  'use strict';

  function safeText(node) {
    return node && node.textContent ? node.textContent.trim() : '';
  }

  // Activate sidebar links (left column)
  function initSidebarLinks() {
    const sidebar = document.querySelector('aside .space-y-2');
    if (!sidebar) return;
    const links = sidebar.querySelectorAll('a');
    links.forEach(a => {
      a.addEventListener('click', function (e) {
        e.preventDefault();
        links.forEach(l => l.classList.remove('bg-gray-100'));
        this.classList.add('bg-gray-100');
      });
    });
  }

  // Follow button: toggle "Following"
  function initFollowButtons() {
    const followButtons = Array.from(document.querySelectorAll('button')).filter(b => safeText(b).toLowerCase().includes('follow'));
    followButtons.forEach(btn => {
      btn.addEventListener('click', function () {
        const isFollowing = this.dataset.following === 'true';
        if (isFollowing) {
          this.textContent = 'Follow';
          this.classList.remove('bg-blue-500', 'text-white');
          this.classList.add('border', 'border-blue-500', 'text-blue-600');
          this.dataset.following = 'false';
        } else {
          this.textContent = 'Following';
          this.classList.add('bg-blue-500', 'text-white');
          this.classList.remove('border', 'border-blue-500', 'text-blue-600');
          this.dataset.following = 'true';
        }
      });
    });
  }

  // Talk to Doctor button: find by nearby heading text
  function initTalkToDoctor() {
    const widgets = document.querySelectorAll('.max-w-7xl aside + * , .space-y-4');
    // fallback: find button with text
    const talkBtns = Array.from(document.querySelectorAll('button')).filter(b => safeText(b).toLowerCase().includes('talk to doctor'));
    if (talkBtns.length) {
      talkBtns.forEach(btn => btn.addEventListener('click', () => {
        // Minimal UI: show modal-like overlay
        showToast('Connecting you with available doctors...');
      }));
      return;
    }

    // Try other fallback: button inside element containing "Need Urgent Help"
    const urgent = Array.from(document.querySelectorAll('div')).find(d => safeText(d).includes('Need Urgent Help'));
    if (urgent) {
      const btn = urgent.querySelector('button');
      if (btn) btn.addEventListener('click', () => showToast('Connecting you with available doctors...'));
    }
  }

  // Show a small toast message
  function showToast(message, timeout = 2200) {
    const existing = document.getElementById('agocare-toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.id = 'agocare-toast';
    toast.className = 'fixed bottom-6 right-6 bg-black/75 text-white px-4 py-2 rounded shadow-lg z-50';
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => {
      toast.style.transition = 'opacity 300ms';
      toast.style.opacity = '0';
      setTimeout(() => toast.remove(), 300);
    }, timeout);
  }

  // Expand/collapse recent question cards when clicked
  function initQuestionCards() {
    const cards = document.querySelectorAll('.space-y-4 .bg-gray-50');
    cards.forEach(card => {
      card.style.cursor = 'pointer';
      card.addEventListener('click', function () {
        const expanded = this.dataset.expanded === 'true';
        if (expanded) {
          this.style.maxHeight = '';
          this.dataset.expanded = 'false';
        } else {
          this.style.maxHeight = '400px';
          this.dataset.expanded = 'true';
        }
      });
    });
  }

  // Keyboard shortcut: focus search on "/" or "q"
  function initKeyboardShortcuts() {
    const search = document.querySelector('input[placeholder*="Search"]');
    document.addEventListener('keydown', function (e) {
      if (e.key === '/' || e.key === 'q') {
        if (search) { search.focus(); e.preventDefault(); }
      }
    });
  }

  // Small helper to hydrate summary numbers from API data
  function hydrateSummaryCards() {
    const cards = document.querySelectorAll('[data-summary-key]');
    if (!cards.length) return;
    // Summary counts are loaded dynamically by loadSummaryCounts() in the HTML
    // Set initial placeholder values
    cards.forEach(c => {
      if (!c.textContent || c.textContent === '0') {
        c.textContent = '...';
      }
    });
  }

  // Initialize all
  document.addEventListener('DOMContentLoaded', function () {
    initSidebarLinks();
    initFollowButtons();
    initTalkToDoctor();
    initQuestionCards();
    initKeyboardShortcuts();
    hydrateSummaryCards();
  });

})();
