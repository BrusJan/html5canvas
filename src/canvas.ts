class DrawnObject {
  constructor(public obj: any, public pageNumber: number) {
  }
}
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
var version = 2 // 1 = original, 2 = my edit, 3 = solution
var zoom = 1
var drawnObjects = new Array<DrawnObject>()
var newLine = new Line(new Boundaries(new Point(0, 0), new Point(0, 0)), false)
var brushIsDrawing = false
var brushPoints = new Array<Point>()
var brushLastPoint = new Point(0, 0)
var brushCurrentPoint = new Point(0, 0)

var image = new Image()
var imgDone = new Image()
var imgUsr = new Image()
var pageNumber = 1

function setTool(t: number) {
  tool = t
  switch (t) {
    case 1: 
      document.getElementById('line')?.classList.replace('enabled','disabled')
      document.getElementById('brush')?.classList.replace('disabled','enabled')
      break;
    case 2: 
    document.getElementById('line')?.classList.replace('disabled','enabled')
    document.getElementById('brush')?.classList.replace('enabled','disabled')
      break;
    case 3: break;
  }
}
function zoomCanvas(z: number) {
  zoom += z
  let ispan = document.getElementById('i-tool')
  if (ispan) ispan.innerHTML = 'zoom ' + zoom.toString()
}

