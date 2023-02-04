<script lang="ts">
	import PictureCanvas from "./PictureCanvas.svelte";
	import Color from './Tools/Settings.svelte'
	import Tool from "./Tools/Tool.svelte";

</script>

<main>
	<h1> Pixinter </h1>
	<div class="canvas">
		<PictureCanvas />
	</div>
	<div class="tools">
		<div class="tool"> <Tool/> </div>
		<Color />
	</div>
</main>

<style>
	@import url('https://fonts.googleapis.com/css2?family=Raleway:ital,wght@0,300;1,200&family=Ubuntu:wght@300&display=swap');

	h1{
		color: white;
	}
	h1, .canvas, .tools {
		display: flex;
		justify-content: center;
		align-items: center;
	}

	h1{
		margin-top: 4em;
	}
	.tool {
		margin-right: 2em;

	}
</style>
