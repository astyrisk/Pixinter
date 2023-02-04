<script>
    import { onMount } from "svelte";
    import { config } from "../stores";
    //TODO fill
    //TODO rectangel
    //TODO keydowns 
    let pen;
    let eraser;

    onMount(() => {
        pen= document.querySelector(".pen");
        eraser = document.querySelector(".eraser");
    });


    function handleKeyDown() {
    }

    function handlePenClick() {
        config.update(n => n = {color: n.color, tool: "pen"})
        eraser.style.borderWidth = "0px";
        pen.style.borderWidth = "0.5px";
    }
    function handleEraserClick() {
        config.update(n => n = {color: n.color, tool: "eraser"})
        pen.style.borderWidth = "0px";
        eraser.style.borderWidth = "0.5px";
    }

</script>


<div class="tools">
    <div class="pen" on:click={handlePenClick} on:keydown={handleKeyDown}>
        <img src="../../icons/pen-tool.png" alt="pixel" width="30px" height="30px">
    </div>

    <div class="eraser" on:click={handleEraserClick} on:keydown={handleKeyDown}>
        <img src="../../icons/eraser.png" alt="pixel" width="30px" height="30px">
    </div>
</div>

<style>
    .tools {
        display: flex;
        align-items: center;
        justify-content: center;
    }
    .pen, .eraser {
        filter: grayscale(0%);
        color: white;
        border: solid;
        border-width: 0px;
        border-radius: 10%;
        border-color: white;
    }
    .pen {
        margin-right: 10px;
    }

</style>