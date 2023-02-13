<script lang="ts">
	import PictureCanvas from "./Compononets/PictureCanvas.svelte";
	import Color from './Compononets/Settings.svelte'
	import Tool from "./Compononets/Tool.svelte";
	import File from "./Compononets/File.svelte"

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
	<div class="file">
		<File />
	</div>
</main>

<style>
	@import url('https://fonts.googleapis.com/css2?family=Raleway:ital,wght@0,300;1,200&family=Ubuntu:wght@300&display=swap');

	h1{
		color: white;
	}
	h1, .canvas, .tools, .file {
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
