// Check if there is any data in localStorage
let budgetData = JSON.parse(localStorage.getItem("budgetData")) || {
    totalBudget: 0,
    totalExpenses: 0,
    budgetLeft: 0,
    expenses: []
};

// Function to update UI
function updateUI() {
    document.getElementById('totalBudget').textContent = budgetData.totalBudget.toFixed(2);
    document.getElementById('totalExpenses').textContent = budgetData.totalExpenses.toFixed(2);
    document.getElementById('budgetLeft').textContent = budgetData.budgetLeft.toFixed(2);

    // Render expenses table
    let tableBody = document.querySelector('.table-container tbody');
    tableBody.innerHTML = '';
    budgetData.expenses.forEach((expense, index) => {
        let row = document.createElement('tr');
        row.innerHTML = `
            <td>${expense.title}</td>
            <td>${expense.amount.toFixed(2)}</td>
            <td>${expense.date}</td>
            <td>
                <button class="btn btn-sm btn-primary edit-btn" data-index="${index}">Edit</button>
                <button class="btn btn-sm btn-danger remove-btn" data-index="${index}">Remove</button>
            </td>
        `;
        tableBody.appendChild(row);
    });

    // Generate monthly report
    generateMonthlyReport();
}

// Function to update local storage
function updateLocalStorage() {
    localStorage.setItem("budgetData", JSON.stringify(budgetData));
}

// Function to generate monthly report
function generateMonthlyReport() {
    let monthlyExpenses = {};

    budgetData.expenses.forEach(expense => {
        let monthYear = new Date(expense.date).toLocaleString('default', { month: 'long', year: 'numeric' });
        if (!monthlyExpenses[monthYear]) {
            monthlyExpenses[monthYear] = { total: 0, expenses: [] };
        }
        monthlyExpenses[monthYear].total += expense.amount;
        monthlyExpenses[monthYear].expenses.push(expense);
    });

    let reportContainer = document.querySelector('.monthly-report');
    reportContainer.innerHTML = '';

    for (let month in monthlyExpenses) {
        let monthData = monthlyExpenses[month];

        let monthReport = document.createElement('div');
        monthReport.classList.add('monthly-report-item');
        
        monthReport.innerHTML = `
            <h5>${month}: Rs.${monthData.total.toFixed(2)}</h5>
            <ul>
                ${monthData.expenses.map(expense => `<li>${expense.title}: Rs.${expense.amount.toFixed(2)} (${expense.date})</li>`).join('')}
            </ul>
        `;
        
        reportContainer.appendChild(monthReport);
    }

    // Store savings data in localStorage for Goal History
    let savingsData = {};
    for (let month in monthlyExpenses) {
        savingsData[month] = budgetData.totalBudget - monthlyExpenses[month].total;
    }
    localStorage.setItem("savingsData", JSON.stringify(savingsData));
}

// Function to reset all data
function resetAll() {
    budgetData = {
        totalBudget: 0,
        totalExpenses: 0,
        budgetLeft: 0,
        expenses: []
    };
    updateLocalStorage();
    updateUI();
}

// Function to send monthly report
function sendMonthlyReport() {
    if (budgetData.expenses.length === 0) {
        alert("No expenses to include in the report.");
        return;
    }

    fetch('send_report.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(budgetData),
    })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            if (data.status === "success") {
                alert(data.message);
            } else {
                alert(`Failed to send report: ${data.message}`);
            }
        })
        .catch(error => {
            console.error("Error sending report:", error);
            alert("An error occurred while sending the report. Please try again. " + error.message);
        });
}

// Function to handle Expenses Page data rendering
function loadExpensesPage() {
    const expensesData = budgetData.expenses;
    let expensesTable = document.querySelector("#expensesTable tbody");
    expensesTable.innerHTML = '';

    expensesData.forEach(expense => {
        let row = document.createElement('tr');
        row.innerHTML = `
            <td>${expense.title}</td>
            <td>${expense.amount.toFixed(2)}</td>
            <td>${expense.date}</td>
        `;
        expensesTable.appendChild(row);
    });
}

// Event listeners
window.addEventListener("DOMContentLoaded", () => {
    updateUI();

    // Add Budget form submission
    document.querySelector('.add-budget-container form').addEventListener('submit', event => {
        event.preventDefault();
        let budgetInput = document.getElementById('budget');
        let budgetAmount = parseFloat(budgetInput.value.trim());

        if (isNaN(budgetAmount) || budgetAmount <= 0) {
            alert('Please enter a valid budget amount.');
            return;
        }

        budgetData.totalBudget = budgetAmount;
        budgetData.budgetLeft = budgetAmount - budgetData.totalExpenses;
        updateLocalStorage();
        updateUI();
        budgetInput.value = '';
    });

    // Add Expense form submission
    document.querySelector('.add-expense-container form').addEventListener('submit', event => {
        event.preventDefault();
        let expenseInput = document.getElementById('expense');
        let amountInput = document.getElementById('amount');
        let dateInput = document.getElementById('date');
        let editIndex = expenseInput.dataset.editIndex;

        let expenseTitle = expenseInput.value.trim();
        let expenseAmount = parseFloat(amountInput.value.trim());
        let expenseDate = dateInput.value;

        if (expenseTitle === '' || isNaN(expenseAmount) || expenseAmount <= 0 || !expenseDate) {
            alert('Please enter valid expense details.');
            return;
        }

        if (editIndex !== undefined && editIndex !== "") {
            // Edit existing expense
            editIndex = parseInt(editIndex);
            let originalExpense = budgetData.expenses[editIndex];
            budgetData.totalExpenses -= originalExpense.amount;
            budgetData.expenses[editIndex] = { title: expenseTitle, amount: expenseAmount, date: expenseDate };
        } else {
            // Add new expense
            budgetData.expenses.push({
                title: expenseTitle,
                amount: expenseAmount,
                date: expenseDate
            });
        }

        budgetData.totalExpenses = budgetData.expenses.reduce((sum, expense) => sum + expense.amount, 0);
        budgetData.budgetLeft = budgetData.totalBudget - budgetData.totalExpenses;

        updateLocalStorage();
        updateUI();

        // Reset the form
        expenseInput.value = '';
        amountInput.value = '';
        dateInput.value = '';
        delete expenseInput.dataset.editIndex;

        // Reset the button text
        document.querySelector('.add-expense-container form button').textContent = 'Add Expense';
    });

    // Handle remove and edit button clicks
    document.querySelector('.table-container').addEventListener('click', event => {
        if (event.target.matches(".remove-btn")) {
            let index = parseInt(event.target.dataset.index);
            let removedExpense = budgetData.expenses.splice(index, 1)[0];
            budgetData.totalExpenses -= removedExpense.amount;
            budgetData.budgetLeft += removedExpense.amount;
            updateLocalStorage();
            updateUI();
        } else if (event.target.matches(".edit-btn")) {
            let index = parseInt(event.target.dataset.index);
            let expense = budgetData.expenses[index];

            document.getElementById('expense').value = expense.title;
            document.getElementById('amount').value = expense.amount;
            document.getElementById('date').value = expense.date;

            document.getElementById('expense').dataset.editIndex = index;

            let addButton = document.querySelector('.add-expense-container form button');
            addButton.textContent = 'Save Changes';
        }
    });

    // Send Monthly Report Button
    document.querySelector('.btn-success').addEventListener("click", sendMonthlyReport);
});
