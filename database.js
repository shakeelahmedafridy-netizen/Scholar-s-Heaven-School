/* ============================================================
   SCHOLAR'S HEAVEN — School Database JavaScript
   ============================================================ */

'use strict';

// ============================================================
// CONFIG
// ============================================================
const CONFIG = {
    PASSWORD: 'admin123',
    STORAGE_KEY: 'scholars_heaven_db',
};

// ============================================================
// STATE
// ============================================================
let DB = {
    students: [],
    fees: [],
    exams: [],
};

let deleteCallback = null;

// ============================================================
// INIT
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
    loadDB();
    setupLogin();
    setupTheme();
    setupSidebar();
    setupTabs();
    setupModals();
    setupStudents();
    setupFees();
    setupExams();
    setupPromote();
    setupImportExport();
    setCurrentDate();
});

// ============================================================
// DATABASE (localStorage)
// ============================================================
function loadDB() {
    const raw = localStorage.getItem(CONFIG.STORAGE_KEY);
    if (raw) {
        try {
            DB = JSON.parse(raw);
            DB.students = DB.students || [];
            DB.fees = DB.fees || [];
            DB.exams = DB.exams || [];
        } catch (e) {
            DB = { students: [], fees: [], exams: [] };
        }
    }
}

function saveDB() {
    localStorage.setItem(CONFIG.STORAGE_KEY, JSON.stringify(DB));
}

function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
}

// ============================================================
// LOGIN
// ============================================================
function setupLogin() {
    const loginScreen = document.getElementById('loginScreen');
    const mainApp = document.getElementById('mainApp');
    const loginBtn = document.getElementById('loginBtn');
    const loginPassword = document.getElementById('loginPassword');
    const loginError = document.getElementById('loginError');
    const eyeBtn = document.getElementById('eyeBtn');
    const eyeIcon = document.getElementById('eyeIcon');
    const logoutBtn = document.getElementById('logoutBtn');

    // Check if already logged in
    if (sessionStorage.getItem('shs_logged_in') === '1') {
        loginScreen.style.display = 'none';
        mainApp.style.display = 'flex';
        refreshAll();
    }

    function tryLogin() {
        const pwd = loginPassword.value;
        const storedPwd = localStorage.getItem('shs_password') || CONFIG.PASSWORD;
        if (pwd === storedPwd) {
            sessionStorage.setItem('shs_logged_in', '1');
            loginScreen.style.display = 'none';
            mainApp.style.display = 'flex';
            loginError.classList.remove('show');
            refreshAll();
        } else {
            loginError.classList.add('show');
            loginPassword.value = '';
            loginPassword.focus();
        }
    }

    loginBtn.addEventListener('click', tryLogin);
    loginPassword.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') tryLogin();
    });

    eyeBtn.addEventListener('click', () => {
        if (loginPassword.type === 'password') {
            loginPassword.type = 'text';
            eyeIcon.className = 'fa-solid fa-eye-slash';
        } else {
            loginPassword.type = 'password';
            eyeIcon.className = 'fa-solid fa-eye';
        }
    });

    logoutBtn.addEventListener('click', () => {
        sessionStorage.removeItem('shs_logged_in');
        loginScreen.style.display = 'flex';
        mainApp.style.display = 'none';
        loginPassword.value = '';
    });
}

// ============================================================
// THEME
// ============================================================
function setupTheme() {
    const themeBtn = document.getElementById('themeBtn');
    const themeIcon = document.getElementById('themeIcon');
    const html = document.documentElement;

    const saved = localStorage.getItem('shs_theme') || 'dark';
    html.setAttribute('data-theme', saved);
    themeIcon.className = saved === 'dark' ? 'fa-solid fa-sun' : 'fa-solid fa-moon';

    themeBtn.addEventListener('click', () => {
        const current = html.getAttribute('data-theme');
        const next = current === 'dark' ? 'light' : 'dark';
        html.setAttribute('data-theme', next);
        localStorage.setItem('shs_theme', next);
        themeIcon.className = next === 'dark' ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
    });
}

// ============================================================
// SIDEBAR
// ============================================================
function setupSidebar() {
    const toggle = document.getElementById('sidebarToggle');
    const sidebar = document.getElementById('sidebar');

    toggle.addEventListener('click', () => {
        sidebar.classList.toggle('open');
    });

    // Close on outside click (mobile)
    document.addEventListener('click', (e) => {
        if (window.innerWidth <= 900 && sidebar.classList.contains('open')) {
            if (!sidebar.contains(e.target) && e.target !== toggle) {
                sidebar.classList.remove('open');
            }
        }
    });
}

// ============================================================
// TABS
// ============================================================
function setupTabs() {
    const navItems = document.querySelectorAll('.nav-item[data-tab]');
    const topbarTitle = document.getElementById('topbarTitle');

    const titles = {
        dashboard: 'Dashboard',
        students: 'Student Management',
        fees: 'Fee Records',
        exams: 'Exam Results',
        promote: 'Class Promotion',
    };

    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const tab = item.getAttribute('data-tab');
            switchTab(tab);
            topbarTitle.textContent = titles[tab] || tab;
            // Close sidebar on mobile
            if (window.innerWidth <= 900) {
                document.getElementById('sidebar').classList.remove('open');
            }
        });
    });
}

function switchTab(tabName) {
    document.querySelectorAll('.nav-item[data-tab]').forEach(item => {
        item.classList.toggle('active', item.getAttribute('data-tab') === tabName);
    });
    document.querySelectorAll('.tab-content').forEach(tc => {
        tc.classList.toggle('active', tc.id === `tab-${tabName}`);
    });
    // Refresh tab data
    if (tabName === 'dashboard') refreshDashboard();
    if (tabName === 'students') renderStudents();
    if (tabName === 'fees') renderFees();
    if (tabName === 'exams') renderExams();
    if (tabName === 'promote') refreshPromote();
}

// ============================================================
// MODALS
// ============================================================
function setupModals() {
    // Close buttons
    document.querySelectorAll('[data-close]').forEach(btn => {
        btn.addEventListener('click', () => {
            closeModal(btn.getAttribute('data-close'));
        });
    });
    // Close on overlay click
    document.querySelectorAll('.modal-overlay').forEach(overlay => {
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                closeModal(overlay.id);
            }
        });
    });
    // Confirm delete
    document.getElementById('confirmDeleteBtn').addEventListener('click', () => {
        if (deleteCallback) deleteCallback();
        closeModal('confirmModal');
    });
}

