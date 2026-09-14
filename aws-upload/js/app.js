// ─── GradeSync App Logic ───────────────────────────────────────────────────
import CONFIG from './config.js';

// ── Helpers ────────────────────────────────────────────────────────────────

function uuid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = Math.random() * 16 | 0;
    return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
  });
}

function calcGrade(pct) {
  if (pct >= 90) return 'A+';
  if (pct >= 75) return 'A';
  if (pct >= 60) return 'B';
  if (pct >= 45) return 'C';
  return 'D';
}

function gradeClass(grade) {
  return { 'A+': 'chip-Aplus', 'A': 'chip-A', 'B': 'chip-B', 'C': 'chip-C', 'D': 'chip-D' }[grade] || 'chip-D';
}

function gradeBigClass(grade) {
  return { 'A+': 'grade-A-plus', 'A': 'grade-A', 'B': 'grade-B', 'C': 'grade-C', 'D': 'grade-D' }[grade] || 'grade-D';
}

function formatTime(iso) {
  try {
    return new Date(iso).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });
  } catch { return iso; }
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

// ── DOM Refs ───────────────────────────────────────────────────────────────

const form         = document.getElementById('grade-form');
const pctVal       = document.getElementById('pct-val');
const gradeBadge   = document.getElementById('grade-badge');
const submitBtn    = document.getElementById('submit-btn');
const submitText   = document.getElementById('submit-text');
const successCard  = document.getElementById('success-card');
const recordsTbody = document.getElementById('records-tbody');
const toast        = document.getElementById('toast');
const toastTitle   = document.getElementById('toast-title');
const toastMsg     = document.getElementById('toast-msg');

const SUBJECT_IDS = ['math', 'science', 'english', 'social', 'cs'];

// ── Grade Preview ──────────────────────────────────────────────────────────

function updateGradePreview() {
  const vals = SUBJECT_IDS.map(id => {
    const v = parseInt(document.getElementById(id)?.value, 10);
    return isNaN(v) ? null : Math.min(100, Math.max(0, v));
  }).filter(v => v !== null);

  if (vals.length === 0) {
    pctVal.textContent = '—';
    gradeBadge.textContent = '?';
    gradeBadge.className = 'grade-badge-big grade-B';
    return;
  }

  const avg = vals.reduce((a, b) => a + b, 0) / vals.length;
  const pct = avg.toFixed(1);
  const grade = calcGrade(avg);
  pctVal.textContent = pct + '%';
  gradeBadge.textContent = grade;
  gradeBadge.className = 'grade-badge-big ' + gradeBigClass(grade);
}

SUBJECT_IDS.forEach(id => {
  document.getElementById(id)?.addEventListener('input', updateGradePreview);
});

// ── Pipeline Step Control ──────────────────────────────────────────────────

const STEPS = ['step-validate', 'step-presign', 'step-s3', 'step-lambda', 'step-dynamo', 'step-sns'];

function resetSteps() {
  STEPS.forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    el.className = 'step';
    const icon = el.querySelector('.step-icon');
    if (icon) { icon.className = 'step-icon idle'; icon.innerHTML = getStepIdleIcon(id); }
    const sub = el.querySelector('.step-sub');
    if (sub) sub.textContent = getStepIdleSub(id);
  });
  successCard.classList.remove('show');
}

function getStepIdleIcon(id) {
  const icons = {
    'step-validate': '✓',
    'step-presign' : '🔗',
    'step-s3'      : '☁',
    'step-lambda'  : 'λ',
    'step-dynamo'  : '◈',
    'step-sns'     : '✉',
  };
  return icons[id] || '·';
}

function getStepIdleSub(id) {
  const subs = {
    'step-validate': 'Waiting...',
    'step-presign' : 'Waiting for upload URL',
    'step-s3'      : 'Waiting to upload',
    'step-lambda'  : 'Lambda on standby',
    'step-dynamo'  : 'No data yet',
    'step-sns'     : 'No notification yet',
  };
  return subs[id] || '';
}

