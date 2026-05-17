/* SmartWallet - Personal Finance Dashboard
 * Client-side application logic.
 * Persists data in localStorage and renders charts via Chart.js.
 */

(function () {
    'use strict';

    // ---------- Constants ----------
    const STORAGE_KEYS = {
        TRANSACTIONS: 'smartwallet.transactions'
    };

    const CATEGORY_META = {
        food:          { label: 'Food & Dining',      icon: 'food',          color: '#22c55e' },
        transport:     { label: 'Transportation',     icon: 'transport',     color: '#3b82f6' },
        shopping:      { label: 'Shopping',           icon: 'shopping',      color: '#a855f7' },
        entertainment: { label: 'Entertainment',      icon: 'entertainment', color: '#ec4899' },
        bills:         { label: 'Bills & Utilities',  icon: 'bills',         color: '#f59e0b' },
        health:        { label: 'Health',             icon: 'health',        color: '#ef4444' },
        salary:        { label: 'Salary',             icon: 'salary',        color: '#10b981' },
        investment:    { label: 'Investment',         icon: 'investment',    color: '#6366f1' },
        other:         { label: 'Other',              icon: 'other',         color: '#9ca3af' }
    };

    const CATEGORY_ICONS = {
        food: '🍔',
        transport: '🚗',
        shopping: '🛍️',
        entertainment: '🎬',
        bills: '🧾',
        health: '⚕️',
        salary: '💼',
        investment: '📈',
        other: '📌'
    };

    // ---------- State ----------
    const state = {
        transactions: [],
        filter: 'all'
    };

    // ---------- Storage helpers ----------
    function loadTransactions() {
        try {
            const raw = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
            if (!raw) return [];
            const parsed = JSON.parse(raw);
            return Array.isArray(parsed) ? parsed : [];
        } catch (err) {
            console.error('Failed to load transactions', err);
            return [];
        }
    }

    function saveTransactions() {
        localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(state.transactions));
    }

    // ---------- Formatters ----------
    function formatCurrency(value) {
        const sign = value < 0 ? '-' : '';
        const abs = Math.abs(value);
        return `${sign}$${abs.toFixed(2)}`;
    }

    function formatDate(isoDate) {
        if (!isoDate) return '';
        const d = new Date(isoDate);
        if (Number.isNaN(d.getTime())) return isoDate;
        return d.toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' });
    }

    function generateId() {
        return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
    }

    // ---------- Form data extraction ----------
    function readTransactionForm(form) {
        const description = form.querySelector('#description').value.trim();
        const amount = parseFloat(form.querySelector('#amount').value);
        const category = form.querySelector('#category').value;
        const typeInput = form.querySelector('input[name="type"]:checked');
        const type = typeInput ? typeInput.value : 'expense';

        const errors = [];
        if (!description) errors.push('Description is required');
        if (!Number.isFinite(amount) || amount <= 0) errors.push('Amount must be greater than zero');
        if (!category) errors.push('Category is required');
        if (type !== 'income' && type !== 'expense') errors.push('Type is invalid');

        return {
            valid: errors.length === 0,
            errors,
            data: {
                id: generateId(),
                description,
                amount,
                category,
                date: new Date().toISOString().slice(0, 10),
                type,
                createdAt: new Date().toISOString()
            }
        };
    }

    // ---------- Transaction CRUD ----------
    function addTransaction(tx) {
        state.transactions.unshift(tx);
        saveTransactions();
        renderAll();
    }

    function deleteTransaction(id) {
        const idx = state.transactions.findIndex(t => t.id === id);
        if (idx === -1) return;
        state.transactions.splice(idx, 1);
        saveTransactions();
        renderAll();
    }

    // ---------- Calculations ----------
    function computeTotals() {
        let income = 0;
        let expenses = 0;
        for (const tx of state.transactions) {
            if (tx.type === 'income') income += tx.amount;
            else if (tx.type === 'expense') expenses += tx.amount;
        }
        return {
            income,
            expenses,
            balance: income - expenses
        };
    }

    // ---------- Filtering ----------
    function getFilteredTransactions() {
        if (state.filter === 'all') return state.transactions;
        return state.transactions.filter(tx => tx.type === state.filter);
    }

    // ---------- Rendering: balance cards ----------
    function renderBalances() {
        const { income, expenses, balance } = computeTotals();
        document.getElementById('totalBalance').textContent = formatCurrency(balance);
        document.getElementById('totalIncome').textContent = formatCurrency(income);
        document.getElementById('totalExpenses').textContent = formatCurrency(expenses);

        const balanceEl = document.getElementById('totalBalance');
        balanceEl.style.color = balance < 0 ? '#fecaca' : '';
    }

    // ---------- Rendering: transactions list ----------
    function renderTransactions() {
        const list = document.getElementById('transactionList');
        const items = getFilteredTransactions();

        if (items.length === 0) {
            list.innerHTML = `
                <div class="empty-state">
                    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M9 5H7C5.89543 5 5 5.89543 5 7V19C5 20.1046 5.89543 21 7 21H17C18.1046 21 19 20.1046 19 19V7C19 5.89543 18.1046 5 17 5H15" stroke="#9ca3af" stroke-width="2" stroke-linecap="round"/>
                        <path d="M9 5C9 3.89543 9.89543 3 11 3H13C14.1046 3 15 3.89543 15 5V7H9V5Z" stroke="#9ca3af" stroke-width="2" stroke-linecap="round"/>
                    </svg>
                    <p>No transactions yet</p>
                    <p class="empty-subtitle">Add your first transaction to get started</p>
                </div>
            `;
            return;
        }

        const sorted = items.slice().sort((a, b) => {
            const da = new Date(a.date).getTime();
            const db = new Date(b.date).getTime();
            if (db !== da) return db - da;
            return (b.createdAt || '').localeCompare(a.createdAt || '');
        });

        list.innerHTML = sorted.map(renderTransactionItem).join('');

        list.querySelectorAll('[data-delete-id]').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.getAttribute('data-delete-id');
                if (confirm('Delete this transaction?')) {
                    deleteTransaction(id);
                }
            });
        });
    }

    function renderTransactionItem(tx) {
        const meta = CATEGORY_META[tx.category] || CATEGORY_META.other;
        const icon = CATEGORY_ICONS[tx.category] || CATEGORY_ICONS.other;
        const sign = tx.type === 'income' ? '+' : '-';
        return `
            <div class="transaction-item" data-id="${tx.id}">
                <div class="transaction-info">
                    <div class="transaction-icon ${tx.type}">${icon}</div>
                    <div class="transaction-details">
                        <h4>${tx.description}</h4>
                        <p>${meta.label} · ${formatDate(tx.date)}</p>
                    </div>
                </div>
                <div style="display:flex;align-items:center;gap:0.5rem;">
                    <span class="transaction-amount ${tx.type}">${sign}${formatCurrency(tx.amount).replace('-', '')}</span>
                    <button class="delete-btn" data-delete-id="${tx.id}" aria-label="Delete transaction">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M3 6H21M8 6V4C8 3.44772 8.44772 3 9 3H15C15.5523 3 16 3.44772 16 4V6M19 6V20C19 20.5523 18.5523 21 18 21H6C5.44772 21 5 20.5523 5 20V6H19Z" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                        </svg>
                    </button>
                </div>
            </div>
        `;
    }

    // ---------- Modal ----------
    function openModal() {
        const modal = document.getElementById('transactionModal');
        modal.classList.add('active');
        setTimeout(() => document.getElementById('description')?.focus(), 50);
    }

    function closeModal() {
        document.getElementById('transactionModal').classList.remove('active');
        document.getElementById('transactionForm').reset();
    }

    // ---------- Top-level render ----------
    function renderAll() {
        renderBalances();
        renderTransactions();
    }

    // ---------- Event binding ----------
    function bindEvents() {
        document.getElementById('addTransactionBtn').addEventListener('click', openModal);
        document.getElementById('closeModal').addEventListener('click', closeModal);

        document.getElementById('transactionModal').addEventListener('click', (e) => {
            if (e.target.id === 'transactionModal') closeModal();
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') closeModal();
        });

        document.getElementById('transactionForm').addEventListener('submit', (e) => {
            e.preventDefault();
            const result = readTransactionForm(e.currentTarget);
            if (!result.valid) {
                alert(result.errors[0]);
                return;
            }
            addTransaction(result.data);
            closeModal();
        });
    
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                state.filter = btn.getAttribute('data-filter') || 'all';
                renderTransactions();
            });
        });
    }

    // ---------- Bootstrap ----------
    function init() {
        state.transactions = loadTransactions();
        state.budget = loadBudget();
        bindEvents();
        renderAll();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