function openModal(id) {
    document.getElementById(id).classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeModal(id) {
    document.getElementById(id).classList.remove('active');
    document.body.style.overflow = '';
}

function showConfirm(title, message, callback) {
    document.getElementById('confirmTitle').innerHTML = `<i class="fa-solid fa-triangle-exclamation"></i> ${title}`;
    document.getElementById('confirmMessage').textContent = message;
    deleteCallback = callback;
    openModal('confirmModal');
}

// ============================================================
// TOAST
// ============================================================
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    const toastMsg = document.getElementById('toastMessage');
    const toastIcon = document.getElementById('toastIcon');

    const icons = { success: 'fa-circle-check', error: 'fa-circle-xmark', info: 'fa-circle-info' };
    toast.className = `toast ${type} show`;
    toastIcon.className = `fa-solid ${icons[type]} toast-icon`;
    toastMsg.textContent = message;

    clearTimeout(toast._timer);
    toast._timer = setTimeout(() => { toast.classList.remove('show'); }, 3000);
}

// ============================================================
// CURRENT DATE
// ============================================================
function setCurrentDate() {
    const el = document.getElementById('currentDate');
    if (el) {
        const now = new Date();
        el.textContent = now.toLocaleDateString('en-PK', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    }
}

// ============================================================
// REFRESH ALL
// ============================================================
function refreshAll() {
    refreshDashboard();
    renderStudents();
    renderFees();
    renderExams();
    updateStudentBadge();
}

// ============================================================
// DASHBOARD
// ============================================================
function refreshDashboard() {
    const now = new Date();
    const currentMonth = now.toLocaleString('en', { month: 'long' });
    const currentYear = now.getFullYear();

    document.getElementById('ds-totalStudents').textContent = DB.students.length;
    document.getElementById('ds-totalExams').textContent = DB.exams.length;

    const monthFees = DB.fees.filter(f => f.month === currentMonth && f.year == currentYear);
    document.getElementById('ds-feePaid').textContent = monthFees.filter(f => f.status === 'paid').length;
    document.getElementById('ds-feePending').textContent = monthFees.filter(f => f.status === 'unpaid').length;

    // Recent students (last 5)
    const tbody = document.getElementById('recentStudentsTbody');
    const recent = [...DB.students].reverse().slice(0, 5);
    tbody.innerHTML = recent.length ? recent.map(s => `
        <tr>
            <td><span class="badge badge-class">${s.rollNo}</span></td>
            <td>${s.name}</td>
            <td>${s.className}</td>
            <td>${s.fatherName}</td>
            <td>${s.phone || '—'}</td>
        </tr>
    `).join('') : `<tr><td colspan="5" class="text-center" style="color:var(--text-muted);padding:20px;">No students yet.</td></tr>`;

    // Class breakdown
    const breakdown = document.getElementById('classBreakdown');
    const classMap = {};
    DB.students.forEach(s => {
        classMap[s.className] = (classMap[s.className] || 0) + 1;
    });
    if (Object.keys(classMap).length === 0) {
        breakdown.innerHTML = `<p style="color:var(--text-muted);font-size:13px;">No students added yet.</p>`;
    } else {
        breakdown.innerHTML = Object.entries(classMap).sort().map(([cls, count]) => `
            <div class="class-pill">
                <span>${cls}</span>
                <strong>${count}</strong>
            </div>
        `).join('');
    }
}

function updateStudentBadge() {
    document.getElementById('studentCountBadge').textContent = DB.students.length;
}

// ============================================================
// STUDENTS
// ============================================================
function setupStudents() {
    document.getElementById('addStudentBtn').addEventListener('click', openAddStudent);
    document.getElementById('saveStudentBtn').addEventListener('click', saveStudent);

    const search = document.getElementById('studentSearch');
    const clearBtn = document.getElementById('clearStudentSearch');
    search.addEventListener('input', () => {
        clearBtn.style.display = search.value ? 'flex' : 'none';
        renderStudents();
    });
    clearBtn.addEventListener('click', () => {
        search.value = '';
        clearBtn.style.display = 'none';
        renderStudents();
    });
    document.getElementById('classFilter').addEventListener('change', renderStudents);
    document.getElementById('sectionFilter').addEventListener('change', renderStudents);
}

function openAddStudent() {
    document.getElementById('studentModalTitle').innerHTML = '<i class="fa-solid fa-user-plus"></i> Add New Student';
    document.getElementById('studentId').value = '';
    ['sRollNo','sName','sFatherName','sPhone','sAddress','sFeeAmount'].forEach(id => document.getElementById(id).value = '');
    ['sClass','sSection','sGender'].forEach(id => document.getElementById(id).value = '');
    document.getElementById('sDOB').value = '';
    document.getElementById('sAdmissionDate').value = new Date().toISOString().split('T')[0];
    openModal('studentModal');
    document.getElementById('sRollNo').focus();
}

function openEditStudent(id) {
    const s = DB.students.find(s => s.id === id);
    if (!s) return;
    document.getElementById('studentModalTitle').innerHTML = '<i class="fa-solid fa-user-pen"></i> Edit Student';
    document.getElementById('studentId').value = s.id;
    document.getElementById('sRollNo').value = s.rollNo;
    document.getElementById('sName').value = s.name;
    document.getElementById('sFatherName').value = s.fatherName;
    document.getElementById('sClass').value = s.className;
    document.getElementById('sSection').value = s.section || '';
    document.getElementById('sDOB').value = s.dob || '';
    document.getElementById('sPhone').value = s.phone || '';
    document.getElementById('sFeeAmount').value = s.feeAmount || '';
    document.getElementById('sAddress').value = s.address || '';
    document.getElementById('sAdmissionDate').value = s.admissionDate || '';
    document.getElementById('sGender').value = s.gender || '';
    openModal('studentModal');
}

function saveStudent() {
    const id = document.getElementById('studentId').value;
    const rollNo = document.getElementById('sRollNo').value.trim();
    const name = document.getElementById('sName').value.trim();
    const fatherName = document.getElementById('sFatherName').value.trim();
    const className = document.getElementById('sClass').value;

    if (!rollNo || !name || !fatherName || !className) {
        showToast('Please fill in required fields (Roll No, Name, Father Name, Class)', 'error');
        return;
    }

    // Check duplicate roll no
    const dup = DB.students.find(s => s.rollNo === rollNo && s.id !== id);
    if (dup) {
        showToast(`Roll No "${rollNo}" already exists!`, 'error');
        return;
    }

    const studentData = {
        rollNo,
        name,
        fatherName,
        className,
        section: document.getElementById('sSection').value,
        dob: document.getElementById('sDOB').value,
        phone: document.getElementById('sPhone').value.trim(),
        feeAmount: document.getElementById('sFeeAmount').value,
        address: document.getElementById('sAddress').value.trim(),
        admissionDate: document.getElementById('sAdmissionDate').value,
        gender: document.getElementById('sGender').value,
        addedAt: new Date().toISOString(),
    };

    if (id) {
        const idx = DB.students.findIndex(s => s.id === id);
        DB.students[idx] = { ...DB.students[idx], ...studentData };
        showToast(`Student "${name}" updated successfully!`);
    } else {
        DB.students.push({ id: generateId(), ...studentData });
        showToast(`Student "${name}" added successfully!`);
    }

    saveDB();
    closeModal('studentModal');
    renderStudents();
    refreshDashboard();
    updateStudentBadge();
}

function deleteStudent(id) {
    const s = DB.students.find(s => s.id === id);
    if (!s) return;
    showConfirm('Delete Student', `Are you sure you want to delete "${s.name}"? All related fee and exam records will also be removed.`, () => {
        DB.students = DB.students.filter(s => s.id !== id);
        DB.fees = DB.fees.filter(f => f.studentId !== id);
        DB.exams = DB.exams.filter(e => e.studentId !== id);
        saveDB();
        renderStudents();
        renderFees();
        renderExams();
        refreshDashboard();
        updateStudentBadge();
        showToast(`Student deleted.`, 'info');
    });
}

function renderStudents() {
    const search = document.getElementById('studentSearch').value.toLowerCase();
    const classF = document.getElementById('classFilter').value;
    const sectionF = document.getElementById('sectionFilter').value;

    let filtered = DB.students.filter(s => {
        const matchSearch = !search || 
            s.name.toLowerCase().includes(search) ||
            s.rollNo.toLowerCase().includes(search) ||
            s.fatherName.toLowerCase().includes(search) ||
            (s.phone && s.phone.includes(search));
        const matchClass = !classF || s.className === classF;
        const matchSection = !sectionF || s.section === sectionF;
        return matchSearch && matchClass && matchSection;
    });

    const tbody = document.getElementById('studentsTbody');
    const empty = document.getElementById('studentsEmpty');
    const info = document.getElementById('studentResultsInfo');

    info.textContent = search || classF || sectionF 
        ? `${filtered.length} student(s) found out of ${DB.students.length}`
        : `${DB.students.length} total students`;

    if (filtered.length === 0) {
        tbody.innerHTML = '';
        empty.style.display = 'block';
    } else {
        empty.style.display = 'none';
        tbody.innerHTML = filtered.map(s => `
            <tr>
                <td><span class="badge badge-class">${s.rollNo}</span></td>
                <td><strong>${s.name}</strong></td>
                <td>${s.fatherName}</td>
                <td><span class="badge badge-grade">${s.className}</span></td>
                <td>${s.section || '—'}</td>
                <td>${s.phone || '—'}</td>
                <td>${s.dob ? formatDate(s.dob) : '—'}</td>
                <td>
                    <div class="action-btns">
                        <button class="act-btn edit" title="Edit" onclick="openEditStudent('${s.id}')">
                            <i class="fa-solid fa-pen"></i>
                        </button>
                        <button class="act-btn delete" title="Delete" onclick="deleteStudent('${s.id}')">
                            <i class="fa-solid fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    }
}

// ============================================================
// FEES
// ============================================================
function setupFees() {
    document.getElementById('addFeeBtn').addEventListener('click', openAddFee);
    document.getElementById('saveFeeBtn').addEventListener('click', saveFee);
    document.getElementById('feeSearch').addEventListener('input', renderFees);
    document.getElementById('feeMonthFilter').addEventListener('change', renderFees);
    document.getElementById('feeStatusFilter').addEventListener('change', renderFees);

    // Autocomplete for student search in fee modal
    setupStudentAutocomplete('feeStudentSearch', 'feeStudentList', 'feeStudentId', 'selectedFeeStudent', 'feeAmount', 'feeStudentInfo');
}

function setupStudentAutocomplete(searchId, listId, hiddenId, selectedId, feeAmtId, infoId) {
    const input = document.getElementById(searchId);
    const list = document.getElementById(listId);
    const hidden = document.getElementById(hiddenId);
    const selected = document.getElementById(selectedId);

    input.addEventListener('input', () => {
        const q = input.value.toLowerCase();
        if (!q) { list.classList.remove('show'); return; }

        const matches = DB.students.filter(s =>
            s.name.toLowerCase().includes(q) || s.rollNo.toLowerCase().includes(q)
        ).slice(0, 8);

        if (matches.length === 0) { list.classList.remove('show'); return; }

        list.innerHTML = matches.map(s => `
            <div class="autocomplete-item" data-id="${s.id}" data-name="${s.name}" data-roll="${s.rollNo}" data-class="${s.className}" data-fee="${s.feeAmount || ''}">
                <div>${s.name}</div>
                <div class="ac-roll">${s.rollNo} · ${s.className}${s.section ? ' - ' + s.section : ''}</div>
            </div>
        `).join('');
        list.classList.add('show');

        list.querySelectorAll('.autocomplete-item').forEach(item => {
            item.addEventListener('click', () => {
                const id = item.getAttribute('data-id');
                const name = item.getAttribute('data-name');
                const roll = item.getAttribute('data-roll');
                const cls = item.getAttribute('data-class');
                const fee = item.getAttribute('data-fee');

                input.value = `${name} (${roll})`;
                hidden.value = id;
                list.classList.remove('show');

                selected.textContent = `✓ ${name} · ${cls}`;
                selected.classList.add('show');

                // Auto-fill fee amount: use previous month fee doubled if exists, otherwise use student's default fee
                if (feeAmtId) {
                    const prevFee = DB.fees.filter(f => f.studentId === id).sort((a,b)=> new Date(b.addedAt)-new Date(a.addedAt))[0];
                    const amount = prevFee ? Number(prevFee.amount) * 2 : (fee ? Number(fee) : 0);
                    document.getElementById(feeAmtId).value = amount;
                }
            });
        });
    });

    document.addEventListener('click', (e) => {
        if (!input.contains(e.target) && !list.contains(e.target)) {
            list.classList.remove('show');
        }
    });
}

function openAddFee() {
    document.getElementById('feeModalTitle').innerHTML = '<i class="fa-solid fa-money-bill-wave"></i> Add Fee Record';
    document.getElementById('feeId').value = '';
    document.getElementById('feeStudentSearch').value = '';
    document.getElementById('feeStudentId').value = '';
    document.getElementById('selectedFeeStudent').classList.remove('show');
    document.getElementById('feeStudentList').classList.remove('show');
    document.getElementById('feeMonth').value = '';
    document.getElementById('feeYear').value = new Date().getFullYear();
    document.getElementById('feeAmount').value = '';
    document.getElementById('feeStatus').value = 'unpaid';
    document.getElementById('feePaidDate').value = '';
    document.getElementById('feeRemarks').value = '';
    openModal('feeModal');
}

function openEditFee(id) {
    const f = DB.fees.find(f => f.id === id);
    if (!f) return;
    const s = DB.students.find(s => s.id === f.studentId);
    document.getElementById('feeModalTitle').innerHTML = '<i class="fa-solid fa-pen"></i> Edit Fee Record';
    document.getElementById('feeId').value = f.id;
    document.getElementById('feeStudentSearch').value = s ? `${s.name} (${s.rollNo})` : f.studentName;
    document.getElementById('feeStudentId').value = f.studentId;
    const sel = document.getElementById('selectedFeeStudent');
    sel.textContent = s ? `✓ ${s.name} · ${s.className}` : f.studentName;
    sel.classList.add('show');
    document.getElementById('feeMonth').value = f.month;
    document.getElementById('feeYear').value = f.year;
    document.getElementById('feeAmount').value = f.amount;
    document.getElementById('feeStatus').value = f.status;
    document.getElementById('feePaidDate').value = f.paidDate || '';
    document.getElementById('feeRemarks').value = f.remarks || '';
    openModal('feeModal');
}

function saveFee() {
    const id = document.getElementById('feeId').value;
    const studentId = document.getElementById('feeStudentId').value;
    const month = document.getElementById('feeMonth').value;
    const year = document.getElementById('feeYear').value;
    const amount = document.getElementById('feeAmount').value;
    const status = document.getElementById('feeStatus').value;

    if (!studentId || !month || !year || !amount) {
        showToast('Please fill in all required fields', 'error');
        return;
    }

    const student = DB.students.find(s => s.id === studentId);
    const isPaid = status === 'paid';
    const paidAmount = isPaid ? Number(amount) : 0;
    const remaining = Number(amount) - paidAmount;
    const feeData = {
        studentId,
        studentName: student ? student.name : '',
        studentRollNo: student ? student.rollNo : '',
        studentClass: student ? student.className : '',
        month,
        year,
        amount,
        status,
        paidAmount,
        remaining,
        paidDate: document.getElementById('feePaidDate').value,
        remarks: document.getElementById('feeRemarks').value.trim(),
    };

    if (id) {
        const idx = DB.fees.findIndex(f => f.id === id);
        DB.fees[idx] = { ...DB.fees[idx], ...feeData };
        showToast('Fee record updated!');
    } else {
        DB.fees.push({ id: generateId(), ...feeData, addedAt: new Date().toISOString() });
        showToast('Fee record added!');
    }

    saveDB();
    closeModal('feeModal');
    renderFees();
    refreshDashboard();
}

function deleteFee(id) {
    showConfirm('Delete Fee Record', 'Delete this fee record permanently?', () => {
        DB.fees = DB.fees.filter(f => f.id !== id);
        saveDB();
        renderFees();
        refreshDashboard();
        showToast('Fee record deleted.', 'info');
    });
}

    function toggleFeeStatus(id) {
        const fee = DB.fees.find(f => f.id === id);
        if (!fee) return;
        if (fee.status === 'paid') {
            fee.status = 'unpaid';
            fee.paidAmount = 0;
            fee.remaining = Number(fee.amount);
            fee.paidDate = '';
        } else {
            fee.status = 'paid';
            fee.paidAmount = Number(fee.amount);
            fee.remaining = 0;
            fee.paidDate = new Date().toISOString().split('T')[0];
        }
        saveDB();
        renderFees();
        refreshDashboard();
        showToast(`Fee marked as ${fee.status}!`);
    }

function renderFees() {
    const search = document.getElementById('feeSearch').value.toLowerCase();
    const monthF = document.getElementById('feeMonthFilter').value;
    const statusF = document.getElementById('feeStatusFilter').value;

    let filtered = DB.fees.filter(f => {
        const matchSearch = !search || 
            f.studentName.toLowerCase().includes(search) ||
            (f.studentRollNo && f.studentRollNo.toLowerCase().includes(search));
        const matchMonth = !monthF || f.month === monthF;
        const matchStatus = !statusF || (
            statusF === 'remaining' ? Number(f.remaining) > 0 : f.status === statusF
        );
        return matchSearch && matchMonth && matchStatus;
    });

    const tbody = document.getElementById('feesTbody');
    const empty = document.getElementById('feesEmpty');

    if (filtered.length === 0) {
        tbody.innerHTML = '';
        empty.style.display = 'block';
    } else {
        empty.style.display = 'none';
        tbody.innerHTML = filtered.map(f => `
            <tr>
                <td><span class="badge badge-class">${f.studentRollNo || '—'}</span></td>
                <td><strong>${f.studentName}</strong></td>
                <td><strong>Rs ${Number(f.amount).toLocaleString()}</strong></td>
                <td>Rs ${f.remaining != null ? Number(f.remaining).toLocaleString() : Number(f.amount - (f.paidAmount || 0)).toLocaleString()}</td>
                <td>
                    <button class="badge ${f.status === 'paid' ? 'badge-paid' : 'badge-unpaid'}" 
                            style="border:none;cursor:pointer;" 
                            onclick="toggleFeeStatus('${f.id}')" title="Click to toggle">
                        <i class="fa-solid ${f.status === 'paid' ? 'fa-check' : 'fa-xmark'}"></i>
                        ${f.status === 'paid' ? 'Paid' : 'Unpaid'}
                    </button>
                </td>
                <td>${f.paidDate ? formatDate(f.paidDate) : '—'}</td>
                <td>
                    <div class="action-btns">
                        <button class="act-btn print" title="Print Fee Card" onclick="printFeeCard('${f.id}')" style="background:#f0fdf4; color:#15803d;">
                            <i class="fa-solid fa-file-invoice"></i>
                        </button>
                        <button class="act-btn edit" title="Edit" onclick="openEditFee('${f.id}')">
                            <i class="fa-solid fa-pen"></i>
                        </button>
                        <button class="act-btn delete" title="Delete" onclick="deleteFee('${f.id}')">
                            <i class="fa-solid fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    }
}

// ============================================================
// EXAMS
// ============================================================
function setupExams() {
    document.getElementById('addExamBtn').addEventListener('click', openAddExam);
    document.getElementById('saveExamBtn').addEventListener('click', saveExam);
    document.getElementById('examSearch').addEventListener('input', renderExams);
    document.getElementById('examClassFilter').addEventListener('change', renderExams);
    document.getElementById('examTypeFilter').addEventListener('change', renderExams);

    setupStudentAutocomplete('examStudentSearch', 'examStudentList', 'examStudentId', 'selectedExamStudent', null, null);

    // Auto calculate grade
    ['examTotalMarks', 'examObtainedMarks'].forEach(id => {
        document.getElementById(id).addEventListener('input', calculateGrade);
    });
}

function calculateGrade() {
    const total = parseFloat(document.getElementById('examTotalMarks').value) || 0;
    const obtained = parseFloat(document.getElementById('examObtainedMarks').value) || 0;

    if (total <= 0) return;
    const pct = (obtained / total) * 100;
    
    let grade = '', result = '';
    if (pct >= 90) { grade = 'A+'; result = 'Pass'; }
    else if (pct >= 80) { grade = 'A'; result = 'Pass'; }
    else if (pct >= 70) { grade = 'B'; result = 'Pass'; }
    else if (pct >= 60) { grade = 'C'; result = 'Pass'; }
    else if (pct >= 50) { grade = 'D'; result = 'Pass'; }
    else if (pct >= 33) { grade = 'E'; result = 'Pass'; }
    else { grade = 'F'; result = 'Fail'; }

    document.getElementById('examGrade').value = grade;
    document.getElementById('examResult').value = result;
}

function openAddExam() {
    document.getElementById('examModalTitle').innerHTML = '<i class="fa-solid fa-file-pen"></i> Add Exam Result';
    document.getElementById('examId').value = '';
    document.getElementById('examStudentSearch').value = '';
    document.getElementById('examStudentId').value = '';
    document.getElementById('selectedExamStudent').classList.remove('show');
    document.getElementById('examStudentList').classList.remove('show');
    ['examType','examSubject','examDate','examTotalMarks','examObtainedMarks','examGrade','examResult','examRemarks'].forEach(id => {
        document.getElementById(id).value = '';
    });
    document.getElementById('examDate').value = new Date().toISOString().split('T')[0];
    openModal('examModal');
}

function openEditExam(id) {
    const ex = DB.exams.find(e => e.id === id);
    if (!ex) return;
    const s = DB.students.find(s => s.id === ex.studentId);
    document.getElementById('examModalTitle').innerHTML = '<i class="fa-solid fa-pen"></i> Edit Exam Result';
    document.getElementById('examId').value = ex.id;
    document.getElementById('examStudentSearch').value = s ? `${s.name} (${s.rollNo})` : ex.studentName;
    document.getElementById('examStudentId').value = ex.studentId;
    const sel = document.getElementById('selectedExamStudent');
    sel.textContent = s ? `✓ ${s.name} · ${s.className}` : ex.studentName;
    sel.classList.add('show');
    document.getElementById('examType').value = ex.examType;
    document.getElementById('examSubject').value = ex.subject;
    document.getElementById('examDate').value = ex.examDate || '';
    document.getElementById('examTotalMarks').value = ex.totalMarks;
    document.getElementById('examObtainedMarks').value = ex.obtainedMarks;
    document.getElementById('examGrade').value = ex.grade;
    document.getElementById('examResult').value = ex.result;
    document.getElementById('examRemarks').value = ex.remarks || '';
    openModal('examModal');
}

function saveExam() {
    const id = document.getElementById('examId').value;
    const studentId = document.getElementById('examStudentId').value;
    const examType = document.getElementById('examType').value;
    const subject = document.getElementById('examSubject').value.trim();
    const totalMarks = document.getElementById('examTotalMarks').value;
    const obtainedMarks = document.getElementById('examObtainedMarks').value;

    if (!studentId || !examType || !subject || !totalMarks || !obtainedMarks) {
        showToast('Please fill in all required fields', 'error');
        return;
    }
    if (parseFloat(obtainedMarks) > parseFloat(totalMarks)) {
        showToast('Obtained marks cannot exceed total marks!', 'error');
        return;
    }

    const student = DB.students.find(s => s.id === studentId);
    calculateGrade();

    const examData = {
        studentId,
        studentName: student ? student.name : '',
        studentRollNo: student ? student.rollNo : '',
        studentClass: student ? student.className : '',
        examType,
        subject,
        examDate: document.getElementById('examDate').value,
        totalMarks,
        obtainedMarks,
        percentage: totalMarks > 0 ? ((obtainedMarks / totalMarks) * 100).toFixed(1) : 0,
        grade: document.getElementById('examGrade').value,
        result: document.getElementById('examResult').value,
        remarks: document.getElementById('examRemarks').value.trim(),
    };

    if (id) {
        const idx = DB.exams.findIndex(e => e.id === id);
        DB.exams[idx] = { ...DB.exams[idx], ...examData };
        showToast('Exam result updated!');
    } else {
        DB.exams.push({ id: generateId(), ...examData, addedAt: new Date().toISOString() });
        showToast('Exam result added!');
    }

    saveDB();
    closeModal('examModal');
    renderExams();
    refreshDashboard();
}

function deleteExam(id) {
    showConfirm('Delete Exam Result', 'Delete this exam result permanently?', () => {
        DB.exams = DB.exams.filter(e => e.id !== id);
        saveDB();
        renderExams();
        refreshDashboard();
        showToast('Exam result deleted.', 'info');
    });
}

function renderExams() {
    const search = document.getElementById('examSearch').value.toLowerCase();
    const classF = document.getElementById('examClassFilter').value;
    const typeF = document.getElementById('examTypeFilter').value;

    let filtered = DB.exams.filter(e => {
        const matchSearch = !search || 
            e.studentName.toLowerCase().includes(search) ||
            (e.studentRollNo && e.studentRollNo.toLowerCase().includes(search));
        const matchClass = !classF || e.studentClass === classF;
        const matchType = !typeF || e.examType === typeF;
        return matchSearch && matchClass && matchType;
    });

    const tbody = document.getElementById('examsTbody');
    const empty = document.getElementById('examsEmpty');

    if (filtered.length === 0) {
        tbody.innerHTML = '';
        empty.style.display = 'block';
    } else {
        empty.style.display = 'none';
        tbody.innerHTML = filtered.map(e => {
            const pct = e.totalMarks > 0 ? ((e.obtainedMarks / e.totalMarks) * 100).toFixed(1) : 0;
            return `
            <tr>
                <td><span class="badge badge-class">${e.studentRollNo || '—'}</span></td>
                <td><strong>${e.studentName}</strong></td>
                <td>${e.studentClass || '—'}</td>
                <td>${e.examType}</td>
                <td>${e.subject}</td>
                <td>${e.totalMarks}</td>
                <td>${e.obtainedMarks}</td>
                <td><strong>${pct}%</strong></td>
                <td><span class="badge badge-grade">${e.grade}</span></td>
                <td><span class="badge ${e.result === 'Pass' ? 'badge-pass' : 'badge-fail'}">${e.result}</span></td>
                <td>
                    <div class="action-btns">
                        <button class="act-btn edit" title="Edit" onclick="openEditExam('${e.id}')">
                            <i class="fa-solid fa-pen"></i>
                        </button>
                        <button class="act-btn delete" title="Delete" onclick="deleteExam('${e.id}')">
                            <i class="fa-solid fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>`;
        }).join('');
    }
}

// ============================================================
// CLASS PROMOTION
// ============================================================
function setupPromote() {
    const fromSel = document.getElementById('promoteFromClass');
    const toSel = document.getElementById('promoteToClass');
    const preview = document.getElementById('promotePreview');

    fromSel.addEventListener('change', () => {
        const from = fromSel.value;
        if (!from) { preview.classList.remove('show'); return; }
        const count = DB.students.filter(s => s.className === from).length;
        preview.innerHTML = `<i class="fa-solid fa-users"></i> <strong>${count}</strong> student(s) in ${from} will be promoted.`;
        preview.classList.add('show');
    });

    document.getElementById('bulkPromoteBtn').addEventListener('click', () => {
        const from = fromSel.value;
        const to = toSel.value;
        if (!from || !to) { showToast('Please select both From and To class', 'error'); return; }
        if (from === to) { showToast('From and To class cannot be the same!', 'error'); return; }

        const affected = DB.students.filter(s => s.className === from);
        if (affected.length === 0) { showToast(`No students found in ${from}`, 'info'); return; }

        showConfirm(
            'Bulk Class Promotion',
            `Promote ALL ${affected.length} student(s) from "${from}" to "${to}"? This cannot be undone.`,
            () => {
                DB.students.forEach(s => {
                    if (s.className === from) s.className = to;
                });
                saveDB();
                preview.classList.remove('show');
                fromSel.value = '';
                toSel.value = '';
                refreshDashboard();
                updateStudentBadge();
                renderStudents();
                showToast(`${affected.length} student(s) promoted from ${from} to ${to}!`);
            }
        );
    });

    // Individual promotion search
    const searchInput = document.getElementById('promoteSearch');
    searchInput.addEventListener('input', () => {
        const q = searchInput.value.toLowerCase();
        const results = document.getElementById('promoteResults');
        if (!q) { results.innerHTML = ''; return; }

        const matches = DB.students.filter(s =>
            s.name.toLowerCase().includes(q) || s.rollNo.toLowerCase().includes(q)
        ).slice(0, 10);

        if (matches.length === 0) {
            results.innerHTML = `<p style="color:var(--text-muted);font-size:13px;">No student found.</p>`;
            return;
        }

        results.innerHTML = matches.map(s => `
            <div class="promote-student-row">
                <div class="promote-student-info">
                    <strong>${s.name}</strong>
                    <span>${s.rollNo} · ${s.className}${s.section ? ' - ' + s.section : ''}</span>
                </div>
                <div class="promote-select-wrap">
                    <select class="filter-select" id="prom-${s.id}" style="font-size:12px;">
                        <option value="">Promote to...</option>
                        <option>Nursery</option><option>KG</option>
                        <option>Class 1</option><option>Class 2</option><option>Class 3</option>
                        <option>Class 4</option><option>Class 5</option><option>Class 6</option>
                        <option>Class 7</option><option>Class 8</option><option>Class 9</option>
                        <option>Class 10</option>
                    </select>
                    <button class="btn-primary" style="padding:8px 14px;font-size:12px;" onclick="promoteIndividual('${s.id}')">
                        <i class="fa-solid fa-arrow-up"></i> Promote
                    </button>
                </div>
            </div>
        `).join('');
    });
}

function promoteIndividual(studentId) {
    const newClass = document.getElementById(`prom-${studentId}`).value;
    if (!newClass) { showToast('Please select the target class', 'error'); return; }
    const s = DB.students.find(s => s.id === studentId);
    if (!s) return;
    const oldClass = s.className;
    s.className = newClass;
    saveDB();
    renderStudents();
    refreshDashboard();
    showToast(`${s.name} promoted from ${oldClass} to ${newClass}!`);
    document.getElementById('promoteSearch').dispatchEvent(new Event('input'));
}

function refreshPromote() { /* refresh on tab open */ }

// ============================================================
// IMPORT / EXPORT
// ============================================================
// ---- PDF Export (Beautiful Professional Design with Logo) ----
function exportPDF() {
  if (!window.jspdf) {
    showToast('PDF library not loaded. Please check internet connection.', 'error');
    return;
  }

  showToast('Generating PDF Report...', 'info');

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const today = new Date();
  const dateStr = today.toLocaleDateString('en-PK', { day: '2-digit', month: 'long', year: 'numeric' });

  // ---- Header Background ----
  doc.setFillColor(30, 58, 138);
  doc.rect(0, 0, pageW, 45, 'F');

  // Gold accent bar
  doc.setFillColor(250, 204, 21);
  doc.rect(0, 45, pageW, 3, 'F');

  // ---- School Logo ----
  if (typeof LOGO_BASE64 !== 'undefined' && LOGO_BASE64) {
    // White circle behind logo
    doc.setFillColor(255, 255, 255);
    doc.circle(25, 22.5, 17, 'F');
    doc.addImage(LOGO_BASE64, 'JPEG', 9, 6, 32, 32);
    } else {
      // Fallback text circle
      doc.setFillColor(255, 255, 255);
      doc.circle(25, 22.5, 17, 'F');
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(30, 58, 138);
      doc.text('SH', 25, 27, { align: 'center' });
    }

    // ---- School Name ----
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 255, 255);
    doc.text("Scholar's Heaven School", 47, 17);

    // Tagline (gold)
    doc.setFontSize(9);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(250, 204, 21);
    doc.text('The Center of Excellence  ·  Unity, Faith, Discipline  ·  Learn & Grow Day By Day', 47, 26);

    // Report title
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(200, 220, 255);
    doc.text('School Management System — Fee Report', 47, 35);

    // Right side info
    doc.setFontSize(9);
    doc.setTextColor(200, 220, 255);
    doc.text(`Generated: ${dateStr}`, pageW - 10, 17, { align: 'right' });
    doc.setFontSize(8);
    doc.text(`Total Students: ${DB.students.length}  |  Total Fee Records: ${DB.fees.length}`, pageW - 10, 25, { align: 'right' });

    // ---- Summary Stats ----
    const totalFees = DB.fees.length;
    const paidFees = DB.fees.filter(f => f.status === 'paid').length;
    const unpaidFees = DB.fees.filter(f => f.status === 'unpaid').length;
    const totalAmt = DB.fees.reduce((s, f) => s + Number(f.amount || 0), 0);
    const paidAmt  = DB.fees.reduce((s, f) => s + Number(f.paidAmount || 0), 0);
    const remainingAmt = DB.fees.reduce((s, f) => {
      const rem = f.remaining != null ? Number(f.remaining) : (Number(f.amount) - Number(f.paidAmount || 0));
      return s + rem;
    }, 0);

    const statY    = 52;
    const statBoxW = (pageW - 20) / 3;

    // Box 1 — Records
    doc.setFillColor(239, 246, 255);
    doc.roundedRect(10, statY, statBoxW - 4, 22, 3, 3, 'F');
    doc.setFontSize(17);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 58, 138);
    doc.text(String(totalFees), 10 + (statBoxW - 4) / 2, statY + 11, { align: 'center' });
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(80, 100, 140);
    doc.text(`Total Records  |  Paid: ${paidFees}  |  Unpaid: ${unpaidFees}`, 10 + (statBoxW - 4) / 2, statY + 18, { align: 'center' });

    // Box 2 — Total Amount
    doc.setFillColor(240, 253, 244);
    doc.roundedRect(10 + statBoxW, statY, statBoxW - 4, 22, 3, 3, 'F');
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(21, 128, 61);
    doc.text(`Rs ${totalAmt.toLocaleString()}`, 10 + statBoxW + (statBoxW - 4) / 2, statY + 11, { align: 'center' });
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(80, 140, 80);
    doc.text('Total Fee Amount', 10 + statBoxW + (statBoxW - 4) / 2, statY + 18, { align: 'center' });

    // Box 3 — Remaining
    doc.setFillColor(255, 247, 237);
    doc.roundedRect(10 + statBoxW * 2, statY, statBoxW - 4, 22, 3, 3, 'F');
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(194, 65, 12);
    doc.text(`Rs ${remainingAmt.toLocaleString()}`, 10 + statBoxW * 2 + (statBoxW - 4) / 2, statY + 11, { align: 'center' });
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(140, 80, 40);
    doc.text('Total Remaining Balance', 10 + statBoxW * 2 + (statBoxW - 4) / 2, statY + 18, { align: 'center' });

    // ---- Fee Table ----
    const headers = [['#', 'Roll No', 'Student Name', 'Class', 'Month / Year', 'Amount (Rs)', 'Paid (Rs)', 'Remaining (Rs)', 'Status', 'Paid Date']];
    const rows = DB.fees.map((f, i) => {
      const rem = f.remaining != null ? Number(f.remaining) : (Number(f.amount) - Number(f.paidAmount || 0));
      return [
        i + 1,
        f.studentRollNo || '—',
        f.studentName   || '—',
        f.studentClass  || '—',
        `${f.month || '—'} ${f.year || ''}`,
        `Rs ${Number(f.amount    || 0).toLocaleString()}`,
        `Rs ${Number(f.paidAmount || 0).toLocaleString()}`,
        `Rs ${rem.toLocaleString()}`,
        f.status === 'paid' ? 'PAID' : 'UNPAID',
        f.paidDate ? formatDate(f.paidDate) : '—'
      ];
    });

    doc.autoTable({
      startY: statY + 26,
      head: headers,
      body: rows,
      theme: 'grid',
      headStyles: {
        fillColor: [30, 58, 138],
        textColor: 255,
        fontStyle: 'bold',
        fontSize: 9,
        halign: 'center',
        cellPadding: 3
      },
      bodyStyles: { fontSize: 8.5, textColor: [40, 40, 60], cellPadding: 2.5 },
      alternateRowStyles: { fillColor: [245, 248, 255] },
      columnStyles: {
        0: { halign: 'center', cellWidth: 8  },
        1: { halign: 'center', cellWidth: 22 },
        2: { cellWidth: 42 },
        3: { halign: 'center', cellWidth: 22 },
        4: { halign: 'center', cellWidth: 26 },
        5: { halign: 'right',  cellWidth: 26 },
        6: { halign: 'right',  cellWidth: 22 },
        7: { halign: 'right',  cellWidth: 28 },
        8: { halign: 'center', cellWidth: 18 },
        9: { halign: 'center', cellWidth: 26 }
      },
      didDrawCell: (data) => {
        if (data.column.index === 8 && data.section === 'body') {
          const val = data.cell.text[0];
          const isPaid = val === 'PAID';
          doc.setFillColor(...(isPaid ? [220, 252, 231] : [254, 226, 226]));
          doc.rect(data.cell.x, data.cell.y, data.cell.width, data.cell.height, 'F');
          doc.setTextColor(...(isPaid ? [21, 128, 61] : [185, 28, 28]));
          doc.setFontSize(8);
          doc.setFont('helvetica', 'bold');
          doc.text(val, data.cell.x + data.cell.width / 2, data.cell.y + data.cell.height / 2 + 1, { align: 'center' });
          doc.setTextColor(40, 40, 60);
          doc.setFont('helvetica', 'normal');
        }
      },
      margin: { left: 10, right: 10 }
    });

    // ---- Footer on every page ----
    const totalPages = doc.internal.getNumberOfPages();
    for (let p = 1; p <= totalPages; p++) {
      doc.setPage(p);
      doc.setFillColor(30, 58, 138);
      doc.rect(0, pageH - 10, pageW, 10, 'F');
      doc.setFontSize(8);
      doc.setTextColor(200, 220, 255);
      doc.text(`Scholar's Heaven School — Confidential Fee Report`, 10, pageH - 3.5);
      doc.text(`Page ${p} of ${totalPages}`, pageW - 10, pageH - 3.5, { align: 'right' });
    }

    doc.save(`SHS_Fee_Report_${today.toISOString().split('T')[0]}.pdf`);
    showToast('Fee report exported as PDF!', 'success');
}

// ---- Individual Monthly Fee Card Export ----
function printFeeCard(id) {
  if (!window.jspdf) {
    showToast('PDF library not loaded. Please check internet connection.', 'error');
    return;
  }
  const fee = DB.fees.find(f => f.id === id);
  if (!fee) return;
  
  showToast('Generating Fee Card...', 'info');

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const today = new Date();
  const dateStr = today.toLocaleDateString('en-PK', { day: '2-digit', month: 'short', year: 'numeric' });

  // Calculate Due Date (7 days after issue)
  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + 7);
  const dueDateStr = dueDate.toLocaleDateString('en-PK', { day: '2-digit', month: 'short', year: 'numeric' });

  // Draw Card Container
  const cx = 15, cy = 20, cw = pageW - 30, ch = 190;
  doc.setFillColor(252, 253, 255);
  doc.rect(cx, cy, cw, ch, 'F');
  doc.setDrawColor(30, 58, 138); // Deep Blue border
  doc.setLineWidth(0.8);
  doc.rect(cx, cy, cw, ch, 'S');

  // Header
  doc.setFillColor(30, 58, 138); // Deep Blue
  doc.rect(cx, cy, cw, 32, 'F');
  doc.setFillColor(250, 204, 21); // Gold
  doc.rect(cx, cy + 32, cw, 2, 'F');

  // Logo
  if (typeof LOGO_BASE64 !== 'undefined' && LOGO_BASE64) {
    doc.setFillColor(255, 255, 255);
    doc.circle(cx + 20, cy + 16, 12, 'F');
    doc.addImage(LOGO_BASE64, 'JPEG', cx + 10, cy + 6, 20, 20);
  } else {
    doc.setFillColor(255, 255, 255);
    doc.circle(cx + 20, cy + 16, 12, 'F');
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 58, 138);
    doc.text('SH', cx + 20, cy + 18, { align: 'center' });
  }

  // School Name
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text("Scholar's Heaven School", cx + 40, cy + 15);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(250, 204, 21);
  doc.text('The Center of Excellence', cx + 40, cy + 22);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(200, 220, 255);
  doc.text('Student Monthly Fee Voucher / Challan Form', cx + 40, cy + 28);

  // Voucher Details Header
  doc.setTextColor(40, 40, 40);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('Voucher No:', cx + 10, cy + 46);
  doc.setFont('helvetica', 'normal');
  doc.text(fee.id.substring(0, 8).toUpperCase(), cx + 35, cy + 46);
  
  doc.setFont('helvetica', 'bold');
  doc.text('Issue Date:', cx + cw - 60, cy + 46);
  doc.setFont('helvetica', 'normal');
  doc.text(dateStr, cx + cw - 35, cy + 46);

  doc.setFont('helvetica', 'bold');
  doc.text('Due Date:', cx + cw - 60, cy + 53);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(185, 28, 28); // Red for Due Date
  doc.text(dueDateStr, cx + cw - 35, cy + 53);
  doc.setTextColor(40, 40, 40);

  // Student Info Box
  doc.setFillColor(244, 248, 255);
  doc.setDrawColor(200, 210, 230);
  doc.roundedRect(cx + 10, cy + 62, cw - 20, 32, 2, 2, 'FD');
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('Student Name:', cx + 15, cy + 72);
  doc.setFont('helvetica', 'normal');
  doc.text(fee.studentName || '—', cx + 45, cy + 72);

  doc.setFont('helvetica', 'bold');
  doc.text('Roll No:', cx + cw / 2 + 10, cy + 72);
  doc.setFont('helvetica', 'normal');
  doc.text(fee.studentRollNo || '—', cx + cw / 2 + 35, cy + 72);

  doc.setFont('helvetica', 'bold');
  doc.text('Class:', cx + 15, cy + 85);
  doc.setFont('helvetica', 'normal');
  doc.text(fee.studentClass || '—', cx + 45, cy + 85);

  doc.setFont('helvetica', 'bold');
  doc.text('Fee Month:', cx + cw / 2 + 10, cy + 85);
  doc.setFont('helvetica', 'normal');
  doc.text(`${fee.month || '—'} ${fee.year || ''}`, cx + cw / 2 + 35, cy + 85);

  // Fee Particulars
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setFillColor(235, 240, 250);
  doc.rect(cx + 10, cy + 105, cw - 20, 8, 'F');
  doc.text('Description', cx + 15, cy + 110);
  doc.text('Amount (Rs)', cx + cw - 15, cy + 110, {align: 'right'});
  
  doc.setDrawColor(200, 200, 200);
  doc.line(cx + 10, cy + 113, cx + cw - 10, cy + 113);

  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text('1. Monthly Tuition Fee', cx + 15, cy + 125);
  doc.text(`${Number(fee.amount || 0).toLocaleString()}`, cx + cw - 15, cy + 125, {align: 'right'});

  let nextY = cy + 137;
  if (fee.status === 'paid') {
      doc.text('2. Paid Amount', cx + 15, nextY);
      doc.text(`- ${Number(fee.paidAmount || 0).toLocaleString()}`, cx + cw - 15, nextY, {align: 'right'});
      nextY += 12;
  }

  doc.line(cx + 10, nextY - 4, cx + cw - 10, nextY - 4);

  // Totals
  const rem = fee.remaining != null ? Number(fee.remaining) : (Number(fee.amount) - Number(fee.paidAmount || 0));
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.text(fee.status === 'paid' ? 'Remaining Balance' : 'Total Payable Amount', cx + 15, nextY + 6);
  doc.text(`Rs ${fee.status === 'paid' ? rem.toLocaleString() : Number(fee.amount || 0).toLocaleString()}/-`, cx + cw - 15, nextY + 6, {align: 'right'});

  // Status Stamp
  doc.setFontSize(26);
  if (fee.status === 'paid') {
      doc.setTextColor(21, 128, 61); // Green
      doc.text('PAID', cx + cw / 2, nextY + 28, {align: 'center'});
  } else {
      doc.setTextColor(185, 28, 28); // Red
      doc.text('UNPAID', cx + cw / 2, nextY + 28, {align: 'center'});
  }

  // Signatures
  doc.setDrawColor(100, 100, 100);
  doc.setTextColor(40, 40, 40);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  
  doc.line(cx + 20, cy + ch - 25, cx + 70, cy + ch - 25);
  doc.text('Cashier / Bank Officer', cx + 25, cy + ch - 20);

  doc.line(cx + cw - 70, cy + ch - 25, cx + cw - 20, cy + ch - 25);
  doc.text('Principal / Admin', cx + cw - 65, cy + ch - 20);

  // School Tagline / Note at bottom
  doc.setFontSize(8);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(120, 120, 120);
  doc.text("Note: Please pay the fee before the due date to avoid late charges. This is a computer generated document.", cx + cw / 2, cy + ch - 8, {align: 'center'});

  doc.save(`Fee_Voucher_${fee.studentRollNo || 'Student'}_${fee.month}.pdf`);
  showToast('Professional Fee Card generated!', 'success');
}

