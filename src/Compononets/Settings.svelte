<script lang="ts">
  import { config } from "../stores";

  function handleColorChange(event) {
    config.update(n => n =  {
      color: event.target.value,
      background_color: n.background_color,
      tool: n.tool,
    });
  }

</script>

<style>
  .color-selector {
    display: inline-block;
    padding: 10px;
    width: 30px;
    height: 30px;
  }
</style>

<div class="color-selector" >
  <input type="color" bind:value={$config['color']} on:input={handleColorChange} width="30px" height="30px"/>
</div>
