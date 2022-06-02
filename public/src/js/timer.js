import { Engine } from "./Engine.js"

// SECTION: ELEMENTS
const timerDiv = document.querySelector("#js-timer")
const currTimeDisplay = document.querySelector("#js-current-time")
const remainingTimeDisplay = document.querySelector("#js-remaining-time")
const startBtn = document.querySelector("#js-start-timer")
const pauseBtn = document.querySelector("#js-pause-timer")
const resetBtn = document.querySelector("#reset-btn")
const indicator = document.querySelector("#js-timeline-indicator")
const startAnnouncementCheckbox = document.querySelector(
  "#playStartAnnouncement"
)
const endAnnouncementCheckbox = document.querySelector("#playEndAnnouncement")
const repetitionsDisplay = document.querySelector("#repeat")
const incrementRepetitionsBtn = document.querySelector("#incrementRepetitions")
const decrementRepetitionsBtn = document.querySelector("#decrementRepetitions")
const sections = Array.from(document.querySelectorAll(".js-section"))
const sectionsContainer = document.querySelector("#js-timeline-bg")

// SECTION: GLOBALS
const timerDuration = totalDurationFromSections(sections)
const timerStartAnnouncement = timerDiv.dataset.startAnnouncement
const timerEndAnnouncement = timerDiv.dataset.endAnnouncement
let timerRemaining = timerDuration
let timerCurrent = 0
let percentComplete = 0
let isRunning = false
let remainingRepetitions = parseInt(repetitionsDisplay.innerText)

const engine = new Engine({ update, render, fps: 120 })

// SECTION: FUNCTIONS
function reset() {
  timerRemaining = timerDuration
  timerCurrent = 0
  percentComplete = 0
  if (isRunning) {
    togglePlayPauseBtn()
    engine.stop()
  }
  render()
}

function togglePlayPauseBtn() {
  startBtn.classList.toggle("hidden")
  pauseBtn.classList.toggle("hidden")
}

function formatTime(totalSeconds) {
  totalSeconds = Number(totalSeconds)
  let hours = Math.floor(totalSeconds / 3600)
  let minutes = Math.floor((totalSeconds % 3600) / 60)
  let seconds = Math.round((totalSeconds % 3600) % 60)

  if (minutes === 60) {
    minutes = 0
    hours += 1
  }

  if (seconds === 60) {
    seconds = 0
    minutes += 1
  }

  const hoursString = hours.toString().padStart(2, "0")
  const minutesString = minutes.toString().padStart(2, "0")
  const secondsString = seconds.toString().padStart(2, "0")

  // Only show hours if hours > 0
  const result =
    hours > 0
      ? `${hoursString}:${minutesString}:${secondsString}`
      : `${minutesString}:${secondsString}`
  return result
}

function speakText(text) {
  const utterance = new SpeechSynthesisUtterance(text)
  speechSynthesis.speak(utterance)
}

function incrementRepetitions() {
  remainingRepetitions += 1
  repetitionsDisplay.innerText = remainingRepetitions
}

function decrementRepetitions() {
  if (remainingRepetitions === 0) return
  remainingRepetitions -= 1
  repetitionsDisplay.innerText = remainingRepetitions
}

function checkTimerEnd() {
  if (isRunning && timerCurrent >= timerDuration) {
    if (endAnnouncementCheckbox.checked) speakText(timerEndAnnouncement)
    console.debug("Stopping timer")

    engine.stop()
    isRunning = false
    togglePlayPauseBtn()

    timerCurrent = 0
    timerRemaining = timerDuration

    decrementRepetitions()

    if (remainingRepetitions > 0) {
      console.debug("Restarting timer")
      startTimer()
    }
  }
}

function render() {
  if (isRunning) {
    currTimeDisplay.innerText = formatTime(timerCurrent)
    remainingTimeDisplay.innerText = formatTime(timerRemaining)
  }

  indicator.style.left = `${percentComplete}%`
}

function update(timeStep) {
  timerCurrent += timeStep
  timerRemaining = timerDuration - timerCurrent

  percentComplete = Math.min((timerCurrent / timerDuration) * 100, 100)

  if (timerRemaining < 0) timerRemaining = 0

  // console.debug(`Current: ${timerCurrent}`)
  // console.debug(`Remaining: ${timerRemaining}`)

  checkTimerEnd()
}

function startTimer() {
  togglePlayPauseBtn()
  if (startAnnouncementCheckbox.checked) speakText(timerStartAnnouncement)
  engine.start()
  isRunning = true
}

function pauseTimer() {
  togglePlayPauseBtn()
  engine.stop()
  isRunning = false
}

// ANCHOR: TimerSection Functions

function sectionDuration(section) {
  return Number(section.dataset.duration)
}

function setSectionWidth(container, totalDuration, section) {
  const fraction = sectionDuration(section) / totalDuration
  const totalWidth = container.offsetWidth
  const sectionWidth = fraction * totalWidth
  section.style.width = `${sectionWidth}px`
}

function reorderSections() {
  // sort sections
  sections.sort((a, b) => {
    if (a.dataset.position > b.dataset.position) return 1
    if (b.dataset.position > a.dataset.position) return -1
    return 0
  })

  // Append nodes in correct order to fragment
  const elements = document.createDocumentFragment()
  sections.forEach((section) => elements.appendChild(section))

  // Empty container and then add fragment containing sorted nodes
  sectionsContainer.innerHTML = null
  sectionsContainer.appendChild(elements)
}

function totalDurationFromSections(sections) {
  return sections.reduce(
    (total, section) => total + sectionDuration(section),
    0
  )
}

function setAllSectionsWidth() {
  sections.forEach((section) =>
    setSectionWidth(sectionsContainer, timerDuration, section)
  )
}

const throttledSetAllSectionsWidth = throttle(setAllSectionsWidth, 500)

// ANCHOR: Utility functions

function throttle(callback, delay = 1000) {
  let shouldWait = false
  return (...args) => {
    if (shouldWait) return

    callback(...args)
    shouldWait = true

    setTimeout(() => (shouldWait = false), delay)
  }
}

// SECTION: EVENT LISTENERS
startBtn.addEventListener("click", startTimer)
pauseBtn.addEventListener("click", pauseTimer)
resetBtn.addEventListener("click", reset)
incrementRepetitionsBtn.addEventListener("click", incrementRepetitions)
decrementRepetitionsBtn.addEventListener("click", decrementRepetitions)
window.addEventListener("resize", throttledSetAllSectionsWidth)

// SECTION: Initialize and Run
reorderSections()
setAllSectionsWidth()
render()
