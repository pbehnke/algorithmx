import { ISelContext, EventHandler } from './Selection'
import { nodeSelection } from './NodeSelection'
import { edgeSelection } from './EdgeSelection'
import { labelSelection } from './LabelSelection'
import { CanvasSelection } from './types/canvas'
import { Selection } from './types/selection'
import { ClassBuilder } from './utils'
import { ICanvasAttr } from '../client/attributes/definitions/canvas'
import { InputAttr } from '../client/attributes/types'
import * as events from '../client/types/events'
import * as selection from './Selection'
import * as utils from './utils'

const receiveHandler = (event: events.ReceiveEvent, listeners: selection.SelListeners): void => {
  if (event.type === events.ReceiveEventType.Broadcast)
     selection.triggerListener(listeners, event.data.message)

  else if (event.type === events.ReceiveEventType.Click)
    selection.triggerListener(listeners, `click-node-${event.data.id}`)

  else if (event.type === events.ReceiveEventType.Hover)
    selection.triggerListener(listeners, `${event.data.entered ? 'hoverin' : 'hoverout'}-node-${event.data.id}`)

  else if (event.type === events.ReceiveEventType.Error)
    throw Error(event.data.message)
}

const builder: ClassBuilder<CanvasSelection, ISelContext<ICanvasAttr>> = (context, self, construct) =>
  utils.inherit<CanvasSelection, Selection>({

  node: id => {
    return self().nodes([id])
  },
  nodes: ids => {
    return nodeSelection({...context, parent: context, ids: ids, data: ids, initAttr: undefined })
  },
  edge: edge => {
    return self().edges([edge])
  },
  edges: edges => {
    const ids = edges.map(([source, target, edgeId]) => {
      const orderedNodes = [source, target].sort()
      return `${orderedNodes[0]}-${orderedNodes[1]}${edgeId !== undefined ? '-' + edgeId : ''}`
    })

    const initAttr = edges.map(([source, target]) =>
      ({ source: String(source), target: String(target) }))

    return edgeSelection({...context, parent: context, ids: ids, data: edges, initAttr: initAttr })
  },
  label: (id = 'title') => {
    return self().labels([id])
  },
  labels: ids => {
    return labelSelection({...context, parent: context, ids: ids, data: undefined, initAttr: undefined })
  },
  size: size => {
    context.client.dispatch(utils.attrEvent(context, size, d => ({ size: d })))
    return self()
  },
  edgeLengths: lengthInfo => {
    context.client.dispatch(utils.attrEvent(context, lengthInfo, d =>
      ({ edgeLengths: d }) as InputAttr<ICanvasAttr>))
    return self()
  },
  pan: location => {
    context.client.dispatch(utils.attrEvent(context, location, d => ({ pan: d })))
    return self()
  },
  zoom: zoom => {
    context.client.dispatch(utils.attrEvent(context, zoom, d => ({ zoom: d })))
    return self()
  },
  panLimit: box => {
    context.client.dispatch(utils.attrEvent(context, box, d => ({ panLimit: d })))
    return self()
  },
  zoomLimit: limit => {
    context.client.dispatch(utils.attrEvent(context, limit, d => ({ zoomLimit: d })))
    return self()
  }
}, selection.builder(context, self, construct))

export const canvasSelection = (handler: EventHandler) => {
  const context: ISelContext<ICanvasAttr> = {
    ...selection.defaultContext,
    client: handler,
    name: 'canvas'
  }
  handler.subscribe(event => receiveHandler(event, context.listeners))
  return utils.build(builder, context)
}
