import { D3Selection } from '../utils'
import { IEdgeAttr, Curve } from '../../attributes/definitions/edge'
import { IRenderLiveNode } from '../node/live'
import { ILayoutState } from '../../layout/layout'
import { ICanvasAttr } from '../../attributes/definitions/canvas'
import { AttrEval } from '../../attributes/types'
import * as renderUtils from '../utils'
import * as liveNode from '../node/live'
import * as math from '../../math'
import * as d3 from '../d3.modules'


interface IRenderLiveEdge {
  readonly angle: number
  readonly flip: boolean
  readonly curve: Curve
  readonly path: ReadonlyArray<[number, number]>
  readonly source: IRenderLiveNode
  readonly target: IRenderLiveNode
  readonly sourceId: string
  readonly targetId: string
}

export const getLiveEdgeData = (canvasSel: D3Selection, layoutState: ILayoutState,
                                canvasAttr: AttrEval<ICanvasAttr>, edgeAttr: AttrEval<IEdgeAttr>): IRenderLiveEdge => {
  const sourceData = liveNode.getLiveNodeData(canvasSel, layoutState, canvasAttr, edgeAttr.source)
  const targetData = liveNode.getLiveNodeData(canvasSel, layoutState, canvasAttr, edgeAttr.target)

  const angle = Math.atan2(targetData.pos[1] - sourceData.pos[1], targetData.pos[0] - sourceData.pos[0])
  return {
    angle: math.restrictAngle(angle),
    flip: edgeAttr.flip,
    curve: edgeAttr.curve,
    path: edgeAttr.path.map(p => [p.x, p.y] as [number, number]),
    source: sourceData,
    target: targetData,
    sourceId: edgeAttr.source,
    targetId: edgeAttr.target
  }
}

export const shouldFlip = (edge: IRenderLiveEdge): boolean => {
  return edge.flip && edge.sourceId !== edge.targetId && edge.angle > Math.PI / 2 && edge.angle <= Math.PI * 3 / 2
}

export const getEdgeOriginRegular = (edge: IRenderLiveEdge): [number, number] => {
  const sourcePoint = liveNode.getPointAtNodeBoundary(edge.source, edge.angle)
  const targetPoint = liveNode.getPointAtNodeBoundary(edge.target, edge.angle + Math.PI)
  return [
    (sourcePoint[0] + targetPoint[0]) / 2,
    (sourcePoint[1] + targetPoint[1]) / 2
  ]
}

export const getEdgeOriginLoop = (edge: IRenderLiveEdge): [number, number]  => {
  return [0, 0]
}

export const getEdgeOrigin = (edge: IRenderLiveEdge): [number, number]  => {
  if (edge.sourceId === edge.targetId) return getEdgeOriginLoop(edge)
  else return getEdgeOriginRegular(edge)
}

export const curveFn = (name: string) => {
  // e.g. convert 'step-after' to 'curveStepAfter'
  return d3.shape['curve' + renderUtils.dashToUpperCamel(name)]
}

export const renderEdgePath = (edgeSel: D3Selection, edge: IRenderLiveEdge, origin: [number, number]) => {
  const edgePath = shouldFlip(edge) ? edge.path.map(([x, y]) => [x, -y] as [number, number]) : edge.path

  const pointBeforeSource = edgePath.length === 0 ? origin
    : math.translate(math.rotate(edgePath[0], edge.angle), origin)
  const pointBeforeTarget = edgePath.length === 0 ? origin
    : math.translate(math.rotate(edgePath[edgePath.length - 1], edge.angle), origin)

  const angleAtSource = Math.atan2(pointBeforeSource[1] - edge.source.pos[1], pointBeforeSource[0] - edge.source.pos[0])
  const angleAtTarget = Math.atan2(pointBeforeTarget[1] - edge.target.pos[1], pointBeforeTarget[0] - edge.target.pos[0])

  const pointAtSource = liveNode.getPointAtNodeBoundary(edge.source, angleAtSource)
  const pointAtTarget = liveNode.getPointAtNodeBoundary(edge.target, angleAtTarget)

  const pointAtSourceRel = math.rotate(math.translate(pointAtSource, [-origin[0], -origin[1]]), -edge.angle)
  const pointAtTargetRel = math.rotate(math.translate(pointAtTarget, [-origin[0], -origin[1]]), -edge.angle)

  const lineFunction = d3.shape.line().x(d => d[0]).y(d => -d[1]).curve(curveFn(edge.curve))
  edgeSel.select('path').attr('d', lineFunction([pointAtSourceRel, ...edgePath, pointAtTargetRel]))
}