// ---- JSON Export ----
function exportJSON() {
  const data = {
    exportedAt: new Date().toISOString(),
    school: "Scholar's Heaven",
    data: {
      students: DB.students,
      fees: DB.fees,
      exams: DB.exams
    }
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `SHS_Backup_${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  showToast('Data exported as JSON backup!', 'success');
}

// ---- Setup Import/Export Event Listeners ----
function setupImportExport() {
  const pdfBtn = document.getElementById('exportPdfBtn');
  const jsonBtn = document.getElementById('exportJsonBtn');
  const importFile = document.getElementById('importFile');

  if (pdfBtn)  pdfBtn.addEventListener('click', exportPDF);
  if (jsonBtn) jsonBtn.addEventListener('click', exportJSON);
  if (importFile) importFile.addEventListener('change', importData);
}

function importData(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
        try {
            const parsed = JSON.parse(ev.target.result);
            const importedDB = parsed.data || parsed;
            if (!importedDB.students && !importedDB.fees && !importedDB.exams) {
                showToast('Invalid file format!', 'error');
                return;
            }
            showConfirm(
                'Import Data',
                `This will MERGE the imported data with existing data. Proceed?`,
                () => {
                    // Merge (avoid duplicates by id)
                    const existingStudentIds = new Set(DB.students.map(s => s.id));
                    const existingFeeIds = new Set(DB.fees.map(f => f.id));
                    const existingExamIds = new Set(DB.exams.map(e => e.id));

                    (importedDB.students || []).forEach(s => { if (!existingStudentIds.has(s.id)) DB.students.push(s); });
                    (importedDB.fees || []).forEach(f => { if (!existingFeeIds.has(f.id)) DB.fees.push(f); });
                    (importedDB.exams || []).forEach(ex => { if (!existingExamIds.has(ex.id)) DB.exams.push(ex); });

                    saveDB();
                    refreshAll();
                    showToast('Data imported and merged successfully!', 'success');
                }
            );
        } catch (err) {
            showToast('Could not read file. Make sure it is a valid JSON backup.', 'error');
        }
        e.target.value = '';
    };
    reader.readAsText(file);
}

// ============================================================
// HELPERS
// ============================================================
function formatDate(dateStr) {
    if (!dateStr) return '—';
    try {
        return new Date(dateStr).toLocaleDateString('en-PK', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch { return dateStr; }
}

// Make functions globally accessible for inline onclick handlers
window.openEditStudent = openEditStudent;
window.deleteStudent = deleteStudent;
window.openEditFee = openEditFee;
window.deleteFee = deleteFee;
window.toggleFeeStatus = toggleFeeStatus;
window.openEditExam = openEditExam;
window.deleteExam = deleteExam;
window.promoteIndividual = promoteIndividual;
window.printFeeCard = printFeeCard;
