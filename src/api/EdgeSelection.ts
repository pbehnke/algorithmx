import { InputEdgeAttr } from '../client/attributes/definitions/types'
import { ISelContext } from './Selection'
import { EdgeSelection } from './types/edge'
import { Selection } from './types/selection'
import { labelSelection } from './LabelSelection'
import { ClassBuilder } from './utils'
import * as selection from './Selection'
import * as utils from './utils'

const builder: ClassBuilder<EdgeSelection, ISelContext<InputEdgeAttr>> = (context, self, construct) =>
  utils.inherit<EdgeSelection, Selection<InputEdgeAttr>>({

  traverse: (source = (e, i) => context.initattr[i].source) => {
    return construct({...context, animation: utils.updateAnimation(context, source, d =>
      ({ type: 'traverse', data: { source: String(d) } })) })
  },

  label: (id = 'weight') => {
    return self().labels([id])
  },
  labels: ids => {
    return labelSelection({...context, parent: context, ids: ids.map(k => String(k)),
      data: null, initattr: undefined })
  },
  directed: directed => {
    context.client.dispatch(utils.attrEvent(context, directed, d => ({ directed: d })))
    return self()
  },
  length: length => {
    context.client.dispatch(utils.attrEvent(context, length, d => ({ length: d })))
    return self()
  },
  thickness: thickness => {
    context.client.dispatch(utils.attrEvent(context, thickness, d => ({ thickness: d })))
    return self()
  },
  color: color => {
    context.client.dispatch(utils.attrEvent(context, color, d => ({ color: d })))
    return self()
  },
  flip: flip => {
    context.client.dispatch(utils.attrEvent(context, flip, d => ({ flip: d })))
    return self()
  },
  curve: curve => {
    context.client.dispatch(utils.attrEvent(context, curve, d => ({ curve: d })))
    return self()
  },
  path: path => {
    context.client.dispatch(utils.attrEvent(context, path, d => ({ path: d })))
    return self()
  },
  ...(selection.svgMixinAttrBuilder(context, self))

}, selection.builder(context, self, construct))

export const edgeSelection = (args: ISelContext<InputEdgeAttr>) => {
  return utils.build(builder, {...args, name: 'edges' })
}
