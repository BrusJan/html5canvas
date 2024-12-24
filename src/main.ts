import { DrawnObject, Boundary, Line, BrushStroke, Point, MainData, MediaAudio, MediaVideo, Square, Ellipse } from './classes/classes.js';
import { TypedText } from './classes/typed-text.js';
import { ToolBox } from './toolbox.js';
import { MainHandlers } from './main-handlers.js';

class Main {

  bookId = null
  userId = null

  cv: HTMLCanvasElement

  MAX_BRUSH_POINT_COUNT = 100
  FONTSIZE = 30
  cvWidth = 600
  cvHeight = 800
  tool = 1 // 0 = none, 1 = line, 2 = text
  version = 1 // 1 = original, 2 = my edit, 3 = solution
  zoom = 1
  drawnObjects = new Array<DrawnObject>()
  newLine = new Line(new Boundary(new Point(0, 0), new Point(0, 0)), false, '#000000')
  newSquare = new Square(new Boundary(new Point(0, 0), new Point(0, 0)), false, '#000000')
  newEllipse = new Ellipse(new Boundary(new Point(0, 0), new Point(0, 0)), false, '#000000')
  brushIsDrawing = false
  newText = TypedText.getNewTypedText('#000000')
  brushPoints = new Array<Point>()
  brushLastPoint = new Point(0, 0)
  brushCurrentPoint = new Point(0, 0)
  selectedColor = "#000000"

  image1 = new Image()
  image2 = new Image()
  pageNumber = 1
  multimedia = new Array<any>()
  audioMedia = null
  videoMedia = null
  toolbarHidden = false

  mainData = new MainData(null, null, null)

  toolbox: ToolBox
  mainHandlers: MainHandlers
  ctx: CanvasRenderingContext2D

  textArea: HTMLTextAreaElement
  inputPageNumber: HTMLInputElement

  btnToolLine: HTMLButtonElement
  btnToolBrush: HTMLButtonElement
  btnToolSquare: HTMLButtonElement
  btnToolEllipse: HTMLButtonElement
  btnToolText: HTMLButtonElement
  btnToolZoomIn: HTMLButtonElement
  btnToolZoomOut: HTMLButtonElement
  btnClose: HTMLButtonElement
  lblSwitch1: HTMLLabelElement
  lblSwitch2: HTMLLabelElement
  lblSwitch3: HTMLLabelElement
  audioMediaElement: HTMLAudioElement
  videoMediaElement: HTMLVideoElement
  audioMediaDivElement: HTMLDivElement
  videoMediaDivElement: HTMLDivElement
  //audioMediaLinkElement: HTMLAnchorElement>document.getElementById('audio-media-link')
  videoMediaLinkElement: HTMLAnchorElement
  videoMediaCloseButton: HTMLButtonElement
  audioMediaCloseButton: HTMLButtonElement
  btnHideToolbar: HTMLDivElement
  colorInput: HTMLInputElement

