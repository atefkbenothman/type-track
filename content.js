const settingsURL = chrome.runtime.getURL("settings.js")
const wpmURL = chrome.runtime.getURL("wpm.js")

// use promise.all to load both modules
Promise.all([
  import(settingsURL),
  import(wpmURL)
]).then(([settingsModule, wpmModule]) => {
  const { SettingsManager } = settingsModule
  const { WPM } = wpmModule

  // initialize popup
  const popup = document.createElement("div")
  popup.className = "wpm-popup"
  document.body.appendChild(popup)

  // initialize settings
  const settings = new SettingsManager();

  // initialize wpm
  const wpm = new WPM(popup, settings)

}).catch(error => {
  console.error('Error loading modules:', error)
});