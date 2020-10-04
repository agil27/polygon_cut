function plot_polygon(poly, mark, linecolor) {
    context.beginPath()
    for (let i = 0; i < poly.length - 1; i++) {
        let color = "blue"
        if (mark[i] == 1) {
            color = "orange"
        } else if (mark[i] == 2) {
            color = "purple"
        }
        context.beginPath()
        context.strokeStyle = color
        context.fillStyle = color
        context.moveTo(poly[i][0], poly[i][1])
        context.arc(poly[i][0], poly[i][1], 5, 0, 2 * Math.PI, false)
        context.fill()
        context.stroke()
        context.beginPath()
        context.strokeStyle = linecolor
        context.moveTo(poly[i][0], poly[i][1])
        context.lineTo(poly[i + 1][0], poly[i + 1][1])
        context.stroke()
    }
}

status = 0 // 0, 1, 2, 3, 4 分别代表没有交互，画主多边形且没有未闭合的环，画主多边形且有未闭合的环，画裁剪多边形且没有未闭合的环，画裁剪多边形且有未闭合的环

function draw_major() {
    status = 1
}

function draw_cut() {
    status = 3
}

function cut() {
    let result = polygon_polygon_intersect(major_points, cut_points)
    let points = result['points']
    let marks = result['marks']
    plot_polygon(points, marks, "green")
}

major_points = []
cut_points = []

// 获得 canvas.context
var canvas = document.getElementById("quad")
var context = canvas.getContext("2d")

context.fillStyle = "white"
context.lineWidth = 2

canvas.onmousedown = function(e) {
    x = e.clientX - canvas.offsetLeft
    y = e.clientY - canvas.offsetTop

    // 画主多边形
    if (Number(status) === 1) {
        context.fillStyle = "blue"
        context.strokeStyle = "blue"
        if (e.button == 0) {
            major_points.push([])
            last_ring = major_points[major_points.length - 1]
            context.beginPath()
            context.moveTo(x, y)
            context.arc(x, y, 5, 0, 2 * Math.PI, true)
            context.fill()
            context.stroke()
            context.moveTo(x, y)
            last_ring.push([x, y])
            status = 2
        }
    } else if (Number(status) === 2) {
        last_ring = major_points[major_points.length - 1]
        context.fillStyle = "blue"
        context.strokeStyle = "blue"
        if (e.button == 0) {
            last_ring.push([x, y])
            context.lineTo(x, y)
            context.stroke()
            context.beginPath()
            context.arc(x, y, 5, 0, 2 * Math.PI, true)
            context.fill()
            context.stroke()
            context.moveTo(x, y)
        } else if (e.button == 2) {
            last_ring.push(last_ring[0])
            context.lineTo(last_ring[0][0], last_ring[0][1])
            context.stroke()
            status = 1
        }
    } else if (Number(status) === 3) {
        context.fillStyle = "red"
        context.strokeStyle = "red"
        if (e.button == 0) {
            cut_points.push([])
            last_ring = cut_points[cut_points.length - 1]
            context.beginPath()
            context.arc(x, y, 5, 0, 2 * Math.PI, true)
            context.fill()
            context.stroke()
            context.moveTo(x, y)
            last_ring.push([x, y])
            status = 4
        }
    } else if (Number(status) === 4) {
        context.fillStyle = "red"
        context.strokeStyle = "red"
        last_ring = cut_points[cut_points.length - 1]
        
        if (e.button == 0) {
            last_ring.push([x, y])
            context.lineTo(x, y)
            context.stroke()
            context.beginPath()
            context.arc(x, y, 5, 0, 2 * Math.PI, true)
            context.fill()
            context.stroke()
            context.moveTo(x, y)
        }
        if (e.button == 2) {
            last_ring.push(last_ring[0])
            context.lineTo(last_ring[0][0], last_ring[0][1])
            context.stroke()
            status = 3
        }
    }
}