// Load data from localStorage
let goalData = JSON.parse(localStorage.getItem("goalData")) || [];
let budgetData = JSON.parse(localStorage.getItem("budgetData")) || {
    totalBudget: 0,
    expenses: []
};

// Save goal details
document.getElementById('goalForm').addEventListener('submit', event => {
    event.preventDefault();

    let goalDuration = parseInt(document.getElementById('goalDuration').value.trim());
    let goalAmount = parseFloat(document.getElementById('goalAmount').value.trim());

    if (isNaN(goalDuration) || goalDuration <= 0 || isNaN(goalAmount) || goalAmount <= 0) {
        alert("Please enter valid goal details.");
        return;
    }

    // Store the goal in localStorage
    goalData.push({ duration: goalDuration, amount: goalAmount });
    localStorage.setItem("goalData", JSON.stringify(goalData));

    // Update UI
    renderGoals();
    document.getElementById('goalForm').reset();
});

// Render saved goals
function renderGoals() {
    let goalTableBody = document.getElementById("goalTableBody");
    goalTableBody.innerHTML = '';

    goalData.forEach(goal => {
        let row = document.createElement('tr');
        row.innerHTML = `
            <td>${goal.duration} months</td>
            <td>Rs.${goal.amount.toFixed(2)}</td>
        `;
        goalTableBody.appendChild(row);
    });
}

// Calculate and render monthly savings
function renderMonthlySavings() {
    let savingsTableBody = document.getElementById("savingsTableBody");
    savingsTableBody.innerHTML = '';

    let monthlyExpenses = {};
    budgetData.expenses.forEach(expense => {
        let monthYear = new Date(expense.date).toLocaleString('default', { month: 'long', year: 'numeric' });
        if (!monthlyExpenses[monthYear]) {
            monthlyExpenses[monthYear] = 0;
        }
        monthlyExpenses[monthYear] += expense.amount;
    });

    for (let month in monthlyExpenses) {
        let totalBudget = budgetData.totalBudget; // Assuming consistent budget
        let totalExpenses = monthlyExpenses[month];
        let savings = totalBudget - totalExpenses;

        let row = document.createElement('tr');
        row.innerHTML = `
            <td>${month}</td>
            <td>Rs.${totalBudget.toFixed(2)}</td>
            <td>Rs.${totalExpenses.toFixed(2)}</td>
            <td>Rs.${savings.toFixed(2)}</td>
        `;
        savingsTableBody.appendChild(row);
    }
}

// Initialize the page
window.addEventListener('DOMContentLoaded', () => {
    renderGoals();
    renderMonthlySavings();
});
