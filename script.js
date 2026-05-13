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
        // populated in upcoming commits
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
