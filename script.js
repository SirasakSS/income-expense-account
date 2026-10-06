// อ้างอิง element ใน index.html
const balance = document.getElementById('balance');
const money_plus = document.getElementById('money-plus');
const money_minus = document.getElementById('money-minus');
const list = document.getElementById('list');
const empty = document.getElementById('empty');
const form = document.getElementById('form');
const text = document.getElementById('text');
const amount = document.getElementById('amount');
const errorBox = document.getElementById('error');
const clearAll = document.getElementById('clear-all');

const STORAGE_KEY = 'income-expense-transactions';

let transactions = load();

function load() {
    try {
        const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
        return Array.isArray(saved) ? saved : [];
    } catch (e) {
        return [];
    }
}

function save() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
    } catch (e) {
        // บันทึกไม่ได้ (เช่น โหมดส่วนตัว) แอปยังใช้งานต่อได้ แต่ข้อมูลจะไม่ถูกเก็บ
    }
}

function formatMoney(num) {
    return '฿' + num.toLocaleString('th-TH', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}

function formatDate(timestamp) {
    return new Date(timestamp).toLocaleDateString('th-TH', {
        day: 'numeric',
        month: 'short',
        year: '2-digit'
    });
}

function render() {
    list.innerHTML = '';
    // แสดงรายการล่าสุดไว้บนสุด
    [...transactions].reverse().forEach(addDataToList);
    empty.hidden = transactions.length > 0;
    clearAll.hidden = transactions.length === 0;
    calculateMoney();
}

function addDataToList(t) {
    const isExpense = t.amount < 0;
    const item = document.createElement('li');
    item.classList.add(isExpense ? 'minus' : 'plus');

    const info = document.createElement('div');
    info.className = 'item-info';
    const name = document.createElement('span');
    name.className = 'item-name';
    name.textContent = t.text; // textContent ป้องกันการแทรกโค้ด HTML
    const date = document.createElement('span');
    date.className = 'item-date';
    date.textContent = formatDate(t.id);
    info.append(name, date);

    const value = document.createElement('span');
    value.className = 'item-amount';
    value.textContent = (isExpense ? '−' : '+') + formatMoney(Math.abs(t.amount));

    const del = document.createElement('button');
    del.type = 'button';
    del.className = 'delete-btn';
    del.setAttribute('aria-label', 'ลบ ' + t.text);
    del.textContent = '×';
    del.addEventListener('click', () => removeData(t.id));

    item.append(info, value, del);
    list.appendChild(item);
}

function calculateMoney() {
    const amounts = transactions.map(t => t.amount);
    const income = amounts.filter(a => a > 0).reduce((sum, a) => sum + a, 0);
    const expense = amounts.filter(a => a < 0).reduce((sum, a) => sum + a, 0) * -1;
    const total = income - expense;

    balance.textContent = (total < 0 ? '−' : '') + formatMoney(Math.abs(total));
    balance.classList.toggle('negative', total < 0);
    money_plus.textContent = formatMoney(income);
    money_minus.textContent = formatMoney(expense);
}

function removeData(id) {
    transactions = transactions.filter(t => t.id !== id);
    save();
    render();
}

function showError(message) {
    errorBox.textContent = message;
    errorBox.hidden = false;
}

function addTransaction(e) {
    e.preventDefault();
    const name = text.value.trim();
    const value = parseFloat(amount.value);

    if (name === '') {
        showError('กรุณาระบุชื่อธุรกรรม');
        text.focus();
        return;
    }
    if (!Number.isFinite(value) || value <= 0) {
        showError('กรุณาระบุจำนวนเงินที่มากกว่า 0');
        amount.focus();
        return;
    }

    errorBox.hidden = true;
    const type = form.elements['type'].value;
    transactions.push({
        id: Date.now(),
        text: name,
        amount: type === 'expense' ? -value : value
    });
    save();
    render();
    text.value = '';
    amount.value = '';
    text.focus();
}

clearAll.addEventListener('click', () => {
    if (confirm('ต้องการลบธุรกรรมทั้งหมดใช่หรือไม่?')) {
        transactions = [];
        save();
        render();
    }
});

form.addEventListener('submit', addTransaction);
render();
