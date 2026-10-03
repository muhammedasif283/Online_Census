/* ============================================================
   KERALA DIGITAL CENSUS 2026 – Shared Application Layer
   Responsibilities: constants · storage · authentication · UI helpers
   ============================================================ */
'use strict';

/* ── Storage key constants (no magic strings elsewhere) ─────── */
const KEYS = Object.freeze({
    LOGGED_IN: 'census_loggedIn',
    ROLE: 'census_role',
    USER_ID: 'census_userId',
    USER_NAME: 'census_userName',
    USER_EMAIL: 'census_userEmail',
    USERS: 'census_users',       // registered user accounts array
    RECORDS: 'census_records',
    EDIT_INDEX: 'census_editIndex',
});

/* ── Admin credentials (server-side in production) ──────────── */
const CREDS = Object.freeze({
    ADMIN: { username: 'admin', password: 'admin123' },
});

/* ── Storage module ──────────────────────────────────────────── */
const Storage = {
    getRecords() { return JSON.parse(localStorage.getItem(KEYS.RECORDS) || '[]'); },
    saveRecords(arr) { localStorage.setItem(KEYS.RECORDS, JSON.stringify(arr)); },
    get(key) { return localStorage.getItem(key); },
    set(key, value) { localStorage.setItem(key, String(value)); },
    remove(...keys) { keys.forEach(k => localStorage.removeItem(k)); },
};

/* ── UserAccounts module ─────────────────────────────────────── */
const UserAccounts = {
    /** @returns {Array} all registered users */
    getAll() {
        return JSON.parse(localStorage.getItem(KEYS.USERS) || '[]');
    },

    /** Save the full users array. */
    _save(users) {
        localStorage.setItem(KEYS.USERS, JSON.stringify(users));
    },

    /**
     * Find a user by email (case-insensitive).
     * @param {string} email
     * @returns {Object|null}
     */
    find(email) {
        const norm = email.trim().toLowerCase();
        return this.getAll().find(u => u.email === norm) ?? null;
    },

    /**
     * Register a new user account.
     * @param {{name:string, email:string, password:string}} opts
     * @returns {'ok'|'exists'} result token
     */
    register({ name, email, password }) {
        const norm = email.trim().toLowerCase();
        const users = this.getAll();
        if (users.find(u => u.email === norm)) return 'exists';
        users.push({
            id: `usr_${Date.now()}`,
            name: name.trim(),
            email: norm,
            password: btoa(password),   // obfuscated (demo only)
        });
        this._save(users);
        return 'ok';
    },

    /**
     * Verify credentials.
     * @param {string} email
     * @param {string} password
     * @returns {Object|null} user object or null
     */
    verify(email, password) {
        const user = this.find(email);
        if (!user) return null;
        return user.password === btoa(password) ? user : null;
    },

    /**
     * Reset a user's password.
     * @param {string} email
     * @param {string} newPassword
     * @returns {boolean} true if found and updated
     */
    resetPassword(email, newPassword) {
        const norm = email.trim().toLowerCase();
        const users = this.getAll();
        const idx = users.findIndex(u => u.email === norm);
        if (idx === -1) return false;
        users[idx].password = btoa(newPassword);
        this._save(users);
        return true;
    },
};

/* ── Auth module ─────────────────────────────────────────────── */
const Auth = {
    isLoggedIn() { return Storage.get(KEYS.LOGGED_IN) === 'true'; },
    isUser() { return Auth.isLoggedIn() && Storage.get(KEYS.ROLE) === 'user'; },
    isAdmin() { return Auth.isLoggedIn() && Storage.get(KEYS.ROLE) === 'admin'; },
    userId() { return Storage.get(KEYS.USER_ID); },
    userName() { return Storage.get(KEYS.USER_NAME) ?? ''; },
    userEmail() { return Storage.get(KEYS.USER_EMAIL) ?? ''; },

    /**
     * Persist an enumerator session.
     * @param {{userId:string, name:string, email:string}} opts
     */
    loginUser({ userId, name, email }) {
        Storage.set(KEYS.LOGGED_IN, 'true');
        Storage.set(KEYS.ROLE, 'user');
        Storage.set(KEYS.USER_ID, userId);
        Storage.set(KEYS.USER_NAME, name);
        Storage.set(KEYS.USER_EMAIL, email);
    },

    loginAdmin() {
        Storage.set(KEYS.LOGGED_IN, 'true');
        Storage.set(KEYS.ROLE, 'admin');
    },

    logout() {
        Storage.remove(
            KEYS.LOGGED_IN, KEYS.ROLE, KEYS.USER_ID,
            KEYS.USER_NAME, KEYS.USER_EMAIL,
            KEYS.EDIT_INDEX
        );
        window.location.href = 'index.html';
    },
};

