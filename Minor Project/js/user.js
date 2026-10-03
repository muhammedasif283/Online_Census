/* ============================================================
   KERALA DIGITAL CENSUS 2026 – Enumerator Module (user.js)
   Depends on: js/app.js  (KEYS, CREDS, Storage, Auth, UserAccounts, UI)
   Responsibilities: auth (sign-in/up/reset) · dashboard · form CRUD · search · stats
   ============================================================ */
'use strict';

/* ── Module-level state ──────────────────────────────────────── */
let records = Storage.getRecords();
let editIndex = null;   // null = create, number = update

/* ═══════════════════════════════════════════════════════════════
   INIT
═══════════════════════════════════════════════════════════════ */
window.addEventListener('DOMContentLoaded', () => {
    /* Already logged in as user → go straight to dashboard */
    if (Auth.isUser()) {
        _enterDashboard();
        return;
    }

    /* Already logged in as admin → send to admin panel */
    if (Auth.isAdmin()) {
        window.location.href = 'records.html';
        return;
    }

    /* Bind login form handlers */
    document.getElementById('signin-form').addEventListener('submit', _handleSignIn);
    document.getElementById('signup-form').addEventListener('submit', _handleSignUp);
    document.getElementById('reset-form').addEventListener('submit', _handleReset);
    document.getElementById('admin-form').addEventListener('submit', _handleAdminLogin);

    /* Password visibility toggles */
    _initPwdToggles();
});

/* ═══════════════════════════════════════════════════════════════
   OUTER ROLE TOGGLE  (Enumerator ↔ Administrator)
═══════════════════════════════════════════════════════════════ */

/** Toggle the visible login panel (enumerator ↔ administrator). */
function switchRole(role) {
    const isUser = role === 'user';
    document.getElementById('tab-user').classList.toggle('active', isUser);
    document.getElementById('tab-admin').classList.toggle('active', !isUser);
    document.getElementById('panel-user').classList.toggle('active', isUser);
    document.getElementById('panel-admin').classList.toggle('active', !isUser);
}

/* ═══════════════════════════════════════════════════════════════
   INNER AUTH MODE (Sign In / Sign Up / Reset Password)
═══════════════════════════════════════════════════════════════ */

/**
 * Switch between 'signin', 'signup', and 'reset' sub-panels
 * within the Enumerator section.
 * @param {'signin'|'signup'|'reset'} mode
 */
function switchAuthMode(mode) {
    ['signin', 'signup', 'reset'].forEach(m => {
        const panel = document.getElementById(`auth-${m}`);
        const tab = document.getElementById(`authtab-${m}`);
        if (panel) panel.classList.toggle('active', m === mode);
        if (tab) tab.classList.toggle('active', m === mode);
    });
    // clear all inline errors when switching
    ['signin-error', 'signup-error', 'reset-error'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.classList.remove('show');
    });
}

/* ═══════════════════════════════════════════════════════════════
   AUTH HANDLERS
═══════════════════════════════════════════════════════════════ */

function _handleSignIn(e) {
    e.preventDefault();

    const email = document.getElementById('signin-email').value.trim();
    const password = document.getElementById('signin-password').value;

    if (!email || !password) {
        UI.showError('signin-error', 'Please enter your email and password.');
        return;
    }

    const user = UserAccounts.verify(email, password);
    if (!user) {
        UI.showError('signin-error', 'Incorrect email or password. Please try again.');
        return;
    }

    Auth.loginUser({ userId: user.id, name: user.name, email: user.email });
    _enterDashboard();
}

function _handleSignUp(e) {
    e.preventDefault();

    const name = document.getElementById('signup-name').value.trim();
    const email = document.getElementById('signup-email').value.trim();
    const password = document.getElementById('signup-password').value;
    const confirm = document.getElementById('signup-confirm').value;

    if (!name || !email || !password || !confirm) {
        UI.showError('signup-error', 'Please fill in all fields.');
        return;
    }

    /* Basic email format check */
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        UI.showError('signup-error', 'Please enter a valid email address.');
        return;
    }

    if (password.length < 6) {
        UI.showError('signup-error', 'Password must be at least 6 characters.');
        return;
    }

    if (password !== confirm) {
        UI.showError('signup-error', 'Passwords do not match. Please re-enter.');
        return;
    }

    const result = UserAccounts.register({ name, email, password });
    if (result === 'exists') {
        UI.showError('signup-error', 'This email is already registered. Please sign in instead.');
        return;
    }

    UI.showToast('🎉 Account created! Please sign in.', 'success');
    document.getElementById('signup-form').reset();
    switchAuthMode('signin');
}

