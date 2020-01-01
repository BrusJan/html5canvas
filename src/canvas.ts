class Point {
  constructor(public x: number, public y: number) {
  }
}
class Boundaries {
  constructor(public a: Point, public b: Point) {
  }
}
class Line {
  constructor(public bo: Boundaries, public editing: boolean) {
  }
}
class BrushStroke {
  constructor(public points: Array<Point>) {
  }
}

var MAX_BRUSH_POINT_COUNT = 100
var cvWidth = 600
var cvHeight = 800
var tool = 0 // 0 = none, 1 = line, 2 = text
var drawnObjects = new Array<any>()
var newLine = new Line(new Boundaries(new Point(0, 0), new Point(0, 0)), false)
var brushIsDrawing = false
var brushPoints = new Array<Point>()
var brushLastPoint = new Point(0, 0)
var brushCurrentPoint = new Point(0, 0)

var imgOrig = new Image()
var imgDone = new Image()
var imgUsr = new Image()
var pageNumber = 1

function lineClick() {
  setTool(1)
}
function brushClick() {
  setTool(2)
}
function textClick() {
  setTool(3)
  console.info({ drawnObjects })
}

function setTool(t: number) {
  tool = t
  let ispan = document.getElementById('i-tool')
  if (ispan) ispan.innerHTML = t.toString()
}

window.onload = function () {
  setTool(0)
  const cv = <HTMLCanvasElement>document.getElementById('canvas')
  const ctx = cv.getContext("2d")
  cv.addEventListener("mousedown", handleMouseDown)
  cv.addEventListener("mouseup", handleMouseUp)
  cv.addEventListener("mousemove", handleMouseMove)
  this.imgOrig.src = 'img/' + pageNumber.toString() + '.png'

  // button prev page click must be async to redraw image after a small delay, otherwise it does not redraw
  async function prevPage() {
    cv.focus()
    pageNumber = --pageNumber
    imgOrig.src = 'img/' + pageNumber.toString() + '.png'
    console.info('page: ' + pageNumber)
    // sleep for  10ms so the picture redraws
    await new Promise(r => setTimeout(r, 50));
    redrawCanvas()
  }
  var prevbtn = document.getElementById('btnPrevPage')
  if (prevbtn) prevbtn.onclick = prevPage

  // button next page click must be async to redraw image after a small delay, otherwise it does not redraw
  async function nextPage() {
    cv.focus()
    pageNumber = ++pageNumber
    imgOrig.src = 'img/' + pageNumber.toString() + '.png'
    console.info('page: ' + pageNumber)
    // sleep for  10ms so the picture redraws
    await new Promise(r => setTimeout(r, 50));
    redrawCanvas()
  }
  var nextbtn = document.getElementById('btnNextPage')
  if (nextbtn) nextbtn.onclick = nextPage

  function handleMouseDown(e: MouseEvent) {
    const rect = cv.getBoundingClientRect()
    switch (tool) {
      case 0: return;
      case 1:
        newLine = new Line(new Boundaries(new Point(e.clientX - rect.left, e.clientY - rect.top), new Point(0, 0)), true)
        break;
      case 2:
        brushPoints.push(new Point(e.clientX - rect.left, e.clientY - rect.top))
        brushCurrentPoint = new Point(e.clientX - rect.left, e.clientY - rect.top)
        brushLastPoint = new Point(e.clientX - rect.left, e.clientY - rect.top)
        brushIsDrawing = true;
        break;
    }

  }

  function handleMouseUp(e: MouseEvent) {
    switch (tool) {
      case 0: return;
      case 1:
        const rect = cv.getBoundingClientRect()
        newLine.bo.b.x = e.clientX - rect.left
        newLine.bo.b.y = e.clientY - rect.top
        newLine.editing = false
        // if line is too short, do not create it
        if (Math.abs(newLine.bo.a.x - newLine.bo.b.x) > 3 || Math.abs(newLine.bo.a.y - newLine.bo.b.y) > 3) {
          // object assign to create new object and not use the same refference over and over
          drawnObjects.push(newLine)
          newLine = new Line(new Boundaries(new Point(0, 0), new Point(0, 0)), false)
        }
        redrawCanvas()
        break;
      case 2:
        if (brushIsDrawing) finishBrushStroke()
        break;
    }
  }

  function handleMouseMove(e: MouseEvent) {
    const rect = cv.getBoundingClientRect()
    switch (tool) {
      case 0: return
      case 1:
        newLine.bo.b.x = e.clientX - rect.left
        newLine.bo.b.y = e.clientY - rect.top
        redrawCanvas()
        break
      case 2:
        if (!brushIsDrawing) break;
        brushCurrentPoint.x = e.clientX - rect.left
        brushCurrentPoint.y = e.clientY - rect.top
        if (Math.abs(brushCurrentPoint.x - brushLastPoint.x) > 3 || Math.abs(brushCurrentPoint.y - brushLastPoint.y) > 20) {
          brushPoints.push(brushCurrentPoint)
          brushLastPoint = new Point(e.clientX - rect.left, e.clientY - rect.top)
          brushCurrentPoint = new Point(e.clientX - rect.left, e.clientY - rect.top)
        }
        if (brushPoints.length >= MAX_BRUSH_POINT_COUNT) finishBrushStroke()
        redrawCanvas()
        break
    }
  }

  function redrawCanvas() {
    if (!ctx) return;
    ctx.clearRect(0, 0, cv.width, cv.height)

    ctx.drawImage(imgOrig, 0, 0, cv.width, cv.height)

    ctx.lineCap = "round"
    ctx.lineJoin = "round"

    // draw objects
    drawnObjects.forEach(object => {
      if (object instanceof Line) {
        ctx.lineWidth = 2
        ctx.strokeStyle = "black"
        ctx.beginPath()
        ctx.moveTo(object.bo.a.x, object.bo.a.y)
        ctx.lineTo(object.bo.b.x, object.bo.b.y)
        ctx.stroke()
        ctx.closePath()
      } else if (object instanceof BrushStroke) {
        ctx.lineWidth = 10
        ctx.strokeStyle = "red"
        ctx.beginPath()
        ctx.moveTo(object.points[0].x, object.points[0].y)
        // i = index of single point in a brush stroke
        for (let i = 1; i < object.points.length; i++) {
          ctx.lineTo(object.points[i].x, object.points[i].y)
          ctx.stroke()
        }
        ctx.closePath()
      }
    });

    // draw current line
    ctx.lineWidth = 2
    ctx.strokeStyle = "black"
    ctx.beginPath()
    if (newLine.editing) {
      ctx.moveTo(newLine.bo.a.x, newLine.bo.a.y)
      ctx.lineTo(newLine.bo.b.x, newLine.bo.b.y)
      ctx.stroke();
    }
    // draw current brush
    ctx.lineWidth = 10
    ctx.strokeStyle = "red"
    if (brushIsDrawing) {
      ctx.beginPath()
      ctx.moveTo(brushPoints[0].x, brushPoints[0].y)
      // i = index of single point in a brush stroke
      for (let i = 1; i < brushPoints.length; i++) {
        ctx.lineTo(brushPoints[i].x, brushPoints[i].y)
        ctx.stroke()
      }
      ctx.closePath()
    }
  }

  function finishBrushStroke() {
    brushIsDrawing = false;
    drawnObjects.push(new BrushStroke(brushPoints))
    brushPoints = []
  }
};
// switch (tool) {
//   case 0: return;
//   case 1:
//     break;
//   case 2:
//     break;
// }


