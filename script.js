// Data Management
        class ExpenseTracker {
            constructor() {
                this.transactions = this.getStoredTransactions();
                this.budget = this.getStoredBudget();
                this.init();
            }

            init() {
                this.setupEventListeners();
                this.updateDashboard();
                this.renderTransactions();
                this.updateCharts();
                this.updateBudgetProgress();
                
                // Set today's date as default in forms
                const today = new Date().toISOString().split('T')[0];
                document.getElementById('expenseDate').value = today;
                document.getElementById('incomeDate').value = today;
                document.getElementById('editDate').value = today;
            }

            // LocalStorage Methods
            getStoredTransactions() {
                const stored = localStorage.getItem('expenseTrackerTransactions');
                return stored ? JSON.parse(stored) : [];
            }

            saveTransactions() {
                localStorage.setItem('expenseTrackerTransactions', JSON.stringify(this.transactions));
            }

            getStoredBudget() {
                const stored = localStorage.getItem('expenseTrackerBudget');
                return stored ? parseFloat(stored) : 0;
            }

            saveBudget() {
                localStorage.setItem('expenseTrackerBudget', this.budget.toString());
            }

            // Transaction Management
            addTransaction(transaction) {
                transaction.id = Date.now().toString();
                this.transactions.unshift(transaction);
                this.saveTransactions();
                this.updateDashboard();
                this.renderTransactions();
                this.updateCharts();
                this.updateBudgetProgress();
            }

            updateTransaction(id, updatedTransaction) {
                const index = this.transactions.findIndex(t => t.id === id);
                if (index !== -1) {
                    this.transactions[index] = { ...this.transactions[index], ...updatedTransaction };
                    this.saveTransactions();
                    this.updateDashboard();
                    this.renderTransactions();
                    this.updateCharts();
                    this.updateBudgetProgress();
                }
            }

            deleteTransaction(id) {
                this.transactions = this.transactions.filter(t => t.id !== id);
                this.saveTransactions();
                this.updateDashboard();
                this.renderTransactions();
                this.updateCharts();
                this.updateBudgetProgress();
            }

            // Dashboard Calculations
            calculateTotals() {
                const currentMonth = new Date().getMonth();
                const currentYear = new Date().getFullYear();
                
                const monthlyTransactions = this.transactions.filter(t => {
                    const transactionDate = new Date(t.date);
                    return transactionDate.getMonth() === currentMonth && 
                           transactionDate.getFullYear() === currentYear;
                });

                const income = monthlyTransactions
                    .filter(t => t.type === 'income')
                    .reduce((sum, t) => sum + parseFloat(t.amount), 0);
                
                const expenses = monthlyTransactions
                    .filter(t => t.type === 'expense')
                    .reduce((sum, t) => sum + parseFloat(t.amount), 0);
                
                const balance = income - expenses;
                
                return { balance, income, expenses };
            }

            // UI Updates
            updateDashboard() {
                const { balance, income, expenses } = this.calculateTotals();
                
                document.getElementById('totalBalance').textContent = this.formatCurrency(balance);
                document.getElementById('totalIncome').textContent = this.formatCurrency(income);
                document.getElementById('totalExpenses').textContent = this.formatCurrency(expenses);
            }

            renderTransactions() {
                const container = document.getElementById('transactionsList');
                const recentTransactions = this.transactions.slice(0, 10);
                
                if (recentTransactions.length === 0) {
                    container.innerHTML = `
                        <div class="empty-state">
                            <i>📋</i>
                            <h3>No transactions yet</h3>
                            <p>Add your first expense or income to get started</p>
                        </div>
                    `;
                    return;
                }
                
                container.innerHTML = recentTransactions.map(transaction => `
                    <div class="transaction-item">
                        <div class="transaction-info">
                            <div class="transaction-icon" style="background-color: ${this.getCategoryColor(transaction)}">
                                ${this.getCategoryIcon(transaction)}
                            </div>
                            <div class="transaction-details">
                                <div class="transaction-title">${transaction.description || this.getDefaultTitle(transaction)}</div>
                                <div class="transaction-meta">
                                    ${this.formatDate(transaction.date)} • 
                                    ${transaction.type === 'expense' ? transaction.category : transaction.source}
                                    ${transaction.type === 'expense' && transaction.paymentMethod ? `• ${transaction.paymentMethod}` : ''}
                                </div>
                            </div>
                        </div>
                        <div class="transaction-amount ${transaction.type === 'income' ? 'transaction-income' : 'transaction-expense'}">
                            ${transaction.type === 'income' ? '+' : '-'}${this.formatCurrency(transaction.amount)}
                        </div>
                        <div class="transaction-actions">
                            <button class="action-btn edit-btn" data-id="${transaction.id}">✏️</button>
                            <button class="action-btn delete-btn" data-id="${transaction.id}">🗑️</button>
                        </div>
                    </div>
                `).join('');
                
                // Add event listeners to action buttons
                document.querySelectorAll('.edit-btn').forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        const id = e.target.closest('.edit-btn').dataset.id;
                        this.openEditModal(id);
                    });
                });
                
                document.querySelectorAll('.delete-btn').forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        const id = e.target.closest('.delete-btn').dataset.id;
                        if (confirm('Are you sure you want to delete this transaction?')) {
                            this.deleteTransaction(id);
                        }
                    });
                });
            }

            // Charts
            updateCharts() {
                this.renderCategoryChart();
                this.renderMonthlyChart();
            }

            renderCategoryChart() {
                const ctx = document.getElementById('categoryChart').getContext('2d');
                const currentMonth = new Date().getMonth();
                const currentYear = new Date().getFullYear();
                
                const monthlyExpenses = this.transactions.filter(t => 
                    t.type === 'expense' && 
                    new Date(t.date).getMonth() === currentMonth && 
                    new Date(t.date).getFullYear() === currentYear
                );
                
                const categories = ['Food', 'Travel', 'Shopping', 'Bills', 'Entertainment', 'Healthcare', 'Education', 'Other'];
                const data = categories.map(category => {
                    const categoryExpenses = monthlyExpenses.filter(t => t.category === category);
                    return categoryExpenses.reduce((sum, t) => sum + parseFloat(t.amount), 0);
                });
                
                // Destroy existing chart if it exists
                if (this.categoryChart) {
                    this.categoryChart.destroy();
                }
                
                this.categoryChart = new Chart(ctx, {
                    type: 'doughnut',
                    data: {
                        labels: categories,
                        datasets: [{
                            data: data,
                            backgroundColor: [
                                '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', 
                                '#9966FF', '#FF9F40', '#8AC926', '#FF6B6B'
                            ]
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            title: {
                                display: true,
                                text: 'Expenses by Category'
                            },
                            legend: {
                                position: 'bottom'
                            }
                        }
                    }
                });
            }

            renderMonthlyChart() {
                const ctx = document.getElementById('monthlyChart').getContext('2d');
                const currentYear = new Date().getFullYear();
                
                const monthlyData = Array(12).fill(0).map((_, month) => {
                    const monthlyTransactions = this.transactions.filter(t => {
                        const transactionDate = new Date(t.date);
                        return transactionDate.getFullYear() === currentYear && 
                               transactionDate.getMonth() === month;
                    });
                    
                    const income = monthlyTransactions
                        .filter(t => t.type === 'income')
                        .reduce((sum, t) => sum + parseFloat(t.amount), 0);
                    
                    const expenses = monthlyTransactions
                        .filter(t => t.type === 'expense')
                        .reduce((sum, t) => sum + parseFloat(t.amount), 0);
                    
                    return { income, expenses };
                });
                
                // Destroy existing chart if it exists
                if (this.monthlyChart) {
                    this.monthlyChart.destroy();
                }
                
                this.monthlyChart = new Chart(ctx, {
                    type: 'bar',
                    data: {
                        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
                        datasets: [
                            {
                                label: 'Income',
                                data: monthlyData.map(d => d.income),
                                backgroundColor: '#4cc9f0'
                            },
                            {
                                label: 'Expenses',
                                data: monthlyData.map(d => d.expenses),
                                backgroundColor: '#f72585'
                            }
                        ]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            title: {
                                display: true,
                                text: 'Monthly Income vs Expenses'
                            }
                        },
                        scales: {
                            x: {
                                stacked: false,
                            },
                            y: {
                                stacked: false,
                                beginAtZero: true
                            }
                        }
                    }
                });
            }

            // Budget Management
            setBudget(amount) {
                this.budget = parseFloat(amount);
                this.saveBudget();
                this.updateBudgetProgress();
            }

            updateBudgetProgress() {
                const { expenses } = this.calculateTotals();
                const budget = this.budget;
                
                if (budget <= 0) {
                    document.getElementById('budgetPercentage').textContent = '0%';
                    document.getElementById('budgetProgress').style.width = '0%';
                    document.getElementById('budgetSpent').textContent = '₹0 spent';
document.getElementById('budgetRemaining').textContent = '₹0 remaining';

                    return;
                }
                
                const percentage = Math.min((expenses / budget) * 100, 100);
                const remaining = Math.max(budget - expenses, 0);
                
                document.getElementById('budgetPercentage').textContent = `${percentage.toFixed(1)}%`;
                document.getElementById('budgetProgress').style.width = `${percentage}%`;
                document.getElementById('budgetSpent').textContent = `${this.formatCurrency(expenses)} spent`;
                document.getElementById('budgetRemaining').textContent = `${this.formatCurrency(remaining)} remaining`;
                
                // Update progress bar color based on percentage
                const progressBar = document.getElementById('budgetProgress');
                progressBar.className = 'progress';
                
                if (percentage < 70) {
                    progressBar.classList.add('progress-safe');
                } else if (percentage < 90) {
                    progressBar.classList.add('progress-warning');
                } else {
                    progressBar.classList.add('progress-danger');
                }
            }

            // Modal Management
            openEditModal(id) {
                const transaction = this.transactions.find(t => t.id === id);
                if (!transaction) return;
                
                document.getElementById('editId').value = transaction.id;
                document.getElementById('editType').value = transaction.type;
                document.getElementById('editAmount').value = transaction.amount;
                document.getElementById('editDate').value = transaction.date;
                document.getElementById('editDescription').value = transaction.description || '';
                
                if (transaction.type === 'expense') {
    document.getElementById('editCategoryGroup').style.display = 'block';
    document.getElementById('editSourceGroup').style.display = 'none';
    document.getElementById('editPaymentGroup').style.display = 'block';

    document.getElementById('editCategory').required = true; // required only for expense
    document.getElementById('editSource').required = false;

    document.getElementById('editCategory').value = transaction.category;
    document.getElementById('editPayment').value = transaction.paymentMethod || 'Cash';
} else {
    document.getElementById('editCategoryGroup').style.display = 'none';
    document.getElementById('editSourceGroup').style.display = 'block';
    document.getElementById('editPaymentGroup').style.display = 'none';

    document.getElementById('editCategory').required = false; // not required for income
    document.getElementById('editSource').required = true;    // required for income

    document.getElementById('editSource').value = transaction.source;
}

                
                document.getElementById('editModal').classList.add('active');
            }

            closeEditModal() {
                document.getElementById('editModal').classList.remove('active');
                document.getElementById('editTransactionForm').reset();
            }

            // Data Export/Import
            exportData() {
                const data = {
                    transactions: this.transactions,
                    budget: this.budget,
                    exportDate: new Date().toISOString()
                };
                
                const dataStr = JSON.stringify(data, null, 2);
                const dataBlob = new Blob([dataStr], { type: 'application/json' });
                
                const link = document.createElement('a');
                link.href = URL.createObjectURL(dataBlob);
                link.download = `expense-tracker-backup-${new Date().toISOString().split('T')[0]}.json`;
                link.click();
            }

            importData(file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    try {
                        const data = JSON.parse(e.target.result);
                        
                        if (data.transactions && Array.isArray(data.transactions)) {
                            this.transactions = data.transactions;
                            this.saveTransactions();
                        }
                        
                        if (data.budget && typeof data.budget === 'number') {
                            this.budget = data.budget;
                            this.saveBudget();
                        }
                        
                        this.updateDashboard();
                        this.renderTransactions();
                        this.updateCharts();
                        this.updateBudgetProgress();
                        
                        alert('Data imported successfully!');
                    } catch (error) {
                        alert('Error importing data. Please check the file format.');
                        console.error(error);
                    }
                };
                reader.readAsText(file);
            }

            clearAllData() {
                if (confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
                    this.transactions = [];
                    this.budget = 0;
                    this.saveTransactions();
                    this.saveBudget();
                    this.updateDashboard();
                    this.renderTransactions();
                    this.updateCharts();
                    this.updateBudgetProgress();
                }
            }

            // Utility Methods
            formatCurrency(amount) {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR'
    }).format(amount);
}


            formatDate(dateString) {
                const options = { month: 'short', day: 'numeric' };
                return new Date(dateString).toLocaleDateString('en-US', options);
            }

            getCategoryColor(transaction) {
                const colors = {
                    Food: '#FF6384',
                    Travel: '#36A2EB',
                    Shopping: '#FFCE56',
                    Bills: '#4BC0C0',
                    Entertainment: '#9966FF',
                    Healthcare: '#FF9F40',
                    Education: '#8AC926',
                    Other: '#FF6B6B',
                    Salary: '#4cc9f0',
                    Freelance: '#4895ef',
                    Gift: '#7209b7',
                    Investment: '#3a0ca3',
                    default: '#6c757d'
                };
                
                return colors[transaction.category || transaction.source] || colors.default;
            }

            getCategoryIcon(transaction) {
                const icons = {
                    Food: '🍕',
                    Travel: '✈️',
                    Shopping: '🛍️',
                    Bills: '📄',
                    Entertainment: '🎬',
                    Healthcare: '🏥',
                    Education: '📚',
                    Other: '📦',
                    Salary: '💰',
                    Freelance: '💼',
                    Gift: '🎁',
                    Investment: '📈'
                };
                
                return icons[transaction.category || transaction.source] || '💸';
            }

            getDefaultTitle(transaction) {
                if (transaction.type === 'expense') {
                    return `${transaction.category} Expense`;
                } else {
                    return `${transaction.source} Income`;
                }
            }

            // Event Listeners
            setupEventListeners() {
                // Form submissions
                document.getElementById('addExpenseForm').addEventListener('submit', (e) => {
                    e.preventDefault();
                    this.handleAddExpense();
                });
                
                document.getElementById('addIncomeForm').addEventListener('submit', (e) => {
                    e.preventDefault();
                    this.handleAddIncome();
                });
                
                document.getElementById('editTransactionForm').addEventListener('submit', (e) => {
                    e.preventDefault();
                    this.handleEditTransaction();
                });
                
                // Tabs
                document.querySelectorAll('.tab').forEach(tab => {
                    tab.addEventListener('click', () => {
                        const tabId = tab.dataset.tab;
                        
                        // Update active tab
                        document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
                        tab.classList.add('active');
                        
                        // Update active form
                        document.querySelectorAll('.tab-content').forEach(content => {
                            content.classList.remove('active');
                        });
                        document.getElementById(`${tabId}-form`).classList.add('active');
                    });
                });
                
                // Budget
                document.getElementById('setBudget').addEventListener('click', () => {
                    const budgetInput = document.getElementById('monthlyBudget');
                    const budgetAmount = parseFloat(budgetInput.value);
                    
                    if (budgetAmount && budgetAmount > 0) {
                        this.setBudget(budgetAmount);
                        budgetInput.value = '';
                        alert('Budget set successfully!');
                    } else {
                        alert('Please enter a valid budget amount.');
                    }
                });
                
                // Data management
                document.getElementById('exportData').addEventListener('click', () => {
                    this.exportData();
                });
                
                document.getElementById('importData').addEventListener('click', () => {
                    document.getElementById('importFile').click();
                });
                
                document.getElementById('importFile').addEventListener('change', (e) => {
                    if (e.target.files.length > 0) {
                        this.importData(e.target.files[0]);
                        e.target.value = ''; // Reset file input
                    }
                });
                
                document.getElementById('clearData').addEventListener('click', () => {
                    this.clearAllData();
                });
                
                // Modal
                document.getElementById('closeModal').addEventListener('click', () => {
                    this.closeEditModal();
                });
                
                document.getElementById('cancelEdit').addEventListener('click', () => {
                    this.closeEditModal();
                });
                
                // Close modal when clicking outside
                document.getElementById('editModal').addEventListener('click', (e) => {
                    if (e.target === document.getElementById('editModal')) {
                        this.closeEditModal();
                    }
                });
            }

            // Form Handlers
            handleAddExpense() {
                const amount = parseFloat(document.getElementById('expenseAmount').value);
                const category = document.getElementById('expenseCategory').value;
                const date = document.getElementById('expenseDate').value;
                const paymentMethod = document.getElementById('expensePayment').value;
                const description = document.getElementById('expenseDescription').value;
                
                if (!amount || !category || !date) {
                    alert('Please fill in all required fields.');
                    return;
                }
                
                const expense = {
                    type: 'expense',
                    amount,
                    category,
                    date,
                    paymentMethod,
                    description
                };
                
                this.addTransaction(expense);
                document.getElementById('addExpenseForm').reset();
                
                // Reset date to today
                const today = new Date().toISOString().split('T')[0];
                document.getElementById('expenseDate').value = today;
                
                alert('Expense added successfully!');
            }

            handleAddIncome() {
                const amount = parseFloat(document.getElementById('incomeAmount').value);
                const source = document.getElementById('incomeSource').value;
                const date = document.getElementById('incomeDate').value;
                const description = document.getElementById('incomeDescription').value;
                
                if (!amount || !source || !date) {
                    alert('Please fill in all required fields.');
                    return;
                }
                
                const income = {
                    type: 'income',
                    amount,
                    source,
                    date,
                    description
                };
                
                this.addTransaction(income);
                document.getElementById('addIncomeForm').reset();
                
                // Reset date to today
                const today = new Date().toISOString().split('T')[0];
                document.getElementById('incomeDate').value = today;
                
                alert('Income added successfully!');
            }

            handleEditTransaction() {
                const id = document.getElementById('editId').value;
                const type = document.getElementById('editType').value;
                const amount = parseFloat(document.getElementById('editAmount').value);
                const date = document.getElementById('editDate').value;
                const description = document.getElementById('editDescription').value;
                
                let updatedTransaction = {
                    amount,
                    date,
                    description
                };
                
                if (type === 'expense') {
                    updatedTransaction.category = document.getElementById('editCategory').value;
                    updatedTransaction.paymentMethod = document.getElementById('editPayment').value;
                } else {
                    updatedTransaction.source = document.getElementById('editSource').value;
                }   
                
                this.updateTransaction(id, updatedTransaction);
                this.closeEditModal();
                alert('Transaction updated successfully!');
            }
        }

        // Initialize the application
        document.addEventListener('DOMContentLoaded', () => {
            window.expenseTracker = new ExpenseTracker();
        });