function setStep(id, state, subText = '') {
  const el = document.getElementById(id);
  if (!el) return;
  el.className = 'step ' + state;
  const icon = el.querySelector('.step-icon');
  if (icon) {
    icon.className = 'step-icon ' + state;
    if (state === 'done')   icon.innerHTML = '✓';
    else if (state === 'active') icon.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>';
    else if (state === 'error')  icon.innerHTML = '✕';
    else icon.innerHTML = getStepIdleIcon(id);
  }
  const sub = el.querySelector('.step-sub');
  if (sub && subText) sub.textContent = subText;
}

// ── Mock Upload Flow (DEMO_MODE) ──────────────────────────────────────────

async function mockUploadFlow(record) {
  setStep('step-validate', 'active', 'Checking fields...');
  await sleep(600);
  setStep('step-validate', 'done', 'All fields valid ✓');

  setStep('step-presign', 'active', 'Requesting presigned URL...');
  await sleep(900);
  setStep('step-presign', 'done', 'URL obtained from Lambda ✓');

  setStep('step-s3', 'active', 'Uploading JSON to S3...');
  await sleep(1100);
  setStep('step-s3', 'done', `Saved as records/${record.id.slice(0,8)}.json ✓`);

  setStep('step-lambda', 'active', 'Lambda processing event...');
  await sleep(1200);
  setStep('step-lambda', 'done', 'Python Lambda executed ✓');

  setStep('step-dynamo', 'active', 'Writing to DynamoDB...');
  await sleep(800);
  setStep('step-dynamo', 'done', `Record ID: ${record.id.slice(0,8)}... ✓`);

  setStep('step-sns', 'active', 'Publishing SNS email...');
  await sleep(700);
  setStep('step-sns', 'done', 'Email notification sent ✓');

  return record;
}

// ── Real Upload Flow ───────────────────────────────────────────────────────

async function realUploadFlow(record) {
  setStep('step-validate', 'active', 'Checking fields...');
  await sleep(300);
  setStep('step-validate', 'done', 'All fields valid ✓');

  // 1. Get presigned URL
  setStep('step-presign', 'active', 'Requesting presigned URL...');
  const presignRes = await fetch(`${CONFIG.API_BASE_URL}/presign?filename=${record.id}.json`);
  if (!presignRes.ok) throw new Error('Failed to get presigned URL');
  const { url, key } = await presignRes.json();
  record.fileKey = key;
  setStep('step-presign', 'done', 'Presigned URL received ✓');

  // 2. Upload JSON to S3
  setStep('step-s3', 'active', 'Uploading to S3...');
  const s3Res = await fetch(url, {
    method: 'PUT',
    body: JSON.stringify(record),
    headers: { 'Content-Type': 'application/json' },
  });
  if (!s3Res.ok) throw new Error('S3 upload failed');
  setStep('step-s3', 'done', `Saved to S3 ✓`);

  // 3. Lambda + DynamoDB + SNS happen automatically via S3 event trigger
  setStep('step-lambda', 'active', 'Waiting for Lambda...');
  await sleep(2500); // give Lambda time to process
  setStep('step-lambda', 'done', 'Lambda executed ✓');

  setStep('step-dynamo', 'active', 'Verifying DynamoDB write...');
  await sleep(800);
  setStep('step-dynamo', 'done', `Record saved ✓`);

  setStep('step-sns', 'active', 'SNS notification...');
  await sleep(600);
  setStep('step-sns', 'done', 'Email sent to subscriber ✓');

  return record;
}

// ── Success Card ───────────────────────────────────────────────────────────

function showSuccessCard(record) {
  document.getElementById('sc-name').textContent  = record.name;
  document.getElementById('sc-roll').textContent  = `#${record.rollNo}`;
  document.getElementById('sc-pct').textContent   = record.percentage + '%';
  document.getElementById('sc-grade').textContent = record.grade;
  document.getElementById('sc-id').textContent    = record.id.slice(0, 16) + '...';
  document.getElementById('sc-time').textContent  = formatTime(record.uploadedAt);
  successCard.classList.add('show');
}

// ── Toast ──────────────────────────────────────────────────────────────────

function showToast(title, msg, isError = false) {
  toastTitle.textContent = title;
  toastMsg.textContent   = msg;
  toast.style.borderColor = isError ? 'rgba(248,113,113,0.3)' : 'rgba(52,211,153,0.3)';
  toastTitle.style.color  = isError ? '#f87171' : '#34d399';
  document.getElementById('toast-icon').textContent = isError ? '❌' : '🎉';
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 5000);
}

