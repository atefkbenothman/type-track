const settingsURL = chrome.runtime.getURL("settings.js")
const wpmURL = chrome.runtime.getURL("wpm.js")

// use promise.all to load both modules
Promise.all([
  import(settingsURL),
  import(wpmURL)
]).then(([settingsModule, wpmModule]) => {
  const { SettingsManager } = settingsModule
  const { WPM } = wpmModule

  // initialize wpm widget
  const widget = document.createElement("div")
  widget.className = "wpm-widget"
  document.body.appendChild(widget)

  // initialize settings
  const settings = new SettingsManager();

  // initialize wpm
  const wpm = new WPM(widget, settings)

}).catch(error => {
  console.error('Error loading modules:', error)
});