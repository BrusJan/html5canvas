import { Drawable, Boundary, Point } from './classes.js';

export class TypedTextOrig implements Drawable {
    static FONTSIZE = 30
    constructor(
        public text: string[],
        public bo: Boundary,
        public editing: boolean,
        public drawingTextBoundary: boolean,
        public textTyping: boolean,
        public carretVisible: boolean, // if the text carret should be blinking
        public carretOn: boolean, // if the text carret is currently visible, should switch back and forth periodically
        public carretCharPosition: number, // 0 = beginning, 1 = after first char, 5 = after 5th char
        public carretLinePosition: number, // 0 = first line, 1 = second line, ...
        public fontSize: number,
    ) {
        window.setInterval(() => {
            if (this.carretVisible) {
                this.carretOn = !this.carretOn
            }
        }, 500)
    }

    handleMouseDown(x: number, y: number, zoom: number) {
        if (!this.textTyping) {
            this.bo.a.x = (x) / zoom
            this.bo.a.y = (y) / zoom
            this.bo.b.x = (x) / zoom
            this.bo.b.y = (y) / zoom
            this.drawingTextBoundary = true
        }
    }
    handleMouseMove(x: number, y: number, zoom: number) {
        if (this.drawingTextBoundary) {
            this.bo.b.x = (x) / zoom
            this.bo.b.y = (y) / zoom
        }
    }
    handleMouseUp(x: number, y: number, zoom: number) {
        if (!this.textTyping) { // set end point of boundaries, turn on carret, start typing, stop drawing boundary
            this.bo.b.x = x / zoom
            this.bo.b.y = y / zoom
            if (this.bo.a.x > this.bo.b.x) { // switch x so a is always left top corner
                let tempX = this.bo.a.x
                this.bo.a.x = this.bo.b.x
                this.bo.b.x = tempX
            }
            if (this.bo.a.y > this.bo.b.y) { // switch y so a is always left top corner
                let tempY = this.bo.a.y
                this.bo.a.y = this.bo.b.y
                this.bo.b.y = tempY
            }
            if (this.bo.b.x - this.bo.a.x < this.fontSize) {
                this.bo.b.x = this.bo.a.x + this.fontSize
            }
            if (this.bo.b.y - this.bo.a.y < this.fontSize) {
                this.bo.b.y = this.bo.a.y + this.fontSize
            }
            this.carretVisible = true
            this.textTyping = true
            this.drawingTextBoundary = false
        }
    }

    handleKeyUp(e: KeyboardEvent): void {
        //console.info(this)
        //console.info(e)
        if (e.keyCode > 48) {
            if (e.ctrlKey == true && e.key == 'v') {
                navigator.clipboard.readText().then(data => {
                    this.text[this.carretLinePosition] = this.text[this.carretLinePosition].slice(0, this.carretCharPosition) + data + this.text[this.carretLinePosition].slice(this.carretCharPosition)
                    this.carretCharPosition += data.length
                })
            } else // insert a new char into this.text[this.carretLinePosition] at this.carretCharPosition index
            {
                this.text[this.carretLinePosition] = this.text[this.carretLinePosition].slice(0, this.carretCharPosition) + e.key + this.text[this.carretLinePosition].slice(this.carretCharPosition)
                this.carretCharPosition += 1
            }
        } else {
            switch (e.keyCode) {
                case 13: // enter
                    if (this.carretCharPosition == this.text[this.carretLinePosition].length) {
                        this.text.splice(this.carretLinePosition + 1, 0, '');
                    } else {
                        this.text.splice(this.carretLinePosition + 1, 0, this.text[this.carretLinePosition].substring(this.carretCharPosition));
                        this.text[this.carretLinePosition] = this.text[this.carretLinePosition].substr(0, this.carretCharPosition)
                    }
                    this.carretCharPosition = 0
                    this.carretLinePosition++
                    break
                case 35: // end
                    this.carretCharPosition = this.text[this.carretLinePosition].length
                    break
                case 32: // space
                    this.text[this.carretLinePosition] = this.text[this.carretLinePosition].slice(0, this.carretCharPosition) + ' ' + this.text[this.carretLinePosition].slice(this.carretCharPosition)
                    this.carretCharPosition += 1
                    break
                case 36: // home
                    this.carretCharPosition = 0
                    break
                case 8: //backspace
                    if (this.carretCharPosition > 0) {
                        this.text[this.carretLinePosition] = this.text[this.carretLinePosition].slice(0, this.carretCharPosition - 1) + this.text[this.carretLinePosition].slice(this.carretCharPosition);
                        this.carretCharPosition -= 1
                    } else if (this.carretLinePosition > 0) {
                        this.carretLinePosition -= 1
                        this.carretCharPosition = this.text[this.carretLinePosition].length
                        this.text.splice(this.carretLinePosition + 1)
                    }
                    break
                case 46: //delete
                    if (this.carretCharPosition < this.text[this.carretLinePosition].length)
                        this.text[this.carretLinePosition] = this.text[this.carretLinePosition].slice(0, this.carretCharPosition) + this.text[this.carretLinePosition].slice(this.carretCharPosition + 1);
                    else if (this.carretLinePosition < this.text.length - 1) {
                        this.text[this.carretLinePosition] = this.text[this.carretLinePosition] + this.text[this.carretLinePosition + 1]
                        this.text.splice(this.carretLinePosition + 1, 1)
                    }
                    break
                case 37: // left arrow
                    if (this.carretCharPosition > 0) this.carretCharPosition -= 1
                    else if (this.carretLinePosition > 0) {
                        this.carretLinePosition -= 1
                        this.carretCharPosition = this.text[this.carretLinePosition].length
                    }
                    break
                case 39: // right arrow
                    if (this.carretCharPosition < this.text[this.carretLinePosition].length) this.carretCharPosition += 1
                    else if (this.carretLinePosition < this.text.length - 1) {
                        this.carretLinePosition += 1
                        this.carretCharPosition = 0
                    }
                    break
                case 40: // down arrow
                    if (this.carretLinePosition < this.text.length - 1) this.carretLinePosition += 1
                    if (this.carretCharPosition > this.text[this.carretLinePosition].length) this.carretCharPosition = this.text[this.carretLinePosition].length
                    break
                case 38: // up arrow
                    if (this.carretLinePosition > 0) this.carretLinePosition -= 1
                    if (this.carretCharPosition > this.text[this.carretLinePosition].length) this.carretCharPosition = this.text[this.carretLinePosition].length
                    break
                case 16: break //shift
                default:
                    break
            }
        }
    }

