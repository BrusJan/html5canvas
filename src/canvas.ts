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

var MAX_BRUSH_POINT_COUNT = 100
var cvWidth = 600
var cvHeight = 800
var tool = 0 // 0 = none, 1 = line, 2 = text
var newLine = new Line(new Boundaries(new Point(0, 0), new Point(0, 0)), false)
var brushStrokes = new Array<Point[]>() // should be saved
var brushIsDrawing = false
var brushPoints = new Array<Point>()
var brushLastPoint = new Point(0, 0)
var brushCurrentPoint = new Point(0, 0)
var lines = new Array<Line>() // should be saved

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
  console.info({ brushPoints })
  console.info({ brushStrokes })
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

  function prevPage() {
    pageNumber = pageNumber--
    imgOrig.src = 'img/' + pageNumber.toString() + '.png'
    redrawCanvas()
    
  }
  var prevbtn = document.getElementById('btnPrevPage')
  if (prevbtn) prevbtn.onclick = prevPage
  function nextPage() {
    pageNumber = pageNumber++
    imgOrig.src = 'img/' + pageNumber.toString() + '.png'
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
          lines.push(newLine)
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

    ctx.drawImage(imgOrig, 0, 0)

    ctx.lineCap = "round"
    ctx.lineJoin = "round"

    // draw lines
    ctx.lineWidth = 2
    ctx.strokeStyle = "black"
    ctx.beginPath()
    if (newLine.editing) {
      ctx.moveTo(newLine.bo.a.x, newLine.bo.a.y)
      ctx.lineTo(newLine.bo.b.x, newLine.bo.b.y)
      ctx.stroke();
    }
    for (let i = 0; i < lines.length; i++) {
      ctx.moveTo(lines[i].bo.a.x, lines[i].bo.a.y)
      ctx.lineTo(lines[i].bo.b.x, lines[i].bo.b.y)
      ctx.stroke()
    }
    ctx.closePath()

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
    // draw other brushes
    if (brushStrokes.length >= 1) {
      // j = index of whole stroke = array of points
      for (let j = 0; j < brushStrokes.length; j++) {
        ctx.beginPath()
        ctx.moveTo(brushStrokes[j][0].x, brushStrokes[j][0].y)
        // i = index of single point in a brush stroke
        for (let i = 1; i < brushStrokes[j].length; i++) {
          ctx.lineTo(brushStrokes[j][i].x, brushStrokes[j][i].y)
          ctx.stroke()
        }
        ctx.closePath()
      }
    }
  }

  function finishBrushStroke() {
    brushIsDrawing = false;
    brushStrokes.push(brushPoints)
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


