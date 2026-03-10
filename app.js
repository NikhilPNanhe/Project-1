/**
 * School Management Portal — Shared JavaScript Utilities
 * =========================================================
 * Provides:
 *   - localStorage helpers  (getUsers, saveUsers, getCurrentUser, setCurrentUser)
 *   - Auth guards           (requireRole)
 *   - User-menu dropdown    (initUserMenu)
 *   - Sidebar navigation    (initSidebar, showPanel)
 *   - Profile helpers       (loadProfileUI, toggleEditProfile, saveProfile)
 *   - Password change       (changePassword)
 *   - Logout                (logout)
 */

'use strict';

/* ── LocalStorage keys ─────────────────────────────────────── */
const SMS_USERS_KEY   = 'sms_users';
const SMS_CURRENT_KEY = 'sms_current_user';

/* ── Storage helpers ───────────────────────────────────────── */
function getUsers() {
  return JSON.parse(localStorage.getItem(SMS_USERS_KEY) || '[]');
}

function saveUsers(users) {
  localStorage.setItem(SMS_USERS_KEY, JSON.stringify(users));
}

function getCurrentUser() {
  const raw = localStorage.getItem(SMS_CURRENT_KEY);
  return raw ? JSON.parse(raw) : null;
}

function setCurrentUser(user) {
  localStorage.setItem(SMS_CURRENT_KEY, JSON.stringify(user));
}

function updateCurrentUser(patch) {
  const user = getCurrentUser();
  if (!user) return;
  Object.assign(user, patch);
  setCurrentUser(user);

  // Sync to users list
  const users = getUsers();
  const idx   = users.findIndex(u => u.id === user.id);
  if (idx !== -1) {
    Object.assign(users[idx], patch);
    saveUsers(users);
  }
}

/* ── Auth ──────────────────────────────────────────────────── */
/**
 * Call at top of each dashboard page.
 * @param {string} role  - expected role ('teacher' | 'principal' | 'admin')
 * @returns {object}     - current user object (never returns if not authed)
 */
function requireRole(role) {
  const user = getCurrentUser();
  if (!user || user.role !== role) {
    location.href = 'index.html';
    return null;
  }
  return user;
}

function logout() {
  localStorage.removeItem(SMS_CURRENT_KEY);
  location.href = 'index.html';
}

/* ── User-menu dropdown ────────────────────────────────────── */
/**
 * Wire up the top-right user button & dropdown.
 * Requires: #userBtn, #dropdown elements on the page.
 */
function initUserMenu() {
  const btn = document.getElementById('userBtn');
  const dd  = document.getElementById('dropdown');
  if (!btn || !dd) return;

  btn.addEventListener('click', function (e) {
    e.stopPropagation();
    dd.classList.toggle('open');
    btn.setAttribute('aria-expanded', dd.classList.contains('open'));
  });

  document.addEventListener('click', function () {
    dd.classList.remove('open');
    if (btn) btn.setAttribute('aria-expanded', 'false');
  });
}

function closeDropdown() {
  const dd  = document.getElementById('dropdown');
  const btn = document.getElementById('userBtn');
  if (dd)  dd.classList.remove('open');
  if (btn) btn.setAttribute('aria-expanded', 'false');
}

/* ── Sidebar / panel navigation ───────────────────────────── */
/**
 * Show a named panel and activate the matching nav-item.
 * Panels have ids like "panel-<name>"; nav-items have "nav-<name>".
 * @param {string} name
 * @param {Function} [onShow]  - optional callback after switching
 */
function showPanel(name, onShow) {
  document.querySelectorAll('.panel').forEach(function (p) {
    p.classList.remove('active');
  });
  document.querySelectorAll('.nav-item').forEach(function (n) {
    n.classList.remove('active');
  });

  const panel = document.getElementById('panel-' + name);
  if (panel) panel.classList.add('active');

  const navEl = document.getElementById('nav-' + name);
  if (navEl) navEl.classList.add('active');

  if (typeof onShow === 'function') onShow(name);
}

/* ── Profile helpers ───────────────────────────────────────── */
/**
 * Populate read-only profile fields from current user.
 * Expects elements with ids: profileAvatar, profileName, profileEmail,
 * pName, pEmail, pPhone, pRole, pDate, and optional pSubject / pExp.
 */
function loadProfileUI(user) {
  const setEl = function (id, val) {
    const el = document.getElementById(id);
    if (el) el.textContent = val || '–';
  };

  setEl('profileName',    user.name);
  setEl('profileEmail',   user.email);
  setEl('pName',  user.name);
  setEl('pEmail', user.email);
  setEl('pPhone', user.phone);
  setEl('pRole',  user.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : '–');
  setEl('pDate',  user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '');

  if (user.subject)    setEl('pSubject',    user.subject);
  if (user.experience) setEl('pExp', user.experience + ' years');

  if (avatarEl && user.name) avatarEl.textContent = user.name[0].toUpperCase();

  const topAvatar = document.getElementById('topAvatar');
  if (topAvatar && user.name) topAvatar.textContent = user.name[0].toUpperCase();

  const topName = document.getElementById('topName');
  if (topName && user.name) topName.textContent = user.name.split(' ')[0];

  // Pre-fill edit fields
  const setVal = function (id, val) {
    const el = document.getElementById(id);
    if (el) el.value = val || '';
  };
  setVal('editName',    user.name);
  setVal('editEmail',   user.email);
  setVal('editPhone',   user.phone);
  setVal('editSubject', user.subject);
  setVal('editExp',     user.experience);
}

