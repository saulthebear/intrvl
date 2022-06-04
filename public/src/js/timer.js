// Handles logic and rendering of a timer

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
const sectionNameDisplay = document.querySelector("#js-current-section-name")
const sectionCurrentTimeDisplay = document.querySelector(
  "#js-section-current-time"
)
const sectionRemainingTimeDisplay = document.querySelector(
  "#js-section-remaining-time"
)
const nextBtn = document.querySelector("#js-next-section-btn")
const prevBtn = document.querySelector("#js-prev-section-btn")

// SECTION: GLOBALS
const timerDuration = totalDurationFromSections(sections)
const timerStartAnnouncement = timerDiv.dataset.startAnnouncement
const timerEndAnnouncement = timerDiv.dataset.endAnnouncement
let timerRemaining = timerDuration
let timerCurrent = 0
let percentComplete = 0
let isRunning = false
let remainingRepetitions = parseInt(repetitionsDisplay.innerText)
let currentSection = null
let sectionTimeElapsed = 0
let sectionTimeRemaining = 0
let sectionDurations, sectionObjects

const engine = new Engine({ update, render, fps: 120 })

// SECTION: FUNCTIONS
function reset() {
  timerRemaining = timerDuration
  timerCurrent = 0
  percentComplete = 0
  currentSection = null
  sectionTimeElapsed = 0
  sectionTimeRemaining = 0
  sectionDurations = sections.map((section) => Number(section.dataset.duration))
  sectionObjects = sections.map((section, index) => {
    const name = section.dataset.name
    const duration = Number(section.dataset.duration)
    const arrayPosition = index
    const startTime = calculateStartTime(index)
    const endTime = startTime + duration
    return {
      name,
      duration,
      arrayPosition,
      startTime,
      endTime,
    }
  })

  setAllSectionsWidth()
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
  return new Promise((resolve) => {
    const utterance = new SpeechSynthesisUtterance(text)

    utterance.onend = resolve
    speechSynthesis.speak(utterance)
  })
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

async function checkTimerEnd() {
  if (isRunning && timerCurrent >= timerDuration) {
    console.debug("Stopping timer")

    engine.stop()
    isRunning = false
    togglePlayPauseBtn()

    timerCurrent = 0
    timerRemaining = timerDuration

    decrementRepetitions()
    if (endAnnouncementCheckbox.checked) await speakText(timerEndAnnouncement)

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
    sectionNameDisplay.innerText = currentSection ? currentSection.name : ""

    sectionCurrentTimeDisplay.innerText = formatTime(sectionTimeElapsed)
    sectionRemainingTimeDisplay.innerText = formatTime(sectionTimeRemaining)
  } else {
    sectionNameDisplay.innerText = ""
  }

  indicator.style.left = `${percentComplete}%`
}

function update(timeStep) {
  currentSection = sectionObjects[getCurrentSectionIndex()]
  timerCurrent += timeStep
  timerRemaining = timerDuration - timerCurrent

  sectionTimeElapsed = timerCurrent - currentSection.startTime
  sectionTimeRemaining = currentSection.endTime - timerCurrent

  percentComplete = Math.min((timerCurrent / timerDuration) * 100, 100)

  if (timerRemaining < 0) timerRemaining = 0

  checkTimerEnd()
}

async function startTimer() {
  togglePlayPauseBtn()
  if (startAnnouncementCheckbox.checked) await speakText(timerStartAnnouncement)
  engine.start()
  isRunning = true
}

function pauseTimer() {
  togglePlayPauseBtn()
  engine.stop()
  isRunning = false
}

function setCurrentTime(secondsElapsed) {
  timerCurrent = secondsElapsed
}

function goToNextSection() {
  if (getCurrentSectionIndex() === sections.length - 1) {
    setCurrentTime(timerDuration - 0.05)
    return
  }

  let nextSection = sectionObjects[getCurrentSectionIndex() + 1]

  setCurrentTime(nextSection.startTime)
}

function goToPrevSection() {
  if (getCurrentSectionIndex() === 0) {
    setCurrentTime(0)
    return
  }

  const prevSection = sectionObjects[getCurrentSectionIndex() - 1]
  setCurrentTime(prevSection.startTime)
}

function restartSection() {
  setCurrentTime(currentSection.startTime)
}

window.goToNextSection = goToNextSection
window.goToPrevSection = goToPrevSection

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

function calculateStartTime(sectionPosition) {
  let durationBefore = 0
  for (let i = 0; i < sectionPosition; i++) {
    durationBefore += sectionDurations[i]
  }
  return durationBefore
}

function getCurrentSectionIndex() {
  // Return first section who's end time is after the current time
  for (let i = 0; i < sectionObjects.length; i++) {
    let section = sectionObjects[i]
    if (section.endTime > timerCurrent) return i
  }
}

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
prevBtn.addEventListener("click", restartSection)
prevBtn.addEventListener("dblclick", goToPrevSection)
nextBtn.addEventListener("click", goToNextSection)
incrementRepetitionsBtn.addEventListener("click", incrementRepetitions)
decrementRepetitionsBtn.addEventListener("click", decrementRepetitions)
window.addEventListener("resize", throttledSetAllSectionsWidth)

// SECTION: Initialize and Run
reset()
