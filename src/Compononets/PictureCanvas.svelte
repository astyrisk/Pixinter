<script lang="ts">
    //TODO rewrite the shapes (rectangle and circle);
    //TODO implement UNDO and REDO
    import { onMount } from 'svelte';
	import { config, picture } from "../stores";
    import { getPointerPosition, getRadius, getColor } from "../subroutines";
    import type { Picture } from "../types";
    import type { Point } from "../types";
    import type { Config } from "../stores"


    /* constants & HTMLElements */
    const scale: number = 10;
    const width: number = 900;
    const height: number = 600;
    const backgroundColor: string = "#E1E4EA";

    const around = [{dx: -1, dy: 0}, {dx: 1, dy: 0},
                    {dx: 0, dy: -1}, {dx: 0, dy: 1}];

    let canvas: HTMLCanvasElement;
    let ctx: CanvasRenderingContext2D;
    // let picture: Picture;
    let pictureObj: Picture;
    let start: Point;

    let drawingRect: boolean = false;
    let drawingCircle: boolean = false;

    onMount(() => {
        canvas = document.querySelector('canvas') as HTMLCanvasElement;
        ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
        // picture = new Picture(width / scale, height / scale, scale);
    });


    /***** */

    /*******/
    /*TODO: rewrite the following in a consistent way */
    /** drawing */
    function drawPoint(p: Point, config: Config) {
        switch(config.tool) {
            case 'PEN':
                picture.subscribe(n => n.drawPoint(p, config['color'], ctx));
                // picture.drawPoint(p, config['color'], ctx);
                break;
            case 'ERASER':
                picture.subscribe(n => n.drawPoint(p, config['background_color'], ctx));
                // picture.drawPoint(p, config['background_color'], ctx);
                break;
        }
    }

    function pickColor(p: Point) {
        let selectedColor: string;
        picture.subscribe(n=> selectedColor = n.getColor(p));
        config.update(n => n = {
            color: selectedColor,
            background_color: n.background_color,
            tool: n.tool,
        });
    }

    function drawRect(start: Point, end: Point, color: string, ctx: CanvasRenderingContext2D) {
        let xStart = Math.min(start.x, end.x);
        let yStart = Math.min(start.y, end.y);
        let xEnd   = Math.max(start.x, end.x);
        let yEnd   = Math.max(start.y, end.y);
        let drawn  = [];

        for (let y = yStart; y < yEnd; y++) 
            for (let x = xStart; x < xEnd; x++) 
                drawn.push({x,y});

    //    picture.drawPoints(drawn, color, ctx);
       picture.subscribe(n => n.drawPoints(drawn, color, ctx));
    }
    

    function drawCircle(start: Point, end: Point, color: string, ctx: CanvasRenderingContext2D) {
        let r: number = Math.ceil(getRadius(start, end));
        let drawn  = [];

        let xStart = Math.min(start.x, end.x);
        let yStart = Math.min(start.y, end.y);
        let xEnd   = Math.max(start.x, end.x);
        let yEnd   = Math.max(start.y, end.y);

        xStart = xStart - 2 * r;
        yStart = yStart - 2 * r;
        xEnd = xEnd + 2 * r;
        yEnd = yEnd + 2 * r;

        for (let y = yStart; y < yEnd; y++) 
            for (let x = xStart; x < xEnd; x++)  {
                if (getRadius(start, {x, y}) <= r) 
                    drawn.push({x, y});
            }

        console.log(drawn);
        picture.subscribe(n => n.drawPoints(drawn, color, ctx));
        // picture.drawPoints(drawn, color, ctx);
    }

    function fillColor(p: Point, color: string, ctx: CanvasRenderingContext2D) {
        let w = width / 10, h = height / 10;
        let targetColor: string;
        picture.subscribe(n => targetColor = n.getColor(p));
        // picture.getColor(p);
        let drawn: Point[] = [p];
 
        for (let done = 0; done < drawn.length; done++){
            for (let {dx, dy} of around) {
                let x = drawn[done].x + dx, y =  drawn[done].y + dy;
                if (x >= 0 && x < w &&
                    y >= 0 && y < h &&
                    getColor(picture, {x,y}) == targetColor &&
                    !drawn.some(p => p.x == x && p.y == y)) {
                    drawn.push({x, y});
                }
            }
        }
        // picture.drawPoints(drawn, color, ctx);
        picture.subscribe(n => n.drawPoints(drawn, color, ctx));
    }

    /* handling canvas */
    function handleClick(event: MouseEvent, config: Config) {
        if (event.button != 0) return;

        switch(config.tool) {
            case 'PICKER':
                pickColor(getPointerPosition(event, canvas));
                break;
            case 'FILL':
                fillColor(getPointerPosition(event, canvas), config['color'], ctx);
                break;
            case 'RECT':
                if (drawingRect) drawRect(start, getPointerPosition(event, canvas), config['color'], ctx);
                else start = getPointerPosition(event, canvas);
                drawingRect = !drawingRect;
                break;
            case 'CIRCLRE':
                if (drawingCircle) drawCircle(start, getPointerPosition(event, canvas), config['color'], ctx);
                else start = getPointerPosition(event, canvas);
                drawingCircle = !drawingCircle;
                break;
            default:
                drawPoint(getPointerPosition(event, canvas), config);
        }
    }

    function handleMove(event: MouseEvent, config: Config) {
        if (event.buttons == 0) return;
        switch(config.tool) {
            default:
                drawPoint(getPointerPosition(event, canvas), config);
        } 
    }


    /*********************************************************/
</script>

<canvas id="canvas" width={width} height={height} style="border:1px solid #000; background-color: {backgroundColor}" on:click={(e) => handleClick(e, $config)} on:mousemove={(e) => handleMove(e, $config)}  >  
</canvas>