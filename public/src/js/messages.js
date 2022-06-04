// Handles automatic dismissing of flash messages

// Specific flash message types
const flashErrors = Array.from(document.querySelectorAll(".js-flash-error"))
const flashMessages = Array.from(document.querySelectorAll(".js-flash-error"))
const flashInfos = Array.from(document.querySelectorAll(".js-flash-info"))
const flashSuccess = Array.from(document.querySelectorAll(".js-flash-success"))

const options = { duration: 2000 }

const errorDismissObjects = flashErrors.map(
  (element) => new Dismiss(element, options)
)

const otherMessages = flashMessages.concat(flashInfos, flashSuccess)
const otherDismissObjects = otherMessages.map(
  (element) => new Dismiss(element, options)
)

// flashDismissObjects.forEach((dismiss) => setTimeout(() => dismiss.hide(), 2000))
errorDismissObjects.forEach((dismiss) => setTimeout(() => dismiss.hide(), 5000))
otherDismissObjects.forEach((dismiss) => setTimeout(() => dismiss.hide(), 1500))
