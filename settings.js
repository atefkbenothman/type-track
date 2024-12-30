export const DEFAULT_SETTINGS = {
  timeout: 1000,
  fontSize: 14,
  backgroundColor: "#FF0000",
  opacity: 80,
  textColor: "#ffffff",
  popupPosition: "above",
  extensionEnabled: true
}

export class SettingsManager {
  constructor() {
    this.settings = { ...DEFAULT_SETTINGS }
    this.initializeSettings()
  }

  async initializeSettings() {
    const loadedSettings = await chrome.storage.sync.get(DEFAULT_SETTINGS)
    this.settings = loadedSettings
    this.applySettings()

    // listen for settings changes
    chrome.storage.onChanged.addListener((changes) => {
      for (let [key, { newValue }] of Object.entries(changes)) {
        this.settings[key] = newValue
      }
      this.applySettings()
    })

    // listen for direct messages from popup
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      if (message.type === "updateStyles") {
        this.settings = message.settings
        if (this.settings.extensionEnabled) {
          this.applySettings()
        }
      }
    })
  }

  applySettings() {
    const popup = document.querySelector(".wpm-widget")
    if (!popup) return
    const r = parseInt(this.settings.backgroundColor.slice(1, 3), 16)
    const g = parseInt(this.settings.backgroundColor.slice(3, 5), 16)
    const b = parseInt(this.settings.backgroundColor.slice(5, 7), 16)
    const a = this.settings.opacity / 100
    popup.style.background = `rgba(${r}, ${g}, ${b}, ${a})`
    popup.style.color = this.settings.textColor
    popup.style.fontSize = `${this.settings.fontSize}px`
  }

  get currentSettings() {
    return { ...this.settings }
  }
}