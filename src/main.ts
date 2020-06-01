import { DrawnObject, Boundary, Line, BrushStroke, Point } from './classes/classes.js';
import { TypedText } from './classes/typed-text.js';

var MAX_BRUSH_POINT_COUNT = 100
var FONTSIZE = 30
var cvWidth = 600
var cvHeight = 800
var tool = 0 // 0 = none, 1 = line, 2 = text
var version = 2 // 1 = original, 2 = my edit, 3 = solution
var zoom = 1
var drawnObjects = new Array<DrawnObject>()
var newLine = new Line(new Boundary(new Point(0, 0), new Point(0, 0)), false)
var brushIsDrawing = false
var newText = TypedText.getNewTypedText();
var brushPoints = new Array<Point>()
var brushLastPoint = new Point(0, 0)
var brushCurrentPoint = new Point(0, 0)

var image1 = new Image()
var image2 = new Image()
var imgDone = new Image()
var imgUsr = new Image()
var pageNumber = 1

function setTool(t: number) {
  tool = t
  switch (t) {
    case 1:
      (<HTMLButtonElement>document.getElementById('line')).classList.replace('enabled', 'disabled');
      (<HTMLButtonElement>document.getElementById('brush')).classList.replace('disabled', 'enabled');
      (<HTMLButtonElement>document.getElementById('text')).classList.replace('disabled', 'enabled');
      break
    case 2:
      (<HTMLButtonElement>document.getElementById('line')).classList.replace('disabled', 'enabled');
      (<HTMLButtonElement>document.getElementById('brush')).classList.replace('enabled', 'disabled');
      (<HTMLButtonElement>document.getElementById('text')).classList.replace('disabled', 'enabled');
      break
    case 3:
      (<HTMLButtonElement>document.getElementById('line')).classList.replace('disabled', 'enabled');
      (<HTMLButtonElement>document.getElementById('brush')).classList.replace('disabled', 'enabled');
      (<HTMLButtonElement>document.getElementById('text')).classList.replace('enabled', 'disabled');
      break
  }
}
function zoomCanvas(z: number) {
  zoom += z
  let inputZoomInfo = <HTMLInputElement>document.getElementById('inputZoomInfo')
  if (inputZoomInfo) inputZoomInfo.value = ((zoom - 1) * 100).toString() + '%'
  document.getElementById('text-input').style.fontSize = TypedText.FONTSIZE * zoom + 'px'
}

