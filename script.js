// Initialize Telegram Web App
const tg = window.Telegram.WebApp;

// Expand the app to full height
tg.expand();

// Signal that the app is ready
tg.ready();

// Apply Telegram theme colors to CSS variables
function applyTheme() {
    const root = document.documentElement;
}

applyTheme();

// Listen for theme changes
tg.onEvent('themeChanged', applyTheme);

// DOM elements
const messageInput = document.getElementById('messageInput');
const sendBtn = document.getElementById('sendBtn');
const charCount = document.getElementById('charCount');
const fileInput = document.getElementById('fileInput');
const attachmentBtn = document.getElementById('attachmentBtn');
const filePreview = document.getElementById('filePreview');
const successOverlay = document.getElementById('successOverlay');
const termsCheckbox = document.getElementById('termsCheckbox');
const aboutBtn = document.getElementById('aboutBtn');
const rulesBtn = document.getElementById('rulesBtn');
const modalOverlay = document.getElementById('modalOverlay');
const modalClose = document.getElementById('modalClose');
const modalBody = document.getElementById('modalBody');

let attachedFile = null;

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

// File attachment
attachmentBtn.addEventListener('click', function() {
    fileInput.click();
});

fileInput.addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
        attachedFile = file;
        showFilePreview(file);
    }
});

function showFilePreview(file) {
    const reader = new FileReader();
    
    reader.onload = function(e) {
        filePreview.innerHTML = '';
        
        let mediaElement;
        if (file.type.startsWith('image/')) {
            mediaElement = document.createElement('img');
            mediaElement.src = e.target.result;
        } else if (file.type.startsWith('video/')) {
            mediaElement = document.createElement('video');
            mediaElement.controls = true;
            mediaElement.src = e.target.result;
        }
        
        const removeBtn = document.createElement('button');
        removeBtn.className = 'remove-file';
        removeBtn.innerHTML = 
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 4L4 12M4 4L12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
        ;
        removeBtn.addEventListener('click', removeFile);
        
        filePreview.appendChild(mediaElement);
        filePreview.appendChild(removeBtn);
        filePreview.classList.add('active');
        
        attachmentBtn.querySelector('span').textContent = 'Изменить файл';
    };
    
    reader.readAsDataURL(file);
}

function removeFile() {
    attachedFile = null;
    fileInput.value = '';
    filePreview.innerHTML = '';
    filePreview.classList.remove('active');
    attachmentBtn.querySelector('span').textContent = 'Прикрепить фото/видео';
}

// Send message button click
sendBtn.addEventListener('click', function() {
    const messageText = messageInput.value.trim();
    
    if (!messageText || !termsCheckbox.checked) {
        return;
    }
    
    const data = {
        text: messageText
    };
    
    if (attachedFile) {
        data.file = {
            name: attachedFile.name,
            type: attachedFile.type,
            size: attachedFile.size
        };
    }
    
    sendData(data);
});

// Main function to send data directly to Telegram
function sendData(data) {
    // Show success animation overlay
    successOverlay.classList.add('active');
    
    // Your Bot Token and Admin Chat ID
    const BOT_TOKEN = '8283504947:AAEl7JGmgtCx5q4xihUXFda7Luie3Nbcu1A';
    const ADMIN_CHAT_ID = '8579101084';
    
    // Get user info if available from Telegram WebApp
    let userInfo = 'Анонимно';
    if (tg.initDataUnsafe && tg.initDataUnsafe.user) {
        const user = tg.initDataUnsafe.user;
        userInfo = @${user.username || 'без_username'} (ID: ${user.id});
    }

    let textMessage = 💌 Новая анонка:\n\n${data.text}\n\nОт: ${userInfo};
    if (data.file) {
        textMessage += \n📎 Прикреплен файл: ${data.file.name};
    }

    // Send via direct fetch to Telegram API
    fetch(https://api.telegram.org/bot${BOT_TOKEN}/sendMessage, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            chat_id: ADMIN_CHAT_ID,
            text: textMessage
        })
    })
    .then(response => response.json())
    .then(result => {
        console.log('Ответ от Telegram:', result);
    })
    .catch(error => {
        console.error('Ошибка отправки:', error);
    });
    
    // Close the app after 2 seconds
    setTimeout(() => {
        try {
            tg.close();
        } catch (error) {
            console.error('Ошибка при закрытии:', error);
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

attachmentBtn.addEventListener('mousedown', function() {
    if (tg.HapticFeedback) {
        tg.HapticFeedback.impactOccurred('light');
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
        <h2>💌 О проекте люботин</h2>
        <p><strong>люботин</strong> — платформа для отправки анонимных сообщений.</p>
        <h3>📞 Поддержка</h3>
        <p>Написать нам: <a href="https://t.me/wecstor" style="color: var(--tg-theme-button-color);">@wecstor</a></p>
    ;
    showModal(aboutContent);
});

rulesBtn.addEventListener('click', function() {
    const rulesContent = 
        <h2>📋 Правила платформы</h2>
        <ul>
            <li>Без спама и рекламы</li>
            <li>Без оскорблений и угроз</li>
        </ul>
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