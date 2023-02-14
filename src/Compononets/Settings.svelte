<script lang="ts">
  import { onMount } from 'svelte';
  import { config } from "../stores";
  import { picture, pictureHistory } from "../stores";

    let canvas: HTMLCanvasElement;
    let ctx: CanvasRenderingContext2D;

    onMount(() => {
        canvas = document.querySelector('canvas') as HTMLCanvasElement;
        ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
    });

  function handleColorChange(event) {
    config.update(n => n =  {
      color: event.target.value,
      background_color: n.background_color,
      tool: n.tool,
    });
  }

  function handleUndo() {
    $picture.setPixels(($pictureHistory).pop().getPixels());
    $picture.redraw(ctx);
  }
</script>

<img src="../icons/undo.png" class="undo" width="30" alt="undo icon" on:click={handleUndo} on:keydown={() => {}}>
<input type="color" bind:value={$config['color']} on:input={handleColorChange} />

<style>
  .undo{
    position: absolute;
    margin-left: 4em;
    margin-top: 1.3em;
  }
  input {
    margin-top: 1.3em;
    margin-left: 0;

  }
 </style>

