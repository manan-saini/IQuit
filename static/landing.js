// Landing page JavaScript

function openLoginModal() {
    document.getElementById('login-modal').classList.add('active');
}

function closeLoginModal() {
    document.getElementById('login-modal').classList.remove('active');
}

function handleRegistration(event) {
    event.preventDefault();
    
    // Collect form data
    const userData = {
        name: document.getElementById('user-name').value,
        cardNumber: document.getElementById('card-number').value,
        amount401k: parseFloat(document.getElementById('account-401k').value),
        savings: parseFloat(document.getElementById('account-savings').value),
        bossName: document.getElementById('boss-name').value,
        timestamp: new Date().toISOString()
    };
    
    // Store in localStorage
    localStorage.setItem('iquit_user_' + userData.name, JSON.stringify(userData));
    localStorage.setItem('iquit_current_user', userData.name);
    
    // Redirect to captcha first
    window.location.href = '/captcha';
}

function handleLogin(event) {
    event.preventDefault();
    
    const name = document.getElementById('login-name').value;
    const userDataStr = localStorage.getItem('iquit_user_' + name);
    
    if (userDataStr) {
        // User exists, load their data
        localStorage.setItem('iquit_current_user', name);
        window.location.href = '/captcha';
    } else {
        alert('No account found with that name. Please register first!');
    }
}

// Format card number as user types
document.addEventListener('DOMContentLoaded', () => {
    const cardInput = document.getElementById('card-number');
    if (cardInput) {
        cardInput.addEventListener('input', (e) => {
            let value = e.target.value.replace(/\s/g, '');
            let formattedValue = value.match(/.{1,4}/g)?.join(' ') || value;
            e.target.value = formattedValue;
        });
    }
});

