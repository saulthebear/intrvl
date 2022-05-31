import { Engine } from "./Engine.js"

const timerDiv = document.querySelector("#js-timer")
const currTimeDisplay = document.querySelector("#js-current-time")
const remainingTimeDisplay = document.querySelector("#js-remaining-time")
const startBtn = document.querySelector("#js-start-timer")
const pauseBtn = document.querySelector("#js-pause-timer")
const indicator = document.querySelector("#js-timeline-indicator")
const startAnnouncementCheckbox = document.querySelector(
  "#playStartAnnouncement"
)
const endAnnouncementCheckbox = document.querySelector("#playEndAnnouncement")

const timerDuration = timerDiv.dataset["duration"]
const timerStartAnnouncement = timerDiv.dataset.startAnnouncement
const timerEndAnnouncement = timerDiv.dataset.endAnnouncement
let timerRemaining = timerDuration
let timerCurrent = 0
let isRunning = false

const togglePlayPauseBtn = () => {
  startBtn.classList.toggle("hidden")
  pauseBtn.classList.toggle("hidden")
}

const formatTime = (totalSeconds) => {
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

const speakText = (text) => {
  const utterance = new SpeechSynthesisUtterance(text)
  speechSynthesis.speak(utterance)
}

function checkTimerEnd() {
  if (isRunning && timerCurrent >= timerDuration) {
    if (endAnnouncementCheckbox.checked) speakText(timerEndAnnouncement)
    engine.stop()
    isRunning = false
    togglePlayPauseBtn()

    timerCurrent = 0
    timerRemaining = timerDuration

    console.log("Stopping timer")
  }
}

const render = () => {
  if (isRunning) {
    currTimeDisplay.innerText = formatTime(timerCurrent)
    remainingTimeDisplay.innerText = formatTime(timerRemaining)
  }
}

const update = (timeStep) => {
  timerCurrent += timeStep
  timerRemaining = timerDuration - timerCurrent

  const percentComplete = Math.min((timerCurrent / timerDuration) * 100, 100)
  indicator.style.left = `${percentComplete}%`

  if (timerRemaining < 0) timerRemaining = 0

  console.log(`Current: ${timerCurrent}`)
  console.log(`Remaining: ${timerRemaining}`)

  checkTimerEnd()
}

const engine = new Engine({ update, render, fps: 120 })

const startTimer = () => {
  togglePlayPauseBtn()
  if (startAnnouncementCheckbox.checked) speakText(timerStartAnnouncement)
  engine.start()
  isRunning = true
}

const pauseTimer = () => {
  togglePlayPauseBtn()
  engine.stop()
  isRunning = false
}

startBtn.addEventListener("click", startTimer)
pauseBtn.addEventListener("click", pauseTimer)

render()
