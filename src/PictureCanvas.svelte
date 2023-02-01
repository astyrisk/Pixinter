<script lang="ts">
    //TODO complete handleMouseclick, handletouch and write the tools, picks pixelated icons from interent. 
    import { onMount } from 'svelte';
    /* consts */
    const scale: number = 10;
    let canvas: HTMLCanvasElement;
    let ctx: CanvasRenderingContext2D;

    class Point {
        x: number;
        y: number;
        constructor(x: number, y: number) {
            this.x = x;
            this.y = y;
        }
        set(x: number, y: number) {
            this.x = x;
            this.y = y;
        }
    }

    let mousePosition: Point = new Point(0, 0);

    onMount(() => {
        canvas = document.querySelector('canvas') as HTMLCanvasElement;
        ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
    });

    /* subroutines */
    function getPointerPosition(p: MouseEvent, domNode: HTMLElement): Point {
        let rect = domNode.getBoundingClientRect();
        return new Point(Math.floor((p.clientX - rect.left) / scale) * scale, Math.floor((p.clientY - rect.top) / scale) * scale);
    }

    /* DOM stuff */
    function handleMouseclick(event: MouseEvent) {
        if (event.button != 0) return;
        let pointerPosition: Point = getPointerPosition(event, canvas);
        ctx.fillRect(pointerPosition.x , pointerPosition.y, scale, scale);
        let move = (moveEvent: MouseEvent) => {
            if (moveEvent.buttons == 0) {
                this.dom.removeEventListener("mousemove", move);
            } else {
                let newPos: Point = getPointerPosition(moveEvent, canvas);
            }
        }
    }
</script>

<div>
    <canvas id="canvas" width="900" height="600" style="border:1px solid #000;" on:click={handleMouseclick} >  
    </canvas>
</div>