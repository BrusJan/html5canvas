"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
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
var BrushStroke = /** @class */ (function () {
    function BrushStroke(points) {
        this.points = points;
    }
    return BrushStroke;
}());
var MAX_BRUSH_POINT_COUNT = 100;
var cvWidth = 600;
var cvHeight = 800;
var tool = 0; // 0 = none, 1 = line, 2 = text
var drawnObjects = new Array();
var newLine = new Line(new Boundaries(new Point(0, 0), new Point(0, 0)), false);
var brushIsDrawing = false;
var brushPoints = new Array();
var brushLastPoint = new Point(0, 0);
var brushCurrentPoint = new Point(0, 0);
var imgOrig = new Image();
var imgDone = new Image();
var imgUsr = new Image();
var pageNumber = 1;
function lineClick() {
    setTool(1);
}
function brushClick() {
    setTool(2);
}
function textClick() {
    setTool(3);
    console.info({ drawnObjects: drawnObjects });
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
    var inputPageNumber = document.getElementById('inputPageNumber');
    cv.addEventListener("mousedown", handleMouseDown);
    cv.addEventListener("mouseup", handleMouseUp);
    cv.addEventListener("mousemove", handleMouseMove);
    this.imgOrig.src = 'img/' + pageNumber.toString() + '.png';
    inputPageNumber.addEventListener("keyup", function (event) {
        console.info('input click');
        // Number 13 is the "Enter" key on the keyboard
        if (event.keyCode === 13) {
            // Cancel the default action, if needed
            console.info('input enter click');
            event.preventDefault();
            pageNumber = +inputPageNumber.value;
            redrawCanvas();
        }
    });
    // button prev page click must be async to redraw image after a small delay, otherwise it does not redraw
    function prevPage() {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        cv.focus();
                        pageNumber = --pageNumber;
                        imgOrig.src = 'img/' + pageNumber.toString() + '.png';
                        console.info('page: ' + pageNumber);
                        // sleep for  10ms so the picture redraws
                        return [4 /*yield*/, new Promise(function (r) { return setTimeout(r, 50); })];
                    case 1:
                        // sleep for  10ms so the picture redraws
                        _a.sent();
                        redrawCanvas();
                        inputPageNumber.value = pageNumber.toString();
                        return [2 /*return*/];
                }
            });
        });
    }
    var prevbtn = document.getElementById('btnPrevPage');
    if (prevbtn)
        prevbtn.onclick = prevPage;
    // button next page click must be async to redraw image after a small delay, otherwise it does not redraw
    function nextPage() {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        cv.focus();
                        pageNumber = ++pageNumber;
                        imgOrig.src = 'img/' + pageNumber.toString() + '.png';
                        console.info('page: ' + pageNumber);
                        // sleep for  10ms so the picture redraws
                        return [4 /*yield*/, new Promise(function (r) { return setTimeout(r, 50); })];
                    case 1:
                        // sleep for  10ms so the picture redraws
                        _a.sent();
                        redrawCanvas();
                        inputPageNumber.value = pageNumber.toString();
                        return [2 /*return*/];
                }
            });
        });
    }
    var nextbtn = document.getElementById('btnNextPage');
    if (nextbtn)
        nextbtn.onclick = nextPage;
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
                    drawnObjects.push(newLine);
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
        ctx.drawImage(imgOrig, 0, 0, cv.width, cv.height);
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        // draw objects
        drawnObjects.forEach(function (object) {
            if (object instanceof Line) {
                ctx.lineWidth = 2;
                ctx.strokeStyle = "black";
                ctx.beginPath();
                ctx.moveTo(object.bo.a.x, object.bo.a.y);
                ctx.lineTo(object.bo.b.x, object.bo.b.y);
                ctx.stroke();
                ctx.closePath();
            }
            else if (object instanceof BrushStroke) {
                ctx.lineWidth = 10;
                ctx.strokeStyle = "red";
                ctx.beginPath();
                ctx.moveTo(object.points[0].x, object.points[0].y);
                // i = index of single point in a brush stroke
                for (var i = 1; i < object.points.length; i++) {
                    ctx.lineTo(object.points[i].x, object.points[i].y);
                    ctx.stroke();
                }
                ctx.closePath();
            }
        });
        // draw current line
        ctx.lineWidth = 2;
        ctx.strokeStyle = "black";
        ctx.beginPath();
        if (newLine.editing) {
            ctx.moveTo(newLine.bo.a.x, newLine.bo.a.y);
            ctx.lineTo(newLine.bo.b.x, newLine.bo.b.y);
            ctx.stroke();
        }
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
    }
    function finishBrushStroke() {
        brushIsDrawing = false;
        drawnObjects.push(new BrushStroke(brushPoints));
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
