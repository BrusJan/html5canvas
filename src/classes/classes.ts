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
  constructor(public bo: Boundary, public editing: boolean) {
  }
  draw(ctx: CanvasRenderingContext2D, zoom: number): void {
    ctx.lineWidth = 2 * zoom
    ctx.strokeStyle = "black"
    ctx.beginPath()
    ctx.moveTo(this.bo.a.x * zoom, this.bo.a.y * zoom)
    ctx.lineTo(this.bo.b.x * zoom, this.bo.b.y * zoom)
    ctx.stroke()
    ctx.closePath()
  }
}
export class BrushStroke implements Drawable {
  constructor(public points: Array<Point>) {
  }
  draw(ctx: CanvasRenderingContext2D, zoom: number): void {
    ctx.lineWidth = 10 * zoom
    ctx.strokeStyle = "red"
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
export class MediaAudio {
  btnPlay = new Image()
  DEFAULT_IMG_SIZE = 40
  constructor(public id: number, public pageNumber: number, public url: string, public bo: Boundary) {
    this.btnPlay.src = 'img/icons/play.png'
  }
  draw(ctx: CanvasRenderingContext2D, zoom: number): void {
    ctx.drawImage(this.btnPlay, this.bo.a.x * zoom, this.bo.a.y * zoom, this.DEFAULT_IMG_SIZE * zoom, this.DEFAULT_IMG_SIZE * zoom) // 80 is width and height of the actual play.png icon
  }
  isInsideBoundary(x: number, y: number, zoom: number): boolean {
    return x >= this.bo.a.x*zoom && x <= this.bo.a.x*zoom+this.DEFAULT_IMG_SIZE && y >= this.bo.a.y*zoom && y <= this.bo.a.y*zoom+this.DEFAULT_IMG_SIZE
  }
}
export class MediaVideo {
  btnPlay = new Image()
  DEFAULT_IMG_SIZE = 40
  constructor(public id: number, public pageNumber: number, public url: string, public bo: Boundary) {
    this.btnPlay.src = 'img/icons/play.png'
  }
  draw(ctx: CanvasRenderingContext2D, zoom: number): void {
    ctx.drawImage(this.btnPlay, this.bo.a.x * zoom, this.bo.a.y * zoom, this.DEFAULT_IMG_SIZE * zoom, this.DEFAULT_IMG_SIZE * zoom) // 80 is width and height of the actual play.png icon
  }
  isInsideBoundary(x: number, y: number, zoom: number): boolean {
    return x >= this.bo.a.x*zoom && x <= this.bo.a.x*zoom+this.DEFAULT_IMG_SIZE && y >= this.bo.a.y*zoom && y <= this.bo.a.y*zoom+this.DEFAULT_IMG_SIZE
  }
}