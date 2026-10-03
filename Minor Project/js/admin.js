/* ============================================================
   KERALA DIGITAL CENSUS 2026 – Administrator Module (admin.js)
   Depends on: js/app.js  (KEYS, CREDS, Storage, Auth, UI)
   Responsibilities: auth guard · stats · full-CRUD records · inline edit · search
   ============================================================ */
'use strict';

/* ── Auth guard: must be admin ───────────────────────────────── */
if (!Auth.isAdmin()) {
    alert('Unauthorized. Please login as Administrator.');
    window.location.href = 'index.html';
}

/* ── Module-level state ──────────────────────────────────────── */
let records = Storage.getRecords();
let adminEditIndex = null;   // null = no active edit

/* ═══════════════════════════════════════════════════════════════
   INIT
═══════════════════════════════════════════════════════════════ */
window.addEventListener('DOMContentLoaded', () => {
    _updateStats();
    renderAdminRecords();
});

/* ═══════════════════════════════════════════════════════════════
   STATS
═══════════════════════════════════════════════════════════════ */

function _updateStats() {
    const total = records.length;
    const members = records.reduce((sum, r) => sum + (parseInt(r.members, 10) || 0), 0);
    const wards = new Set(records.map(r => r.ward)).size;
    const general = records.filter(r => r.category === 'General').length;

    document.getElementById('stat-total').textContent = total;
    document.getElementById('stat-total-members').textContent = members;
    document.getElementById('stat-wards-covered').textContent = wards;
    document.getElementById('stat-general').textContent = general;
}

/* ═══════════════════════════════════════════════════════════════
   RENDER  –  ALL RECORDS
═══════════════════════════════════════════════════════════════ */

/** Re-render the admin records grid (invoked on load and after mutations). */
function renderAdminRecords() {
    const list = document.getElementById('admin-records-list');
    const query = (document.getElementById('admin-search')?.value ?? '').toLowerCase();

    const visible = query
        ? records
            .map((r, i) => ({ r, i }))
            .filter(({ r }) =>
                [r.headName, r.street, r.ward, r.house, r.category,
                r.district ?? '', r.taluk ?? '']
                    .join(' ').toLowerCase().includes(query))
        : records.map((r, i) => ({ r, i }));

    if (visible.length === 0) {
        const msg = query ? 'No records match your search.' : 'No household records submitted yet.';
        list.innerHTML = `<li class="empty-state"><div class="empty-icon">📭</div>${msg}</li>`;
        return;
    }

    list.innerHTML = visible
        .map(({ r, i }) => UI.buildRecordCard(r, i, 'openAdminEdit', 'deleteRecord'))
        .join('');
}

/* ═══════════════════════════════════════════════════════════════
   INLINE EDIT FORM
═══════════════════════════════════════════════════════════════ */

/** Open the inline edit form pre-filled with the record at `index`. */
function openAdminEdit(index) {
    adminEditIndex = index;
    const r = records[index];
    const set = (id, val) => { document.getElementById(id).value = val; };
    const chk = (id, val) => { document.getElementById(id).checked = val; };

    set('e-street', r.street);
    set('e-ward', r.ward);
    set('e-house', r.house);
    set('e-headName', r.headName);
    set('e-category', r.category);
    set('e-members', r.members);
    chk('e-water', r.water);
    chk('e-electricity', r.electricity);
    chk('e-internet', r.internet);
    chk('e-land', r.land);

    const section = document.getElementById('admin-edit-section');
    section.classList.remove('hidden');
    section.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/** Validate and persist the admin inline edit. */
function saveAdminEdit() {
    const v = (id) => document.getElementById(id).value.trim();
    const c = (id) => document.getElementById(id).checked;

    const street = v('e-street');
    const ward = v('e-ward');
    const house = v('e-house');
    const headName = v('e-headName');
    const category = v('e-category');
    const members = v('e-members');

    if (!street || !ward || !house || !headName || !category || !members) {
        UI.showToast('⚠️ Please fill in all required fields.', 'error');
        return;
    }

    records[adminEditIndex] = {
        ...records[adminEditIndex],
        street, ward, house, headName, category, members,
        water: c('e-water'),
        electricity: c('e-electricity'),
        internet: c('e-internet'),
        land: c('e-land'),
    };

    Storage.saveRecords(records);
    _cancelAdminEdit();
    _updateStats();
    renderAdminRecords();
    UI.showToast('✏️ Record updated successfully!', 'info');
}

/** Cancel the inline edit without saving. */
function cancelAdminEdit() {
    _cancelAdminEdit();
}

function _cancelAdminEdit() {
    adminEditIndex = null;
    document.getElementById('admin-edit-section').classList.add('hidden');
    document.getElementById('admin-edit-form').reset();
}

/* ═══════════════════════════════════════════════════════════════
   DELETE
═══════════════════════════════════════════════════════════════ */

function deleteRecord(index) {
    if (!confirm('Permanently delete this record?')) return;

    records.splice(index, 1);

    /* Keep inline-edit index consistent after splice */
    if (adminEditIndex === index) _cancelAdminEdit();
    else if (adminEditIndex !== null && adminEditIndex > index) adminEditIndex--;

    Storage.saveRecords(records);
    _updateStats();
    renderAdminRecords();
    UI.showToast('🗑️ Record deleted.', 'error');
}

/* ═══════════════════════════════════════════════════════════════
   NAVIGATION
═══════════════════════════════════════════════════════════════ */

/** Redirect to the enumerator app so a user can add a new record. */
function goAddRecord() {
    window.location.href = 'index.html';
}

/** Full admin logout – clears session and returns to login page. */
function adminLogout() {
    Auth.logout();
}