/* ── UI utility module ───────────────────────────────────────── */
const UI = {
    /**
     * Escape a string for safe HTML insertion.
     * @param {*} str
     * @returns {string}
     */
    esc(str) {
        return String(str ?? '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    },

    /**
     * Return the CSS badge class for a social category.
     * @param {string} category
     * @returns {string}
     */
    badgeClass(category) {
        const map = { General: 'badge-general', OBC: 'badge-obc', SC: 'badge-sc', ST: 'badge-st' };
        return map[category] ?? 'badge-general';
    },

    /**
     * Show an inline error message, auto-hide after 3.5 s.
     * @param {string} elementId
     * @param {string} message
     */
    showError(elementId, message) {
        const el = document.getElementById(elementId);
        if (!el) return;
        el.textContent = message;
        el.classList.add('show');
        clearTimeout(el._hideTimer);
        el._hideTimer = setTimeout(() => el.classList.remove('show'), 3500);
    },

    /**
     * Show a toast notification, auto-hide after 3.2 s.
     * @param {string} message
     * @param {'success'|'error'|'info'} type
     */
    showToast(message, type = 'success') {
        const toast = document.getElementById('toast');
        if (!toast) return;
        toast.textContent = message;
        toast.className = `toast ${type} show`;
        clearTimeout(toast._hideTimer);
        toast._hideTimer = setTimeout(() => toast.classList.remove('show'), 3200);
    },

    /**
     * Build the HTML for a household record card.
     * @param {Object} record
     * @param {number} index   real index in the master records array
     * @param {string} onEdit  global function name for the edit callback
     * @param {string} onDelete global function name for the delete callback
     * @returns {string} HTML string
     */
    buildRecordCard(record, index, onEdit, onDelete) {
        const AMENITY_MAP = [
            [record.water, '💧 Piped Water'],
            [record.electricity, '⚡ Electricity'],
            [record.internet, '🌐 Internet'],
            [record.land, '🌱 Owns Land'],
        ];

        const tags = AMENITY_MAP
            .filter(([flag]) => flag)
            .map(([, label]) => `<span class="tag">${label}</span>`)
            .join('');

        const timeLine = record.submittedAt
            ? `🕐 ${UI.esc(record.submittedAt)}`
            : '';

        const submittedBy = record.submitterName
            ? `👤 ${UI.esc(record.submitterName)}<br>`
            : '';

        return `
        <li class="record-card">
            <div class="record-head">
                <div class="record-name">${UI.esc(record.headName)}</div>
                <span class="record-badge ${UI.badgeClass(record.category)}">${UI.esc(record.category)}</span>
            </div>
            <div class="record-meta">
                📍 ${UI.esc(record.street)}, Ward ${UI.esc(record.ward)}<br>
                🏡 ${UI.esc(record.house)} &bull; 👨‍👩‍👧 ${UI.esc(record.members)} member(s)<br>
                ${submittedBy}${timeLine}
            </div>
            <div class="tag-row">
                ${tags || '<span class="no-amenity">No amenities recorded</span>'}
            </div>
            <div class="record-actions">
                <button class="btn-icon btn-edit"   onclick="${onEdit}(${index})">✏️ Edit</button>
                <button class="btn-icon btn-delete" onclick="${onDelete}(${index})">🗑️ Delete</button>
            </div>
        </li>`;
    },
};
