function cross_product(a, b, c) {
    return (b.x - a.x) * (c.y - a.y) - (c.x - a.x) * (b.y - a.y)
}


// ref: http://www.cppblog.com/wicbnu/archive/2009/08/24/94225.html
function isIntersected(p, q) {
    a = {'x': p[0][0], 'y': p[0][1]}
    b = {'x': p[1][0], 'y': p[1][1]}
    c = {'x': q[0][0], 'y': q[0][1]}
    d = {'x': q[1][0], 'y': q[1][1]}
    
    f1 = cross_product(a, b, c) * cross_product(a, b, d)
    f2 = cross_product(c, d, a) * cross_product(c, d, b)
    return (f1 < 0.0 || Math.abs(f1) < 1e-6) && (f2 < 0.0 || Math.abs(f2) < 1e-6)
}


// ref: https://en.wikipedia.org/wiki/Line%E2%80%93line_intersection#Given_two_points_on_each_line
function lineseg_intersect(p, q) {
    x1 = p[0][0], y1 = p[0][1]
    x2 = p[1][0], y2 = p[1][1]
    x3 = q[0][0], y3 = q[0][1]
    x4 = q[1][0], y4 = q[1][1]

    t1 = (x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)
    t2 = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4)
    t = t1 / t2
    x = x1 + t * (x2 - x1)
    y = y1 + t * (y2 - y1)
    return [x, y]
}


function lineseg_ring_intersect(p, r) {
    points = []
    for (let i = 0; i < r.length - 1; i++) {
        q = [[], []]
        q[0] = r[i], q[1] = r[i + 1]
        if (isIntersected(p, q)) {
            points.push(lineseg_intersect(p, q))
        }
    }
    return points
}


function lineseg_polygon_intersect(l, p) {
    points = []

    x = l[0][0], y = l[0][1]

    for (let r of p) {
        points = points.concat(lineseg_ring_intersect(l, r))
    }

    points.sort(function(a, b) {
        dxa = Math.abs(a[0] - x)
        dxb = Math.abs(b[0] - x)
        dya = Math.abs(a[1] - y)
        dyb = Math.abs(b[1] - y)

        if (dxa === dxb) {
            return dya - dyb
        } else {
            return dxa - dxb
        }
    })

    return points
}


function ring_polygon_intersect(r, p) {
    len = r.length
    points = []
    for (let i = 0; i < len - 1; i++) {
        l = [r[i], r[i + 1]]
        points = points.concat(lineseg_polygon_intersect(l, p))
    }
    return points
}


function polygon_polygon_intersect(p, q) {
    points = []
    for (let r of p) {
        points = points.concat(ring_polygon_intersect(r, q))
    }
    return points
}
