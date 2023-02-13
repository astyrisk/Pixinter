<script lang="ts">
  //TODO change undo icon -whiter!
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
    // $picture.setPixels(pixels);
    // $picture.redraw(ctx);

    let pics = $pictureHistory;
    let length = pics.length;
    let pixels = pics[length - 1].getPixels();
    
    console.log(pics);

    // console.log(pixels);

    $picture.setPixels(pixels);
    $picture.redraw(ctx);

    $pictureHistory.pop();
  }



</script>

<style>
  input {
    margin-top: .7em;
    margin-right: 1em;
  }
  img {
    margin-top: 0em;
  }
</style>

  <input type="color" bind:value={$config['color']} on:input={handleColorChange} width="30px" height="30px"/>
  <img src="../icons/undo.png" width="30" alt="undo icon" on:click={handleUndo} on:keydown={() => {}}>
