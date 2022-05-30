/**
 * The Engine is responsible for calling the `update` and `render` methods
  at fixed time intervals, determined by the `fps` property
 */
export class Engine {
  /**
   * Game update function to call before rendering each frame
   * @type {function}
   */
  #update

  /**
   * Render function to call each frame
   * @type {function}
   */
  #render

  /**
   * Fixed time step in seconds. `update` & `render` are called at this
   * frequency
   * @type {number}
   */
  #timeStep

  /**
   * Most recent time the cycle was run
   * `DOMHighResTimeStamp`, measured in milliseconds.
   * @type {number}
   */
  #mostRecentTime = 0

  /**
   * Time the last frame was rendered.
   * `DOMHighResTimeStamp`, measured in milliseconds.
   * @type {number}
   */
  #lastFrameTime = window.performance.now()

  /**
   * Time elapsed between frames in seconds
   * @type {number}
   */
  #accumulatedTime = 0

  /**
   * Has the `update` function been called since last cycle?
   * `false` if not enough time has passed.
   * Prevents rendering when no update has occurred.
   * @type {boolean}
   */
  #updated = false

  /**
  * Is the engine running or stopped?
  * Determines if the frame function should keep being called by
  `requestAnimationFrame`
  * @type {boolean}
  */
  #isRunning = false

  /**
   * @typedef {object} EngineConfig
   * @property {function} update - Called before rendering
   * @property {function} render - Called after updating
   * @property {number} fps - Frames Per Second
   */
  /**
   *
   * @param {EngineConfig} config
   */
  constructor({ update, render, fps }) {
    this.#update = update
    this.#render = render
    this.#timeStep = 1 / fps
  }

  /**
   * Start the game loop. Start calling update and render at set frequency
   */
  start() {
    this.#isRunning = true
    requestAnimationFrame(this.#frame)
  }

  /**
   * Stop the game loop. Update and render will no longer be called
   */
  stop() {
    this.#isRunning = false
  }

  /**
   * Calculates the time between frames
   * It is capped at 1 second, in case the user switches tabs for a long time,
   * so that the update function isn't called over and over before rendering
   * @param {number} currentTime - In milliseconds
   * @param {number} previousTime - In milliseconds
   * @returns {number} Time in seconds between frames, capped at 1 second
   */
  #calculateAccumulatedTime(currentTime, previousTime) {
    const deltaInSeconds = (currentTime - previousTime) / 1000
    const cappedDelta = Math.min(1, deltaInSeconds)
    return cappedDelta
  }

  /**
   * This is the callback to requestAnimationFrame.
   * Checks how much time has passed after the last call,
   * calls the update function as many times as necessary,
   * and then calls the render function if update has been called
   * @returns {void}
   */
  #frame = () => {
    if (!this.#isRunning) return

    this.#mostRecentTime = window.performance.now()
    this.#accumulatedTime =
      this.#accumulatedTime +
      this.#calculateAccumulatedTime(this.#mostRecentTime, this.#lastFrameTime)

    /*
    We only update and render when the browser is ready. To ensure the game runs
    at the same speed regardless of machine, we need to:
      * Only update game if enough time has elapsed.
      *  Keep updating the game if more than a time step's worth of time has
          elapsed
    */
    while (this.#accumulatedTime > this.#timeStep) {
      this.#accumulatedTime -= this.#timeStep
      this.#update(this.#timeStep)
      this.#updated = true
    }

    // Only render if the game has updated
    if (this.#updated) {
      this.#render(this.#accumulatedTime)
      this.#updated = false
    }

    this.#lastFrameTime = this.#mostRecentTime
    requestAnimationFrame(this.#frame)
  }
}
