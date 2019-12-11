class Point {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
}

class Boundaries {
  constructor(a, b) {
    this.a = a;
    this.b = b;
  }
}

var MAX_BRUSH_POINT_COUNT = 100
var tool = 0 // 0 = none, 1 = line, 2 = text
var newLine = { boundaries: new Boundaries(new Point(0, 0), new Point(0, 0)), editing: false }
var brushStrokes = []
var brushIsDrawing = false
var brushPoints = []
var brushLastPoint = new Point(0, 0);
var brushCurrentPoint = new Point(0, 0);
var lines = []

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
function setTool(t) {
  tool = t
  let ispan = document.getElementById('i-tool')
  ispan.innerHTML = t
}

window.onload = function () {
  setTool(0)
  const cv = document.querySelector('#canvas');
  const ctx = cv.getContext("2d");
  cv.addEventListener("mousedown", handleMouseDown);
  cv.addEventListener("mouseup", handleMouseUp);
  cv.addEventListener("mousemove", handleMouseMove);

  function handleMouseDown(e) {
    const rect = cv.getBoundingClientRect()
    switch (tool) {
      case 0: return;
      case 1:
        newLine = { boundaries: new Boundaries(new Point(parseInt(e.clientX - rect.left), parseInt(e.clientY - rect.top)), new Point(0, 0)), editing: true }
        break;
      case 2:
        brushPoints.push(new Point(parseInt(e.clientX - rect.left), parseInt(e.clientY - rect.top)))
        brushCurrentPoint = new Point(parseInt(e.clientX - rect.left), parseInt(e.clientY - rect.top))
        brushLastPoint = new Point(parseInt(e.clientX - rect.left), parseInt(e.clientY - rect.top))
        brushIsDrawing = true;
        break;
    }

  }

  function handleMouseUp(e) {
    switch (tool) {
      case 0: return;
      case 1:
        const rect = cv.getBoundingClientRect()
        newLine.boundaries.b.x = parseInt(e.clientX - rect.left)
        newLine.boundaries.b.y = parseInt(e.clientY - rect.top)
        newLine.editing = false
        // if line is too short, do not create it
        if (Math.abs(newLine.boundaries.a.x - newLine.boundaries.b.x) > 3 || Math.abs(newLine.boundaries.a.y - newLine.boundaries.b.y) > 3) {
          // object assign to create new object and not use the same refference over and over
          lines.push(newLine)
          newLine = { boundaries: new Boundaries(new Point(0, 0), new Point(0, 0)), editing: false }
        }
        redrawCanvas()
        break;
      case 2:
        if (brushIsDrawing) finishBrushStroke()
        break;
    }
  }

  function handleMouseMove(e) {
    const rect = cv.getBoundingClientRect()
    switch (tool) {
      case 0: return
      case 1:
        newLine.boundaries.b.x = parseInt(e.clientX - rect.left)
        newLine.boundaries.b.y = parseInt(e.clientY - rect.top)
        redrawCanvas()
        break
      case 2:
        if (!brushIsDrawing) break;
        brushCurrentPoint.x = parseInt(e.clientX - rect.left)
        brushCurrentPoint.y = parseInt(e.clientY - rect.top)
        if (Math.abs(brushCurrentPoint.x - brushLastPoint.x) > 3 || Math.abs(brushCurrentPoint.y - brushLastPoint.y) > 20) {
          brushPoints.push(brushCurrentPoint)
          brushLastPoint = new Point(parseInt(e.clientX - rect.left), parseInt(e.clientY - rect.top))
          brushCurrentPoint = new Point(parseInt(e.clientX - rect.left), parseInt(e.clientY - rect.top))
        }
        if (brushPoints.length >= MAX_BRUSH_POINT_COUNT) finishBrushStroke()
        redrawCanvas()
        break
    }
  }

  function redrawCanvas() {
    ctx.clearRect(0, 0, cv.width, cv.height)
    ctx.lineCap = "round"
    ctx.lineJoin = "round"

    // draw lines
    ctx.lineWidth = 2
    ctx.strokeStyle = "black"
    ctx.beginPath()
    if (newLine.editing) {
      ctx.moveTo(newLine.boundaries.a.x, newLine.boundaries.a.y)
      ctx.lineTo(newLine.boundaries.b.x, newLine.boundaries.b.y)
      ctx.stroke();
    }
    for (let i = 0; i < lines.length; i++) {
      ctx.moveTo(lines[i].boundaries.a.x, lines[i].boundaries.a.y)
      ctx.lineTo(lines[i].boundaries.b.x, lines[i].boundaries.b.y)
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


