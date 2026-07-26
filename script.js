// Initialize Telegram Web App
const tg = window.Telegram.WebApp;

// Expand the app to full height
tg.expand();

// Signal that the app is ready
tg.ready();

// Apply Telegram theme colors to CSS variables (keep black theme as default)
function applyTheme() {
    const root = document.documentElement;
    
    // Keep our black theme as default, only use Telegram theme if explicitly needed
    // Uncomment below if you want to use Telegram's theme instead
    /*
    if (tg.themeParams) {
        root.style.setProperty('--tg-theme-bg-color', tg.themeParams.bg_color || '#000000');
        root.style.setProperty('--tg-theme-text-color', tg.themeParams.text_color || '#ffffff');
        root.style.setProperty('--tg-theme-hint-color', tg.themeParams.hint_color || '#888888');
        root.style.setProperty('--tg-theme-link-color', tg.themeParams.link_color || '#6c5ce7');
        root.style.setProperty('--tg-theme-button-color', tg.themeParams.button_color || '#6c5ce7');
        root.style.setProperty('--tg-theme-button-text-color', tg.themeParams.button_text_color || '#ffffff');
        root.style.setProperty('--tg-theme-secondary-bg-color', tg.themeParams.secondary_bg_color || '#1a1a1a');
        root.style.setProperty('--tg-theme-header-bg-color', tg.themeParams.header_bg_color || '#000000');
    }
    */
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
    
    // Add warning class when approaching limit
    if (currentLength >= 450) {
        charCount.classList.add('warning');
    } else {
        charCount.classList.remove('warning');
    }
    
    // Validate form
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
        removeBtn.innerHTML = `
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 4L4 12M4 4L12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
        `;
        removeBtn.addEventListener('click', removeFile);
        
        filePreview.appendChild(mediaElement);
        filePreview.appendChild(removeBtn);
        filePreview.classList.add('active');
        
        // Update attachment button text
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

// Send message
sendBtn.addEventListener('click', function() {
    const messageText = messageInput.value.trim();
    
    if (!messageText) {
        return;
    }
    
    if (!termsCheckbox.checked) {
        return;
    }
    
    // Prepare data对象
    const data = {
        text: messageText
    };
    
    // Add file info if attached
    if (attachedFile) {
        data.file = {
            name: attachedFile.name,
            type: attachedFile.type,
            size: attachedFile.size
        };
        
        // Convert file to base64 for sending
        const reader = new FileReader();
        reader.onload = function(e) {
            data.file.data = e.target.result;
            sendData(data);
        };
        reader.readAsDataURL(attachedFile);
    } else {
        sendData(data);
    }
});

function sendData(data) {
    // Show success animation
    successOverlay.classList.add('active');
    
    // Send data to Telegram bot
    try {
        tg.sendData(JSON.stringify(data));
        console.log('Data sent successfully');
    } catch (error) {
        console.error('Error sending data:', error);
    }
    
    // Close the app after animation with multiple fallback attempts
    let closeAttempts = 0;
    const maxAttempts = 3;
    
    const attemptClose = () => {
        closeAttempts++;
        try {
            tg.close();
            console.log(`Close attempt ${closeAttempts}`);
        } catch (error) {
            console.error(`Close attempt ${closeAttempts} failed:`, error);
            if (closeAttempts < maxAttempts) {
                setTimeout(attemptClose, 500);
            }
        }
    };
    
    // First attempt after animation completes
    setTimeout(attemptClose, 2000);
}

// Handle back button (if available)
if (tg.BackButton) {
    tg.BackButton.show();
    tg.BackButton.onClick(() => {
        tg.close();
    });
}

// Enable haptic feedback on button press
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

// Handle viewport changes
tg.onEvent('viewportChanged', () => {
    // Adjust layout if needed when viewport changes
    if (!tg.isExpanded) {
        tg.expand();
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

// About button click
aboutBtn.addEventListener('click', function() {
    const aboutContent = `
        <h2>💌 О проекте люботин</h2>
        <p><strong>люботин</strong> — это платформа для отправки анонимных сообщений, где ты можешь выразить свои мысли без страха быть узнанным.</p>
        
        <h3>🎯 Наша миссия</h3>
        <p>Создать безопасное пространство для честного общения, где каждый может сказать то, что боится сказать в лицо.</p>
        
        <h3>✨ Возможности</h3>
        <ul>
            <li>📝 Отправка текстовых сообщений</li>
            <li>📷 Прикрепление фото и видео</li>
            <li>🔒 Полная анонимность</li>
            <li>✅ Модерация контента</li>
        </ul>
        
        <h3>📞 Поддержка</h3>
        <p>Если у вас есть вопросы или проблемы, напишите нам: <a href="https://t.me/wecstor" style="color: var(--tg-theme-button-color);">@wecstor</a></p>
    `;
    showModal(aboutContent);
});

// Rules button click
rulesBtn.addEventListener('click', function() {
    const rulesContent = `
        <h2>📋 Правила платформы</h2>
        
        <h3>⚠️ Важно знать</h3>
        <ul>
            <li>Публикуется только контент, одобренный администрацией</li>
            <li>Администрация не несет ответственности за отправленный контент</li>
            <li>Пожалуйста, отправляйте только соответствующий контент</li>
        </ul>
        
        <h3>🚫 Запрещено</h3>
        <ul>
            <li>Спам и реклама</li>
            <li>Оскорбления и угрозы</li>
            <li>Непристойный контент</li>
            <li>Раскрытие личной информации</li>
            <li>Мошенничество</li>
        </ul>
        
        <h3>✅ Рекомендуется</h3>
        <ul>
            <li>Быть вежливым и уважительным</li>
            <li>Выражать мысли конструктивно</li>
            <li>Соблюдать правила этикета</li>
        </ul>
        
        <p><em>Нарушение правил может привести к блокировке аккаунта.</em></p>
    `;
    showModal(rulesContent);
});

// Close modal button
modalClose.addEventListener('click', closeModal);

// Close modal on overlay click
modalOverlay.addEventListener('click', function(e) {
    if (e.target === modalOverlay) {
        closeModal();
    }
});

// Close modal on Escape key
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && modalOverlay.classList.contains('active')) {
        closeModal();
    }
});