  constructor() {
    this.cv = <HTMLCanvasElement>document.getElementById('canvas')
    this.ctx = this.cv.getContext("2d")
    this.toolbox = new ToolBox(this)
    this.mainHandlers = new MainHandlers(this)

    this.textArea = <HTMLTextAreaElement>document.getElementById('text-input')
    this.inputPageNumber = <HTMLInputElement>document.getElementById('inputPageNumber')

    this.btnToolLine = <HTMLButtonElement>document.getElementById('line')
    this.btnToolBrush = <HTMLButtonElement>document.getElementById('brush')
    this.btnToolSquare = <HTMLButtonElement>document.getElementById('square')
    this.btnToolEllipse = <HTMLButtonElement>document.getElementById('ellipse')
    this.btnToolText = <HTMLButtonElement>document.getElementById('text')
    this.btnToolZoomIn = <HTMLButtonElement>document.getElementById('zoomin')
    this.btnToolZoomOut = <HTMLButtonElement>document.getElementById('zoomout')
    this.btnClose = <HTMLButtonElement>document.getElementById('close')
    this.lblSwitch1 = <HTMLLabelElement>document.getElementById('lblSwitch1')
    this.lblSwitch2 = <HTMLLabelElement>document.getElementById('lblSwitch2')
    this.lblSwitch3 = <HTMLLabelElement>document.getElementById('lblSwitch3')
    this.audioMediaElement = <HTMLAudioElement>document.getElementById('audio-media')
    this.videoMediaElement = <HTMLVideoElement>document.getElementById('video-media')
    this.audioMediaDivElement = <HTMLDivElement>document.getElementById('audio-media-div')
    this.videoMediaDivElement = <HTMLDivElement>document.getElementById('video-media-div')
    //audioMediaLinkElement = <HTMLAnchorElement>document.getElementById('audio-media-link')
    this.videoMediaLinkElement = <HTMLAnchorElement>document.getElementById('video-media-link')
    this.videoMediaCloseButton = <HTMLButtonElement>document.getElementById('close-video-media')
    this.audioMediaCloseButton = <HTMLButtonElement>document.getElementById('close-audio-media')
    this.btnHideToolbar = <HTMLDivElement>document.getElementById('hide-toolbar')
    this.colorInput = <HTMLInputElement>document.getElementById('color-picker')
  }

  setTool(t: number) {
    this.tool = t
    switch (t) {
      case 1:
        (<HTMLButtonElement>document.getElementById('line')).classList.replace('not-selected', 'selected');
        (<HTMLButtonElement>document.getElementById('brush')).classList.replace('selected', 'not-selected');
        (<HTMLButtonElement>document.getElementById('square')).classList.replace('selected', 'not-selected');
        (<HTMLButtonElement>document.getElementById('ellipse')).classList.replace('selected', 'not-selected');
        (<HTMLButtonElement>document.getElementById('text')).classList.replace('selected', 'not-selected');
        break
      case 2:
        (<HTMLButtonElement>document.getElementById('line')).classList.replace('selected', 'not-selected');
        (<HTMLButtonElement>document.getElementById('brush')).classList.replace('not-selected', 'selected');
        (<HTMLButtonElement>document.getElementById('square')).classList.replace('selected', 'not-selected');
        (<HTMLButtonElement>document.getElementById('ellipse')).classList.replace('selected', 'not-selected');
        (<HTMLButtonElement>document.getElementById('text')).classList.replace('selected', 'not-selected');
        break
      case 3:
        (<HTMLButtonElement>document.getElementById('line')).classList.replace('selected', 'not-selected');
        (<HTMLButtonElement>document.getElementById('brush')).classList.replace('selected', 'not-selected');
        (<HTMLButtonElement>document.getElementById('square')).classList.replace('selected', 'not-selected');
        (<HTMLButtonElement>document.getElementById('ellipse')).classList.replace('selected', 'not-selected');
        (<HTMLButtonElement>document.getElementById('text')).classList.replace('not-selected', 'selected');
        break
      case 4:
        (<HTMLButtonElement>document.getElementById('line')).classList.replace('selected', 'not-selected');
        (<HTMLButtonElement>document.getElementById('brush')).classList.replace('selected', 'not-selected');
        (<HTMLButtonElement>document.getElementById('square')).classList.replace('not-selected', 'selected');
        (<HTMLButtonElement>document.getElementById('ellipse')).classList.replace('selected', 'not-selected');
        (<HTMLButtonElement>document.getElementById('text')).classList.replace('selected', 'not-selected');
        break
      case 5:
        (<HTMLButtonElement>document.getElementById('line')).classList.replace('selected', 'not-selected');
        (<HTMLButtonElement>document.getElementById('brush')).classList.replace('selected', 'not-selected');
        (<HTMLButtonElement>document.getElementById('square')).classList.replace('selected', 'not-selected');
        (<HTMLButtonElement>document.getElementById('ellipse')).classList.replace('not-selected', 'selected');
        (<HTMLButtonElement>document.getElementById('text')).classList.replace('selected', 'not-selected');
        break
    }
  }
  zoomCanvas(z: number) {
    this.zoom += z
    let inputZoomInfo = <HTMLInputElement>document.getElementById('inputZoomInfo')
    if (inputZoomInfo) inputZoomInfo.value = ((this.zoom) * 100).toString() + '%'
    document.getElementById('text-input').style.fontSize = TypedText.FONTSIZE * this.zoom + 'px'
  }

