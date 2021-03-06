import { IEdgeAttr } from '../../attributes/definitions/edge'
import { D3Selection, D3SelTrans } from '../utils'
import { RenderAttr, getEntry } from '../process'
import * as renderMarker from './marker'
import * as renderFns from '../render'
import * as renderElement from '../element'
import * as renderUtils from '../utils'

export const selectOverlay = (edgeSel: D3Selection, renderData: RenderAttr<IEdgeAttr>): D3Selection => {
  edgeSel.select('.edge-path-overlay').remove()
  const overlay = edgeSel.append('path').classed('edge-path-overlay', true)
    .attr('fill', 'none').attr('stroke-linecap', 'butt')

  if (renderData.attr.directed) overlay.attr('marker-end', `url(#${renderMarker.getFullId(edgeSel, 'target')}`)
  return overlay
}

const getPathLength = (pathSel: D3Selection) => (pathSel.node() as SVGPathElement).getTotalLength()

const reverseDirection = (renderData: RenderAttr<IEdgeAttr>): boolean => {
  const colorData = getEntry(renderData, 'color')
  if (!colorData.animation || !colorData.animation.data || !colorData.animation.data.source)
    return false
  else return renderData.attr.source !== renderData.animation.color.data.source
}

const tweenOverlay = (overlaySel: D3SelTrans, reverse: boolean, pathLengthFn: () => number,
                      beginTraverse: boolean): D3SelTrans => {
  if (renderUtils.isTransition(overlaySel)) {
    return overlaySel.attrTween('stroke-dashoffset', () => {
      const pathLength = pathLengthFn()
      if (beginTraverse) return t => (pathLength - (reverse ? -t : t) * pathLength).toString()
      else return t => (pathLength * 2 - (reverse ? -t : t) * pathLength).toString()
    })
  } else return overlaySel.attr('stroke-dashoffset', beginTraverse ? 0 : pathLengthFn())
}

const highlightTraverse = (pathSel: D3Selection, overlaySel: D3Selection,
                           renderData: RenderAttr<IEdgeAttr>): void => {
  const colorData = getEntry(renderData, 'color')
  const reverse = reverseDirection(renderData)

  overlaySel.attr('stroke', renderUtils.parseColor(colorData.highlight))
    .attr('stroke-width', renderData.attr.thickness + 2)

  const startFn = (sel: D3SelTrans): D3SelTrans => {
    const trans = sel.attr('stroke-width', renderData.attr.thickness)
    return tweenOverlay(trans, reverse, () => getPathLength(pathSel), true)
  }
  const endFn = (sel: D3SelTrans): D3SelTrans => {
    sel.on('start', () => {
      const pathLength = getPathLength(pathSel)
      overlaySel.attr('stroke-dasharray', pathLength)
    })
    const trans = tweenOverlay(sel, reverse, () => getPathLength(pathSel), false)
    return renderFns.newTransition(trans, t => t.duration(0)).remove()
  }
  renderFns.renderHighlight(overlaySel, colorData, startFn, endFn)
}

export const renderTraverse = (pathSel: D3Selection, renderData: RenderAttr<IEdgeAttr>,
                               overlaySelector: () => D3Selection): void => {
  const colorData = getEntry(renderData, 'color')
  const reverse = reverseDirection(renderData)
  const overlaySel = overlaySelector()
  const pathLengthInit = getPathLength(pathSel)

  overlaySel.attr('stroke-dasharray', pathLengthInit).attr('stroke-dashoffset', pathLengthInit)

  if (colorData.highlight !== undefined) highlightTraverse(pathSel, overlaySel, renderData)
  else {
    overlaySel.attr('stroke', renderUtils.parseColor(colorData.attr))
      .attr('stroke-width', renderData.attr.thickness + 2)

    renderFns.render(overlaySel, colorData, sel => {
      const trans = sel.attr('stroke-width', renderData.attr.thickness)
      return tweenOverlay(trans, reverse, () => getPathLength(pathSel), true)
    })

    const animDuration = renderFns.parseTime(colorData.animation.duration)
    const endDuration = animDuration / 3
    renderFns.transition(pathSel, colorData.name, t =>
      t.delay(animDuration).duration(endDuration))
        .attr('stroke', renderUtils.parseColor(colorData.attr))

    const removeTrans = renderFns.newTransition(overlaySel.attr('opacity', 1), t =>
      t.delay(animDuration + endDuration).duration(endDuration))
        .attr('opacity', 0)
    renderFns.newTransition(removeTrans, t => t.duration(0)).remove()
  }
}

export const renderColor = (pathSel: D3Selection, markerSelector: () => D3Selection, overlaySelector: () => D3Selection,
                            renderData: RenderAttr<IEdgeAttr>): void => {
  const colorData = getEntry(renderData, 'color')
  const doTraverse = colorData.animation && colorData.animation.type === 'traverse'

  if (doTraverse) renderTraverse(pathSel, renderData, overlaySelector)
  else renderElement.renderSvgAttr(pathSel, 'stroke', v => renderUtils.parseColor(v), colorData)

  if (renderData.attr.directed)
    renderElement.renderSvgAttr(markerSelector(), 'fill', v => renderUtils.parseColor(v), colorData)
}
