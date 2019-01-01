import { Lookup } from '../utils'
import { AttrEval, AttrEvalPartial } from '../attributes/types'
import { ICanvasAttr } from '../attributes/definitions/canvas'
import * as webcola from 'webcola'


export const didUpdateLayout = (changes: AttrEvalPartial<ICanvasAttr>): boolean => {
  return changes.size !== undefined || changes.edgeLengths !== undefined
}

export const updateCola = (cola: webcola.Layout, attr: AttrEval<ICanvasAttr>): void => {
  cola.size([attr.size.width, attr.size.height])

  if (attr.edgeLengths.type === 'individual')
    cola.linkDistance(edge => edge.length)
  else if (attr.edgeLengths.type === 'jaccard')
    cola.jaccardLinkLengths(attr.edgeLengths.length, 1)
  else if (attr.edgeLengths.type === 'symmetric')
    cola.symmetricDiffLinkLengths(attr.edgeLengths.length, 0.1)
}

export const calcAdjacency = (nodes: AttrEval<ICanvasAttr['nodes']>, edges: AttrEval<ICanvasAttr['edges']>):
                              Lookup<ReadonlyArray<string>> => {
  return {}
}