  run() {

    const urlString = window.location.search;
    const urlParams = new URLSearchParams(urlString);

    this.setTool(1)
    this.setImgSrc()

    this.toolbox.bindActions()

    window.addEventListener("resize", () => {
      this.setImgSrc()
    });

    const cv = <HTMLCanvasElement>document.getElementById('canvas')
    /*cv.addEventListener("scroll", function (event) {
      var scroll = this.scrollTop;
      console.log(scroll);
    });*/

    this.inputPageNumber.value = this.pageNumber.toString()

    // set initial zoom text in input
    let inputZoomInfo = <HTMLInputElement>document.getElementById('inputZoomInfo')
    if (inputZoomInfo) inputZoomInfo.value = ((this.zoom - 1) * 100).toString() + '%'

    this.inputPageNumber.addEventListener("change", (function () {
      if (this.pageNumber == +this.inputPageNumber.value) return
      this.pageNumber = +this.inputPageNumber.value
      this.setImgSrc()
      this.resetMediaObjects()
    }).bind(this))
    this.inputPageNumber.addEventListener("keyup", (event) => {
      console.info('input click')
      // Number 13 is the "Enter" key on the keyboard
      if (event.keyCode === 13) {
        // Cancel the default action, if needed
        console.info('input enter click')
        event.preventDefault()
        this.pageNumber = +this.inputPageNumber.value
        this.resetMediaObjects()
      }
    })
    this.lblSwitch1.addEventListener("click", () => {
      this.switchVersion(1)
    })
    this.lblSwitch2.addEventListener("click", () => {
      this.switchVersion(2)
    })
    if (urlParams.get('st') != '1') {
      this.lblSwitch3.addEventListener("click", () => {
        this.switchVersion(3)
      })
    } else {
      this.lblSwitch3.style.opacity = '0.5';
      (<HTMLInputElement>document.getElementById('solution')).disabled = true
    }
    this.btnToolLine.addEventListener("click", () => {
      this.setTool(1)
    })
    this.btnToolBrush.addEventListener("click", () => {
      this.setTool(2)
    })
    this.btnToolText.addEventListener("click", () => {
      this.setTool(3)
    })
    this.btnToolSquare.addEventListener("click", () => {
      this.setTool(4)
    })
    this.btnToolEllipse.addEventListener("click", () => {
      this.setTool(5)
    })
    this.btnToolZoomIn.addEventListener("click", () => {
      this.zoomCanvas(0.25)
    })
    this.btnToolZoomOut.addEventListener("click", () => {
      this.zoomCanvas(-0.25)
    })
    this.btnClose.addEventListener("click", () => {
      window.location.href = "library.php"
    })
    this.btnHideToolbar.onclick = () => {
      console.info('btn hide clicked')
      this.toolbarHidden = !this.toolbarHidden;
      if (this.toolbarHidden) {
        (<HTMLDivElement>document.getElementById('toolbar')).style.transform = 'translateX(-50%) translateY(100%)';
        (<HTMLDivElement>document.getElementById('hide-toolbar')).style.bottom = '0';
        (<HTMLImageElement>document.getElementById('btn-hide-toolbar-img')).src = 'img/icons/arr_up.png';
      }
      else {
        (<HTMLDivElement>document.getElementById('toolbar')).style.transform = 'translateX(-50%) translateY(0%)';
        (<HTMLDivElement>document.getElementById('hide-toolbar')).style.bottom = '153px';
        (<HTMLImageElement>document.getElementById('btn-hide-toolbar-img')).src = 'img/icons/arr_down.png';
      }
    }
    this.audioMediaElement.onloadstart = () => {
      this.audioMedia.loaded = true;
    }
    this.audioMediaElement.onerror = () => {
      console.info('audio media src failed to load')
    }
    this.videoMediaElement.onloadstart = () => {
      this.videoMedia.loaded = true;
    }
    this.videoMediaElement.onerror = () => {
      console.info('video media src failed to load')
    }
    this.videoMediaCloseButton.onclick = this.resetMediaObjects.bind(this)
    this.audioMediaCloseButton.onclick = this.resetMediaObjects.bind(this)
    this.colorInput.onchange = () => {
      this.selectedColor = this.colorInput.value
      this.newText.color = this.selectedColor
      this.newLine.color = this.selectedColor
      this.newSquare.color = this.selectedColor
      this.newEllipse.color = this.selectedColor
      this.textArea.style.color = this.selectedColor
    }
  }

