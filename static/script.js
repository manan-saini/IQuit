// Global variables
let userData = null;
let amount401k = 0;
let savingsAmount = 0;
let selectedCharity = '';
let selectedCharityName = '';
let canvas, ctx;
let currentRotation = 0;
let isSpinning = false;
let selectedColor = null;
let currentPhase = 0; // 0 = not started, 1 = financial, 2 = social

// Roulette wheel configuration - FanDuel style
const segments = [
    { color: '#000000', text: 'BLACK', name: 'black' },
    { color: '#dc143c', text: 'RED', name: 'red' },
    { color: '#000000', text: 'BLACK', name: 'black' },
    { color: '#228b22', text: 'GREEN', name: 'green' },
    { color: '#dc143c', text: 'RED', name: 'red' },
    { color: '#000000', text: 'BLACK', name: 'black' }
];

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadUserData();
    initializeEventListeners();
    initializePhoneChat();
});

function loadUserData() {
    const currentUser = localStorage.getItem('iquit_current_user');
    if (!currentUser) {
        // No user logged in, redirect to landing
        window.location.href = '/';
        return;
    }
    
    const userDataStr = localStorage.getItem('iquit_user_' + currentUser);
    if (!userDataStr) {
        // User data not found
        window.location.href = '/';
        return;
    }
    
    userData = JSON.parse(userDataStr);
    amount401k = userData.amount401k;
    savingsAmount = userData.savings;
    
    // Show personalized welcome message
    const welcomeText = document.getElementById('welcome-text');
    if (welcomeText) {
        welcomeText.textContent = `Welcome back, ${userData.name}! Ready to transform your life for the better?`;
    }
}

function initializeEventListeners() {
    document.getElementById('quit-btn').addEventListener('click', startJourney);
    document.getElementById('liquidate-btn').addEventListener('click', liquidate401k);
    document.getElementById('spin-btn').addEventListener('click', spinWheel);
    document.getElementById('continue-charity-btn').addEventListener('click', goToCharityScreen);
    document.getElementById('donate-btn').addEventListener('click', donateSavings);
    document.getElementById('continue-phase1-complete-btn').addEventListener('click', showPhase1Complete);
    document.getElementById('continue-phase2-btn').addEventListener('click', goToPhase2);
    document.getElementById('start-doxing-btn').addEventListener('click', startDoxing);
    document.getElementById('continue-complete-btn').addEventListener('click', completeAllPhases);
    
    // Color selection buttons
    document.querySelectorAll('.color-btn').forEach(btn => {
        btn.addEventListener('click', (e) => selectColor(e.currentTarget.dataset.color));
    });
}

// (Simulator chat removed from main app; see static/phone.js)

function submitScandal() {
    // Both buttons do the same thing - show fake success popup
    showPopup(
        '📰 Article Distributed',
        `Your article has been successfully sent to CP24, Toronto Star, 6ixbuzz, and Queen's Gazette.\n\nExpect to see it in the news cycle within 24-48 hours.\n\n✅ Distribution Complete`,
        () => {
            showDoxingScreen();
        }
    );
}

function showDoxingScreen() {
    // Display user's address
    document.getElementById('display-address').textContent = userData.homeAddress;
    
    // Reset status indicators
    document.getElementById('twitter-status').textContent = '';
    document.getElementById('instagram-status').textContent = '';
    document.getElementById('snapchat-status').textContent = '';
    document.getElementById('start-doxing-btn').style.display = 'block';
    document.getElementById('continue-complete-btn').style.display = 'none';
    
    showScreen('doxing-screen');
}

function startDoxing() {
    const button = document.getElementById('start-doxing-btn');
    button.disabled = true;
    button.textContent = 'Posting...';
    
    // Sequential posting animation
    setTimeout(() => {
        document.getElementById('twitter-status').textContent = '✓ Sent';
        document.getElementById('twitter-status').style.color = '#1DA1F2';
    }, 1000);
    
    setTimeout(() => {
        document.getElementById('instagram-status').textContent = '✓ Sent';
        document.getElementById('instagram-status').style.color = '#E4405F';
    }, 2000);
    
    setTimeout(() => {
        document.getElementById('snapchat-status').textContent = '✓ Sent';
        document.getElementById('snapchat-status').style.color = '#FFFC00';
    }, 3000);
    
    setTimeout(() => {
        showPopup(
            '✅ Successfully Posted',
            `Your home address has been publicly posted to:\n\n🐦 Twitter\n📷 Instagram\n👻 Snapchat\n\nEveryone now knows where you live!`,
            () => {
                button.style.display = 'none';
                document.getElementById('continue-complete-btn').style.display = 'block';
            }
        );
    }, 4000);
}

function goToCharityScreen() {
    showScreen('charity-screen');
}

