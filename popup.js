const settingsUrl = chrome.runtime.getURL('settings.js');

class PopupManager {
  constructor(defaultSettings) {
    this.form = document.getElementById("settingsForm")
    this.statusElement = document.getElementById("status")
    this.initialize(defaultSettings)
  }

  initialize(defaultSettings) {
    this.loadSettings(defaultSettings)
    this.form.addEventListener("submit", this.handleSubmit.bind(this))
  }

  async loadSettings(defaultSettings) {
    const settings = await chrome.storage.sync.get(defaultSettings)
    this.populateForm(settings)
  }

  populateForm(settings) {
    const elements = {
      timeout: value => document.getElementById("timeout").value = value,
      fontSize: value => document.getElementById("fontSize").value = value,
      backgroundColor: value => document.getElementById("backgroundColor").value = value,
      opacity: value => document.getElementById("opacity").value = value,
      textColor: value => document.getElementById("textColor").value = value,
      popupPosition: value => document.getElementById("position").value = value,
      extensionEnabled: value => document.getElementById("extensionEnabled").checked = value,
    }
    Object.entries(settings).forEach(([key, value]) => {
      if (elements[key]) {
        elements[key](value)
      }
    })
  }

  getFormValues() {
    return {
      timeout: parseInt(document.getElementById('timeout').value),
      fontSize: parseInt(document.getElementById('fontSize').value),
      backgroundColor: document.getElementById('backgroundColor').value,
      opacity: parseInt(document.getElementById('opacity').value),
      textColor: document.getElementById('textColor').value,
      popupPosition: document.getElementById('position').value,
      extensionEnabled: document.getElementById('extensionEnabled').checked
    }
  }

  async updateContentScript(settings) {
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true })
    if (tabs[0]) {
      await chrome.tabs.sendMessage(tabs[0].id, {
        type: "updateStyles",
        settings: settings
      })
    }
  }

  showStatus(duration = 2000) {
    const statusElement = document.createElement("div")
    statusElement.id = "status"
    statusElement.className = "status"
    statusElement.textContent = "Settings saved!"
    statusElement.style.marginTop = "8px"
    statusElement.style.padding = "8px"
    statusElement.style.background = "#dff0d8"
    statusElement.style.color = "#3c763d"
    statusElement.style.borderRadius = "4px"
    statusElement.style.textAlign = "center"
    document.body.appendChild(statusElement)
    setTimeout(() => {
      statusElement.remove()
    }, duration)
  }

  async handleSubmit(e) {
    e.preventDefault()
    const settings = this.getFormValues()
    try {
      await chrome.storage.sync.set(settings)
      await this.updateContentScript(settings)
      this.showStatus()
    } catch (err) {
      console.error("error saving settings:", err)
    }
  }
}

function initializePopupManager(defaultSettings) {
  const startManager = () => {
    const popupManager = new PopupManager(defaultSettings)
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", startManager)
  } else {
    startManager()
  }
}

import(settingsUrl)
  .then(({ DEFAULT_SETTINGS }) => {
    initializePopupManager(DEFAULT_SETTINGS)
  })
  .catch(err => {
    console.error("Error loading settings module:", err)
  })