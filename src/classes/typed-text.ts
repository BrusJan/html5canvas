import { Drawable, Boundary, Point } from './classes.js';

export class TypedText implements Drawable {
    static FONTSIZE = 30
    input: HTMLInputElement
    constructor(
        public text: string,
        public bo: Boundary,
        public editing: boolean,
        public drawingTextBoundary: boolean,
        public textTyping: boolean,
        public fontSize: number,
    ) {
        this.input = <HTMLInputElement>document.getElementById("text-input")
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
        if (this.drawingTextBoundary) { // set end point of boundaries
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
            this.textTyping = true
            this.drawingTextBoundary = false
        }
    }

    handleKeyUp(e: KeyboardEvent): void {

    }

    isInsideBoundaries(x: number, y: number, zoom: number): boolean {
        if (x / zoom < this.bo.a.x || x / zoom > this.bo.b.x
            || y / zoom < this.bo.a.y || y / zoom > this.bo.b.y) {
            return false
        }
        return true
    }

    draw(ctx: CanvasRenderingContext2D, zoom: number): void {
        let fontsize = TypedText.FONTSIZE * zoom
        ctx.font = fontsize + "px Roboto"

        // draw text line by line
        let split = this.text.split('\n')
        split.forEach((line, index) => {
            ctx.fillText(line, this.bo.a.x * zoom, ((this.bo.a.y * zoom)) + fontsize * (index + 1))
        });

        if (this.textTyping || this.drawingTextBoundary) {
            let canvasDiv = <HTMLCanvasElement>document.getElementById('canvasDiv')
            this.input.classList.add('visible')
            this.input.classList.remove('hidden')
            this.input.style.width = Math.abs(this.bo.b.x - this.bo.a.x) * zoom + 'px'
            this.input.style.height = Math.abs(this.bo.b.y - this.bo.a.y) * zoom + 'px'
            this.input.style.top = ((Math.min(this.bo.a.y, this.bo.b.y) * zoom) - canvasDiv.scrollTop) + 'px'
            this.input.style.left = ((Math.min(this.bo.a.x, this.bo.b.x) * zoom) - canvasDiv.scrollLeft) + 'px';
        }

    }

    finishText(): void {
        this.textTyping = false
        this.input.classList.remove('visible')
        this.input.classList.add('hidden')
        this.text = this.input.value
        this.input.value = ''
    }

    static getNewTypedText(): TypedText {
        return new TypedText(
            '',
            new Boundary(new Point(0, 0), new Point(0, 0)),
            false,
            false,
            false,
            TypedText.FONTSIZE,
        )
    }

}