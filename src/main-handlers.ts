import { Boundary, Line, Point, MediaAudio, MediaVideo, DrawnObject, Square, Ellipse } from './classes/classes.js';

export class MainHandlers {

    main: any

    constructor(main: any) {
        this.main = main
    }

    bindActions() {
        this.main.cv.addEventListener("mousedown", this.handleMouseDown.bind(this))
        this.main.cv.addEventListener("mouseup", this.handleMouseUp.bind(this))
        this.main.cv.addEventListener("mousemove", this.handleMouseMove.bind(this))
        this.main.cv.addEventListener("keyup", this.handleKeyUp.bind(this))
        this.main.textArea.addEventListener("mouseup", this.handleMouseUp.bind(this))
    }

    handleKeyUp(e: KeyboardEvent) {
        if (this.main.newText.textTyping) {
            if (e.keyCode == 27) this.main.finishText()
            else this.main.newText.handleKeyUp(e)
        }
    }
    handleMouseDown(e: MouseEvent) {
        // do stuff only when version 2 is active (moje upravy)
        if (this.main.version != 2) return
        const rect = this.main.cv.getBoundingClientRect()
        var x = e.clientX - rect.left
        var y = e.clientY - rect.top
        switch (this.main.tool) {
            case 0: return
            case 1:
                this.main.newLine = new Line(new Boundary(new Point(x, y), new Point(x, y)), true, this.main.selectedColor)
                break
            case 2:
                this.main.brushPoints.push(new Point(x, y))
                this.main.brushCurrentPoint = new Point(x, y)
                this.main.brushLastPoint = new Point(x, y)
                this.main.brushIsDrawing = true
                break
            case 3:
                this.main.newText.handleMouseDown(x, y, this.main.zoom)
                break
            case 4:
                this.main.newSquare = new Square(new Boundary(new Point(x, y), new Point(x, y)), true, this.main.selectedColor)
                break
            case 5:
                this.main.newEllipse = new Ellipse(new Boundary(new Point(x, y), new Point(x, y)), true, this.main.selectedColor)
                break
        }
    }

