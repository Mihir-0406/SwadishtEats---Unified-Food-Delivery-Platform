/* ============================================================
   js/auth.js — Shared auth utilities across all pages
   ============================================================ */
'use strict';

// Re-used toast function for auth pages
function showToast(type, title, msg) {
  const toast = document.getElementById('toast');
  if (!toast) return;
  const icon = document.getElementById('toastIcon');
  const ttl  = document.getElementById('toastTitle');
  const tmsg = document.getElementById('toastMsg');
  if (icon) icon.textContent = type === 'success' ? '✅' : '❌';
  if (ttl)  ttl.textContent  = title;
  if (tmsg) tmsg.textContent = msg || '';
  toast.className = `toast ${type} show`;
  setTimeout(() => toast && toast.classList.remove('show'), 4000);
}

// Check if a user is logged in
function getLoggedInUser() {
  try {
    const str = localStorage.getItem('se_user');
    return str ? JSON.parse(str) : null;
  } catch { return null; }
}

// Expose globally
window.showToast = showToast;
window.getLoggedInUser = getLoggedInUser;
