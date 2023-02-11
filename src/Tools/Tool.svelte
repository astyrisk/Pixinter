<script lang="ts">
    import { onMount } from "svelte";
    import { config, TOOLENUM } from "../stores";

    

    /* subroutines */
    function getClassName(target: EventTarget | any) : string {
        return  (target.classList[0]);
    }

    /* const */
    const tools: string[] = ["pen", "eraser", "fill", "picker"];
    const shapes: string[] = ["circle", "rect"];

    let toolsImg: HTMLImageElement[];


    onMount(() => {
        toolsImg = Array.from(document.querySelectorAll("img"));
    });


    function handleMouseClick(event: MouseEvent) {
        let toolName: string = getClassName(event.target);
        toolsImg.map(n => { n.src = `../../icons/${n.classList[0]}.png`; });
        toolsImg.filter(n => n.classList[0] == toolName)[0].src = `../../icons/${toolName}-selected.png`;
        /* updating the store */
        toolName = toolName.toUpperCase();

        config.update(n => n = {
            color: n.color,
            background_color: n.background_color,
            tool: TOOLENUM[toolName],
        });


    }
    function handleKeyDown() {
    }
    function handleMouseOver(event: MouseEvent | FocusEvent) {
        let toolName: string = getClassName(event.target);
        toolsImg.map(n => { n.style.borderWidth = "0px"; });
        toolsImg.filter(n => n.classList[0] == toolName)[0].style.borderWidth = "1px";
    }
    function handleFocus() {
    }



</script>


<main>
    <!-- Tools-->
    <div class="tools">
        {#each tools as tool}
            <img src="../../icons/{tool}.png" class="{tool}" alt="{tool}" width="30px" on:click={handleMouseClick} on:keydown={handleKeyDown} on:mouseover={handleMouseOver} on:focus={handleFocus}>
        {/each}
    </div>

    <img class="seperator" src="../../icons/seperator.png" alt="seperator" width="30px" height="30px">

    <!-- Shapes -->
    <div class="shapes">
        {#each shapes as shape}
            <img src="../../icons/{shape}.png" class="{shape}" alt="{shape}" width="30px" on:click={handleMouseClick} on:keydown={handleKeyDown} on:mouseover={handleMouseOver} on:focus={handleFocus}>
        {/each}
    </div>
    
    <img class="seperator" src="../../icons/seperator.png" alt="seperator" width="30px" height="30px">
</main>


<style>
    main {
        display: flex;
        align-items: center;
        justify-content: center;
    }
    img {
        border-width: 0px;
        border: solid;
        border-radius: 10%;
        border-color: white;
        border-width: 0px;
        margin-right: 7px;
        margin-left: 7px;
    }
</style>