function showBossScreen() {
    // Display boss name in the message
    const bossName = userData.bossName;
    document.getElementById('boss-name-display').textContent = bossName;
    
    showScreen('boss-screen');
}

function selectCharity(charityId, charityName) {
    selectedCharity = charityId;
    selectedCharityName = charityName;
    
    // Highlight selected charity
    document.querySelectorAll('.charity-card').forEach(card => {
        card.classList.remove('selected');
    });
    document.querySelector(`[data-charity="${charityId}"]`).classList.add('selected');
    
    // Skip savings input and go directly to donation with pre-filled data
    donateSavings();
}

function donateSavings() {
    // Use pre-filled savings amount from userData
    if (!selectedCharityName) {
        alert('Please select a charity first!');
        return;
    }
    
    // Show motivational warning popup
    const totalLost = amount401k + savingsAmount;
    showPopup(
        '⚠️ Wait! Think About This', 
        `You're about to donate $${savingsAmount.toLocaleString()} to a terrible cause. You've already lost $${amount401k.toLocaleString()} from your 401k.\n\nThis is a bad idea! You still have time to turn back.\n\nClick 'OK' to receive all $${totalLost.toLocaleString()} back and quit this game before it's too late!`,
        () => {
            // After they click OK thinking they'll get money back...
            setTimeout(() => {
                showPopup(
                    'Just Kidding!', 
                    `😈 Did you really think we'd let you quit?\n\nYou have successfully donated $${savingsAmount.toLocaleString()} to ${selectedCharityName}!\n\nYour money is gone. Forever. 💸`,
                    () => {
                        // After second popup, show boss message screen
                        showBossScreen();
                    }
                );
            }, 300);
        }
    );
}

function showPopup(title, message, onClose) {
    // Create popup overlay
    const overlay = document.createElement('div');
    overlay.className = 'popup-overlay';
    
    const popup = document.createElement('div');
    popup.className = 'popup-box';
    popup.innerHTML = `
        <h3 class="popup-title">${title}</h3>
        <p class="popup-message">${message}</p>
        <button class="popup-btn">OK</button>
    `;
    
    overlay.appendChild(popup);
    document.body.appendChild(overlay);
    
    // Add click handler to button
    popup.querySelector('.popup-btn').addEventListener('click', () => {
        document.body.removeChild(overlay);
        if (onClose) onClose();
    });
    
    // Animate in
    setTimeout(() => {
        overlay.classList.add('show');
    }, 10);
}

function showPhase1Complete() {
    const totalLost = amount401k + savingsAmount;
    
    document.getElementById('summary-401k').textContent = `$${amount401k.toLocaleString()}`;
    document.getElementById('summary-savings').textContent = `$${savingsAmount.toLocaleString()}`;
    document.getElementById('summary-total').textContent = `$${totalLost.toLocaleString()}`;
    document.getElementById('charity-donated-name').textContent = selectedCharityName;
    
    showScreen('phase1-complete-screen');
}

function startJourney() {
    // Show progress bar
    document.getElementById('progress-bar-container').style.display = 'block';
    
    // Mark Phase 1 as active
    currentPhase = 1;
    updateProgressBar();
    
    // Skip input screen and go directly to spinner with pre-filled data
    document.getElementById('display-amount').textContent = amount401k.toLocaleString();
    showScreen('spinner-screen');
    
    // Initialize the roulette wheel
    setTimeout(() => {
        initRouletteWheel();
    }, 100);
}

function updateProgressBar() {
    const financialPhase = document.getElementById('phase-financial');
    const socialPhase = document.getElementById('phase-social');
    
    // Reset all phases
    financialPhase.classList.remove('active', 'completed');
    socialPhase.classList.remove('active', 'completed');
    
    if (currentPhase >= 1) {
        financialPhase.classList.add('active');
    }
    if (currentPhase >= 2) {
        financialPhase.classList.remove('active');
        financialPhase.classList.add('completed');
        socialPhase.classList.add('active');
    }
    if (currentPhase >= 3) {
        socialPhase.classList.remove('active');
        socialPhase.classList.add('completed');
    }
}

function goToPhase2() {
    currentPhase = 2;
    updateProgressBar();
    
    // Fill in the user's name in the article and go directly to scandal screen
    const fullName = userData.name;
    document.getElementById('article-name-1').textContent = fullName;
    document.getElementById('article-name-2').textContent = fullName;
    document.getElementById('article-name-3').textContent = fullName;
    
    showScreen('social-screen');
}

