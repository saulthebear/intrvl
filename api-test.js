import textToSpeech from "@google-cloud/text-to-speech"
import fs from "fs"
import util from "util"
import dotEnv from "dotenv"

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

quickStart()
