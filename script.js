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
const charProgress = document.getElementById('charProgress');
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
const themeToggle = document.getElementById('themeToggle');
const messageCount = document.getElementById('messageCount');

let attachedFile = null;
let lastSendTime = 0;
const SEND_COOLDOWN = 30000; // 30 seconds cooldown

// Function to validate form
function validateForm() {
    const hasText = messageInput.value.trim().length > 0;
    const hasAcceptedTerms = termsCheckbox.checked;
    sendBtn.disabled = !(hasText && hasAcceptedTerms);
}

// Character counter and progress bar
messageInput.addEventListener('input', function() {
    const currentLength = this.value.length;
    const maxLength = 500;
    const percentage = (currentLength / maxLength) * 100;
    
    charCount.textContent = currentLength;
    charProgress.style.width = percentage + '%';
    
    // Update progress bar color based on usage
    charProgress.classList.remove('warning', 'danger');
    if (percentage >= 90) {
        charProgress.classList.add('danger');
    } else if (percentage >= 70) {
        charProgress.classList.add('warning');
    }
    
    // Add warning class when approaching limit
    if (currentLength >= 450) {
        charCount.classList.add('warning');
    } else {
        charCount.classList.remove('warning');
    }
    
    // Validate form
    validateForm();
});

// Load message count from localStorage
function loadMessageCount() {
    const count = localStorage.getItem('lyubotin_message_count') || '0';
    messageCount.textContent = count;
}

// Increment message count
function incrementMessageCount() {
    const currentCount = parseInt(localStorage.getItem('lyubotin_message_count') || '0');
    const newCount = currentCount + 1;
    localStorage.setItem('lyubotin_message_count', newCount.toString());
    messageCount.textContent = newCount;
    
    // Animate the counter
    messageCount.style.transform = 'scale(1.3)';
    setTimeout(() => {
        messageCount.style.transform = 'scale(1)';
    }, 200);
}

// Theme toggle functionality
themeToggle.addEventListener('click', function() {
    document.body.classList.toggle('light-theme');
    const isLight = document.body.classList.contains('light-theme');
    localStorage.setItem('lyubotin_theme', isLight ? 'light' : 'dark');
    
    // Haptic feedback
    if (tg.HapticFeedback) {
        tg.HapticFeedback.impactOccurred('light');
    }
});

// Load saved theme
function loadTheme() {
    const savedTheme = localStorage.getItem('lyubotin_theme');
    if (savedTheme === 'light') {
        document.body.classList.add('light-theme');
    }
}

// Initialize
loadMessageCount();
loadTheme();

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
            // Use canvas to maintain full quality
            const img = new Image();
            img.onload = function() {
                const canvas = document.createElement('canvas');
                canvas.width = img.naturalWidth;
                canvas.height = img.naturalHeight;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0);
                mediaElement.src = canvas.toDataURL(file.type, 1.0); // Maximum quality
            };
            img.src = e.target.result;
        } else if (file.type.startsWith('video/')) {
            mediaElement = document.createElement('video');
            mediaElement.controls = true;
            mediaElement.src = e.target.result;
        }
        
        if (!file.type.startsWith('image/')) {
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
    
    // Rate limiting check
    const currentTime = Date.now();
    if (currentTime - lastSendTime < SEND_COOLDOWN) {
        const remainingTime = Math.ceil((SEND_COOLDOWN - (currentTime - lastSendTime)) / 1000);
        alert(`Пожалуйста, подождите ${remainingTime} секунд перед отправкой следующего сообщения.`);
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
    lastSendTime = Date.now();
    incrementMessageCount();
    successOverlay.classList.add('active');

    if (attachedFile) {
        const reader = new FileReader();
        reader.onload = function(e) {
            data.file = {
                name: attachedFile.name,
                type: attachedFile.type,
                data: e.target.result
            };
            tg.sendData(JSON.stringify(data));
        };
        reader.readAsDataURL(attachedFile);
    } else {
        tg.sendData(JSON.stringify(data));
    }

    setTimeout(() => {
        if (typeof tg !== 'undefined' && tg.close) {
            tg.close();
        }
    }, 2000);
}