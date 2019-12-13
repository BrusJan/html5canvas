"use strict";
var Point = /** @class */ (function () {
    function Point(x, y) {
        this.x = x;
        this.y = y;
    }
    return Point;
}());
var Boundaries = /** @class */ (function () {
    function Boundaries(a, b) {
        this.a = a;
        this.b = b;
    }
    return Boundaries;
}());
var Line = /** @class */ (function () {
    function Line(bo, editing) {
        this.bo = bo;
        this.editing = editing;
    }
    return Line;
}());
var MAX_BRUSH_POINT_COUNT = 100;
var tool = 0; // 0 = none, 1 = line, 2 = text
var newLine = new Line(new Boundaries(new Point(0, 0), new Point(0, 0)), false);
var brushStrokes = new Array();
var brushIsDrawing = false;
var brushPoints = new Array();
var brushLastPoint = new Point(0, 0);
var brushCurrentPoint = new Point(0, 0);
var lines = new Array();
function lineClick() {
    setTool(1);
}
function brushClick() {
    setTool(2);
}
function textClick() {
    setTool(3);
    console.info({ brushPoints: brushPoints });
    console.info({ brushStrokes: brushStrokes });
}
function setTool(t) {
    tool = t;
    var ispan = document.getElementById('i-tool');
    if (ispan)
        ispan.innerHTML = t.toString();
}
window.onload = function () {
    setTool(0);
    var cv = document.getElementById('canvas');
    var ctx = cv.getContext("2d");
    cv.addEventListener("mousedown", handleMouseDown);
    cv.addEventListener("mouseup", handleMouseUp);
    cv.addEventListener("mousemove", handleMouseMove);
    function handleMouseDown(e) {
        var rect = cv.getBoundingClientRect();
        switch (tool) {
            case 0: return;
            case 1:
                newLine = new Line(new Boundaries(new Point(e.clientX - rect.left, e.clientY - rect.top), new Point(0, 0)), true);
                break;
            case 2:
                brushPoints.push(new Point(e.clientX - rect.left, e.clientY - rect.top));
                brushCurrentPoint = new Point(e.clientX - rect.left, e.clientY - rect.top);
                brushLastPoint = new Point(e.clientX - rect.left, e.clientY - rect.top);
                brushIsDrawing = true;
                break;
        }
    }
    function handleMouseUp(e) {
        switch (tool) {
            case 0: return;
            case 1:
                var rect = cv.getBoundingClientRect();
                newLine.bo.b.x = e.clientX - rect.left;
                newLine.bo.b.y = e.clientY - rect.top;
                newLine.editing = false;
                // if line is too short, do not create it
                if (Math.abs(newLine.bo.a.x - newLine.bo.b.x) > 3 || Math.abs(newLine.bo.a.y - newLine.bo.b.y) > 3) {
                    // object assign to create new object and not use the same refference over and over
                    lines.push(newLine);
                    newLine = new Line(new Boundaries(new Point(0, 0), new Point(0, 0)), false);
                }
                redrawCanvas();
                break;
            case 2:
                if (brushIsDrawing)
                    finishBrushStroke();
                break;
        }
    }
    function handleMouseMove(e) {
        var rect = cv.getBoundingClientRect();
        switch (tool) {
            case 0: return;
            case 1:
                newLine.bo.b.x = e.clientX - rect.left;
                newLine.bo.b.y = e.clientY - rect.top;
                redrawCanvas();
                break;
            case 2:
                if (!brushIsDrawing)
                    break;
                brushCurrentPoint.x = e.clientX - rect.left;
                brushCurrentPoint.y = e.clientY - rect.top;
                if (Math.abs(brushCurrentPoint.x - brushLastPoint.x) > 3 || Math.abs(brushCurrentPoint.y - brushLastPoint.y) > 20) {
                    brushPoints.push(brushCurrentPoint);
                    brushLastPoint = new Point(e.clientX - rect.left, e.clientY - rect.top);
                    brushCurrentPoint = new Point(e.clientX - rect.left, e.clientY - rect.top);
                }
                if (brushPoints.length >= MAX_BRUSH_POINT_COUNT)
                    finishBrushStroke();
                redrawCanvas();
                break;
        }
    }
    function redrawCanvas() {
        if (!ctx)
            return;
        ctx.clearRect(0, 0, cv.width, cv.height);
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        // draw lines
        ctx.lineWidth = 2;
        ctx.strokeStyle = "black";
        ctx.beginPath();
        if (newLine.editing) {
            ctx.moveTo(newLine.bo.a.x, newLine.bo.a.y);
            ctx.lineTo(newLine.bo.b.x, newLine.bo.b.y);
            ctx.stroke();
        }
        for (var i = 0; i < lines.length; i++) {
            ctx.moveTo(lines[i].bo.a.x, lines[i].bo.a.y);
            ctx.lineTo(lines[i].bo.b.x, lines[i].bo.b.y);
            ctx.stroke();
        }
        ctx.closePath();
        // draw current brush
        ctx.lineWidth = 10;
        ctx.strokeStyle = "red";
        if (brushIsDrawing) {
            ctx.beginPath();
            ctx.moveTo(brushPoints[0].x, brushPoints[0].y);
            // i = index of single point in a brush stroke
            for (var i = 1; i < brushPoints.length; i++) {
                ctx.lineTo(brushPoints[i].x, brushPoints[i].y);
                ctx.stroke();
            }
            ctx.closePath();
        }
        // draw other brushes
        if (brushStrokes.length >= 1) {
            // j = index of whole stroke = array of points
            for (var j = 0; j < brushStrokes.length; j++) {
                ctx.beginPath();
                ctx.moveTo(brushStrokes[j][0].x, brushStrokes[j][0].y);
                // i = index of single point in a brush stroke
                for (var i = 1; i < brushStrokes[j].length; i++) {
                    ctx.lineTo(brushStrokes[j][i].x, brushStrokes[j][i].y);
                    ctx.stroke();
                }
                ctx.closePath();
            }
        }
    }
    function finishBrushStroke() {
        brushIsDrawing = false;
        brushStrokes.push(brushPoints);
        brushPoints = [];
    }
};
// switch (tool) {
//   case 0: return;
//   case 1:
//     break;
//   case 2:
//     break;
// }