let displayedUserCount = 5; // Initialize with the first 5 users to be displayed

function addUser() {
    const firstName = document.getElementById('userFirstName').value.trim();
    const lastName = document.getElementById('userLastName').value.trim();
    const email = document.getElementById('userEmail').value.trim();

    fetch('/users', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ first_name: firstName, last_name: lastName, email: email })
    })
    .then(response => response.json())
    .then(newUser => {
        alert('User added successfully!');
        // Directly insert the new user into the UI
        const userElement = `<li onclick="showPortfolio('${newUser.user_id}')">
            ${newUser.first_name} ${newUser.last_name} - ${newUser.email}
            <button onclick="deleteUser('${newUser._id}', event)" class="delete-btn">Delete</button>
        </li>`;
        document.getElementById('usersList').innerHTML += userElement; // Append the new user to the list
    })
    .catch(error => console.error('Error:', error));
}

function getUsers() {
    fetch('/users')
    .then(response => response.json())
    .then(users => {
        const limitedUsers = users.slice(0, displayedUserCount); // Display users up to the current count
        const list = limitedUsers.map(user =>
            `<li onclick="showPortfolio('${user.user_id}'); setCurrentUserId('${user.user_id}');">
                ${user.first_name} ${user.last_name} - ${user.email}
                <button onclick="deleteUser('${user._id}', event)" class="delete-btn">Delete</button>
            </li>`
        ).join('');
        document.getElementById('usersList').innerHTML = `<ul>${list}</ul>`;
    })
    .catch(error => console.error('Error:', error));
}

let currentUserId = null; // Global variable to store the current user ID

function setCurrentUserId(userId) {
    currentUserId = userId; // Set the global variable when a user is clicked
}



function showPortfolio(userId) {
    fetch(`/portfolios/user/${userId}`)
    .then(response => response.json())
    .then(portfolios => {
        if (portfolios && portfolios.length > 0) {
            const portfolio = portfolios[0]; // Assuming one portfolio per user for simplicity
            let propertiesDisplay = portfolio.properties.length > 0 ? portfolio.properties.join(', ') : "Portfolio contains no properties";
            document.getElementById('portfolioDetails').innerHTML = `
                <h2>Portfolio Details</h2>
                Name: ${portfolio.name}<br>
                Total Value: ${portfolio.total_value}<br>
                Status: ${portfolio.status ? 'Active' : 'Inactive'}<br>
                Properties: ${propertiesDisplay}
                <button onclick="editPortfolio('${portfolio.portfolio_id}')">Edit Portfolio</button>
            `;
            document.getElementById('portfolioDetails').style.display = 'block';
        } else {
            document.getElementById('portfolioDetails').innerHTML = 'No portfolio found for this user.';
            document.getElementById('portfolioDetails').style.display = 'block';
        }
    })
    .catch(error => console.error('Error:', error));
}


function deleteUser(userId, event) {
    event.stopPropagation(); // Prevents the li onclick from triggering when the button is clicked
    if (confirm('Are you sure you want to delete this user?')) {
        fetch(`/users/${userId}`, {
            method: 'DELETE'
        })
        .then(response => {
            if (response.ok) {
                alert('User deleted successfully');
                displayedUserCount = Math.max(displayedUserCount - 1, 5); // Ensure at least 5 users are displayed
                getUsers(); // Refresh the list after deletion
            } else {
                throw new Error('Failed to delete user');
            }
        })
        .catch(error => alert(error.message));
    }
}

function editPortfolio(portfolioId) {
    fetch(`/portfolios/${portfolioId}`) // Ensuring this matches the `portfolio_id` not MongoDB's `_id`
    .then(response => response.json())
    .then(portfolio => {
        document.getElementById('editName').value = portfolio.name;
        document.getElementById('editValue').value = portfolio.total_value;
        document.getElementById('editStatus').checked = portfolio.status;
        document.getElementById('editPortfolioForm').style.display = 'block';
        document.getElementById('saveChangesButton').onclick = function() {
            savePortfolioEdit(portfolio.portfolio_id); // Make sure it's passing `portfolio_id`
        };
    })
    .catch(error => console.error('Error fetching portfolio:', error));
}

function savePortfolioEdit(portfolioId) {
    const updatedName = document.getElementById('editName').value;
    const updatedValue = document.getElementById('editValue').value;
    const updatedStatus = document.getElementById('editStatus').checked;

    fetch(`/portfolios/${portfolioId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            name: updatedName,
            total_value: updatedValue,
            status: updatedStatus
        })
    })
    .then(response => response.json())
    .then(updatedPortfolio => {
        alert('Portfolio updated successfully!');
        document.getElementById('portfolioDetails').style.display = 'none';
        document.getElementById('editPortfolioForm').style.display = 'none';
    })
    .catch(error => console.error('Error updating portfolio:', error));
}

function addPortfolio() {
    const name = document.getElementById('newPortfolioName').value;
    const totalValue = document.getElementById('newPortfolioValue').value;
    const status = document.getElementById('newPortfolioStatus').checked;

    if (!currentUserId) {
        alert('Please select a user first.');
        return;
    }

    fetch('/portfolios', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            user_id: currentUserId,
            name: name,
            total_value: totalValue,
            status: status
        })
    })
    .then(response => response.json())
    .then(newPortfolio => {
        alert('Portfolio added successfully!');
        // Optionally clear form or update UI to reflect the new portfolio
        // Reset or hide the add portfolio form
    })
    .catch(error => console.error('Error adding portfolio:', error));
}


// Optionally add functionality to show/hide the add portfolio form
function toggleAddPortfolioForm() {
    const form = document.getElementById('editPortfolioForm');
    form.style.display = form.style.display === 'none' ? 'block' : 'none';
}




window.onload = getUsers;
