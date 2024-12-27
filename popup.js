// Default settings
const defaultSettings = {
  timeout: 1500,
  fontSize: 14,
  backgroundColor: '#000000',
  opacity: 80,
  textColor: '#ffffff',
  popupPosition: 'cursor',
  extensionEnabled: true
};

// Load settings when popup opens
document.addEventListener('DOMContentLoaded', () => {
  chrome.storage.sync.get(defaultSettings, (settings) => {
    document.getElementById('timeout').value = settings.timeout;
    document.getElementById('fontSize').value = settings.fontSize;
    document.getElementById('backgroundColor').value = settings.backgroundColor;
    document.getElementById('opacity').value = settings.opacity;
    document.getElementById('textColor').value = settings.textColor;
    document.getElementById('position').value = settings.popupPosition;
    document.getElementById('toggle').checked = settings.extensionEnabled;
  });
});

// Save settings when form is submitted
document.getElementById('settingsForm').addEventListener('submit', (e) => {
  e.preventDefault();

  const settings = {
    timeout: parseInt(document.getElementById('timeout').value),
    fontSize: parseInt(document.getElementById('fontSize').value),
    backgroundColor: document.getElementById('backgroundColor').value,
    opacity: parseInt(document.getElementById('opacity').value),
    textColor: document.getElementById('textColor').value,
    popupPosition: document.getElementById('position').value,
    extensionEnabled: document.getElementById('toggle').checked
  };

  // Update settings in storage
  chrome.storage.sync.set(settings, () => {
    // Send message to content script to force style update
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        chrome.tabs.sendMessage(tabs[0].id, {
          type: 'updateStyles',
          settings: settings
        });
      }
    });

    // Show success message
    const status = document.getElementById('status');
    status.style.visibility = 'visible';
    setTimeout(() => {
      status.style.visibility = 'hidden';
    }, 2000);
  });
});