export class Point {
  constructor(public x: number, public y: number) {

  }
}
export class Boundaries {
  constructor(public a: Point, public b: Point) {
  }
}
export class Line {
  constructor(public bo: Boundaries, public editing: boolean) {
  }
}