import { DrawnObject, Boundary, Line, BrushStroke, Point, MainData, MediaAudio, MediaVideo } from './classes/classes.js';
import { TypedText } from './classes/typed-text.js';

var MAX_BRUSH_POINT_COUNT = 100
var FONTSIZE = 30
var cvWidth = 600
var cvHeight = 800
var tool = 0 // 0 = none, 1 = line, 2 = text
var version = 1 // 1 = original, 2 = my edit, 3 = solution
var zoom = 1
var drawnObjects = new Array<DrawnObject>()
var newLine = new Line(new Boundary(new Point(0, 0), new Point(0, 0)), false)
var brushIsDrawing = false
var newText = TypedText.getNewTypedText()
var brushPoints = new Array<Point>()
var brushLastPoint = new Point(0, 0)
var brushCurrentPoint = new Point(0, 0)

var image1 = new Image()
var image2 = new Image()
var pageNumber = 1
var multimedia = new Array<any>()

var mainData = new MainData(null, null, null)

function setTool(t: number) {
  tool = t
  switch (t) {
    case 1:
      (<HTMLButtonElement>document.getElementById('line')).classList.replace('not-selected', 'selected');
      (<HTMLButtonElement>document.getElementById('brush')).classList.replace('selected', 'not-selected');
      (<HTMLButtonElement>document.getElementById('text')).classList.replace('selected', 'not-selected');
      break
    case 2:
      (<HTMLButtonElement>document.getElementById('line')).classList.replace('selected', 'not-selected');
      (<HTMLButtonElement>document.getElementById('brush')).classList.replace('not-selected', 'selected');
      (<HTMLButtonElement>document.getElementById('text')).classList.replace('selected', 'not-selected');
      break
    case 3:
      (<HTMLButtonElement>document.getElementById('line')).classList.replace('selected', 'not-selected');
      (<HTMLButtonElement>document.getElementById('brush')).classList.replace('selected', 'not-selected');
      (<HTMLButtonElement>document.getElementById('text')).classList.replace('not-selected', 'selected');
      break
  }
}
function zoomCanvas(z: number) {
  zoom += z
  let inputZoomInfo = <HTMLInputElement>document.getElementById('inputZoomInfo')
  if (inputZoomInfo) inputZoomInfo.value = ((zoom) * 100).toString() + '%'
  document.getElementById('text-input').style.fontSize = TypedText.FONTSIZE * zoom + 'px'
}

