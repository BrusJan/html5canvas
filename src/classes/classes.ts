export class TypedText implements Drawable {
  constructor(public text: string[], public bo: Boundaries, public editing: boolean) {
  }
  draw(ctx: CanvasRenderingContext2D, zoom: number): void {
    let fontsize = 30 * zoom
    ctx.font = fontsize + "px Arial"
    ctx.fillText(this.text[this.text.length - 1], this.bo.a.x * zoom, (this.bo.a.y + fontsize) * zoom)
  }
  
}
export class DrawnObject {
  constructor(public obj: any, public pageNumber: number) {
  }
}
export class Point {
  constructor(public x: number, public y: number) {
  }
}
export class Boundaries {
  constructor(public a: Point, public b: Point) {
  }
}
export class Line implements Drawable {
  constructor(public bo: Boundaries, public editing: boolean) {
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