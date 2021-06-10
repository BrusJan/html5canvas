export class DrawnObject {
  constructor(public obj: any, public pageNumber: number) {
  }
}
export class Point {
  constructor(public x: number, public y: number) {
  }
}
export class Boundary {
  constructor(public a: Point, public b: Point) {
  }
}
export class Line implements Drawable {
  constructor(public bo: Boundary, public editing: boolean, public color: any) {
  }
  draw(ctx: CanvasRenderingContext2D, zoom: number): void {
    ctx.lineWidth = 2 * zoom
    ctx.strokeStyle = this.color
    ctx.beginPath()
    ctx.moveTo(this.bo.a.x * zoom, this.bo.a.y * zoom)
    ctx.lineTo(this.bo.b.x * zoom, this.bo.b.y * zoom)
    ctx.stroke()
    ctx.closePath()
  }
}
export class Square implements Drawable {
  constructor(public bo: Boundary, public editing: boolean, public color: any) {
  }
  draw(ctx: CanvasRenderingContext2D, zoom: number): void {
    ctx.lineWidth = 2 * zoom
    ctx.fillStyle = this.color
    ctx.beginPath()
    ctx.fillRect(Math.min(this.bo.a.x, this.bo.b.x) * zoom, Math.min(this.bo.a.y, this.bo.b.y) * zoom, Math.abs(this.bo.a.x - this.bo.b.x) * zoom, Math.abs(this.bo.a.y - this.bo.b.y) * zoom)
    ctx.closePath()
  }
}
export class Ellipse implements Drawable {
  constructor(public bo: Boundary, public editing: boolean, public color: any) {
  }
  draw(ctx: CanvasRenderingContext2D, zoom: number): void {
    ctx.lineWidth = 2 * zoom
    ctx.fillStyle = this.color
    ctx.beginPath()
    ctx.ellipse(this.bo.a.x * zoom, this.bo.a.y * zoom, Math.abs(this.bo.a.x - this.bo.b.x) * zoom, Math.abs(this.bo.a.y - this.bo.b.y) * zoom, 0, 0, 2 * Math.PI)
    ctx.fill()
    ctx.closePath()
  }
}
export class BrushStroke implements Drawable {
  constructor(public points: Array<Point>, public color: any) {
  }
  draw(ctx: CanvasRenderingContext2D, zoom: number): void {
    ctx.lineWidth = 10 * zoom
    ctx.strokeStyle = this.color
    ctx.beginPath()
    ctx.moveTo(this.points[0].x * zoom, this.points[0].y * zoom)
    // i = index of single point in a brush stroke
    for (let i = 1; i < this.points.length; i++) {
      ctx.lineTo(this.points[i].x * zoom, this.points[i].y * zoom)
      ctx.stroke()
    }
    ctx.closePath()
  }
}
export interface Drawable {
  draw(ctx: CanvasRenderingContext2D, zoom: number): void
}
export class MainData {
  constructor(public settings: Settings, public pages: Page[], public objects: DrawnObject[]) {
  }
}
export class Settings {
  constructor(public zoom: number) {    
  }
}
export class Page {
  constructor(public pageNumber: number, public imgO: string, public imgU: string, public imgR: string, public multimedia: any[]) {    
  }
}
export interface Media {
  draw(ctx: CanvasRenderingContext2D, zoom: number, isRightSide: boolean, canvasWidth: number, cvToOrigRatioX: number, cvToOrigRatioY: number): void
  isInsideBoundary(x: number, y: number, zoom: number, isRightSide: boolean, canvasWidth: number): boolean
}
export class MediaAudio implements Media {
  btnPlay = new Image()
  DEFAULT_IMG_SIZE = 40
  loaded = false;
  exactCoords = new Point(0,0) // pixel coordinations in canvas where the draw method computed it
  constructor(public id: number, public pageNumber: number, public url: string, public coords: Point) {
    this.btnPlay.src = 'img/icons/play.png'
  }
  // ctx - canvas to draw on
  // zoom - user selected value 0 - 1,
  // isRightSide - two pages are displayed, the even ones are always moved to the right by half of viewport
  // canvasWidth - you know what this is right?
  // cvToOrigRatio - zoom caused by resizing the window, user might have 100% zoom but the window might be small and the canvas always adjusts to window size
  draw(ctx: CanvasRenderingContext2D, zoom: number, isRightSide: boolean, canvasWidth: number, cvToOrigRatioX: number, cvToOrigRatioY: number): void {
    let x
    if (isRightSide) x = (this.coords.x * zoom * cvToOrigRatioX) + canvasWidth/2
    else x = this.coords.x * zoom * cvToOrigRatioX
    let y = this.coords.y * zoom * cvToOrigRatioY
    this.exactCoords.x = x;
    this.exactCoords.y = y;
    ctx.drawImage(this.btnPlay, x, y, this.DEFAULT_IMG_SIZE * zoom, this.DEFAULT_IMG_SIZE * zoom)
  }
  isInsideBoundary(x: number, y: number, zoom: number, isRightSide: boolean, canvasWidth: number): boolean {
    return x >= this.exactCoords.x && x <= this.exactCoords.x+this.DEFAULT_IMG_SIZE && y >= this.exactCoords.y && y <= this.exactCoords.y + this.DEFAULT_IMG_SIZE
  }
}
export class MediaVideo {
  btnPlay = new Image()
  DEFAULT_IMG_SIZE = 40
  loaded = false;
  exactCoords = new Point(0,0)
  constructor(public id: number, public pageNumber: number, public url: string, public coords: Point) {
    this.btnPlay.src = 'img/icons/pause.png'
  }
  draw(ctx: CanvasRenderingContext2D, zoom: number, isRightSide: boolean, canvasWidth: number, cvToOrigRatioX: number, cvToOrigRatioY: number): void {
    let x
    if (isRightSide) x = (this.coords.x * zoom * cvToOrigRatioX) + canvasWidth/2
    else x = this.coords.x * zoom * cvToOrigRatioX
    let y = this.coords.y * zoom * cvToOrigRatioY
    this.exactCoords.x = x;
    this.exactCoords.y = y;
    ctx.drawImage(this.btnPlay, x, y, this.DEFAULT_IMG_SIZE * zoom, this.DEFAULT_IMG_SIZE * zoom)
  }
  isInsideBoundary(x: number, y: number, zoom: number, isRightSide: boolean, canvasWidth: number): boolean {
    return x >= this.exactCoords.x && x <= this.exactCoords.x+this.DEFAULT_IMG_SIZE && y >= this.exactCoords.y && y <= this.exactCoords.y + this.DEFAULT_IMG_SIZE
  }
}