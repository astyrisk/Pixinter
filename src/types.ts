interface Point {
    x: number;
    y: number;
}

class Picture {
    width: number;
    height: number;
    scale: number;
    pixels: string[][];

    constructor (width: number, height: number, scale: number) {
        this.width = width;
        this.height = height;
        this.scale = scale;

        this.pixels = new Array(height);
        for (let i = 0; i < height ; i++) {
            this.pixels[i] = new Array(width);
            this.pixels[i].fill("#E1E4EA"); // should be background color
        }
    }

    setPixels(pixels: string[][]) {
        this.pixels = pixels;
    }

    redraw(ctx: CanvasRenderingContext2D) {
        for (let j = 0; j < this.height; j++)
            for (let i = 0; i < this.width; i++) {
                ctx.fillStyle = this.pixels[j][i];
                ctx.fillRect(i * 10, j * 10, this.scale, this.scale);
            }
    }
    drawPoint(p: Point, color: string, ctx: CanvasRenderingContext2D) {
        this.pixels[p.y][p.x] = color;
        ctx.fillStyle = color; 
        ctx.fillRect(p.x * 10, p.y * 10, this.scale, this.scale);
    }
    getColor(p: Point) : string {
        return this.pixels[p.y][p.x];
    }
    drawPoints(ps: Point[], color: string, ctx: CanvasRenderingContext2D) {
        ctx.fillStyle = color;
        for (let {x, y} of ps) {
            this.pixels[y][x] = color;
            ctx.fillRect(x  * this.scale, y * this.scale, this.scale, this.scale);
        }
    }
}
export {Picture};
export type {Point};
