const db = require("./models")
const chalk = require("chalk")

const createTag = async () => {
  try {
    const timer = await db.Timer.findByPk(3)
    timer.createTag({ name: "New", color: "yellow", UserId: 1 })
  } catch (error) {
    console.error(chalk.red("Error creating tag"), chalk.red(error))
  }
}

const props = async () => {
  const tag = await db.Tag.findByPk(1, { include: db.Timer })
  console.log(chalk.yellow(Object.keys(tag)))
  const timers = tag.Timers
  timers.forEach((timer) => console.log(chalk.green(timer.name)))
  // console.log(chalk.green(tag.Timers))
}

createTag()
// props()
