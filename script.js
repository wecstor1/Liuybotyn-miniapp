// Initialize Telegram Web App
const tg = window.Telegram.WebApp;

// Expand the app to full height
tg.expand();

// Signal that the app is ready
tg.ready();

// DOM elements
const messageInput = document.getElementById('messageInput');
const sendBtn = document.getElementById('sendBtn');
const charCount = document.getElementById('charCount');
const termsCheckbox = document.getElementById('termsCheckbox');
const successOverlay = document.getElementById('successOverlay');
const aboutBtn = document.getElementById('aboutBtn');
const rulesBtn = document.getElementById('rulesBtn');
const modalOverlay = document.getElementById('modalOverlay');
const modalClose = document.getElementById('modalClose');
const modalBody = document.getElementById('modalBody');

// Function to validate form
function validateForm() {
    const hasText = messageInput.value.trim().length > 0;
    const hasAcceptedTerms = termsCheckbox.checked;
    sendBtn.disabled = !(hasText && hasAcceptedTerms);
}

// Character counter
messageInput.addEventListener('input', function() {
    const currentLength = this.value.length;
    charCount.textContent = currentLength;
    
    if (currentLength >= 450) {
        charCount.classList.add('warning');
    } else {
        charCount.classList.remove('warning');
    }
    
    validateForm();
});

// Terms checkbox change
termsCheckbox.addEventListener('change', function() {
    validateForm();
});

// Send message button click
sendBtn.addEventListener('click', function() {
    const messageText = messageInput.value.trim();
    
    if (!messageText || !termsCheckbox.checked) {
        return;
    }
    
    const data = {
        text: messageText
    };
    
    sendData(data);
});

// Function to send data back to Telegram Bot via WebApp API
function sendData(data) {
    successOverlay.classList.add('active');
    
    try {
        tg.sendData(JSON.stringify(data));
        console.log('✅ Данные успешно улетели в бот через tg.sendData');
    } catch (error) {
        console.error('❌ Ошибка отправки данных через tg.sendData:', error);
    }
    
    setTimeout(() => {
        try {
            tg.close();
        } catch (error) {
            console.error('Ошибка при закрытии мини-приложения:', error);
        }
    }, 2000);
}

// Handle back button
if (tg.BackButton) {
    tg.BackButton.show();
    tg.BackButton.onClick(() => {
        tg.close();
    });
}

// Haptic feedback
sendBtn.addEventListener('mousedown', function() {
    if (tg.HapticFeedback) {
        tg.HapticFeedback.impactOccurred('medium');
    }
});

// Modal functions
function showModal(content) {
    modalBody.innerHTML = content;
    modalOverlay.classList.add('active');
}

function closeModal() {
    modalOverlay.classList.remove('active');
}

aboutBtn.addEventListener('click', function() {
    const aboutContent = 
        <div>
            <h2>💌 О проекте люботин</h2>
            <p><strong>люботин</strong> — платформа для отправки анонимных сообщений.</p>
            <h3>📞 Поддержка</h3>
            <p>Написать нам: <a href="https://t.me/wecstor" style="color: var(--tg-theme-button-color);">@wecstor</a></p>
        </div>
    ;
    showModal(aboutContent);
});

rulesBtn.addEventListener('click', function() {
    const rulesContent = 
        <div>
            <h2>📋 Правила платформы</h2>
            <ul>
                <li>Без спама и рекламы</li>
                <li>Без оскорблений и угроз</li>
            </ul>
        </div>
    ;
    showModal(rulesContent);
});

modalClose.addEventListener('click', closeModal);
modalOverlay.addEventListener('click', function(e) {
    if (e.target === modalOverlay) {
        closeModal();
    }
});

document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && modalOverlay.classList.contains('active')) {
        closeModal();
    }
});