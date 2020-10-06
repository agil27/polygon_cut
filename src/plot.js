// 绘制一个简单闭多边形
function plot_polygon(poly, color) {
    context.beginPath()
    context.strokeStyle = color
        context.fillStyle = color
    for (let i = 0; i < poly.length - 1; i++) {
        context.moveTo(poly[i][0], poly[i][1])
        context.arc(poly[i][0], poly[i][1], 5, 0, 2 * Math.PI, false)
        context.fill()
        context.stroke()
        context.moveTo(poly[i][0], poly[i][1])
        context.lineTo(poly[i + 1][0], poly[i + 1][1])
        context.stroke()
    }
}


// 调试用函数，用来绘制所有交点（入点和出点用不同颜色标识）
function plot_polygon_with_mark(poly, mark, linecolor) {
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


// 表示状态的全局变量
// 0, 1, 2, 3, 4 分别代表没有交互，画主多边形且没有未闭合的环，画主多边形且有未闭合的环，画裁剪多边形且没有未闭合的环，画裁剪多边形且有未闭合的环
var status = 0 

// 存储多边形点的列表
var major_points = []
var cut_points = []


// 获得画图板有关句柄
var canvas = document.getElementById("quad")
var context = canvas.getContext("2d")

context.fillStyle = "white"
context.lineWidth = 2


// 按钮响应函数
function draw_major() {
    status = 1
}


function draw_cut() {
    status = 3
}


function cut() {
    // 调试用代码
    // let result = polygon_polygon_intersect(major_points, cut_points)
    // let points = result['points']
    // let marks = result['marks']
    // plot_polygon_with_mark(points, marks, "green")

    let cut_result = weiler_atherton(major_points, cut_points)

    // console.log(cut_result)
    
    for (let r of cut_result) {
        plot_polygon(r, "green")
    }
}


function clear_all() {
    major_points = []
    cut_points = []
    status = 0
    context.clearRect(0, 0, canvas.width, canvas.height)
}


// 设置绘图板点击的响应事件
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