function completeAllPhases() {
    currentPhase = 3;
    updateProgressBar();
    
    // Update final review screen
    const totalLost = amount401k + savingsAmount;
    document.getElementById('final-401k').textContent = `$${amount401k.toLocaleString()}`;
    document.getElementById('final-savings').textContent = `$${savingsAmount.toLocaleString()}`;
    document.getElementById('final-total').textContent = `$${totalLost.toLocaleString()}`;
    document.getElementById('final-charity').textContent = selectedCharityName;
    document.getElementById('final-scandal-name').textContent = userData.name;
    
    showScreen('complete-screen');
    
    // Start confetti animation
    setTimeout(() => {
        startConfetti();
    }, 500);
}

function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    document.getElementById(screenId).classList.add('active');
}

function showInputScreen() {
    // This function is no longer needed but kept for compatibility
    showScreen('input-screen');
}

function liquidate401k() {
    // This function is no longer needed but kept for compatibility
    document.getElementById('display-amount').textContent = amount401k.toLocaleString();
    showScreen('spinner-screen');
    
    // Initialize the roulette wheel
    setTimeout(() => {
        initRouletteWheel();
    }, 100);
}

function initRouletteWheel() {
    canvas = document.getElementById('roulette-wheel');
    ctx = canvas.getContext('2d');
    drawWheel(0);
}

function drawWheel(rotation) {
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = canvas.width / 2 - 10;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    let currentAngle = rotation;
    const anglePerSegment = (2 * Math.PI) / segments.length;
    
    segments.forEach((segment, index) => {
        // Draw segment
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + anglePerSegment);
        ctx.closePath();
        ctx.fillStyle = segment.color;
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 3;
        ctx.stroke();
        
        // Draw text
        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(currentAngle + anglePerSegment / 2);
        ctx.textAlign = 'center';
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 22px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
        ctx.fillText(segment.text, radius / 2, 10);
        ctx.restore();
        
        currentAngle += anglePerSegment;
    });
    
    // Draw center circle
    ctx.beginPath();
    ctx.arc(centerX, centerY, 25, 0, 2 * Math.PI);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    ctx.strokeStyle = '#0e4595';
    ctx.lineWidth = 4;
    ctx.stroke();
}

function selectColor(color) {
    if (isSpinning) return;
    
    selectedColor = color;
    
    // Update UI to show selection
    document.querySelectorAll('.color-btn').forEach(btn => {
        btn.classList.remove('selected');
    });
    document.querySelector(`[data-color="${color}"]`).classList.add('selected');
    
    // Show selected bet
    document.getElementById('selected-bet').style.display = 'block';
    document.getElementById('bet-color-display').textContent = color.toUpperCase();
    document.getElementById('bet-color-display').style.color = getColorHex(color);
    
    // Enable spin button
    document.getElementById('spin-btn').disabled = false;
    document.getElementById('spin-btn').textContent = 'SPIN THE WHEEL';
}

function getColorHex(colorName) {
    const colors = {
        'black': '#000000',
        'red': '#dc143c',
        'green': '#228b22'
    };
    return colors[colorName];
}

function spinWheel() {
    if (isSpinning || !selectedColor) return;
    
    isSpinning = true;
    document.getElementById('spin-btn').disabled = true;
    document.querySelectorAll('.color-btn').forEach(btn => btn.disabled = true);
    
    // Rig the outcome based on user selection
    const outcome = rigOutcome(selectedColor);
    
    // Calculate target rotation
    const segmentAngle = (2 * Math.PI) / segments.length;
    
    // Find a segment index that matches the rigged outcome
    const matchingIndices = segments
        .map((seg, idx) => seg.name === outcome.name ? idx : -1)
        .filter(idx => idx !== -1);
    const outcomeIndex = matchingIndices[Math.floor(Math.random() * matchingIndices.length)];
    const targetSegmentAngle = outcomeIndex * segmentAngle;
    
    // Add multiple full rotations plus the target angle
    // The arrow points down (top), so we need to adjust for that
    const fullRotations = 5 + Math.random() * 3; // 5-8 full rotations
    const totalRotation = fullRotations * 2 * Math.PI + (2 * Math.PI - targetSegmentAngle) + (segmentAngle / 2);
    
    animateSpin(totalRotation, outcome);
}

function rigOutcome(userChoice) {
    // Rig the game so user always loses
    const riggedOutcomes = {
        'black': 'red',   // User picks black → lands on red
        'red': 'green',   // User picks red → lands on green
        'green': 'black'  // User picks green → lands on black
    };
    
    const resultColor = riggedOutcomes[userChoice];
    return segments.find(seg => seg.name === resultColor);
}

function animateSpin(targetRotation, outcome) {
    const duration = 4000; // 4 seconds
    const startTime = Date.now();
    const startRotation = currentRotation;
    
    function animate() {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing function (ease-out)
        const easeProgress = 1 - Math.pow(1 - progress, 3);
        
        currentRotation = startRotation + targetRotation * easeProgress;
        drawWheel(currentRotation);
        
        if (progress < 1) {
            requestAnimationFrame(animate);
        } else {
            // Spin complete
            isSpinning = false;
            setTimeout(() => {
                showResult(outcome);
            }, 500);
        }
    }
    
    animate();
}

