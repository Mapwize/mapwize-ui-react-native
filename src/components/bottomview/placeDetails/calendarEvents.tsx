import React from 'react'

import Canvas from 'react-native-canvas'

export interface CalendarEvent {
  day: number
  start: Date
  end: Date
}
const drawAxe = (ctx: any, gridWidth: number, height: number) => {
  ctx.strokeStyle = 'gray'
  ctx.beginPath()
  ctx.moveTo(0, height - 20)
  ctx.lineTo(gridWidth * 24, height - 20)
  ctx.closePath()
  ctx.stroke()

  for (let i = 0; i < 24; i++) {
    if (i !== 0) {
      ctx.moveTo(i * gridWidth, height - 20)
      ctx.lineTo(i * gridWidth, height - 15)
    }
    ctx.fillText(i + 'h', i * gridWidth + 2, height - 10)
    ctx.stroke()
    ctx.fill()
  }
}

const drawSchedule = (
  ctx: any,
  gridWidth: number,
  height: number,
  events: CalendarEvent[],
  mainColor?: string
) => {
  events.forEach((event) => {
    const start = new Date(event.start)
    const end = new Date(event.end)
    let startInMinuts = start.getHours() + start.getMinutes() / 60
    let endInMinuts = end.getHours() + end.getMinutes() / 60
    if (!isToday(start)) {
      startInMinuts = 0
    }
    if (!isToday(end)) {
      endInMinuts = 23.99
    }

    ctx.beginPath()
    ctx.fillStyle = mainColor
    let width = (endInMinuts - startInMinuts) * gridWidth - 2
    let height = 120 - 1
    let radius = 8
    if (width < 16) {
      radius = width / 2
    }
    drawHalfRoundedRect(
      ctx,
      startInMinuts * gridWidth + 1,
      10,
      width,
      height,
      radius
    )
  })
}

const drawCurrentTime = (ctx: any, gridWidth: number, height: number) => {
  const date = new Date()
  const dateInSeconds = date.getHours() + date.getMinutes() / 60
  ctx.strokeStyle = 'blue'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(dateInSeconds * gridWidth, height - 5)
  ctx.lineTo(dateInSeconds * gridWidth, 0)
  ctx.stroke()
}

const drawHalfRoundedRect = (
  ctx: any,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) => {
  ctx.beginPath()
  ctx.moveTo(x + radius, y)
  ctx.lineTo(x + width - radius, y)
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius)
  ctx.lineTo(x + width, y + height)
  ctx.quadraticCurveTo(x + width, y + height, x + width, y + height)
  ctx.lineTo(x, y + height)
  ctx.quadraticCurveTo(x, y + height, x, y + height)
  ctx.lineTo(x, y + radius)
  ctx.quadraticCurveTo(x, y, x + radius, y)
  ctx.closePath()
  ctx.fill()
}
const isToday = (someDate: Date) => {
  const today = new Date()
  return (
    someDate.getDate() === today.getDate() &&
    someDate.getMonth() === today.getMonth() &&
    someDate.getFullYear() === today.getFullYear()
  )
}
export interface CalendarEventsProps {
  data?: any
  mainColor?: string
}
const CalendarEvents = ({ data, mainColor }: CalendarEventsProps) => {
  return (
    <Canvas
      ref={(canvas?: any) => {
        if (canvas === null) {
          return
        }
        // var dpr = window.devicePixelRatio || 1
        var dpr = 1
        // Get the size of the canvas in CSS pixels.
        // Give the canvas pixel dimensions of their CSS
        // size * the device pixel ratio.
        canvas.width = 600 * dpr
        canvas.height = 150 * dpr
        const gridWidth = 600 / 24
        const height = 150
        var ctx = canvas.getContext('2d')
        canvas.width = 600
        canvas.height = 150
        // Scale all drawing operations by the dpr, so you
        // don't have to worry about the difference.
        ctx.scale(dpr, dpr)

        drawAxe(ctx, gridWidth, height)
        drawSchedule(ctx, gridWidth, height, data, mainColor)
        drawCurrentTime(ctx, gridWidth, height)
      }}
    />
  )
}

export default CalendarEvents