function _handleReset(e) {
    e.preventDefault();

    const email = document.getElementById('reset-email').value.trim();
    const password = document.getElementById('reset-password').value;
    const confirm = document.getElementById('reset-confirm').value;

    if (!email || !password || !confirm) {
        UI.showError('reset-error', 'Please fill in all fields.');
        return;
    }

    if (!UserAccounts.find(email)) {
        UI.showError('reset-error', 'No account found with that email address.');
        return;
    }

    if (password.length < 6) {
        UI.showError('reset-error', 'New password must be at least 6 characters.');
        return;
    }

    if (password !== confirm) {
        UI.showError('reset-error', 'Passwords do not match. Please re-enter.');
        return;
    }

    UserAccounts.resetPassword(email, password);
    UI.showToast('🔑 Password reset successfully! Please sign in.', 'success');
    document.getElementById('reset-form').reset();
    switchAuthMode('signin');
}

function _handleAdminLogin(e) {
    e.preventDefault();

    const username = document.getElementById('admin-username').value.trim();
    const password = document.getElementById('admin-password').value;

    if (username === CREDS.ADMIN.username && password === CREDS.ADMIN.password) {
        Auth.loginAdmin();
        window.location.href = 'records.html';
    } else {
        UI.showError('admin-error', 'Invalid administrator credentials.');
    }
}

/* ═══════════════════════════════════════════════════════════════
   PASSWORD VISIBILITY TOGGLES
═══════════════════════════════════════════════════════════════ */

function _initPwdToggles() {
    document.querySelectorAll('.pwd-toggle').forEach(btn => {
        btn.addEventListener('click', () => {
            const targetId = btn.dataset.target;
            const input = document.getElementById(targetId);
            if (!input) return;
            const isHidden = input.type === 'password';
            input.type = isHidden ? 'text' : 'password';
            btn.textContent = isHidden ? '🙈' : '👁️';
            btn.setAttribute('aria-label', isHidden ? 'Hide password' : 'Show password');
        });
    });
}

/* ═══════════════════════════════════════════════════════════════
   DASHBOARD
═══════════════════════════════════════════════════════════════ */

function _enterDashboard() {
    document.getElementById('login-page').classList.add('hidden');
    document.getElementById('dashboard').classList.remove('hidden');

    const name = Auth.userName();
    document.getElementById('nav-user-info').textContent = name ? `👤 ${name}` : '';

    /* Restore pending edit (cross-page navigation from admin) */
    const storedIdx = Storage.get(KEYS.EDIT_INDEX);
    if (storedIdx !== null) {
        editIndex = parseInt(storedIdx, 10);
        _prefillForm(records[editIndex]);
        Storage.remove(KEYS.EDIT_INDEX);
        _setEditMode(true);
    }

    renderUserRecords();
    _updateStats();
}

/** Full logout – clears session and returns to login page. */
function handleLogout() {
    Auth.logout();
}

/* ═══════════════════════════════════════════════════════════════
   STATS
═══════════════════════════════════════════════════════════════ */

function _updateStats() {
    const userId = Auth.userId();
    const own = records.filter(r => r.userId === userId);
    const members = own.reduce((sum, r) => sum + (parseInt(r.members, 10) || 0), 0);
    const wards = new Set(own.map(r => r.ward)).size;

    document.getElementById('stat-records').textContent = own.length;
    document.getElementById('stat-members').textContent = members;
    document.getElementById('stat-wards').textContent = wards;
}

/* ═══════════════════════════════════════════════════════════════
   FORM  –  CREATE / UPDATE
═══════════════════════════════════════════════════════════════ */