  finishBrushStroke() {
    this.brushIsDrawing = false
    this.brushPoints.forEach(point => {
      point.x /= this.zoom
      point.y /= this.zoom
    })
    this.drawnObjects.push(new DrawnObject(new BrushStroke(this.brushPoints, this.selectedColor), this.pageNumber))
    this.brushPoints = []
  }

  finishText() {
    this.newText.finishText()
    this.drawnObjects.push(new DrawnObject(this.newText, this.pageNumber))
    this.newText = TypedText.getNewTypedText(this.selectedColor)
  }

  // 1 = original, 2 = my edit, 3 = solution
  switchVersion(v: number) {
    this.version = v
    if (v == 2) {
      this.btnToolBrush.classList.remove('unavailable'); this.btnToolBrush.disabled = null;
      this.btnToolLine.classList.remove('unavailable'); this.btnToolLine.disabled = null;
      this.btnToolSquare.classList.remove('unavailable'); this.btnToolSquare.disabled = null;
      this.btnToolEllipse.classList.remove('unavailable'); this.btnToolEllipse.disabled = null;
      this.btnToolText.classList.remove('unavailable'); this.btnToolText.disabled = null;
    }
    else {
      this.btnToolBrush.classList.add('unavailable'); this.btnToolBrush.disabled = true
      this.btnToolLine.classList.add('unavailable'); this.btnToolLine.disabled = true
      this.btnToolSquare.classList.add('unavailable'); this.btnToolSquare.disabled = true;
      this.btnToolEllipse.classList.add('unavailable'); this.btnToolEllipse.disabled = true;
      this.btnToolText.classList.add('unavailable'); this.btnToolText.disabled = true
    }
    this.setImgSrc()
  }

  setImgSrc() {

    const vw = Math.max(document.documentElement.clientWidth, window.innerWidth || 0) - 20

    if (this.mainData.pages && this.mainData.pages.length >= 2) {
      //console.info('multimedia.length: ' + this.multimedia.length)
      //console.info('maindata loaded')
      if (this.version == 1) {
        this.image1.src = this.mainData.pages.find(page => page.pageNumber == this.pageNumber).imgO
        this.image2.src = this.mainData.pages.find(page => page.pageNumber == this.pageNumber + 1).imgO
      }
      if (this.version == 2) {
        this.image1.src = this.mainData.pages.find(page => page.pageNumber == this.pageNumber).imgU
        this.image2.src = this.mainData.pages.find(page => page.pageNumber == this.pageNumber + 1).imgU
      }
      if (this.version == 3) {
        this.image1.src = this.mainData.pages.find(page => page.pageNumber == this.pageNumber).imgR
        this.image2.src = this.mainData.pages.find(page => page.pageNumber == this.pageNumber + 1).imgR
      }
    } else {
      console.info('main data not loaded')
    }

    this.image1.onload = () => {
      //console.info('image1.naturalHeight ' + this.image1.naturalHeight)
      this.image1.width = vw / 2
      let resizeRatio1 = this.image1.naturalWidth / ((vw + 20) / 2)
      this.image1.height = this.image1.naturalHeight / resizeRatio1
    }
    this.image1.onerror = () => {
      //console.info('this.image1 src failed to load')
      this.image1.src = 'img/icons/unavailable.png'
    }
    this.image2.onload = () => {
      //console.info('this.image2.naturalHeight ' + this.image2.naturalHeight)
      this.image2.width = vw / 2
      let resizeRatio2 = this.image2.naturalWidth / ((vw + 20) / 2)
      this.image2.height = this.image2.naturalHeight / resizeRatio2
    }
    this.image2.onerror = () => {
      //console.info('this.image2 src failed to load')
      this.image2.src = 'img/icons/unavailable.png'
    }
  }
  resetMediaObjects() {
    this.audioMediaElement.pause()
    this.videoMediaElement.pause()
    this.audioMediaDivElement.style.opacity = '0'
    this.audioMediaDivElement.style.transform = 'scaleY(0) translate(-50%, -50%)'
    this.videoMediaDivElement.style.opacity = '0'
    this.videoMediaDivElement.style.transform = 'scaleY(0) translate(-50%, -50%)'
  }
}

