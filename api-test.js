// import textToSpeech from "@google-cloud/text-to-speech"
// import fs from "fs"
// import util from "util"
// import dotEnv from "dotenv"
// import logger from "./helpers/logger.js"
// import db from "./models"
// import chalk from "chalk"

const textToSpeech = require("@google-cloud/text-to-speech")
const fs = require("fs")
const util = require("util")
const dotEnv = require("dotenv")
const logger = require("./helpers/logger")
const db = require("./models")
const chalk = require("chalk")

dotEnv.config()

const client = new textToSpeech.TextToSpeechClient()

async function quickStart() {
  const text = "Start!"

  const request = {
    input: { text },
    voice: { languageCode: "en-US", ssmlGender: "NEUTRAL" },
    audioConfig: { audioEncoding: "MP3" },
  }

  const [response] = await client.synthesizeSpeech(request)

  // write binary audio content to a local file
  const writeFile = util.promisify(fs.writeFile)
  await writeFile("output.mp3", response.audioContent, "binary")
  console.log("Audio content written to file: output.mp3")
}

async function saveToDb(input) {
  try {
    const request = {
      input: { text: input },
      voice: { languageCode: "en-US", ssmlGender: "NEUTRAL" },
      audioConfig: { audioEncoding: "MP3" },
    }

    const [response] = await client.synthesizeSpeech(request)

    const sound = await db.Sound.create({
      text: input,
      file: response.audioContent,
    })

    if (sound) {
      logger.debug(chalk.green("Sound added to db"))
    } else {
      throw "Couldn't save sound"
    }
  } catch (error) {
    logger.error(chalk.red("Error saving audio to db: "))
    logger.error(chalk.red(error))
  }
}

// quickStart()

saveToDb("Hello, there. This is a test.")