/** Validate and persist a new or edited household record. */
function finalizeUpload() {
    const fields = _readFormFields();

    if (!fields) {
        UI.showError('form-error', 'Please fill in all required fields before submitting.');
        return;
    }

    const record = {
        userId: Auth.userId(),
        submitterName: Auth.userName(),
        submittedAt: new Date().toLocaleString('en-IN'),
        ...fields,
    };

    if (editIndex === null) {
        records.push(record);
        UI.showToast('✅ Report submitted successfully!');
    } else {
        /* Preserve original userId / submittedAt on edit */
        record.userId = records[editIndex].userId;
        record.submittedAt = records[editIndex].submittedAt;
        records[editIndex] = record;
        editIndex = null;
        _setEditMode(false);
        UI.showToast('✏️ Record updated successfully!', 'info');
    }

    Storage.saveRecords(records);
    document.getElementById('submission-form').reset();
    renderUserRecords();
    _updateStats();
}

/* ═══════════════════════════════════════════════════════════════
   FORM  –  READ / PREFILL
═══════════════════════════════════════════════════════════════ */

/**
 * Read all form fields; return a plain object or null if any required
 * field is empty.
 */
function _readFormFields() {
    const v = (id) => document.getElementById(id).value.trim();
    const c = (id) => document.getElementById(id).checked;

    const street = v('street');
    const ward = v('ward');
    const house = v('house');
    const headName = v('headName');
    const category = v('category');
    const members = v('members');

    if (!street || !ward || !house || !headName || !category || !members) {
        return null;
    }

    return {
        street, ward, house, headName, category, members,
        water: c('water'),
        electricity: c('electricity'),
        internet: c('internet'),
        land: c('land'),
    };
}

function _prefillForm(r) {
    const set = (id, val) => { document.getElementById(id).value = val; };
    const chk = (id, val) => { document.getElementById(id).checked = val; };

    set('street', r.street);
    set('ward', r.ward);
    set('house', r.house);
    set('headName', r.headName);
    set('category', r.category);
    set('members', r.members);
    chk('water', r.water);
    chk('electricity', r.electricity);
    chk('internet', r.internet);
    chk('land', r.land);
}

/* ═══════════════════════════════════════════════════════════════
   EDIT MODE BANNER
═══════════════════════════════════════════════════════════════ */

function _setEditMode(on) {
    document.getElementById('edit-banner').classList.toggle('show', on);
    document.getElementById('form-title').textContent = on
        ? '✏️ Edit Household Record'
        : '📋 Household Report Submission';
}

/** Public: cancel active edit from the "Cancel" button. */
function cancelEdit() {
    editIndex = null;
    _setEditMode(false);
    document.getElementById('submission-form').reset();
}

/* ═══════════════════════════════════════════════════════════════
   RENDER  –  USER'S OWN RECORDS
═══════════════════════════════════════════════════════════════ */

/** Re-render the "My Submitted Records" section (called on load & after mutations). */
function renderUserRecords() {
    const list = document.getElementById('user-records-list');
    const userId = Auth.userId();
    const query = (document.getElementById('user-search')?.value ?? '').toLowerCase();

    const own = records
        .map((r, i) => ({ r, i }))
        .filter(({ r }) => r.userId === userId);

    const visible = query
        ? own.filter(({ r }) =>
            [r.headName, r.street, r.ward, r.house, r.category]
                .join(' ').toLowerCase().includes(query))
        : own;

    if (visible.length === 0) {
        const msg = query
            ? 'No records match your search.'
            : 'No records submitted yet. Fill the form above to get started.';
        list.innerHTML = `<li class="empty-state"><div class="empty-icon">📭</div>${msg}</li>`;
        return;
    }

    list.innerHTML = visible
        .map(({ r, i }) => UI.buildRecordCard(r, i, 'editRecord', 'deleteRecord'))
        .join('');
}

/* ═══════════════════════════════════════════════════════════════
   CRUD ACTIONS  (called via inline onclick)
═══════════════════════════════════════════════════════════════ */

function editRecord(index) {
    editIndex = index;
    _prefillForm(records[index]);
    _setEditMode(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function deleteRecord(index) {
    if (!confirm('Are you sure you want to delete this record?')) return;

    records.splice(index, 1);

    /* Keep editIndex consistent after splice */
    if (editIndex === index) { editIndex = null; _setEditMode(false); }
    else if (editIndex !== null && editIndex > index) editIndex--;

    Storage.saveRecords(records);
    renderUserRecords();
    _updateStats();
    UI.showToast('🗑️ Record deleted.', 'error');
}
