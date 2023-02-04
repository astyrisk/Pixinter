<script>
    //TODO put an icon before the input

    import { config } from "../stores";

  function handleColorChange(event) {
    config.set({color: event.target.value, tool: "pen"});
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
