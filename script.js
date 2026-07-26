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
        } else if (file.type.startsWith('video/')) {
            mediaElement = document.createElement('video');
            mediaElement.controls = true;
        }
        
        mediaElement.src = e.target.result;
        
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