window.onload = function () {
  setTool(0)
  setImgSrc()
  const cv = <HTMLCanvasElement>document.getElementById('canvas')
  const ctx = cv.getContext("2d")
  const inputPageNumber = <HTMLInputElement>document.getElementById('inputPageNumber')
  const btnPrevPage = <HTMLButtonElement>document.getElementById('btnPrevPage')
  const btnNextPage = <HTMLButtonElement>document.getElementById('btnNextPage')
  const lblSwitch1 = <HTMLLabelElement>document.getElementById('lblSwitch1')
  const lblSwitch2 = <HTMLLabelElement>document.getElementById('lblSwitch2')
  const lblSwitch3 = <HTMLLabelElement>document.getElementById('lblSwitch3')
  inputPageNumber.value = pageNumber.toString()
  cv.addEventListener("mousedown", handleMouseDown)
  cv.addEventListener("mouseup", handleMouseUp)
  cv.addEventListener("mousemove", handleMouseMove)

  // first call, calls request animation frame inside co it cycles inside after this one call
  redrawCanvas()

  inputPageNumber.addEventListener("change", function (event) {
    pageNumber = +inputPageNumber.value
    setImgSrc()
  })
  inputPageNumber.addEventListener("keyup", function (event) {
    console.info('input click')
    // Number 13 is the "Enter" key on the keyboard
    if (event.keyCode === 13) {
      // Cancel the default action, if needed
      console.info('input enter click')
      event.preventDefault();
      pageNumber = +inputPageNumber.value
    }
  })
  lblSwitch1.addEventListener("click", function (event) {
    switchVersion(1)
  })
  lblSwitch2.addEventListener("click", function (event) {
    switchVersion(2)
  })
  lblSwitch3.addEventListener("click", function (event) {
    switchVersion(3)
  })

  // button prev page click must be async to redraw image after a small delay, otherwise it does not redraw
  function prevPage() {
    pageNumber = --pageNumber
    if (pageNumber < 1) {
      pageNumber = 1
      btnPrevPage.disabled = true
    }
    setImgSrc()
    inputPageNumber.value = pageNumber.toString()
  }
  var prevbtn = document.getElementById('btnPrevPage')
  if (prevbtn) prevbtn.onclick = prevPage

  // button next page click must be async to redraw image after a small delay, otherwise it does not redraw
  function nextPage() {
    pageNumber = ++pageNumber
    if (pageNumber == 2) {
      btnPrevPage.disabled = false
    }
    setImgSrc()
    inputPageNumber.value = pageNumber.toString()
  }
  var nextbtn = document.getElementById('btnNextPage')
  if (nextbtn) nextbtn.onclick = nextPage

  function handleMouseDown(e: MouseEvent) {
    // do stuff only when version 2 is active (moje upravy)
    if (version != 2) return
    const rect = cv.getBoundingClientRect()
    switch (tool) {
      case 0: return;
      case 1:
        newLine = new Line(new Boundaries(new Point(e.clientX - rect.left, e.clientY - rect.top), new Point(e.clientX - rect.left, e.clientY - rect.top)), true)
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
    // do stuff only when version 2 is active (moje upravy)
    if (version != 2) return
    switch (tool) {
      case 0: return;
      case 1:
        const rect = cv.getBoundingClientRect()
        // recalculate original point
        newLine.bo.a.x /= zoom
        newLine.bo.a.y /= zoom
        // set end point
        newLine.bo.b.x = (e.clientX - rect.left) / zoom
        newLine.bo.b.y = (e.clientY - rect.top) / zoom
        newLine.editing = false
        // if line is too short, do not create it
        if (Math.abs(newLine.bo.a.x - newLine.bo.b.x) > 3 || Math.abs(newLine.bo.a.y - newLine.bo.b.y) > 3) {
          // object assign to create new object and not use the same refference over and over
          drawnObjects.push(new DrawnObject(newLine, pageNumber))
          newLine = new Line(new Boundaries(new Point(0, 0), new Point(0, 0)), false)
        }
        break;
      case 2:
        if (brushIsDrawing) finishBrushStroke()
        break;
    }
  }

  function handleMouseMove(e: MouseEvent) {
    // do stuff only when version 2 is active (moje upravy)
    if (version != 2) return
    const rect = cv.getBoundingClientRect()
    switch (tool) {
      case 0: return
      case 1:
        newLine.bo.b.x = e.clientX - rect.left
        newLine.bo.b.y = e.clientY - rect.top
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
        break
    }
  }

  function redrawCanvas() {
    if (!ctx) return
    cv.width = image.width * zoom
    cv.height = image.height * zoom
    ctx.clearRect(0, 0, cv.width, cv.height)

    ctx.drawImage(image, 0, 0, cv.width, cv.height)

    ctx.lineCap = "round"
    ctx.lineJoin = "round"

    // draw all objects only if version 2 is active (moje upravy)
    if (version == 2) {
      // draw objects
      drawnObjects.forEach(object => {
        if (object.pageNumber != pageNumber) return
        if (object.obj instanceof Line) {
          ctx.lineWidth = 2 * zoom
          ctx.strokeStyle = "black"
          ctx.beginPath()
          ctx.moveTo(object.obj.bo.a.x * zoom, object.obj.bo.a.y * zoom)
          ctx.lineTo(object.obj.bo.b.x * zoom, object.obj.bo.b.y * zoom)
          ctx.stroke()
          ctx.closePath()
        } else if (object.obj instanceof BrushStroke) {
          ctx.lineWidth = 10 * zoom
          ctx.strokeStyle = "red"
          ctx.beginPath()
          ctx.moveTo(object.obj.points[0].x * zoom, object.obj.points[0].y * zoom)
          // i = index of single point in a brush stroke
          for (let i = 1; i < object.obj.points.length; i++) {
            ctx.lineTo(object.obj.points[i].x * zoom, object.obj.points[i].y * zoom)
            ctx.stroke()
          }
          ctx.closePath()
        }
      });

      // draw current line
      ctx.lineWidth = 2 * zoom
      ctx.strokeStyle = "black"
      ctx.beginPath()
      if (newLine.editing) {
        ctx.moveTo(newLine.bo.a.x, newLine.bo.a.y)
        ctx.lineTo(newLine.bo.b.x, newLine.bo.b.y)
        ctx.stroke();
      }
      // draw current brush
      ctx.lineWidth = 10 * zoom
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


    requestAnimationFrame(redrawCanvas)
  }

  function finishBrushStroke() {
    brushIsDrawing = false;
    brushPoints.forEach(point => {
      point.x /= zoom
      point.y /= zoom
    })
    drawnObjects.push(new DrawnObject(new BrushStroke(brushPoints), pageNumber))
    brushPoints = []
  }

  // 1 = original, 2 = my edit, 3 = solution
  function switchVersion(v: number) {
    version = v
    setImgSrc()
  }

  function setImgSrc() {
    console.info('version ' + version)
    if (version == 1) image.src = 'img/' + pageNumber.toString() + '.png'
    if (version == 2) image.src = 'img/' + pageNumber.toString() + '.png'
    if (version == 3) image.src = 'img/' + pageNumber.toString() + '_r.png'
  }

};
// switch (tool) {
//   case 0: return;
//   case 1:
//     break;
//   case 2:
//     break;
// }


