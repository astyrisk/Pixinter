<script lang="ts">

    import { onMount } from 'svelte';
	import { config } from "./stores";

    const scale: number = 10;
    let canvas: HTMLCanvasElement;
    let ctx: CanvasRenderingContext2D;

    interface Point {
        x: number;
        y: number;
    }

    interface ColoredPoint {
        x: number;
        y: number;
        color: string;
    }

    interface Config {
        color: string,
        tool: string,
    }

    onMount(() => {
        canvas = document.querySelector('canvas') as HTMLCanvasElement;
        ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
    });

    class Picture { 
        width: number;
        heigh: number;
        pixels: Point[];
    }

    function getPointerPosition(p: MouseEvent, domNode: HTMLElement): Point {
        let rect = domNode.getBoundingClientRect();
        return {x: Math.floor((p.clientX - rect.left) / scale) * scale,
                y: Math.floor((p.clientY - rect.top)  / scale) * scale};
    }

    function drawPoint(p: Point, config: Config) {
        if (config.tool == "pen") {
            ctx.fillStyle = config['color'];
            ctx.fillRect(p.x, p.y, scale, scale);
        } else {
            ctx.fillStyle = "#ffffff";
            ctx.fillRect(p.x, p.y, scale, scale);
        }
    }

    function handleMouseclick(event: MouseEvent, config: Config) {
        if (event.button != 0) return;
        drawPoint(getPointerPosition(event, canvas), config);
    }

    function handleMousemove(event: MouseEvent, config: Config) {
        if (event.buttons == 0) return;
        drawPoint(getPointerPosition(event, canvas), config);
    }
</script>

<div>
    <canvas id="canvas" width="900" height="600" style="border:1px solid #000;" on:click={(e) => handleMouseclick(e, $config)} on:mousemove={(e) => handleMousemove(e, $config)}  >  
    </canvas>
</div>


<style>
    #canvas{
        background-color: #E1E4EA;
    }
</style>