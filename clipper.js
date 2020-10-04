var INF = 27182836


// 计算向量ab和ac的叉积
function cross_product(a, b, c) {
    return (b[0] - a[0]) * (c[1] - a[1]) - (c[0] - a[0]) * (b[1] - a[1])
}


// ref: http://www.cppblog.com/wicbnu/archive/2009/08/24/94225.html
function is_intersected(p, q) {
    let a = p[0]
    let b = p[1]
    let c = q[0]
    let d = q[1]
    
    let f1 = cross_product(a, b, c) * cross_product(a, b, d)
    let f2 = cross_product(c, d, a) * cross_product(c, d, b)
    return (f1 < 0.0 || Math.abs(f1) < 1e-6) && (f2 < 0.0 || Math.abs(f2) < 1e-6)
}


// ref: https://en.wikipedia.org/wiki/Line%E2%80%93line_intersection#Given_two_points_on_each_line
function lineseg_intersect(p, q) {
    let x1 = p[0][0], y1 = p[0][1]
    let x2 = p[1][0], y2 = p[1][1]
    let x3 = q[0][0], y3 = q[0][1]
    let x4 = q[1][0], y4 = q[1][1]

    let t1 = (x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)
    let t2 = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4)
    let t = t1 / t2
    let x = x1 + t * (x2 - x1)
    let y = y1 + t * (y2 - y1)
    return [x, y]
}


function lineseg_ring_intersect(p, r) {
    points = []
    for (let i = 0; i < r.length - 1; i++) {
        q = [[], []]
        q[0] = r[i], q[1] = r[i + 1]
        if (is_intersected(p, q)) {
            points.push(lineseg_intersect(p, q))
        }
    }
    return points
}


function lineseg_polygon_intersect(l, p) {
    let points = [l[0]]

    let x = l[0][0], y = l[0][1]

    for (let r of p) {
        points = points.concat(lineseg_ring_intersect(l, r))
    }

    points.sort(function(a, b) {
        let dxa = Math.abs(a[0] - x)
        let dxb = Math.abs(b[0] - x)
        let dya = Math.abs(a[1] - y)
        let dyb = Math.abs(b[1] - y)

        if (dxa === dxb) {
            return dya - dyb
        } else {
            return dxa - dxb
        }
    })

    let marks = [0] // 0为顶点，1为入点，2为出点

    let first_orient = 1
    if (point_inside_polygon(l[0], p)) {
        first_orient = 2
    }
    let second_orient = 3 - first_orient

    for (let i = 1; i < points.length; i++) {
        if (i % 2 == 1) {
            marks.push(first_orient)
        } else {
            marks.push(second_orient)
        }
    }

    return {'points': points, 'marks': marks}
}


function ring_polygon_intersect(r, p) {
    let len = r.length
    let points = []
    let marks = []
    for (let i = 0; i < len - 1; i++) {
        let l = [r[i], r[i + 1]]
        let result = lineseg_polygon_intersect(l, p)
        let new_points = result['points']
        let new_marks = result['marks']
        points = points.concat(new_points)
        marks = marks.concat(new_marks)
    }
    points.push(r[0])
    marks.push(0)
    return {'points': points, 'marks': marks}
}


function polygon_polygon_intersect(p, q) {
    let points = []
    let marks = []
    for (let r of p) {
        let result = ring_polygon_intersect(r, q)
        let new_points = result['points']
        let new_marks = result['marks']
        points = points.concat(new_points)
        marks = marks.concat(new_marks)
    }
    return {'points': points, 'marks': marks}
}


// 给定三个共线的点p, q, r，判断q是否在线段pr上
function on_lineseg(p, q, r) {
    return ((q[0] <= Math.max(p[0], r[0])) && (q[0] >= Math.min(p[0], r[0]))
        && (q[1] <= Math.max(p[1], r[1])) && (q[1] >= Math.min(p[2], r[2])))
}


// 判断三点的位置关系，0代表共线，1代表构成逆时针三角形，2表示顺时针三角形
function orient(p, q, r) {
    let v = Number(cross_product(p, q, r))
    if (v === 0 || Math.abs(v) < 1e-6) {
        return 0
    } else if (v < 0) {
        return 1
    } else {
        return 2
    }
}


// 水平射线法判断点是否在一个简单闭环内
function point_inside_ring(p, r) {
    let n = r.length - 1
    if (n < 3) return false

    let e = [INF, p[1]] // 无穷远点
    let count = 0
    let l = [p, e]

    for (let i = 0; i < n; i++) {
        let side = [r[i], r[i + 1]]
        if (is_intersected(l, side)) {
            orientation = Number(orient(r[i], p, r[i + 1]))
            if (orientation === 0) {
                return on_lineseg(r[i], p, r[i + 1])
            }
            count++
        }
    }
    return (count % 2 == 1)
}


// 判断一个点是否在多边形内
function point_inside_polygon(point, poly) {
    for (let ring of poly) {
        if (ring.length < 3) {
            return false
        }
    
        let orientation = Number(orient(ring[0], ring[1], ring[2])) // 判断是内环还是外环

        if (orientation === 0) return false
    
        f = point_inside_ring(point, ring)
        if (orientation === 2) f = !f
        if (!f) return false
    }
    return true
}


function weiler_atherton(major_points, cut_points) {
    major_list = polygon_polygon_intersect(major_points, cut_points)
    cut_list = polygon_polygon_intersect(cut_points, major_points)

    result = []
    visited = []

    for (let i = 0; i < major_list.length; i++) {
        visited.push(false)
    }
    
    while (true) {
        for (let i = 0; i < visited.length; i++) {
            if (!visited[i]) {
                // 如果有未追踪的点，则开始沿着两张表追踪
                continue
            }
        }
        break
    }
}