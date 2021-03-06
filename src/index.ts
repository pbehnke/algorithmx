import { InputCanvasAttr, InputNodeAttr, InputEdgeAttr, InputLabelAttr} from './client/attributes/definitions/types'
import { DispatchEvent, ReceiveEvent } from './client/types/events'
import { Client } from './api/types/client'
import { CanvasSelection } from './api/types/canvas'
import { NodeSelection } from './api/types/node'
import { EdgeSelection } from './api/types/edge'
import { LabelSelection } from './api/types/label'
import * as clientBridge from './api/ClientBridge'
import { EventHandler } from './api/Selection'
import { canvasSelection } from './api/CanvasSelection'
import { Canvas } from './client/types/events'

/**
 * Creates a new [[Client]], responsible for rendering the network, storing application state, and dispatching and receiving
 * events. The network can be rendered in any HTML element on the page (preferably a `div`), or an `Element` object.
 * A client should only be used directly if complete control over event handling is required.
 *
 * @param output - The `id` attribute of an element in which to render the network, or an `Element` object.
 *
 * @return A new [[Client]].
 */
export const client = (output: Canvas): Client => {
  return clientBridge.client(output)
}

/**
 * Creates a new [[CanvasSelection]], providing an interface to the network's graphics. The network can be rendered in
 * any HTML element on the page (preferably a `div`), or an `Element` object. This will automatically initialize a
 * [[Client]] and return its corresponding interface.
 *
 * @param output - The `id` attribute of an element on the HTML page to use as the canvas, or an `Element` object.
 *
 * @return A new [[CanvasSelection]].
 */
export const canvas = (output: Canvas): CanvasSelection => {
  return client(output).canvas()
}

export {
  Client,
  DispatchEvent,
  ReceiveEvent,
  EventHandler,
  canvasSelection,

  CanvasSelection,
  NodeSelection,
  EdgeSelection,
  LabelSelection,

  InputCanvasAttr,
  InputNodeAttr,
  InputEdgeAttr,
  InputLabelAttr
}
