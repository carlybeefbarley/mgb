/** Bresenham line Function
 * @params drawPtFn() is a function that will draw a point at (x, y)
 * x0,y0 are the start position for the line
 * x1,y1 are the end position for the line
*/
export default function bline(drawPtFn, x0, y0, x1, y1) {
  let dx = Math.abs(x1 - x0),
    sx = x0 < x1 ? 1 : -1
  let dy = Math.abs(y1 - y0),
    sy = y0 < y1 ? 1 : -1
  let err = (dx > dy ? dx : -dy) / 2

  while (true) {
    drawPtFn(x0, y0)
    if (x0 === x1 && y0 === y1) break
    let e2 = err
    if (e2 > -dx) {
      err -= dy
      x0 += sx
    }
    if (e2 < dy) {
      err += dx
      y0 += sy
    }
  }
}
