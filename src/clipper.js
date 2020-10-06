var INF = 27182836


// 计算向量ab和ac的叉积
function cross_product(a, b, c) {
    return (b[0] - a[0]) * (c[1] - a[1]) - (c[0] - a[0]) * (b[1] - a[1])
}


// 判断两条线段是否相交
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


// 计算两条直线的交点
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


// 计算一条直线与一个简单闭多边形（闭环）的交点
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


// 计算一条直线与一个含闭环的多边形的交点
function lineseg_polygon_intersect(l, p) {
    let points = [l[0]]

    let x = l[0][0], y = l[0][1]

    for (let r of p) {
        points = points.concat(lineseg_ring_intersect(l, r))
    }

    // 按照距离出发点的远近排列交点，这样入点出点一定是交替出现的
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


// 计算一个闭环与一个多边形的交点
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


// 计算多边形与多边形的交点，最后返回结果是一个点列表和每个点的标记（入点，出点，顶点）
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
// ref: https://www.geeksforgeeks.org/how-to-check-if-a-given-point-lies-inside-a-polygon/
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


// 判断一个环是顺时针还是逆时针
function clockwise(r) {
    // 找到最左端的点，一定是凸点
    let min_x = INF
    let convex_index = -1
    for (let i = 0; i < r.length - 1; i++) {
        if (r[i][0] < min_x) {
            convex_index = i
            min_x = r[i][0]
        }
    }

    let prev_index = convex_index - 1
    
    // 如果恰好是第一个或最后一个点
    if (convex_index == 0) {
        prev_index = r.length - 2
    }
    
    let next_index = convex_index + 1
    
    // 判断该点与前后两点的位置关系
    let orientation = Number(orient(r[prev_index], r[convex_index], r[next_index]))

    return (orientation === 2)
}


// 判断一个点是否在多边形内
function point_inside_polygon(point, poly) {
    for (let ring of poly) {
        if (ring.length < 3) {
            return false
        }
    
        f = point_inside_ring(point, ring) ^ clockwise(ring)
        if (!f) return false
    }
    return true
}


// 判断两点是否相同
function identical_point(p, q) {
    return (Math.abs(p[0] - q[0]) < 1e-6) && (Math.abs(p[1] - q[1]) < 1e-6)
}


// 将两张表的交点建立对应，方便查询
function link_list(major_list, major_marks, cut_list, cut_marks) {
    map_m2c = []
    map_c2m = []
    for (let i = 0; i < major_list.length; i++) {
        for (let j = 0; j < cut_list.length; j++) {
            if (major_marks[i] != 0 && cut_marks[j] != 0 && identical_point(major_list[i], cut_list[j])) {
                map_m2c[i] = j
                map_c2m[j] = i
            }
        }    
    }
    return [map_m2c, map_c2m]
}


// 核心算法
function weiler_atherton(major_points, cut_points) {
    major_result= polygon_polygon_intersect(major_points, cut_points)
    cut_result = polygon_polygon_intersect(cut_points, major_points)

    major_list = major_result['points']
    major_marks = major_result['marks']
    cut_list = cut_result['points']
    cut_marks = cut_result['marks']

    // 裁剪多边形列表中入点出点调整
    for (let i = 0; i < cut_marks.length; i++) {
        if (cut_marks[i] > 0) {
            cut_marks[i] = 3 - cut_marks[i]
        }
    }

    link_result = link_list(major_list, major_marks, cut_list, cut_marks)

    // 调试代码
    // console.log(major_list)
    // console.log(cut_list)
    // console.log(map_m2c)
    // console.log(map_c2m)

    map_m2c = link_result[0]
    map_c2m = link_result[1]

    result = []
    visited = []

    for (let i = 0; i < major_list.length; i++) {
        visited.push(false)
    }
    
    for (let i = 0; i < visited.length; i++) {
        if (!visited[i] && Number(major_marks[i]) !== 0) {
            // 如果有未追踪的交点，则开始沿着两张表追踪
            first_index = i
            current_index = i
            current_list = 'major'
            ring = []
            while (true) {
                // 调试代码
                // console.log(current_list, current_index)
                if (current_list === 'major') {
                    ring.push(major_list[current_index])
                    vertex_type = major_marks[current_index]
                    visited[current_index] = true

                    if (ring.length > 1 && current_index == first_index) {
                        // 回到了起点，形成了闭环
                        break
                    }

                    if (vertex_type == 0) {
                        // 如果是顶点，判断一下是不是到了列表末端
                        for (let j = 0; j < major_list.length - 1; j++) {
                            if (identical_point(major_list[j], major_list[current_index])) {
                                current_index = j
                                break
                            }
                        }
                        current_index++
                        continue
                    } else if (vertex_type == 1) {
                        // 如果是入点，继续沿着主多边形追踪
                        current_index++
                        continue
                    } else {
                        // 如果是出点，在裁剪多边形中追踪
                        current_list = 'cut'
                        current_index = map_m2c[current_index] + 1
                        continue
                    }
                } else {
                    ring.push(cut_list[current_index])
                    vertex_type = cut_marks[current_index]
                    if (ring.length > 1 && map_c2m[current_index] == first_index) {
                        // 回到了起点，形成了闭环
                        break
                    }
                    if (vertex_type == 0) {
                        // 如果是顶点，判断一下是不是到了列表末端
                        for (let j = 0; j < cut_list.length - 1; j++) {   
                            if (identical_point(cut_list[j], cut_list[current_index])) {
                                current_index = j
                                break
                            }
                        }
                        current_index++
                        continue
                    } else if (vertex_type == 2) {
                        // 如果是出点，继续沿着裁剪多边形追踪
                        visited[map_c2m[current_index]] = true
                        current_index++
                        continue
                    } else {
                        // 如果是入点，在主多边形中追踪
                        visited[map_c2m[current_index]] = true
                        current_list = 'major'
                        current_index = map_c2m[current_index] + 1
                        continue
                    }
                }
            }
            result.push(ring)
        }
    }
    
    return result
}
