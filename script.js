
        // App State
        const state = {
            currentUser: null,
            users: {},
            categories: ['Food', 'Transport', 'Entertainment', 'Shopping', 'Bills', 'Healthcare', 'Salary', 'Freelance'],
            transactions: [],
            categoryChart: null,
            trendChart: null
        };

        // DOM Elements
        const elements = {
            // Sidebar
            sidebar: document.getElementById('sidebar'),
            menuToggle: document.getElementById('menuToggle'),
            themeToggle: document.getElementById('themeToggle'),
            userTabs: document.getElementById('userTabs'),
            addUserBtn: document.getElementById('addUserBtn'),
            navItems: document.querySelectorAll('.nav-item'),
            
            // Main Content
            pageTitle: document.getElementById('pageTitle'),
            addTransactionBtn: document.getElementById('addTransactionBtn'),
            
            // Sections
            dashboardSection: document.getElementById('dashboardSection'),
            transactionsSection: document.getElementById('transactionsSection'),
            categoriesSection: document.getElementById('categoriesSection'),
            
            // Dashboard
            totalIncome: document.getElementById('totalIncome'),
            totalExpense: document.getElementById('totalExpense'),
            netBalance: document.getElementById('netBalance'),
            categoryChart: document.getElementById('categoryChart'),
            trendChart: document.getElementById('trendChart'),
            
            // Transactions
            typeFilter: document.getElementById('typeFilter'),
            categoryFilter: document.getElementById('categoryFilter'),
            sortFilter: document.getElementById('sortFilter'),
            exportBtn: document.getElementById('exportBtn'),
            transactionsTableBody: document.getElementById('transactionsTableBody'),
            
            // Categories
            addCategoryBtn: document.getElementById('addCategoryBtn'),
            categoriesList: document.getElementById('categoriesList'),
            
            // Modals
            transactionModal: document.getElementById('transactionModal'),
            transactionModalTitle: document.getElementById('transactionModalTitle'),
            transactionForm: document.getElementById('transactionForm'),
            transactionId: document.getElementById('transactionId'),
            amount: document.getElementById('amount'),
            category: document.getElementById('category'),
            description: document.getElementById('description'),
            date: document.getElementById('date'),
            closeTransactionModal: document.getElementById('closeTransactionModal'),
            cancelTransaction: document.getElementById('cancelTransaction'),
            
            userModal: document.getElementById('userModal'),
            userModalTitle: document.getElementById('userModalTitle'),
            userForm: document.getElementById('userForm'),
            userName: document.getElementById('userName'),
            closeUserModal: document.getElementById('closeUserModal'),
            cancelUser: document.getElementById('cancelUser'),
            
            categoryModal: document.getElementById('categoryModal'),
            categoryModalTitle: document.getElementById('categoryModalTitle'),
            categoryForm: document.getElementById('categoryForm'),
            categoryName: document.getElementById('categoryName'),
            closeCategoryModal: document.getElementById('closeCategoryModal'),
            cancelCategory: document.getElementById('cancelCategory')
        };

        // Initialize App
        function initApp() {
            loadData();
            setupEventListeners();
            setupDefaultUser();
            renderUserTabs();
            updateUI();
        }

        // Load data from localStorage
        function loadData() {
            const storedData = localStorage.getItem('expenseTrackerData');
            if (storedData) {
                const data = JSON.parse(storedData);
                state.users = data.users || {};
                state.categories = data.categories || state.categories;
            }
        }

        // Save data to localStorage
        function saveData() {
            const data = {
                users: state.users,
                categories: state.categories
            };
            localStorage.setItem('expenseTrackerData', JSON.stringify(data));
        }

        // Set up default user if none exists
        function setupDefaultUser() {
            if (Object.keys(state.users).length === 0) {
                state.users = {
                    'Default User': {
                        transactions: []
                    }
                };
                saveData();
            }
            
            // Set current user to the first user
            state.currentUser = Object.keys(state.users)[0];
            state.transactions = state.users[state.currentUser].transactions || [];
        }

        // Set up event listeners
        function setupEventListeners() {
            // Theme toggle
            elements.themeToggle.addEventListener('click', toggleTheme);
            
            // Menu toggle for mobile
            elements.menuToggle.addEventListener('click', toggleSidebar);
            
            // Navigation
            elements.navItems.forEach(item => {
                item.addEventListener('click', () => {
                    const section = item.getAttribute('data-section');
                    switchSection(section);
                    
                    // Update active nav item
                    elements.navItems.forEach(nav => nav.classList.remove('active'));
                    item.classList.add('active');
                });
            });
            
            // Add transaction button
            elements.addTransactionBtn.addEventListener('click', () => openTransactionModal());
            
            // Transaction modal
            elements.closeTransactionModal.addEventListener('click', closeTransactionModal);
            elements.cancelTransaction.addEventListener('click', closeTransactionModal);
            elements.transactionForm.addEventListener('submit', handleTransactionSubmit);
            
            // User management
            elements.addUserBtn.addEventListener('click', () => openUserModal());
            elements.closeUserModal.addEventListener('click', closeUserModal);
            elements.cancelUser.addEventListener('click', closeUserModal);
            elements.userForm.addEventListener('submit', handleUserSubmit);
            
            // Category management
            elements.addCategoryBtn.addEventListener('click', () => openCategoryModal());
            elements.closeCategoryModal.addEventListener('click', closeCategoryModal);
            elements.cancelCategory.addEventListener('click', closeCategoryModal);
            elements.categoryForm.addEventListener('submit', handleCategorySubmit);
            
            // Filters
            elements.typeFilter.addEventListener('change', updateTransactionsTable);
            elements.categoryFilter.addEventListener('change', updateTransactionsTable);
            elements.sortFilter.addEventListener('change', updateTransactionsTable);
            
            // Export
            elements.exportBtn.addEventListener('click', exportToCSV);
        }

        // Toggle theme (light/dark mode)
        function toggleTheme() {
            document.body.classList.toggle('dark-mode');
            elements.themeToggle.textContent = document.body.classList.contains('dark-mode') ? '☀️' : '🌙';
        }

        // Toggle sidebar for mobile
        function toggleSidebar() {
            elements.sidebar.classList.toggle('active');
        }

        // Switch between sections
        function switchSection(section) {
            // Hide all sections
            elements.dashboardSection.style.display = 'none';
            elements.transactionsSection.style.display = 'none';
            elements.categoriesSection.style.display = 'none';
            
            // Show selected section
            if (section === 'dashboard') {
    elements.dashboardSection.style.display = 'block';
    elements.pageTitle.textContent = `Dashboard – ${state.currentUser}`;
    updateCharts();
} else if (section === 'transactions') {
    elements.transactionsSection.style.display = 'block';
    elements.pageTitle.textContent = `Transactions – ${state.currentUser}`;
    updateTransactionsTable();
} else if (section === 'categories') {
    elements.categoriesSection.style.display = 'block';
    elements.pageTitle.textContent = `Categories – ${state.currentUser}`;
    renderCategories();
}


        }

        // Render user tabs
        function renderUserTabs() {
            elements.userTabs.innerHTML = '';
            
            Object.keys(state.users).forEach(userName => {
                const userTab = document.createElement('div');
                userTab.className = `user-tab ${userName === state.currentUser ? 'active' : ''}`;
                userTab.innerHTML = `
                    <span>${userName}</span>
                    <div class="user-actions">
                        <button class="user-action-btn edit-user" data-user="${userName}">✏️</button>
                        ${Object.keys(state.users).length > 1 ? `<button class="user-action-btn delete-user" data-user="${userName}">🗑️</button>` : ''}
                    </div>
                `;
                
                // Switch user on click
                userTab.querySelector('span').addEventListener('click', () => switchUser(userName));
                
                // Edit user
                const editBtn = userTab.querySelector('.edit-user');
                editBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    openUserModal(userName);
                });
                
                // Delete user (if not the only user)
                const deleteBtn = userTab.querySelector('.delete-user');
                if (deleteBtn) {
                    deleteBtn.addEventListener('click', (e) => {
                        e.stopPropagation();
                        deleteUser(userName);
                    });
                }
                
                elements.userTabs.appendChild(userTab);
            });
        }

        // Switch to a different user
        function switchUser(userName) {
            state.currentUser = userName;
            state.transactions = state.users[userName].transactions || [];
            renderUserTabs();
            updateUI();
        }

        // Add a new user
       function addUser(userName) {
    if (state.users[userName]) {
        alert('User already exists!');
        return;
    }

    // Create new user
    state.users[userName] = {
        transactions: []
    };

    // 🔹 Set this new user as the current one
    state.currentUser = userName;
    state.transactions = state.users[userName].transactions;

    saveData();
    renderUserTabs();
    closeUserModal();

    // 🔹 Update the UI to show username in dashboard and transactions
    updateUI();
}


        // Edit an existing user
        function editUser(oldName, newName) {
            if (oldName !== newName && state.users[newName]) {
                alert('User already exists!');
                return;
            }
            
            if (oldName !== newName) {
                state.users[newName] = state.users[oldName];
                delete state.users[oldName];
                
                if (state.currentUser === oldName) {
                    state.currentUser = newName;
                }
            }
            
            saveData();
            renderUserTabs();
            closeUserModal();
        }

        // Delete a user
        function deleteUser(userName) {
            if (Object.keys(state.users).length <= 1) {
                alert('You must have at least one user!');
                return;
            }
            
            if (confirm(`Are you sure you want to delete user "${userName}"?`)) {
                delete state.users[userName];
                
                if (state.currentUser === userName) {
                    // Switch to the first available user
                    state.currentUser = Object.keys(state.users)[0];
                    state.transactions = state.users[state.currentUser].transactions || [];
                }
                
                saveData();
                renderUserTabs();
                updateUI();
            }
        }

        // Open user modal for adding/editing
        function openUserModal(userName = null) {
            elements.userModalTitle.textContent = userName ? 'Edit User' : 'Add User';
            elements.userName.value = userName || '';
            
            // Store the current user name for editing
            elements.userForm.dataset.editingUser = userName || '';
            
            elements.userModal.style.display = 'flex';
        }

        // Close user modal
        function closeUserModal() {
            elements.userModal.style.display = 'none';
            elements.userForm.reset();
            delete elements.userForm.dataset.editingUser;
        }

        // Handle user form submission
        function handleUserSubmit(e) {
            e.preventDefault();
            
            const userName = elements.userName.value.trim();
            if (!userName) return;
            
            const editingUser = elements.userForm.dataset.editingUser;
            
            if (editingUser) {
                editUser(editingUser, userName);
            } else {
                addUser(userName);
            }
        }

        // Open transaction modal for adding/editing
        function openTransactionModal(transactionId = null) {
            // Populate category dropdown
            elements.category.innerHTML = '';

// Add optional blank option
const blankOption = document.createElement('option');
blankOption.value = '';
blankOption.textContent = '(Optional)';
elements.category.appendChild(blankOption);

// Add existing categories
state.categories.forEach(cat => {
    const option = document.createElement('option');
    option.value = cat;
    option.textContent = cat;
    elements.category.appendChild(option);
});

// Add "Other" at the end
const otherOption = document.createElement('option');
otherOption.value = 'Other';
otherOption.textContent = 'Other';
elements.category.appendChild(otherOption);

            
            if (transactionId) {
                // Edit mode
                elements.transactionModalTitle.textContent = 'Edit Transaction';
                const transaction = state.transactions.find(t => t.id === transactionId);
                
                if (transaction) {
                    elements.transactionId.value = transaction.id;
                    elements.amount.value = transaction.amount;
                    elements.category.value = transaction.category;
                    document.querySelector(`input[name="type"][value="${transaction.type}"]`).checked = true;
                    elements.description.value = transaction.description;
                    elements.date.value = transaction.date;
                }
            } else {
                // Add mode
                elements.transactionModalTitle.textContent = 'Add Transaction';
                elements.transactionForm.reset();
                elements.transactionId.value = '';
                elements.date.value = new Date().toISOString().split('T')[0];
            }
            
            elements.transactionModal.style.display = 'flex';
        }

        // Close transaction modal
        function closeTransactionModal() {
            elements.transactionModal.style.display = 'none';
            elements.transactionForm.reset();
        }