    handleMouseUp(e: MouseEvent) {
        if (this.main.version == 1 || this.main.version == 3) {
            const rect = this.main.cv.getBoundingClientRect()
            var x = e.clientX - rect.left
            var y = e.clientY - rect.top
            this.main.multimedia.forEach(mm => {
                // if a media or audio was clicked set the proper global objects
                if (mm.pageNumber == this.main.pageNumber) {
                    if (mm.isInsideBoundary(x, y, this.main.zoom, false, null)) {
                        console.info('mouse up on media object')
                        mm.loaded = false;
                        if (mm instanceof MediaAudio) this.main.audioMedia = mm
                        else if (mm instanceof MediaVideo) this.main.videoMedia = mm
                    }
                }
                if (mm.pageNumber == this.main.pageNumber + 1) {
                    if (mm.isInsideBoundary(x, y, this.main.zoom, true, this.main.cv.width)) {
                        console.info('mouse up on media object right side')
                        mm.loaded = false;
                        if (mm instanceof MediaAudio) this.main.audioMedia = mm
                        else if (mm instanceof MediaVideo) this.main.videoMedia = mm
                    }
                }

            });
        }
        this.main.audioMediaDivElement.style.opacity = '0'
        this.main.audioMediaDivElement.style.transform = 'scaleY(0) translate(-50%, -50%)'
        this.main.audioMediaElement.pause()
        this.main.videoMediaDivElement.style.opacity = '0'
        this.main.videoMediaDivElement.style.transform = 'scaleY(0) translate(-50%, -50%)'
        this.main.videoMediaElement.pause()
        // do stuff only when version 2 is active (moje upravy)
        if (this.main.version != 2) return
        const rect = this.main.cv.getBoundingClientRect()
        var x = e.clientX - rect.left
        var y = e.clientY - rect.top
        switch (this.main.tool) {
            case 0: return // no tool
            case 1: // line
                // recalculate original point
                this.main.newLine.bo.a.x /= this.main.zoom
                this.main.newLine.bo.a.y /= this.main.zoom
                // set end point
                this.main.newLine.bo.b.x = x / this.main.zoom
                this.main.newLine.bo.b.y = y / this.main.zoom
                this.main.newLine.editing = false
                // if line is too short, do not create it
                if (Math.abs(this.main.newLine.bo.a.x - this.main.newLine.bo.b.x) > 3 || Math.abs(this.main.newLine.bo.a.y - this.main.newLine.bo.b.y) > 3) {
                    // object assign to create new object and not use the same refference over and over
                    this.main.drawnObjects.push(new DrawnObject(this.main.newLine, this.main.pageNumber))
                    this.main.newLine = new Line(new Boundary(new Point(0, 0), new Point(0, 0)), false, this.main.selectedColor)
                }
                break
            case 2: //brush
                if (this.main.brushIsDrawing) this.main.finishBrushStroke()
                break
            case 3: // text        
                if (this.main.newText.textTyping && !this.main.newText.isInsideBoundaries(x, y, this.main.zoom)) {
                    // if click is away from boundaries, finish text
                    this.main.finishText()
                } else this.main.newText.handleMouseUp(x, y, this.main.zoom)
                break
            case 4: // square
                // recalculate original point
                this.main.newSquare.bo.a.x /= this.main.zoom
                this.main.newSquare.bo.a.y /= this.main.zoom
                // set end point
                this.main.newSquare.bo.b.x = x / this.main.zoom
                this.main.newSquare.bo.b.y = y / this.main.zoom
                this.main.newSquare.editing = false
                // if line is too short, do not create it
                if (Math.abs(this.main.newSquare.bo.a.x - this.main.newSquare.bo.b.x) > 3 || Math.abs(this.main.newSquare.bo.a.y - this.main.newSquare.bo.b.y) > 3) {
                    // object assign to create new object and not use the same refference over and over
                    this.main.drawnObjects.push(new DrawnObject(this.main.newSquare, this.main.pageNumber))
                    this.main.newSquare = new Square(new Boundary(new Point(0, 0), new Point(0, 0)), false, this.main.selectedColor)
                }
                break
            case 5: // ellipse
                // recalculate original point
                this.main.newEllipse.bo.a.x /= this.main.zoom
                this.main.newEllipse.bo.a.y /= this.main.zoom
                // set end point
                this.main.newEllipse.bo.b.x = x / this.main.zoom
                this.main.newEllipse.bo.b.y = y / this.main.zoom
                this.main.newEllipse.editing = false
                // if line is too short, do not create it
                if (Math.abs(this.main.newEllipse.bo.a.x - this.main.newEllipse.bo.b.x) > 3 || Math.abs(this.main.newEllipse.bo.a.y - this.main.newEllipse.bo.b.y) > 3) {
                    // object assign to create new object and not use the same refference over and over
                    this.main.drawnObjects.push(new DrawnObject(this.main.newEllipse, this.main.pageNumber))
                    this.main.newEllipse = new Ellipse(new Boundary(new Point(0, 0), new Point(0, 0)), false, this.main.selectedColor)
                }
                break
        }
    }

    handleMouseMove(e: MouseEvent) {
        // do stuff only when this.main.version 2 is active (moje upravy)
        if (this.main.version != 2) return
        const rect = this.main.cv.getBoundingClientRect()
        var x = e.clientX - rect.left
        var y = e.clientY - rect.top
        switch (this.main.tool) {
            case 0: return
            case 1:
                this.main.newLine.bo.b.x = x
                this.main.newLine.bo.b.y = y
                break
            case 2:
                if (!this.main.brushIsDrawing) break
                this.main.brushCurrentPoint.x = x
                this.main.brushCurrentPoint.y = y
                if (Math.abs(this.main.brushCurrentPoint.x - this.main.brushLastPoint.x) > 3 || Math.abs(this.main.brushCurrentPoint.y - this.main.brushLastPoint.y) > 20) {
                    this.main.brushPoints.push(this.main.brushCurrentPoint)
                    this.main.brushLastPoint = new Point(x, y)
                    this.main.brushCurrentPoint = new Point(x, y)
                }
                if (this.main.brushPoints.length >= this.main.MAX_BRUSH_POINT_COUNT) this.main.finishBrushStroke()
                break
            case 3: // text
                this.main.newText.handleMouseMove(x, y, this.main.zoom)
                break
            case 4: // square
                this.main.newSquare.bo.b.x = x
                this.main.newSquare.bo.b.y = y
                break
            case 5: // square
                this.main.newEllipse.bo.b.x = x
                this.main.newEllipse.bo.b.y = y
                break
        }

    }

}