window.onload = function () {
  setTool(0)
  setImgSrc()
  window.addEventListener("resize", function (event) {
    setImgSrc()
  });

  const cv = <HTMLCanvasElement>document.getElementById('canvas')
  cv.addEventListener("scroll", function (event) {
    var scroll = this.scrollTop;
    console.log(scroll)
  });
  const textArea = <HTMLTextAreaElement>document.getElementById('text-input')
  const ctx = cv.getContext("2d")
  const inputPageNumber = <HTMLInputElement>document.getElementById('inputPageNumber')
  const btnPrevPage = <HTMLButtonElement>document.getElementById('btnPrevPage')
  const btnNextPage = <HTMLButtonElement>document.getElementById('btnNextPage')
  const btnToolLine = <HTMLButtonElement>document.getElementById('line')
  const btnToolBrush = <HTMLButtonElement>document.getElementById('brush')
  const btnToolText = <HTMLButtonElement>document.getElementById('text')
  const btnToolZoomIn = <HTMLButtonElement>document.getElementById('zoomin')
  const btnToolZoomOut = <HTMLButtonElement>document.getElementById('zoomout')
  const lblSwitch1 = <HTMLLabelElement>document.getElementById('lblSwitch1')
  const lblSwitch2 = <HTMLLabelElement>document.getElementById('lblSwitch2')
  const lblSwitch3 = <HTMLLabelElement>document.getElementById('lblSwitch3')
  inputPageNumber.value = pageNumber.toString()
  cv.addEventListener("mousedown", handleMouseDown)
  cv.addEventListener("mouseup", handleMouseUp)
  cv.addEventListener("mousemove", handleMouseMove)
  cv.addEventListener("keyup", handleKeyUp)
  textArea.addEventListener("mouseup", handleMouseUp)

  // set initial zoom text in input
  let inputZoomInfo = <HTMLInputElement>document.getElementById('inputZoomInfo')
  if (inputZoomInfo) inputZoomInfo.value = ((zoom - 1) * 100).toString() + '%'

  // first call, calls request animation frame inside so it cycles inside after this one call
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
      event.preventDefault()
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
  btnToolLine.addEventListener("click", function (event) {
    setTool(1)
  })
  btnToolBrush.addEventListener("click", function (event) {
    setTool(2)
  })
  btnToolText.addEventListener("click", function (event) {
    setTool(3)
  })
  btnToolZoomIn.addEventListener("click", function (event) {
    zoomCanvas(0.25)
  })
  btnToolZoomOut.addEventListener("click", function (event) {
    zoomCanvas(-0.25)
  })

  function prevPage() {
    pageNumber = pageNumber - 2
    if (pageNumber < 1) {
      pageNumber = 1
      btnPrevPage.disabled = true
    }
    setImgSrc()
    inputPageNumber.value = pageNumber.toString()
  }
  var prevbtn = document.getElementById('btnPrevPage')
  if (prevbtn) prevbtn.onclick = prevPage

  function nextPage() {
    pageNumber = pageNumber + 2
    if (pageNumber == 2) {
      btnPrevPage.disabled = false
    }
    setImgSrc()
    inputPageNumber.value = pageNumber.toString()
  }
  var nextbtn = document.getElementById('btnNextPage')
  if (nextbtn) nextbtn.onclick = nextPage

  function handleKeyUp(e: KeyboardEvent) {
    if (newText.textTyping) {
      if (e.keyCode == 27) finishText()
      else newText.handleKeyUp(e)
    }
  }
  function handleMouseDown(e: MouseEvent) {
    // do stuff only when version 2 is active (moje upravy)
    if (version != 2) return
    const rect = cv.getBoundingClientRect()
    var x = e.clientX - rect.left
    var y = e.clientY - rect.top
    switch (tool) {
      case 0: return
      case 1:
        newLine = new Line(new Boundary(new Point(x, y), new Point(x, y)), true)
        break
      case 2:
        brushPoints.push(new Point(x, y))
        brushCurrentPoint = new Point(x, y)
        brushLastPoint = new Point(x, y)
        brushIsDrawing = true
        break
      case 3:
        newText.handleMouseDown(x, y, zoom)
        break
    }
  }

  function handleMouseUp(e: MouseEvent) {
    // do stuff only when version 2 is active (moje upravy)
    if (version != 2) return
    const rect = cv.getBoundingClientRect()
    var x = e.clientX - rect.left
    var y = e.clientY - rect.top
    switch (tool) {
      case 0: return; // no tool
      case 1: // line
        // recalculate original point
        newLine.bo.a.x /= zoom
        newLine.bo.a.y /= zoom
        // set end point
        newLine.bo.b.x = x / zoom
        newLine.bo.b.y = y / zoom
        newLine.editing = false
        // if line is too short, do not create it
        if (Math.abs(newLine.bo.a.x - newLine.bo.b.x) > 3 || Math.abs(newLine.bo.a.y - newLine.bo.b.y) > 3) {
          // object assign to create new object and not use the same refference over and over
          drawnObjects.push(new DrawnObject(newLine, pageNumber))
          newLine = new Line(new Boundary(new Point(0, 0), new Point(0, 0)), false)
        }
        break
      case 2: //brush
        if (brushIsDrawing) finishBrushStroke()
        break
      case 3: // text        
        if (newText.textTyping && !newText.isInsideBoundaries(x, y, zoom)) {
          // if click is away from boundaries, finish text
          finishText()
        } else newText.handleMouseUp(x, y, zoom)
        break
    }
  }

  function handleMouseMove(e: MouseEvent) {
    // do stuff only when version 2 is active (moje upravy)
    if (version != 2) return
    const rect = cv.getBoundingClientRect()
    var x = e.clientX - rect.left
    var y = e.clientY - rect.top
    switch (tool) {
      case 0: return
      case 1:
        newLine.bo.b.x = x
        newLine.bo.b.y = y
        break
      case 2:
        if (!brushIsDrawing) break
        brushCurrentPoint.x = x
        brushCurrentPoint.y = y
        if (Math.abs(brushCurrentPoint.x - brushLastPoint.x) > 3 || Math.abs(brushCurrentPoint.y - brushLastPoint.y) > 20) {
          brushPoints.push(brushCurrentPoint)
          brushLastPoint = new Point(x, y)
          brushCurrentPoint = new Point(x, y)
        }
        if (brushPoints.length >= MAX_BRUSH_POINT_COUNT) finishBrushStroke()
        break
      case 3: // text
        newText.handleMouseMove(x, y, zoom)
        break
    }
  }

  function redrawCanvas() {
    if (!ctx) return
    cv.width = (image1.width * zoom) + (image2.width * zoom)
    if (image1.height > image2.height) cv.height = image1.height * zoom
    else cv.height = image2.height * zoom

    ctx.clearRect(0, 0, cv.width, cv.height)

    ctx.drawImage(image1, 0, 0, image1.width * zoom, image1.height * zoom)
    ctx.drawImage(image2, image1.width * zoom, 0, image2.width * zoom, image2.height * zoom)

    ctx.lineCap = "round"
    ctx.lineJoin = "round"

    // draw all objects only if version 2 is active (moje upravy)
    if (version == 2) {
      // draw finished objects
      drawnObjects.forEach(object => {
        if (object.pageNumber != pageNumber) return
        object.obj.draw(ctx, zoom)
      })

      // draw current line
      if (newLine.editing) {
        newLine.draw(ctx, 1) // current line pixels fit mouse location, are recalculated by zoom on mouse up
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
      // draw current text
      newText.draw(ctx, zoom)
    }


    requestAnimationFrame(redrawCanvas)
  }

  function finishBrushStroke() {
    brushIsDrawing = false
    brushPoints.forEach(point => {
      point.x /= zoom
      point.y /= zoom
    })
    drawnObjects.push(new DrawnObject(new BrushStroke(brushPoints), pageNumber))
    brushPoints = []
  }

  function finishText() {
    newText.finishText();

    drawnObjects.push(new DrawnObject(newText, pageNumber))
    newText = TypedText.getNewTypedText();
  }

  // 1 = original, 2 = my edit, 3 = solution
  function switchVersion(v: number) {
    version = v
    setImgSrc()
  }

  function setImgSrc() {
    console.info('version ' + version)
    image1.onload = function () {
      console.info('image1.naturalHeight ' + image1.naturalHeight);
      image1.width = vw / 2
      let resizeRatio1 = image1.naturalWidth / ((vw + 20) / 2)
      image1.height = image1.naturalHeight / resizeRatio1
    }
    image2.onload = function () {
      console.info('image2.naturalHeight ' + image2.naturalHeight);
      image2.width = vw / 2
      let resizeRatio2 = image2.naturalWidth / ((vw + 20) / 2)
      image2.height = image2.naturalHeight / resizeRatio2
    }
    if (version == 1) {
      image1.src = 'img/' + pageNumber.toString() + '.png'
      image2.src = 'img/' + (pageNumber + 1).toString() + '.png'
    }
    if (version == 2) {
      image1.src = 'img/' + pageNumber.toString() + '.png'
      image2.src = 'img/' + (pageNumber + 1).toString() + '.png'
    }
    if (version == 3) {
      image1.src = 'img/' + pageNumber.toString() + '_r.png'
      image2.src = 'img/' + (pageNumber + 1).toString() + '_r.png'
    }
    const vw = Math.max(document.documentElement.clientWidth, window.innerWidth || 0) - 20
    console.info('window width ' + vw)

  }

}



