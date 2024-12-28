const settingsURL = chrome.runtime.getURL("settings.js")
const wpmTrackerURL = chrome.runtime.getURL("tracker.js")

// use promise.all to load both modules
Promise.all([
  import(settingsURL),
  import(wpmTrackerURL)
]).then(([settingsModule, wpmTrackerModule]) => {
  const { SettingsManager } = settingsModule
  const { WPMTracker } = wpmTrackerModule

  // initialize popup
  const popup = document.createElement("div")
  popup.className = "wpm-popup"
  document.body.appendChild(popup)

  // initialize settings
  const settings = new SettingsManager();

  // initialize wpm tracker
  const wpmTracker = new WPMTracker(popup, settings)

}).catch(error => {
  console.error('Error loading modules:', error)
});