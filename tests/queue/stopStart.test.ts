import { expect } from 'chai'
import * as algorithmx from '../../src/index'
import * as utils from '../utils'

it('Queue | Stop', () => {
  const canvas = algorithmx.canvas(utils.createDiv())
  return new Promise((resolve, reject) => {
    canvas.pause(0.01).callback(() => reject(new Error('queue didn\'t stop')))
    canvas.eventQ(2).stop()
    setTimeout(resolve, 20)
  })
})

it('Queue | Start', () => {
  const canvas = algorithmx.canvas(utils.createDiv())
  return new Promise((resolve, reject) => {
    canvas.eventQ(1).pause(0.01).callback(resolve)
    canvas.stop(1)
    canvas.start(1)
    setTimeout(() => reject(new Error('queue didn\'t start')), 20)
  })
})

it('Queue | Cancel', () => {
  const canvas = algorithmx.canvas(utils.createDiv())
  return new Promise((resolve, reject) => {
    canvas.eventQ('q1').pause(0.01).callback(() => reject(new Error('queue didn\'t cancel')))
    canvas.cancel('q1')
    setTimeout(resolve, 20)
  })
})

it('Queue | Delayed start', () => {
  const canvas = algorithmx.canvas(utils.createDiv())
  return new Promise((resolve, reject) => {
    canvas.stop(1)
    canvas.eventQ(1).pause(0.005).callback(() => reject(new Error('queue shouldn\'t have started')))
    canvas.pause(0.5).start(1)
    setTimeout(resolve, 10)
  })
})

it('Queue | Delayed stop', () => {
  const canvas = algorithmx.canvas(utils.createDiv())
  return new Promise((resolve, reject) => {
    canvas.eventQ(1).pause(0.015).callback(() => reject(new Error('queue didn\'t stop')))
    canvas.pause(0.01).stop(1)
    setTimeout(resolve, 30)
  })
})

it('Queue | Stop and start multiple', () => {
  const canvas = algorithmx.canvas(utils.createDiv())
  return new Promise(resolve => {
    /* tslint:disable */
    let count = 0
    /* tslint:enable */
    canvas.eventQ(1).pause(0.01).callback(() => count += 1)
    canvas.eventQ(2).pause(0.01).callback(() => count += 1)

    canvas.stop(1).stop(2)
    canvas.pause(0.02).start(1).start(2)

    expect(count).to.eq(0)
    setTimeout(() => {
      expect(count).to.eq(2)
      resolve()
    }, 25)
  })
})

it('Queue | Cancel multiple', () => {
  const canvas = algorithmx.canvas(utils.createDiv())
  return new Promise((resolve, reject) => {
    canvas.eventQ('q1').pause(0.01).callback(() => reject(new Error('queue 1 didn\'t cancel')))
    canvas.eventQ('q2').pause(0.01).callback(() => reject(new Error('queue 2 didn\'t cancel')))
    canvas.cancel('q1').cancel('q2')
    setTimeout(resolve, 20)
  })
})

it('Queue | Cancel then start', () => {
  const canvas = algorithmx.canvas(utils.createDiv())
  return new Promise((resolve, reject) => {
    canvas.pause(0.01).callback(() => reject(new Error('queue didn\'t cancel')))
    canvas.eventQ(null).stop()
    canvas.pause(0.1)

    canvas.eventQ(null).cancel()

    canvas.pause(0.01).callback(resolve)
    canvas.eventQ(null).start()
    setTimeout(() => reject(new Error('queue didn\'t start')), 20)
  })
})

it('Queue | Interrupt pause', () => {
  const canvas = algorithmx.canvas(utils.createDiv())
  return new Promise((resolve, reject) => {
    canvas.pause(0.01).pause(0.1).callback(() =>
      reject(new Error('stopping the queue didn\'t invalidate the current pause')))
    canvas.eventQ(null).stop().start()

    canvas.pause(0.01)
    canvas.eventQ(null).cancel()

    canvas.pause(0.1).callback(() =>
      reject(new Error('cancelling the queue didn\'t invalidate the current pause')))
    setTimeout(resolve, 20)
  })
})
