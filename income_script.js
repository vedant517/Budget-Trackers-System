document.getElementById('incomeForm').addEventListener('submit', function (e) {
    e.preventDefault();

    // Retrieve form values
    const incomeTitle = document.getElementById('incomeTitle').value.trim();
    const incomeAmount = parseFloat(document.getElementById('incomeAmount').value);
    const incomeDate = document.getElementById('incomeDate') ? document.getElementById('incomeDate').value : '';

    // Validate inputs
    if (!incomeTitle || isNaN(incomeAmount) || incomeAmount <= 0 || !incomeDate) {
        alert('Please enter valid income details, including title, amount, and date.');
        return;
    }

    // Get the income list element
    const incomeList = document.getElementById('incomeList');

    // Create a new list item
    const listItem = document.createElement('li');
    listItem.className = 'list-group-item d-flex justify-content-between align-items-center';
    listItem.innerHTML = `
        ${incomeTitle} - $${incomeAmount.toFixed(2)} <small class="text-muted">(${incomeDate})</small>
        <button class="btn btn-sm btn-danger delete-btn">Delete</button>
    `;

    // Append the new list item to the list
    incomeList.appendChild(listItem);

    // Clear the form inputs
    document.getElementById('incomeTitle').value = '';
    document.getElementById('incomeAmount').value = '';
    if (document.getElementById('incomeDate')) {
        document.getElementById('incomeDate').value = '';
    }

    // Attach delete event to the button
    listItem.querySelector('.delete-btn').addEventListener('click', function () {
        listItem.remove();
    });
});