function showResult(outcome) {
    const finalAmount = 0; // User always loses everything
    let message = '';
    let emoji = '💸';
    
    const userColorUpper = selectedColor.toUpperCase();
    const resultColorUpper = outcome.name.toUpperCase();
    
    message = `You bet on ${userColorUpper}, but it landed on ${resultColorUpper}!`;
    
    document.getElementById('result-title').textContent = emoji + ' YOU LOST! ' + emoji;
    document.getElementById('result-message').innerHTML = 
        `<span style="color: ${getColorHex(selectedColor)}">${userColorUpper}</span> vs ` +
        `<span style="color: ${getColorHex(outcome.name)}">${resultColorUpper}</span><br><br>` +
        `${message}`;
    document.getElementById('final-balance').innerHTML = 
        `Original Balance: <strong>$${amount401k.toLocaleString()}</strong><br>` +
        `Final Balance: <strong style="color: #d32f2f;">$${finalAmount.toLocaleString()}</strong><br><br>` +
        `<span style="color: #d32f2f; font-weight: 700;">YOU LOST EVERYTHING!</span>`;
    
    showScreen('result-screen');
}

function restart() {
    // Reset state
    selectedCharity = '';
    selectedCharityName = '';
    currentRotation = 0;
    isSpinning = false;
    selectedColor = null;
    currentPhase = 0;
    
    // Reload amounts from userData
    amount401k = userData.amount401k;
    savingsAmount = userData.savings;
    
    document.getElementById('spin-btn').disabled = true;
    document.getElementById('spin-btn').textContent = 'SELECT A COLOR TO SPIN';
    document.getElementById('selected-bet').style.display = 'none';
    document.querySelectorAll('.color-btn').forEach(btn => {
        btn.classList.remove('selected');
        btn.disabled = false;
    });
    document.querySelectorAll('.charity-card').forEach(card => {
        card.classList.remove('selected');
    });
    
    // Hide progress bar
    document.getElementById('progress-bar-container').style.display = 'none';
    
    // Reset progress bar
    updateProgressBar();
    
    // Stop confetti
    stopConfetti();
    
    showScreen('initial-screen');
}

// Confetti Animation
let confettiAnimationId;
let confettiParticles = [];

function startConfetti() {
    const canvas = document.getElementById('confetti-canvas');
    const ctx = canvas.getContext('2d');
    
    // Set canvas size
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    // Create confetti particles
    const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#f9ca24', '#6c5ce7', '#a29bfe', '#fd79a8', '#fdcb6e'];
    const particleCount = 150;
    
    for (let i = 0; i < particleCount; i++) {
        confettiParticles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height - canvas.height,
            r: Math.random() * 6 + 4,
            d: Math.random() * particleCount,
            color: colors[Math.floor(Math.random() * colors.length)],
            tilt: Math.random() * 10 - 10,
            tiltAngleIncremental: Math.random() * 0.07 + 0.05,
            tiltAngle: 0
        });
    }
    
    function updateConfetti() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        confettiParticles.forEach((p, index) => {
            p.tiltAngle += p.tiltAngleIncremental;
            p.y += (Math.cos(p.d) + 3 + p.r / 2) / 2;
            p.x += Math.sin(p.d);
            p.tilt = Math.sin(p.tiltAngle) * 15;
            
            if (p.y > canvas.height) {
                confettiParticles[index] = {
                    x: Math.random() * canvas.width,
                    y: -20,
                    r: p.r,
                    d: p.d,
                    color: p.color,
                    tilt: p.tilt,
                    tiltAngleIncremental: p.tiltAngleIncremental,
                    tiltAngle: p.tiltAngle
                };
            }
            
            ctx.beginPath();
            ctx.lineWidth = p.r / 2;
            ctx.strokeStyle = p.color;
            ctx.moveTo(p.x + p.tilt + p.r / 4, p.y);
            ctx.lineTo(p.x + p.tilt, p.y + p.tilt + p.r / 4);
            ctx.stroke();
        });
        
        confettiAnimationId = requestAnimationFrame(updateConfetti);
    }
    
    updateConfetti();
}

function stopConfetti() {
    if (confettiAnimationId) {
        cancelAnimationFrame(confettiAnimationId);
        confettiAnimationId = null;
    }
    confettiParticles = [];
    const canvas = document.getElementById('confetti-canvas');
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

// Handle window resize for confetti
window.addEventListener('resize', () => {
    const canvas = document.getElementById('confetti-canvas');
    if (canvas) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
});

