import { ICanvasAttr } from '../../attributes/definitions/canvas'
import { Canvas } from '../../types/events'
import { D3Selection } from '../utils'
import { ILayoutState } from '../../layout/layout'
import * as canvasUtils from './utils'
import * as liveEdge from '../edge/live'
import * as math from '../../math'

const updateNodes = (canvasSel: D3Selection, attr: ICanvasAttr['nodes'], layout: ILayoutState): void => {
  Object.entries(layout.nodes).forEach(([id, node]) => {
    if (attr[id].visible) {
      const nodeSel = canvasUtils.selectNode(canvasUtils.selectNodeGroup(canvasSel), id)
      nodeSel.attr('transform', `translate(${node.x},${-node.y})`)
    }
  })
}

const updateEdges = (canvasSel: D3Selection, attr: ICanvasAttr, layout: ILayoutState): void => {
  Object.keys(attr.edges).forEach(k => {
    if (attr.edges[k].visible) {
      const edge = liveEdge.getLiveEdgeData(canvasSel, layout, attr, attr.edges[k])
      const edgeSel = canvasUtils.selectEdge(canvasSel, k)

      const origin = liveEdge.getEdgeOrigin(edge)
      edgeSel.attr('transform', `translate(${origin[0]},${-origin[1]})rotate(${-math.angleToDeg(edge.angle)})`)

      liveEdge.renderEdgePath(edgeSel, edge, origin)
    }
  })
}

export const updateCanvas = (canvas: Canvas, attr: ICanvasAttr, layout: ILayoutState) => {
  if (!attr.visible) return
  const canvasSel = canvasUtils.selectCanvasInner(canvasUtils.selectCanvas(canvas))
  updateNodes(canvasSel, attr.nodes, layout)
  updateEdges(canvasSel, attr, layout)
}
