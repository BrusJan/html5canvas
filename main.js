var tool = 0 // 0 = none, 1 = line, 2 = text
var newLine = { x1: 0, y1: 0, x2: 0, y2: 0, editing: false }
var lines = []
var lineStarted

function lineClick() {
  setTool(1)
  console.log('lineclick')
  console.log(lines)
}
function textClick() {
  setTool(2)
  console.log('textclick')
  console.log(lines)
}
function setTool(t) {
  tool = t
  let ispan = document.getElementById('i-tool')
  ispan.innerHTML = t
}

window.onload = function () {
  setTool(0)
};
// switch (tool) {
//   case 0: return;
//   case 1:
//     break;
//   case 2:
//     break;
// }
function handleMouseDown(e) {
  switch (tool) {
    case 0: return;
    case 1:
      const rect = canvas.getBoundingClientRect()
      newLine = { x1: parseInt(e.clientX - rect.left), y1: parseInt(e.clientY - rect.top), x2: 0, y2: 0, editing: true }
      break;
    case 2:
      break;
  }

}

function handleMouseUp(e) {
  switch (tool) {
    case 0: return;
    case 1:
      const rect = canvas.getBoundingClientRect()
      newLine.x2 = parseInt(e.clientX - rect.left)
      newLine.y2 = parseInt(e.clientY - rect.top)
      newLine.editing = false
      // if line is too short, do not create it
      if (Math.abs(newLine.x1 - newLine.x2) > 3 || Math.abs(newLine.y1 - newLine.y2) > 3) {
        lines.push(Object.assign({}, newLine))
      }
      redrawCanvas()
      break;
    case 2:
      break;
  }
}

function handleMouseMove(e) {
  switch (tool) {
    case 0: return
    case 1:
      const rect = canvas.getBoundingClientRect()
      newLine.x2 = parseInt(e.clientX - rect.left)
      newLine.y2 = parseInt(e.clientY - rect.top)
      redrawCanvas()
      break
    case 2:
      break
  }
}

function redrawCanvas() {
  let canvas = document.querySelector('canvas')
  let ctx = canvas.getContext("2d")
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  ctx.beginPath()
  if (newLine.editing) {
    ctx.moveTo(newLine.x1, newLine.y1)
    ctx.lineTo(newLine.x2, newLine.y2)
    ctx.stroke();
  }
  for (let i = 0; i < lines.length; i++) {
    ctx.moveTo(lines[i].x1, lines[i].y1)
    ctx.lineTo(lines[i].x2, lines[i].y2)
    ctx.stroke()
  }
  ctx.closePath()
}

