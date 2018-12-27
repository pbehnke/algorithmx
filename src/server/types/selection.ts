import { AnimationType, AnimationEase } from '../../client/attributes/definitions/animation'
import { ElementFn, ElementArg } from './types'

export interface Selection {
  /**
   * Adds all elements in the current selection to the canvas. This should be called immediately after a
   * selection of new elements is created. Additionally, this will disable all subsequent animations, allowing initial
   * attributes to be set.
   *
   * @return A new instance of the current selection with animations disabled.
   */
  add (): this

  /**
   * Removes all elements in the current selection from the canvas.
   */
  remove (): this

  /**
   * Sets whether or not the elements in the current selection should be visible. This can be animated in the same way
   * as additions and removals. However, in contrast to removing, disabling visibility will not clear attributes or
   * affect layout.
   *
   * @param visible - Whether or not the elements should be visible.
   */
  visible (visible: ElementArg<boolean>): this

  /**
   * Sets the queue onto which all events triggered by the selection should be added. Each queue handles events
   * independently, and all queues execute in parallel. Since queues can be delayed (see [[Selection.pause]]), this
   * effectively enables multiple animations to run simultaneously.
   *
   * The `null` queue is special; all events added to it will execute immediately. The default queue is named "default".
   *
   * @param queue - The name of the queue. This can be any string or integer, or `null` for the immediate queue.
   *
   * @return A new instance of the current selection using the specified event queue.
   */
  eventQ (queue: string | number | null): this

  /**
   * Configures the type of animation which should be used for all attribute changes triggered by the selection.
   *
   * @param type - One of the following strings:
   * - "normal": The standard animation, applicable in most cases.
   * - "scale": Animates the size of elements being added/removed.
   * - "fade": Animates the opacity of elements being added/removed.
   * - "scale-face": Animates both the size and opacity of elements being added/removed.
   * - "traverse": Changes the color of edges using a traversal animation (from source to target).
   * - "traverse-reverse": Changes the color of edges using a reversed traversal animation (from target to source).
   *
   * @return A new instance of the current selection using the specified animation type.
   */
  animate (type: AnimationType): this

  /**
   * Configures the duration of all animations triggered by the selection. A duration of 0 will ensure that changes
   * occur immediately.
   *
   * @param milliseconds - The animation duration, in milliseconds.
   *
   * @return A new instance of the current selection using the specified animation duration.
   */
  duration (milliseconds: number): this

  /**
   * Configures the ease function used in all animations triggered by the selection. This will affect the way attributes
   * transition from one value to another. More information is available here: [[https://github.com/d3/d3-ease]].
   *
   * @param ease - The name of the ease function, based on the functions found in D3. The full list is below:
   *
   * "linear",
   * "poly", "polyIn", "polyOut", "polyInOut",
   * "quad", "quadIn", "quadOut", "quadInOut",
   * "cubic", "cubicIn", "cubicOut", "cubicInOut",
   * "sin", "sinIn", "sinOut", "sinInOut",
   * "exp", "expIn", "expOut", "expInOut",
   * "circle", "circleIn", "circleOut", "circleInOut",
   * "elastic", "elasticIn", "elasticOut", "elasticOut",
   * "back", "backIn", "backOut", "backInOut",
   * "bounce", "bounceIn", "bounceOut", "bounceInOut".
   *
   * @return A new instance of the current selection using the specified animation ease.
   */
  ease (ease: AnimationEase): this

  /**
   * Returns a new selection through which all attribute changes are temporary. This is typically used to draw attention
   * to a certain element without permanently changing its attributes.
   *
   * @param milliseconds - (Optional) The amount of time attributes should remain 'highlighted', in milliseconds, before
   * changing back to their original values.
   *
   * @return A new instance of the current selection, where all attribute changes are temporary.
   */
  highlight (milliseconds?: number): this

  /**
   * Binds the selection to a list of data values. This will affect the arguments provided whenever an attribute is
   * configured using a function (see [[ElementArg]]).
   *
   * @param data - A list of values to use as the data of this selection, which should have the same length as the number
   * of elements in the selection. Alternatively, a function transforming the selection's previous data.
   *
   * @return A new instance of the current selection bound to the given data.
   */
  data (data: ReadonlyArray<unknown> | ElementFn<unknown>): this

  /**
   * Adds a pause to the event queue, delaying the next event by the given number of milliseconds.
   *
   * @param milliseconds - The duration of the pause, in milliseconds.
   */
  pause (milliseconds: number): this

  /**
   * Stops the execution of all scheduled events on the current event queue
   * (or on every queue if the current queue is `null`).
   */
  stop (): this

  /**
   * Starts/resumes the execution of all scheduled events on the current event queue
   * (or on every queue if the current queue is `null`).
   */
  start (): this

  /**
   * Cancels all scheduled events on the current event queue
   * (or on every queue if the current queue is `null`).
   */
  cancel (): this

  /**
   * Adds a message to the event queue, which will trigger a corresponding listener (see [[Selection.listen]]).
   * This can be used to detect when a queue reaches a certain point in execution, or to enable communication between
   * a server.
   *
   * @param message - The message.
   */
  broadcast (message: string): this

  /**
   * Registers a function to listen for a specific broadcast message (see [[Selection.broadcast]]). The function will
   * be called when the corresponding broadcast event is processed by the event queue. If the same message is broadcast
   * multiple times, the function will be called each time.
   *
   * @param message - The message to listen for.
   * @param onReceive - The function to call when the message is received.
   */
  listen (message: string, onReceive: () => void): this

  /**
   * Adds a callback to the event queue. This is roughly equivalent to broadcasting a unique message and setting up
   * a corresponding listener. The callback function is guaranteed to only execute once.
   *
   * @param onCallback - The function to call when the callback event is processed by the event queue.
   */
  callback (onCallback: () => void): this
}