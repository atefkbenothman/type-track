// Create popup element
const popup = document.createElement('div');
popup.className = 'wpm-popup';
document.body.appendChild(popup);

// Default settings
let settings = {
  timeout: 1000,
  fontSize: 14,
  backgroundColor: '#000000',
  opacity: 80,
  textColor: '#ffffff',
  popupPosition: 'cursor'
};

// Function to apply styles to popup
function updatePopupStyles() {
  popup.style.fontSize = `${settings.fontSize}px`;
  popup.style.color = settings.textColor;
  // Convert hex background color to rgba for opacity
  const r = parseInt(settings.backgroundColor.slice(1, 3), 16);
  const g = parseInt(settings.backgroundColor.slice(3, 5), 16);
  const b = parseInt(settings.backgroundColor.slice(5, 7), 16);
  const a = settings.opacity / 100;
  popup.style.backgroundColor = `rgba(${r}, ${g}, ${b}, ${a})`;
  console.log('Styles updated:', settings); // Debug log
}

// Load initial settings
chrome.storage.sync.get(settings, (loadedSettings) => {
  settings = loadedSettings;
  updatePopupStyles();
});

// Listen for settings changes
chrome.storage.onChanged.addListener((changes) => {
  for (let [key, { newValue }] of Object.entries(changes)) {
    settings[key] = newValue;
  }
  updatePopupStyles();
});

// Listen for direct messages from popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'updateStyles') {
    settings = message.settings;
    if (settings.extensionEnabled) {
      updatePopupStyles();
    }
    updatePopupStyles();
  }
});

// Variables for WPM calculation
let startTime = null;
let charCount = 0;
let hideTimeout = null;
let lastCursorX = 0;
let lastCursorY = 0;

// Debounced cursor position tracking
let mouseMoveTimeout = null;
document.addEventListener('mousemove', (e) => {
  if (mouseMoveTimeout) return;

  mouseMoveTimeout = setTimeout(() => {
    mouseMoveTimeout = null;
  }, 16);

  lastCursorX = e.pageX;
  lastCursorY = e.pageY;
}, { passive: true });

function updateWPM(event) {
  if (!settings.extensionEnabled) return; // Exit early if the extension is disabled
  if (event.key.length !== 1) return;

  const now = Date.now();
  if (!startTime) {
    startTime = now;
    charCount = 0;
    popup.style.position = 'absolute'; // Ensure popup is absolutely positioned
    popup.style.left = "";
    popup.style.right = "";
    popup.style.top = "";
    popup.style.bottom = "";
    const targetRect = event.target.getBoundingClientRect();
    switch (settings.popupPosition) {
      case 'cursor':
        popup.style.left = `${lastCursorX}px`;
        popup.style.top = `${lastCursorY}px`;
        break;

      case 'above':
        popup.style.left = `${targetRect.left}px`;
        popup.style.top = `${targetRect.top - 40}px`;
        break;

      case 'topRight':
        popup.style.right = "10px";
        popup.style.top = "10px";
        popup.style.width = "fit-content";
        popup.style.height = "fit-content";
        break;

      case 'topLeft':
        popup.style.left = "10px";
        popup.style.top = "10px";
        popup.style.width = "fit-content";
        popup.style.height = "fit-content";
        break;

      case 'bottomLeft':
        popup.style.left = "10px";
        popup.style.bottom = "10px";
        popup.style.width = "fit-content";
        popup.style.height = "fit-content";
        break;

      case 'bottomRight':
        popup.style.right = "10px";
        popup.style.bottom = "10px";
        popup.style.width = "fit-content";
        popup.style.height = "fit-content";
        break;
    }
    popup.style.visibility = 'visible';
    popup.textContent = '- wpm';
    return;
  }

  charCount++;

  const timeElapsed = (now - startTime) / 1000 / 60;
  const wpm = Math.round((charCount / 5) / timeElapsed);
  popup.textContent = `${wpm} wpm`;

  clearTimeout(hideTimeout);
  hideTimeout = setTimeout(() => {
    popup.style.visibility = 'hidden';
    startTime = null;
  }, settings.timeout);
}

function isTextInput(element) {
  if (!element) return false;
  const tag = element.tagName;
  return element.hasAttribute('contenteditable') ||
    tag === 'TEXTAREA' ||
    (tag === 'INPUT' && !['button', 'submit', 'reset', 'checkbox', 'radio', 'file'].includes(element.type || ''));
}

document.addEventListener('keypress', (e) => {
  if (isTextInput(e.target)) {
    updateWPM(e);
  }
}, { passive: true });

// Force initial style update when content script loads
updatePopupStyles();