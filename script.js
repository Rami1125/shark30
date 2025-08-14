// == Configuration ==
const API_BASE = 'https://script.google.com/macros/s/AKfycbyn_XlZa0_FY95TlrdHYc4CLFOVWbdI0hhi6Qv6OviHI7_Oa9-DETzz9jjUc_AXYmysmw/exec'; // Your GAS Web App URL
let showClosed = false;

const tBody = document.querySelector('#ordersTable tbody');
const alerts = document.getElementById('alerts');

// Fetch orders from API
async function fetchOrders(){
  try {
    const res = await fetch(API_BASE + '?action=list&show='+(showClosed?'all':'open'));
    const data = await res.json();
    renderTable(data.data || []);
  } catch(err){
    console.error(err);
    showAlert('שגיאה', 'לא ניתן לשלוף הזמנות');
  }
}

function renderTable(data){
  tBody.innerHTML = '';
  data.forEach(order => {
    const tr = document.createElement('tr');
    for (let key in order) {
      const td = document.createElement('td');
      td.textContent = order[key] !== undefined ? order[key] : '';
      tr.appendChild(td);
    }
    tBody.appendChild(tr);
  });
}

function showAlert(title, msg){
  console.log(title, msg);
}

// Init
fetchOrders();

// Mock for quick demo (will be replaced by fetchOrders)
const mockOrders = [
  {date:'2025-08-04', doc:'6713938', agent:'מוחמד/שארק', client:'הכל מבראשית', address:'שער 14 תל אביב', action_type:'החלפה', container_out:'71', container_in:'20', status:'סגורה', notes:'', id:1},
  {date:'2025-08-13', doc:'6713975', agent:'מוחמד/שארק', client:'שחר שאול תכנון', address:'גלגל המזלות הוד השרון', action_type:'החלפה', container_out:'71', container_in:'0', status:'פתוחה', notes:'', id:5}
];

// ===== UI helpers =====
const tBody = document.querySelector('#ordersTable tbody');
const kpiOpen = document.getElementById('kpiOpen');
const kpiOverdue = document.getElementById('kpiOverdue');
const kpiSoon = document.getElementById('kpiSoon');
const kpiDuplicates = document.getElementById('kpiDuplicates');
const alerts = document.getElementById('alerts');

// Modal controls
const modal = document.getElementById('modal');
const modalClose = document.getElementById('modalClose');
const orderForm = document.getElementById('orderForm');

// Init
document.getElementById('btnRefresh').addEventListener('click', fetchOrders);
document.getElementById('btnAdd').addEventListener('click', ()=>openModal());
document.getElementById('btnToggleClosed').addEventListener('click', ()=>{showClosed = !showClosed; document.getElementById('btnToggleClosed').innerText = showClosed ? 'הצג פתוחות' : 'הצג סגורות'; fetchOrders();});
modalClose.addEventListener('click', closeModal);
orderForm.addEventListener('submit', submitForm);

// Fetch orders (from API or mock)
async function fetchOrders(){
  // For demo use mockOrders, but code ready for real fetch:
  // const res = await fetch(API_BASE + '?action=list&show='+(showClosed?'all':'open'));
  // const data = await res.json();
  const data = mockOrders.filter(o => showClosed ? true : o.status !== 'סגורה');
  renderTable(data);
  runBackgroundChecks(data);
}

function renderTable(data){
  tBody.innerHTML = '';
  data.forEach(r => {
    const tr = document.createElement('tr');
    if(isOverdue(r)) tr.classList.add('row-overdue');
    tr.innerHTML = `
      <td>${r.date}</td>
      <td>${r.doc}</td>
      <td>${r.client}</td>
      <td>${r.address}</td>
      <td>${r.action_type}</td>
      <td>${r.container_out||''}</td>
      <td>${r.container_in||''}</td>
      <td>${r.status}</td>
      <td>
        <button class="btn" onclick='openHistory(${r.id})'>הצג היסטוריה</button>
        <button class="btn primary" onclick='openModal(${r.id})'>ערוך</button>
        <button class="btn" onclick='duplicate(${r.id})'>שכפל</button>
        <button class="btn" onclick='closeOrder(${r.id})'>סגור</button>
      </td>
    `;
    tBody.appendChild(tr);
  });
  // KPIs
  kpiOpen.innerText = data.filter(d=>d.status!=='סגורה').length;
  kpiOverdue.innerText = data.filter(isOverdue).length;
  kpiSoon.innerText = data.filter(d=>daysLeft(d)<=3 && !isOverdue(d)).length;
  kpiDuplicates.innerText = 0; // updated by background checks
}

// Simple overdue calc: if action_type is הצבה or החלפה -> startDate +10 days
function parseDate(s){ return new Date(s); }
function computeEndDate(r){ if(['הצבה','החלפה'].includes(r.action_type)){ const d=parseDate(r.date); d.setDate(d.getDate()+10); return d; } return null; }
function daysLeft(r){ const end=computeEndDate(r); if(!end) return Infinity; const diff=Math.ceil((end - new Date())/86400000); return diff; }
function isOverdue(r){ const left=daysLeft(r); return left!==Infinity && left<0 && r.status!=='סגורה'; }

// Background checks: duplicates and address fuzzy (very simple)
function runBackgroundChecks(data){
  // container duplicates
  const containerCount = {};
  data.forEach(d=>{
    if(d.container_out) containerCount[d.container_out] = (containerCount[d.container_out]||0)+1;
    if(d.container_in) containerCount[d.container_in] = (containerCount[d.container_in]||0)+1;
  });
  const duplicates = Object.keys(containerCount).filte