window.onload = function () {

  var xhttp = new XMLHttpRequest();
  //xhttp.open("GET", "http://iklett.cz/new/test3.php?id=110823", true)
  
  xhttp.open("GET", "http://localhost:5501/dist/data.json", true)
  xhttp.onreadystatechange = function () {
    if (this.readyState == 4 && this.status == 200) {
      console.info(xhttp.responseText)
      mainData = JSON.parse(xhttp.responseText)
      zoom = +mainData.settings.zoom
      setImgSrc()
      // fill multimedia array
      mainData.pages.forEach(page => {
        if (page.multimedia)
          page.multimedia.forEach(mm => {
            if (mm.type == 0) multimedia.push(new MediaAudio(mm.id, page.pageNumber, mm.file, new Boundary(new Point(mm.x, mm.y), new Point(mm.x + mm.width, mm.y + mm.height))))
          })
      });
      // first call, calls request animation frame inside so it cycles inside after this one call
      redrawCanvas()
    }
  }
  xhttp.send()

  setTool(0)
  setImgSrc()
  window.addEventListener("resize", function (event) {
    setImgSrc()
  });

  const cv = <HTMLCanvasElement>document.getElementById('canvas')
  cv.addEventListener("scroll", function (event) {
    var scroll = this.scrollTop
    console.log(scroll)
  })
  const textArea = <HTMLTextAreaElement>document.getElementById('text-input')
  const ctx = cv.getContext("2d")
  const inputPageNumber = <HTMLInputElement>document.getElementById('inputPageNumber')
  const btnPrevPage = <HTMLButtonElement>document.getElementById('btnPrevPage')
  const btnNextPage = <HTMLButtonElement>document.getElementById('btnNextPage')
  const btnFirstPage = <HTMLButtonElement>document.getElementById('btnFirstPage')
  const btnLastPage = <HTMLButtonElement>document.getElementById('btnLastPage')
  const btnToolLine = <HTMLButtonElement>document.getElementById('line')
  const btnToolBrush = <HTMLButtonElement>document.getElementById('brush')
  const btnToolText = <HTMLButtonElement>document.getElementById('text')
  const btnToolZoomIn = <HTMLButtonElement>document.getElementById('zoomin')
  const btnToolZoomOut = <HTMLButtonElement>document.getElementById('zoomout')
  const lblSwitch1 = <HTMLLabelElement>document.getElementById('lblSwitch1')
  const lblSwitch2 = <HTMLLabelElement>document.getElementById('lblSwitch2')
  const lblSwitch3 = <HTMLLabelElement>document.getElementById('lblSwitch3')
  const audioMedia = <HTMLAudioElement>document.getElementById('audio-media')
  inputPageNumber.value = pageNumber.toString()
  cv.addEventListener("mousedown", handleMouseDown)
  cv.addEventListener("mouseup", handleMouseUp)
  cv.addEventListener("mousemove", handleMouseMove)
  cv.addEventListener("keyup", handleKeyUp)
  textArea.addEventListener("mouseup", handleMouseUp)

  // set initial zoom text in input
  let inputZoomInfo = <HTMLInputElement>document.getElementById('inputZoomInfo')
  if (inputZoomInfo) inputZoomInfo.value = ((zoom - 1) * 100).toString() + '%'

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


  btnPrevPage.onclick = function () {
    pageNumber = pageNumber - 2
    if (pageNumber == 1 || pageNumber < 1) goToFirstPage()
    btnNextPage.disabled = false
    btnLastPage.disabled = true
    setImgSrc()
    inputPageNumber.value = pageNumber.toString()
  }

  btnNextPage.onclick = function () {
    pageNumber = pageNumber + 2
    if (pageNumber >= mainData.pages.length - 1) goToLastPage()
    btnPrevPage.disabled = false
    btnFirstPage.disabled = false
    setImgSrc()
    inputPageNumber.value = pageNumber.toString()
  }

  btnFirstPage.onclick = function () {
    goToFirstPage()
  }

  function goToFirstPage() {
    pageNumber = 1
    btnPrevPage.disabled = true
    btnFirstPage.disabled = true
    btnLastPage.disabled = false
    btnNextPage.disabled = false
    setImgSrc()
    inputPageNumber.value = pageNumber.toString()
  }

  btnLastPage.onclick = function () {
    goToLastPage()
  }

  function goToLastPage() {
    pageNumber = mainData.pages.length - 1
    btnPrevPage.disabled = false
    btnFirstPage.disabled = false
    btnLastPage.disabled = true
    btnNextPage.disabled = true
    setImgSrc()
    inputPageNumber.value = pageNumber.toString()
  }

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
    if (version == 1) {
      const rect = cv.getBoundingClientRect()
      var x = e.clientX - rect.left
      var y = e.clientY - rect.top
      multimedia.forEach(mm => {
        if (mm.isInsideBoundary(x, y, zoom)) {
          audioMedia.style.display = 'block'
          audioMedia.style.left = mm.bo.a.x*zoom + 'px'
          audioMedia.style.top = mm.bo.a.y*zoom + 'px'
          audioMedia.src = mm.url
        }
      });
    }

    if (version != 2) return
    const rect = cv.getBoundingClientRect()
    var x = e.clientX - rect.left
    var y = e.clientY - rect.top
    switch (tool) {
      case 0: return // no tool
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
    //cv.width = (image1.width * zoom) + (image2.width * zoom)
    cv.width = window.innerWidth * zoom
    cv.height = image1.height > image2.height ? image1.height * zoom : image2.height * zoom

    ctx.clearRect(0, 0, cv.width, cv.height)
    if (image1.complete)
      ctx.drawImage(image1, 0, 0, cv.width / 2, (((cv.width / image1.width)) * image1.height) / 2)
    if (image2.complete)
      ctx.drawImage(image2, cv.width / 2, 0, cv.width / 2, (((cv.width / image2.width)) * image2.height) / 2)

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

    // draw multimedia objects
    multimedia.forEach(mm => {
      if (mm.pageNumber != pageNumber) return;
      mm.draw(ctx, zoom)
    });

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
    newText.finishText()
    drawnObjects.push(new DrawnObject(newText, pageNumber))
    newText = TypedText.getNewTypedText()
  }

  // 1 = original, 2 = my edit, 3 = solution
  function switchVersion(v: number) {
    version = v
    if (v == 2) {
      btnToolBrush.classList.remove('unavailable'); btnToolBrush.disabled = null;
      btnToolLine.classList.remove('unavailable'); btnToolLine.disabled = null;
      btnToolText.classList.remove('unavailable'); btnToolText.disabled = null;
    }
    else {
      btnToolBrush.classList.add('unavailable'); btnToolBrush.disabled = true
      btnToolLine.classList.add('unavailable'); btnToolLine.disabled = true
      btnToolText.classList.add('unavailable'); btnToolText.disabled = true
    }
    setImgSrc()
  }

  function setImgSrc() {

    const vw = Math.max(document.documentElement.clientWidth, window.innerWidth || 0) - 20

    if (mainData.pages && mainData.pages.length >= 2) {
      console.info('multimedia.length: ' + multimedia.length)
      console.info('maindata loaded')
      if (version == 1) {
        image1.src = mainData.pages.find(page => page.pageNumber == pageNumber).imgO
        image2.src = mainData.pages.find(page => page.pageNumber == pageNumber + 1).imgO
      }
      if (version == 2) {
        image1.src = mainData.pages.find(page => page.pageNumber == pageNumber).imgU
        image2.src = mainData.pages.find(page => page.pageNumber == pageNumber + 1).imgU
      }
      if (version == 3) {
        image1.src = mainData.pages.find(page => page.pageNumber == pageNumber).imgR
        image2.src = mainData.pages.find(page => page.pageNumber == pageNumber + 1).imgR
      }
    } else {
      console.info('main data not loaded')
    }

    image1.onload = function () {
      console.info('image1.naturalHeight ' + image1.naturalHeight)
      image1.width = vw / 2
      let resizeRatio1 = image1.naturalWidth / ((vw + 20) / 2)
      image1.height = image1.naturalHeight / resizeRatio1
    }
    image1.onerror = function () {
      console.info('image1 src failed to load')
      image1.src = 'img/icons/unavailable.png'
    }
    image2.onload = function () {
      console.info('image2.naturalHeight ' + image2.naturalHeight)
      image2.width = vw / 2
      let resizeRatio2 = image2.naturalWidth / ((vw + 20) / 2)
      image2.height = image2.naturalHeight / resizeRatio2
    }
    image2.onerror = function () {
      console.info('image2 src failed to load')
      image2.src = 'img/icons/unavailable.png'
    }

  }

}



