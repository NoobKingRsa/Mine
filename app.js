// --- Utility Functions ---
localStorage.removeItem('stock'); // Remove or comment out this line after your first successful run!

// --- Demo stock data, YOUR animal feeds/products ---
const DEFAULT_STOCK = [
    { 
        id: 1, 
        name: "Roemryk Voere – Feeds 40kg", 
        type: "Animal Feed", 
        stock: 20, 
        price: 155.00 
    },
    { 
        id: 2, 
        name: "Veld Mix Bales", 
        type: "Grass mix (basic grass)", 
        stock: 30, 
        price: 80.00 
    },
    { 
        id: 3, 
        name: "Teff Bales", 
        type: "Teff grass bales (denser, heavier)", 
        stock: 25, 
        price: 120.00 
    }
];

function getStock() {
    return JSON.parse(localStorage.getItem('stock')) || DEFAULT_STOCK;
}
function setStock(stock) {
    localStorage.setItem('stock', JSON.stringify(stock));
}
function getSales() {
    return JSON.parse(localStorage.getItem('sales')) || [];
}
function setSales(sales) {
    localStorage.setItem('sales', JSON.stringify(sales));
}
function getUnsyncedSales() {
    return getSales().filter(sale => !sale.synced);
}
function markSalesAsSynced() {
    let sales = getSales();
    sales.forEach(sale => { sale.synced = true; });
    setSales(sales);
}

// --- Hamburger / Sidebar Logic ---
function openSidebar() {
    document.getElementById('sidebar').classList.add('open');
    document.getElementById('overlay').classList.add('open');
}
function closeSidebar() {
    document.getElementById('sidebar').classList.remove('open');
    document.getElementById('overlay').classList.remove('open');
}

// --- Navigation Logic ---
function showPage(page) {
    document.querySelectorAll('.page').forEach(p => p.style.display = 'none');
    document.getElementById(page).style.display = 'block';
    if (page === 'stock') renderStockTable();
    if (page === 'sync') renderUnsyncedSales();
    if (page === 'sales') updateItemSelect();
    // Highlight menu
    document.querySelectorAll('.sidebar nav a').forEach(a => a.classList.remove('active'));
    let navLinks = Array.from(document.querySelectorAll('.sidebar nav a'));
    if (page === 'sales') navLinks[0].classList.add('active');
    if (page === 'stock') navLinks[1].classList.add('active');
    if (page === 'sync') navLinks[2].classList.add('active');
}

// --- Sales Page Logic ---
function updateItemSelect() {
    let stock = getStock();
    let select = document.getElementById('itemSelect');
    select.innerHTML = '';
    stock.forEach(item => {
        let opt = document.createElement('option');
        opt.value = item.id;
        opt.textContent = `${item.name} (Stock: ${item.stock})`;
        select.appendChild(opt);
    });
    updatePrice();
}

function updatePrice() {
    let stock = getStock();
    let itemId = parseInt(document.getElementById('itemSelect').value);
    let item = stock.find(i => i.id === itemId);
    document.getElementById('price').value = item ? item.price.toFixed(2) : "";
    updateTotal();
}

function updateTotal() {
    let price = parseFloat(document.getElementById('price').value) || 0;
    let quantity = parseInt(document.getElementById('quantity').value) || 0;
    document.getElementById('total').value = (price * quantity).toFixed(2);
    updateChange();
}
function updateChange() {
    let total = parseFloat(document.getElementById('total').value) || 0;
    let given = parseFloat(document.getElementById('amountGiven').value) || 0;
    document.getElementById('change').value = (given - total).toFixed(2);
}

// --- Sales Form Events ---
document.addEventListener('DOMContentLoaded', function() {
    // Hamburger menu
    document.getElementById('menuToggle').onclick = openSidebar;
    document.getElementById('closeSidebar').onclick = closeSidebar;
    document.getElementById('overlay').onclick = closeSidebar;

    showPage('sales');

    document.getElementById('itemSelect').addEventListener('change', updatePrice);
    document.getElementById('quantity').addEventListener('input', updateTotal);
    document.getElementById('amountGiven').addEventListener('input', updateChange);

    document.getElementById('salesForm').onsubmit = function(e) {
        e.preventDefault();
        let stock = getStock();
        let itemId = parseInt(document.getElementById('itemSelect').value);
        let item = stock.find(i => i.id === itemId);
        let quantity = parseInt(document.getElementById('quantity').value) || 0;

        if (quantity > item.stock) {
            document.getElementById('salesStatus').textContent = "Not enough stock!";
            return;
        }

        // Collect customer info
        const customer = {
            name: document.getElementById('name').value,
            surname: document.getElementById('surname').value,
            email: document.getElementById('email').value,
            phone: document.getElementById('phone').value,
            businessName: document.getElementById('businessName').value
        };
        let sale = {
            id: Date.now(),
            itemId,
            itemName: item.name,
            quantity,
            price: item.price,
            total: quantity * item.price,
            amountGiven: parseFloat(document.getElementById('amountGiven').value),
            change: parseFloat(document.getElementById('change').value),
            customer,
            date: new Date().toISOString(),
            synced: false
        };
        // Save sale
        let sales = getSales();
        sales.push(sale);
        setSales(sales);

        // Update local stock
        item.stock -= quantity;
        setStock(stock);

        document.getElementById('salesStatus').textContent = "Sale saved!";
        document.getElementById('salesForm').reset();
        updateItemSelect();
        setTimeout(() => document.getElementById('salesStatus').textContent = "", 2000);
    };
});

// --- Stock Page Logic ---
function renderStockTable() {
    let stock = getStock();
    let tbody = document.getElementById('stockTable').querySelector('tbody');
    tbody.innerHTML = '';
    stock.forEach(item => {
        let row = document.createElement('tr');
        row.innerHTML = `<td>${item.name}</td>
                         <td>${item.stock}</td>
                         <td>R${item.price.toFixed(2)}</td>`;
        tbody.appendChild(row);
    });
}

// --- Sync Page Logic (placeholder only) ---
function renderUnsyncedSales() {
    let list = document.getElementById('unsyncedSales');
    let unsynced = getUnsyncedSales();
    list.innerHTML = '';
    if (unsynced.length === 0) {
        list.innerHTML = "<li>All sales are synced!</li>";
    } else {
        unsynced.forEach(sale => {
            let li = document.createElement('li');
            li.textContent = `${sale.quantity}x ${sale.itemName} for R${sale.total.toFixed(2)} (${sale.customer.name} ${sale.customer.surname})`;
            list.appendChild(li);
        });
    }
}
document.getElementById('syncBtn').onclick = function() {
    // Placeholder: just mark all as synced
    markSalesAsSynced();
    renderUnsyncedSales();
    document.getElementById('syncStatus').textContent = "All sales marked as synced (stub).";
    setTimeout(() => document.getElementById('syncStatus').textContent = "", 2000);
};