    isInsideBoundaries(x: number, y: number, zoom: number): boolean {
        if (x / zoom < this.bo.a.x || x / zoom > this.bo.b.x
            || y / zoom < this.bo.a.y || y / zoom > this.bo.b.y) {
            return false
        }
        return true
    }

    draw(ctx: CanvasRenderingContext2D, zoom: number): void {
        let fontsize = 30 * zoom
        ctx.font = fontsize + "px Arial"
        for (let i = 0; i < this.text.length; i++) {
            // draw each line of text
            ctx.fillText(this.text[i], this.bo.a.x * zoom, ((this.bo.a.y * zoom) + (fontsize * (i + 1))))
        }
        // draw boundary
        if (this.textTyping || this.drawingTextBoundary) {
            ctx.lineWidth = 1 * zoom
            ctx.strokeStyle = "rgba(0,0,0,0.3)"
            ctx.beginPath()
            ctx.rect(this.bo.a.x * zoom, this.bo.a.y * zoom, (this.bo.b.x - this.bo.a.x) * zoom, (this.bo.b.y - this.bo.a.y) * zoom)
            ctx.stroke()
            ctx.closePath()
        }
        // draw text carret
        if (this.carretVisible && this.carretOn) {
            ctx.lineWidth = 2 * zoom
            ctx.strokeStyle = "black"
            ctx.beginPath()
            let carretX = ctx.measureText(this.text[this.carretLinePosition].substring(0, this.carretCharPosition)).width + 1
            ctx.moveTo((this.bo.a.x * zoom) + carretX, (this.bo.a.y * zoom) + (fontsize * (this.carretLinePosition) + 5))
            ctx.lineTo((this.bo.a.x * zoom) + carretX, (this.bo.a.y * zoom) + (fontsize * (this.carretLinePosition + 1)))
            ctx.stroke()
            ctx.closePath()
        }
    }

    finishText(): void {
        this.carretVisible = false
        this.textTyping = false
    }

    static getNewTypedText(): TypedTextOrig {
        return new TypedTextOrig(
            [''],
            new Boundary(new Point(0, 0), new Point(0, 0)),
            false,
            false,
            false,
            false,
            false,
            0,
            0,
            30,
        )
    }

    carretOnLastLine(): boolean {
        if (this.carretLinePosition + 1 == this.text.length) return true
        return false
    }
    carretOnLastChar(): boolean {
        if (this.carretCharPosition == this.text[this.carretLinePosition].length) return true
        return false
    }

}