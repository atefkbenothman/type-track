export class WPMTracker {
  constructor(popup, settingsManager) {
    this.popup = popup
    this.settingsManager = settingsManager
    this.startTime = null
    this.hideTimeout = null
    this.charCount = 0
    this.lastCursorX = 0
    this.lastCursorY = 0
    this.mouseMoveTimeout = null
    this.initializeEventListeners()
  }

  initializeEventListeners() {
    document.addEventListener("mousemove", this.handleMouseMove.bind(this), { passive: true })
    document.addEventListener("keypress", this.handleKeyPress.bind(this), { passive: true })
  }

  isTextInput(element) {
    if (!element) return false
    const tag = element.tagName
    const isContentEditable = element.hasAttribute("contenteditable")
    const isTextArea = tag === "TEXTAREA"
    const isInput = tag === "INPUT" && !["button", "submit", "reset", "checkbox", "radio", "file"].includes(element.type || "")
    return isContentEditable || isTextArea || isInput
  }

  handleMouseMove(e) {
    if (this.mouseMoveTimeout) return
    this.mouseMoveTimeout = setTimeout(() => {
      this.mouseMoveTimeout = null
    }, 16)
    this.lastCursorX = e.pageX
    this.lastCursorY = e.pageY
  }

  handleKeyPress(e) {
    if (!this.isTextInput(e.target)) return
    if (!this.settingsManager.currentSettings.extensionEnabled) return
    this.updateWPM(e)
  }

  updatePopupPosition(target) {
    const settings = this.settingsManager.currentSettings

    this.popup.style.position = "absolute"
    this.popup.style.width = "fit-content";
    this.popup.style.height = "fit-content";
    this.popup.style.left = ""
    this.popup.style.right = ""
    this.popup.style.top = ""
    this.popup.style.bottom = ""

    const targetRect = target.getBoundingClientRect()

    const positions = {
      cursor: () => {
        this.popup.style.left = `${this.lastCursorX}px`
        this.popup.style.top = `${this.lastCursorY}px`
      },
      above: () => {
        this.popup.style.left = `${targetRect.left}px`
        this.popup.style.top = `${targetRect.top - 40}px`
      },
      topRight: () => {
        this.popup.style.right = "10px";
        this.popup.style.top = "10px";
      },
      topLeft: () => {
        this.popup.style.left = '10px';
        this.popup.style.top = '10px';
      },
      bottomRight: () => {
        this.popup.style.right = '10px';
        this.popup.style.bottom = '10px';
      },
      bottomLeft: () => {
        this.popup.style.left = '10px';
        this.popup.style.bottom = '10px';
      },
    }

    const positionFunc = positions[settings.popupPosition]
    if (positionFunc) {
      positionFunc()
    }
  }

  updateWPM(e) {
    if (e.key.length !== 1) return
    const now = performance.now()
    if (!this.startTime) {
      this.startTime = now
      this.charCount = 0
      this.updatePopupPosition(e.target)
      this.popup.style.visibility = "visible"
      this.popup.textContent = "- wpm"
      return
    }
    this.charCount++
    const timeElapsed = (now - this.startTime) / 1000 / 60
    const wpm = Math.round((this.charCount / 5) / timeElapsed)
    this.popup.textContent = `${wpm} wpm`
    clearTimeout(this.hideTimeout)
    this.hideTimeout = setTimeout(() => {
      this.popup.style.visibility = "hidden"
      this.startTime = null
    }, this.settingsManager.currentSettings.timeout)
  }

}