window.onload = () => {

  var m = new Main()

  const urlString = window.location.search;
  const urlParams = new URLSearchParams(urlString);
  m.bookId = urlParams.get('id')
  m.userId = urlParams.get('user')
  if (!m.bookId || !m.userId) {
    console.error('incorrect url, expecting parameters id and user (?id=1&user=123)')
    return
  }
  var xhttp = new XMLHttpRequest();
  if (window.location.hostname.indexOf('localhost') >= 0 || window.location.hostname.indexOf('127.0.0.1') >= 0) xhttp.open("GET", "http://localhost:5501/dist/data.json", true)
  else xhttp.open("GET", window.location.pathname.substring(0, window.location.pathname.lastIndexOf('/') + 1) + 'test3.php' + window.location.search, true)
  xhttp.onreadystatechange = (function (req: XMLHttpRequest, e: Event): any {
    if (req.readyState == 4 && req.status == 200) {
      //console.info(xhttp.responseText)
      m.mainData = JSON.parse(xhttp.responseText)
      m.zoom = +m.mainData.settings.zoom
      m.setImgSrc()
      // fill multimedia array
      m.mainData.pages.forEach(page => {
        if (page.multimedia)
          page.multimedia.forEach(mm => {
            if (mm.type == '0') m.multimedia.push(new MediaAudio(mm.id, page.pageNumber, mm.file, new Point(Number(mm.x), Number(mm.y))))
            else m.multimedia.push(new MediaVideo(mm.id, page.pageNumber, mm.file, new Point(Number(mm.x), Number(mm.y))))
          })
      });
      // first call, calls request animation frame inside so it cycles inside after m one call
      redrawCanvas()
    }
  }).bind(this, xhttp)
  xhttp.send()

  m.run()
  var mainHandlers = new MainHandlers(m)
  mainHandlers.bindActions()

  function redrawCanvas() {
    if (!m.ctx) return
    //cv.width = (image1.width * m.zoom) + (image2.width * m.zoom)
    m.cv.width = window.innerWidth * m.zoom
    m.cv.height = m.image1.height > m.image2.height ? m.image1.height * m.zoom : m.image2.height * m.zoom

    m.ctx.clearRect(0, 0, m.cv.width, m.cv.height)

    m.ctx.font = TypedText.FONTSIZE * m.zoom + "px Roboto"
    if (m.image1.complete) m.ctx.drawImage(m.image1, 0, 0, m.cv.width / 2, (((m.cv.width / m.image1.width)) * m.image1.height) / 2)
    else m.ctx.fillText('Načítám', 0.1 * m.cv.width, 0.1 * m.cv.height) // draw loading text at 10% of width so should be on the left side
    if (m.image2.complete) m.ctx.drawImage(m.image2, m.cv.width / 2, 0, m.cv.width / 2, (((m.cv.width / m.image2.width)) * m.image2.height) / 2)
    else m.ctx.fillText('Načítám', 0.6 * m.cv.width, 0.1 * m.cv.height) // draw loading text at 60% of width so should be on the right side

    m.ctx.lineCap = "round"
    m.ctx.lineJoin = "round"

    // draw all objects only if m.version 2 is active (moje upravy)
    if (m.version == 2) {
      // draw finished objects
      m.drawnObjects.forEach(object => {
        if (object.pageNumber != m.pageNumber) return
        object.obj.draw(m.ctx, m.zoom)
      })
      // draw current line
      if (m.newLine.editing) {
        m.newLine.draw(m.ctx, 1) // current line pixels fit mouse location, are recalculated by m.zoom on mouse up
      }
      // draw current square
      if (m.newSquare.editing) {
        m.newSquare.draw(m.ctx, 1)
      }
      // draw current ellipse
      if (m.newEllipse.editing) {
        m.newEllipse.draw(m.ctx, 1)
      }
      // draw current brush
      m.ctx.lineWidth = 10 * m.zoom
      m.ctx.strokeStyle = m.selectedColor
      if (m.brushIsDrawing) {
        m.ctx.beginPath()
        m.ctx.moveTo(m.brushPoints[0].x, m.brushPoints[0].y)
        // i = index of single point in a brush stroke
        for (let i = 1; i < m.brushPoints.length; i++) {
          m.ctx.lineTo(m.brushPoints[i].x, m.brushPoints[i].y)
          m.ctx.stroke()
        }
        m.ctx.closePath()
      }
      // draw current text
      m.newText.draw(m.ctx, m.zoom)

    }

    if (m.version == 1 || m.version == 3) {
      // draw multimedia objects
      m.multimedia.forEach(mm => {
        let cvToOrigRatio1X = 1
        let cvToOrigRatio1Y = 1
        if (m.image1.complete) {
          cvToOrigRatio1X = (m.cv.width/2) / m.image1.naturalWidth
          cvToOrigRatio1Y = m.cv.height / m.image1.naturalHeight
        }
        let cvToOrigRatio2X = 1
        let cvToOrigRatio2Y = 1
        if (m.image2.complete) {
          cvToOrigRatio2X = (m.cv.width/2) / m.image2.naturalWidth
          cvToOrigRatio2Y = m.cv.height / m.image2.naturalHeight
        }
        //console.info(`cv width: ${m.cv.width},cv height: ${m.cv.height}`)
        if (mm.pageNumber == m.pageNumber) mm.draw(m.ctx, m.zoom, false, null, cvToOrigRatio1X, cvToOrigRatio1Y)
        if (mm.pageNumber == m.pageNumber + 1) mm.draw(m.ctx, m.zoom, true, m.cv.width, cvToOrigRatio2X, cvToOrigRatio2Y)
      });
    }

    // set audio/video media element stuff if any active
    if (m.audioMedia && !m.audioMedia.loaded) {
      m.audioMediaDivElement.style.opacity = '1'
      m.audioMediaDivElement.style.transform = 'scaleY(1) translate(-50%, -50%)'
      m.audioMediaElement.src = m.audioMedia.url
    }
    if (m.videoMedia && !m.videoMedia.loaded) {
      m.videoMediaDivElement.style.opacity = '1'
      m.videoMediaDivElement.style.transform = 'scaleY(1) translate(-50%, -50%)'
      m.videoMediaElement.src = m.videoMedia.url
      m.videoMediaLinkElement.href = m.videoMedia.url
    }

    // set changes list
    const changesDiv = document.getElementById('changesList');
    changesDiv.innerHTML = '';
    m.drawnObjects.forEach(o => {
      const changeLine = document.createElement("p");
      changeLine.innerText = JSON.stringify(o.obj);
      changesDiv.appendChild(changeLine)
    })

    requestAnimationFrame(redrawCanvas)
  }
}



