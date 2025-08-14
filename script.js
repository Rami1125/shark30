// script.js - לוח בקרה מכולות מלא עם כתובת Web App

const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyn_XlZa0_FY95TlrdHYc4CLFOVWbdI0hhi6Qv6OviHI7_Oa9-DETzz9jjUc_AXYmysmw/exec';

// טעינת הזמנות מהשרת
async function loadOrders(show='open') {
  try {
    const response = await fetch(`${SCRIPT_URL}?action=list&show=${show}`);
    if (!response.ok) throw new Error('Network response was not ok');

    const result = await response.json();
    if(!result.ok) throw new Error(result.error || 'שגיאה בטעינת נתונים');

    const orders = result.data;
    const tbody = document.querySelector('#ordersTable tbody');
    tbody.innerHTML = '';

    orders.forEach(order => {
      const tr = document.createElement('tr');
      for (let key in order) {
        if (order.hasOwnProperty(key) && key !== '_rowIndex') {
          const td = document.createElement('td');
          td.textContent = order[key];
          tr.appendChild(td);
        }
      }
      tbody.appendChild(tr);
    });
  } catch (err) {
    console.error('Error loading orders:', err);
    alert('שגיאה בטעינת ההזמנות: ' + err.message);
  }
}

// הוספת הזמנה דמה
async function addDummyOrder() {
  try {
    const response = await fetch(`${SCRIPT_URL}?action=add-dummy`, {
      method: 'POST'
    });
    const result = await response.json();
    if(result.ok){
      alert('הזמנה דמה נוספה בהצלחה');
      loadOrders();
    } else {
      alert('שגיאה בהוספת הזמנה דמה: ' + result.error);
    }
  } catch (err) {
    console.error('Error adding dummy order:', err);
    alert('שגיאה בשרת: ' + err.message);
  }
}

// הצגת הזמנות פתוחות
document.addEventListener('DOMContentLoaded', ()=>{
  loadOrders('open');
});

// פונקציה להוספת כפתורים חכמים לדוגמה
function addButtons(){
  const dummyBtn = document.createElement('button');
  dummyBtn.textContent = 'הוסף הזמנה דמה';
  dummyBtn.onclick = addDummyOrder;
  document.body.prepend(dummyBtn);
} 

addButtons();