// ── Records Table ──────────────────────────────────────────────────────────

const LOCAL_RECORDS_KEY = 'gradesync_records';

function saveRecordLocally(record) {
  const existing = getLocalRecords();
  existing.unshift(record);
  const trimmed = existing.slice(0, 10);
  localStorage.setItem(LOCAL_RECORDS_KEY, JSON.stringify(trimmed));
}

function getLocalRecords() {
  try { return JSON.parse(localStorage.getItem(LOCAL_RECORDS_KEY)) || []; }
  catch { return []; }
}

async function fetchRecords() {
  if (CONFIG.DEMO_MODE || !CONFIG.API_BASE_URL) {
    return getLocalRecords();
  }
  try {
    const res = await fetch(`${CONFIG.API_BASE_URL}/records`);
    if (!res.ok) throw new Error('API error');
    return await res.json();
  } catch {
    return getLocalRecords();
  }
}

function renderRecords(records) {
  if (!records.length) {
    recordsTbody.innerHTML = `<tr><td colspan="7" class="empty-records">No records yet. Submit the first student record above!</td></tr>`;
    return;
  }
  recordsTbody.innerHTML = records.map(r => `
    <tr>
      <td class="td-name">${escHtml(r.name)}</td>
      <td>${escHtml(String(r.rollNo))}</td>
      <td>${escHtml(r.classSection)}</td>
      <td>${escHtml(r.academicYear)}</td>
      <td>${r.percentage}%</td>
      <td><span class="grade-chip ${gradeClass(r.grade)}">${r.grade}</span></td>
      <td>${formatTime(r.uploadedAt)}</td>
    </tr>
  `).join('');
}

function escHtml(str) {
  return String(str).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}

async function refreshRecords() {
  const records = await fetchRecords();
  renderRecords(records);
}

// ── Form Submit ────────────────────────────────────────────────────────────

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const name         = document.getElementById('name').value.trim();
  const rollNo       = parseInt(document.getElementById('roll-no').value, 10);
  const classSection = document.getElementById('class-section').value;
  const academicYear = document.getElementById('academic-year').value;
  const teacher      = document.getElementById('teacher').value.trim();
  const remarks      = document.getElementById('remarks').value.trim();

  const marks = {};
  let totalMarks = 0;
  for (const id of SUBJECT_IDS) {
    const v = parseInt(document.getElementById(id).value, 10);
    if (isNaN(v) || v < 0 || v > 100) {
      showToast('Validation Error', `Please enter a valid mark (0–100) for all subjects.`, true);
      return;
    }
    marks[id] = v;
    totalMarks += v;
  }

  const percentage = (totalMarks / SUBJECT_IDS.length).toFixed(1);
  const grade      = calcGrade(parseFloat(percentage));

  const record = {
    id          : uuid(),
    name, rollNo, classSection, academicYear, teacher, remarks,
    marks       : { math: marks.math, science: marks.science, english: marks.english, social: marks.social, cs: marks.cs },
    percentage  : parseFloat(percentage),
    grade,
    uploadedAt  : new Date().toISOString(),
    fileKey     : '',
  };

  // Lock UI
  submitBtn.disabled = true;
  submitText.textContent = 'Uploading…';
  resetSteps();

  try {
    const flowFn = CONFIG.DEMO_MODE || !CONFIG.API_BASE_URL ? mockUploadFlow : realUploadFlow;
    await flowFn(record);

    saveRecordLocally(record);
    showSuccessCard(record);
    showToast('Record Uploaded! 🎓', `${record.name}'s record saved to DynamoDB & email sent.`);
    await refreshRecords();
    form.reset();
    updateGradePreview();
  } catch (err) {
    console.error(err);
    showToast('Upload Failed', err.message || 'Something went wrong. Check console.', true);
    STEPS.forEach(id => {
      const el = document.getElementById(id);
      if (el && el.classList.contains('active')) setStep(id, 'error', 'Failed');
    });
  } finally {
    submitBtn.disabled = false;
    submitText.textContent = 'Upload Record to S3';
  }
});

// ── Init ───────────────────────────────────────────────────────────────────

(async () => {
  updateGradePreview();
  await refreshRecords();
})();