// Handle transaction form submission
function handleTransactionSubmit(e) {
    e.preventDefault();

    // 🟢 Make description & category optional
    const amount = parseFloat(elements.amount.value);
    const category = elements.category.value || 'Other';
    const type = document.querySelector('input[name="type"]:checked').value;
    const description = elements.description.value.trim() || '(No description)';
    const date = elements.date.value;

    const transaction = {
        id: elements.transactionId.value || generateId(),
        amount,
        category,
        type,
        description,
        date
    };

    if (elements.transactionId.value) {
        // Update existing transaction
        const index = state.transactions.findIndex(t => t.id === elements.transactionId.value);
        if (index !== -1) {
            state.transactions[index] = transaction;
        }
    } else {
        // Add new transaction
        state.transactions.unshift(transaction);
    }

    // Update user data
    state.users[state.currentUser].transactions = state.transactions;
    saveData();

    closeTransactionModal();
    updateUI();
}


        // Delete a transaction
        function deleteTransaction(transactionId) {
            if (confirm('Are you sure you want to delete this transaction?')) {
                state.transactions = state.transactions.filter(t => t.id !== transactionId);
                state.users[state.currentUser].transactions = state.transactions;
                saveData();
                updateUI();
            }
        }

        // Generate a unique ID
        function generateId() {
            return Date.now().toString(36) + Math.random().toString(36).substr(2);
        }

        // Update the entire UI
        function updateUI() {
    // 🔹 Update page title to show current user name
    const sectionTitle = elements.pageTitle.textContent.split(' – ')[0]; // remove old name if any
    elements.pageTitle.textContent = `${sectionTitle} – ${state.currentUser}`;

    updateDashboard();
    updateTransactionsTable();
    updateCharts();
    updateCategoryFilter();
}


        // Update dashboard cards
        function updateDashboard() {
            const income = state.transactions
                .filter(t => t.type === 'income')
                .reduce((sum, t) => sum + t.amount, 0);
                
            const expense = state.transactions
                .filter(t => t.type === 'expense')
                .reduce((sum, t) => sum + t.amount, 0);
                
            const balance = income - expense;
            
            elements.totalIncome.textContent = `₹${income.toFixed(2)}`;
            elements.totalExpense.textContent = `₹${expense.toFixed(2)}`;
            elements.netBalance.textContent = `₹${balance.toFixed(2)}`;
            
            // Color balance based on value
            if (balance < 0) {
                elements.netBalance.style.color = 'var(--danger)';
            } else if (balance > 0) {
                elements.netBalance.style.color = 'var(--success)';
            } else {
                elements.netBalance.style.color = 'var(--text-color)';
            }
        }

        // Update transactions table
        function updateTransactionsTable() {
            let filteredTransactions = [...state.transactions];
            
            // Filter by type
            const typeFilter = elements.typeFilter.value;
            if (typeFilter !== 'all') {
                filteredTransactions = filteredTransactions.filter(t => t.type === typeFilter);
            }
            
            // Filter by category
            const categoryFilter = elements.categoryFilter.value;
            if (categoryFilter !== 'all') {
                filteredTransactions = filteredTransactions.filter(t => t.category === categoryFilter);
            }
            
            // Sort transactions
            const sortFilter = elements.sortFilter.value;
            switch (sortFilter) {
                case 'date-desc':
                    filteredTransactions.sort((a, b) => new Date(b.date) - new Date(a.date));
                    break;
                case 'date-asc':
                    filteredTransactions.sort((a, b) => new Date(a.date) - new Date(b.date));
                    break;
                case 'amount-desc':
                    filteredTransactions.sort((a, b) => b.amount - a.amount);
                    break;
                case 'amount-asc':
                    filteredTransactions.sort((a, b) => a.amount - b.amount);
                    break;
            }
            
            // Render transactions
            elements.transactionsTableBody.innerHTML = '';
            
            if (filteredTransactions.length === 0) {
                elements.transactionsTableBody.innerHTML = `
                    <tr>
                        <td colspan="6" style="text-align: center; padding: 20px;">
                            No transactions found
                        </td>
                    </tr>
                `;
                return;
            }
            
            filteredTransactions.forEach(transaction => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${formatDate(transaction.date)}</td>
                    <td>${transaction.description}</td>
                    <td>${transaction.category}</td>
                    <td>
                        <span class="transaction-${transaction.type}">
                            ${transaction.type === 'income' ? 'Income' : 'Expense'}
                        </span>
                    </td>
                    <td class="transaction-${transaction.type}">
                        ${transaction.type === 'income' ? '+' : '-'}₹${transaction.amount.toFixed(2)}
                    </td>
                    <td>
                        <div class="action-buttons">
                            <button class="edit-btn" data-id="${transaction.id}">Edit</button>
                            <button class="delete-btn" data-id="${transaction.id}">Delete</button>
                        </div>
                    </td>
                `;
                
                // Add event listeners to action buttons
                row.querySelector('.edit-btn').addEventListener('click', () => {
                    openTransactionModal(transaction.id);
                });
                
                row.querySelector('.delete-btn').addEventListener('click', () => {
                    deleteTransaction(transaction.id);
                });
                
                elements.transactionsTableBody.appendChild(row);
            });
        }

        // Update category filter options
        function updateCategoryFilter() {
            elements.categoryFilter.innerHTML = '<option value="all">All Categories</option>';
            state.categories.forEach(category => {
                const option = document.createElement('option');
                option.value = category;
                option.textContent = category;
                elements.categoryFilter.appendChild(option);
            });
        }

        // Update charts
        function updateCharts() {
            updateCategoryChart();
            updateTrendChart();
        }

        // Update category chart (pie chart)
        function updateCategoryChart() {
            const expenseTransactions = state.transactions.filter(t => t.type === 'expense');
            const categoryData = {};
            
            expenseTransactions.forEach(transaction => {
                if (categoryData[transaction.category]) {
                    categoryData[transaction.category] += transaction.amount;
                } else {
                    categoryData[transaction.category] = transaction.amount;
                }
            });
            
            const categories = Object.keys(categoryData);
            const amounts = Object.values(categoryData);
            
            // Generate colors for the chart
            const colors = generateColors(categories.length);
            
            if (state.categoryChart) {
                state.categoryChart.destroy();
            }
            
            if (categories.length === 0) {
                elements.categoryChart.innerHTML = '<p style="text-align: center; padding: 20px;">No expense data available</p>';
                return;
            }
            
            const ctx = elements.categoryChart.getContext('2d');
            state.categoryChart = new Chart(ctx, {
                type: 'pie',
                data: {
                    labels: categories,
                    datasets: [{
                        data: amounts,
                        backgroundColor: colors,
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: {
                            position: 'bottom'
                        }
                    }
                }
            });
        }

        // Update trend chart (line chart)
        function updateTrendChart() {
            const monthlyData = {};
            
            state.transactions.forEach(transaction => {
                const date = new Date(transaction.date);
                const monthYear = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
                
                if (!monthlyData[monthYear]) {
                    monthlyData[monthYear] = {
                        income: 0,
                        expense: 0
                    };
                }
                
                if (transaction.type === 'income') {
                    monthlyData[monthYear].income += transaction.amount;
                } else {
                    monthlyData[monthYear].expense += transaction.amount;
                }
            });
            
            const months = Object.keys(monthlyData).sort();
            const incomeData = months.map(month => monthlyData[month].income);
            const expenseData = months.map(month => monthlyData[month].expense);
            
            if (state.trendChart) {
                state.trendChart.destroy();
            }
            
            if (months.length === 0) {
                elements.trendChart.innerHTML = '<p style="text-align: center; padding: 20px;">No transaction data available</p>';
                return;
            }
            
            const ctx = elements.trendChart.getContext('2d');
            state.trendChart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: months.map(month => formatMonth(month)),
                    datasets: [
                        {
                            label: 'Income',
                            data: incomeData,
                            borderColor: 'var(--success)',
                            backgroundColor: 'rgba(76, 201, 240, 0.1)',
                            tension: 0.3,
                            fill: true
                        },
                        {
                            label: 'Expense',
                            data: expenseData,
                            borderColor: 'var(--danger)',
                            backgroundColor: 'rgba(247, 37, 133, 0.1)',
                            tension: 0.3,
                            fill: true
                        }
                    ]
                },
                options: {
                    responsive: true,
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    }
                }
            });
        }

        // Open category modal for adding
        function openCategoryModal() {
            elements.categoryModalTitle.textContent = 'Add Category';
            elements.categoryName.value = '';
            elements.categoryModal.style.display = 'flex';
        }

        // Close category modal
        function closeCategoryModal() {
            elements.categoryModal.style.display = 'none';
            elements.categoryForm.reset();
        }

        // Handle category form submission
        function handleCategorySubmit(e) {
            e.preventDefault();
            
            const categoryName = elements.categoryName.value.trim();
            if (!categoryName) return;
            
            if (state.categories.includes(categoryName)) {
                alert('Category already exists!');
                return;
            }
            
            state.categories.push(categoryName);
            saveData();
            closeCategoryModal();
            renderCategories();
            updateCategoryFilter();
        }

        // Delete a category
        function deleteCategory(categoryName) {
            if (confirm(`Are you sure you want to delete category "${categoryName}"?`)) {
                state.categories = state.categories.filter(c => c !== categoryName);
                saveData();
                renderCategories();
                updateCategoryFilter();
            }
        }

        // Render categories list
        function renderCategories() {
            elements.categoriesList.innerHTML = '';
            
            if (state.categories.length === 0) {
                elements.categoriesList.innerHTML = '<p style="text-align: center; padding: 20px;">No categories found</p>';
                return;
            }
            
            state.categories.forEach(category => {
                const categoryItem = document.createElement('div');
                categoryItem.className = 'card';
                categoryItem.style.marginBottom = '10px';
                categoryItem.style.display = 'flex';
                categoryItem.style.justifyContent = 'space-between';
                categoryItem.style.alignItems = 'center';
                
                categoryItem.innerHTML = `
                    <span>${category}</span>
                    <button class="delete-btn delete-category" data-category="${category}">Delete</button>
                `;
                
                categoryItem.querySelector('.delete-category').addEventListener('click', () => {
                    deleteCategory(category);
                });
                
                elements.categoriesList.appendChild(categoryItem);
            });
        }

        // Export transactions to CSV
        function exportToCSV() {
            if (state.transactions.length === 0) {
                alert('No transactions to export!');
                return;
            }
            
            const headers = ['Date', 'Description', 'Category', 'Type', 'Amount'];
            const csvData = [
                headers.join(','),
                ...state.transactions.map(t => [
                    t.date,
                    `"${t.description}"`,
                    t.category,
                    t.type,
                    t.amount
                ].join(','))
            ].join('\n');
            
            const blob = new Blob([csvData], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `expenses_${state.currentUser}_${new Date().toISOString().split('T')[0]}.csv`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }

        // Helper function to format date
        function formatDate(dateString) {
            const date = new Date(dateString);
            return date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
        }

        // Helper function to format month for chart
        function formatMonth(monthString) {
            const [year, month] = monthString.split('-');
            const date = new Date(year, month - 1);
            return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
        }

        // Helper function to generate colors for charts
        function generateColors(count) {
            const colors = [
                '#4361ee', '#3a0ca3', '#7209b7', '#f72585', '#4cc9f0',
                '#4895ef', '#560bad', '#b5179e', '#f15bb5', '#00bbf9',
                '#00f5d4', '#fee440', '#fb5607', '#ff006e', '#8338ec'
            ];
            
            // If we need more colors than available, repeat the palette
            const result = [];
            for (let i = 0; i < count; i++) {
                result.push(colors[i % colors.length]);
            }
            
            return result;
        }

        // Initialize the app when DOM is loaded
        document.addEventListener('DOMContentLoaded', initApp);