/**
 * Toggle between view and edit modes for the profile card.
 */
function toggleEditProfile() {
  const view = document.getElementById('profileViewMode');
  const edit = document.getElementById('profileEditMode');
  if (!view || !edit) return;

  const isEditing = edit.style.display !== 'none';
  view.style.display = isEditing ? 'block' : 'none';
  edit.style.display = isEditing ? 'none'  : 'block';

  const msgEl = document.getElementById('profileMsg');
  if (msgEl) { msgEl.className = 'msg'; msgEl.textContent = ''; }

  if (!isEditing) {
    // refresh edit fields from current user
    const user = getCurrentUser();
    if (user) {
      const sv = function (id, v) { const el = document.getElementById(id); if (el) el.value = v || ''; };
      sv('editName',    user.name);
      sv('editPhone',   user.phone);
      sv('editSubject', user.subject);
      sv('editExp',     user.experience);
    }
  }
}

/**
 * Save the profile edit form.
 * Reads #editName, #editPhone, and optionally #editSubject / #editExp.
 * @param {Event} e
 * @param {Function} [onSaved] - callback(updatedUser) after saving
 */
function saveProfile(e, onSaved) {
  e.preventDefault();
  const msgEl = document.getElementById('profileMsg');

  const name    = (document.getElementById('editName')    || {value: ''}).value.trim();
  const phone   = (document.getElementById('editPhone')   || {value: ''}).value.trim();
  const subject = (document.getElementById('editSubject') || {value: ''}).value.trim();
  const exp     = (document.getElementById('editExp')     || {value: ''}).value.trim();

  if (!name || !phone) {
    if (msgEl) { msgEl.className = 'msg error'; msgEl.textContent = 'Name and phone are required.'; }
    return;
  }

  const patch = { name, phone };
  if (subject !== '') patch.subject    = subject;
  if (exp     !== '') patch.experience = exp;

  updateCurrentUser(patch);
  const user = getCurrentUser();

  if (msgEl) { msgEl.className = 'msg success'; msgEl.textContent = '✅ Profile updated successfully.'; }
  if (user)  loadProfileUI(user);

  setTimeout(function () {
    toggleEditProfile();
    if (typeof onSaved === 'function') onSaved(user);
  }, 1400);
}

/* ── Change password ───────────────────────────────────────── */
/**
 * Handle the change-password form submission.
 * Reads #currPw, #newPw, #confPw; shows result in #pwMsg.
 * @param {Event} e
 */
function changePassword(e) {
  e.preventDefault();
  const msgEl  = document.getElementById('pwMsg');
  const currPw = document.getElementById('currPw').value;
  const newPw  = document.getElementById('newPw').value;
  const confPw = document.getElementById('confPw').value;

  if (msgEl) { msgEl.className = 'msg'; msgEl.textContent = ''; }

  if (!currPw || !newPw || !confPw) {
    if (msgEl) { msgEl.className = 'msg error'; msgEl.textContent = 'Please fill in all fields.'; }
    return;
  }

  const user = getCurrentUser();
  if (!user) { location.href = 'index.html'; return; }

  if (currPw !== user.password) {
    if (msgEl) { msgEl.className = 'msg error'; msgEl.textContent = 'Current password is incorrect.'; }
    return;
  }
  if (newPw.length < 6) {
    if (msgEl) { msgEl.className = 'msg error'; msgEl.textContent = 'New password must be at least 6 characters.'; }
    return;
  }
  if (newPw !== confPw) {
    if (msgEl) { msgEl.className = 'msg error'; msgEl.textContent = 'New passwords do not match.'; }
    return;
  }

  updateCurrentUser({ password: newPw });
  if (msgEl) { msgEl.className = 'msg success'; msgEl.textContent = '✅ Password updated successfully.'; }
  document.getElementById('pwForm').reset();
}

/* ── Message helper ────────────────────────────────────────── */
/**
 * Show a temporary message in an element.
 * @param {string}  id       - element id
 * @param {string}  type     - 'success' | 'error'
 * @param {string}  text     - message text
 * @param {number}  [ttl]    - auto-clear after ms (0 = never)
 */
function showMsg(id, type, text, ttl) {
  const el = document.getElementById(id);
  if (!el) return;
  el.className = 'msg ' + type;
  el.textContent = text;
  if (ttl) {
    setTimeout(function () { el.className = 'msg'; el.textContent = ''; }, ttl);
  }
}
