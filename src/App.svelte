<script lang="ts">
	import PictureCanvas from "./Compononets/PictureCanvas.svelte";
	import Tool from "./Compononets/Tool.svelte";
	import Settings from './Compononets/Settings.svelte'
	import File from "./Compononets/File.svelte"

</script>

<main>
	<h1> Pixinter </h1>

	<div class="canvas">
		<PictureCanvas />
	</div>

	<div class="tools">
		<div class="tool"> <Tool/> </div>
		<div class="settings"> <Settings /> </div>
	</div>

	<div class="file">
		<File />
	</div>
</main>

<style>
	@import url('https://fonts.googleapis.com/css2?family=Raleway:ital,wght@0,300;1,200&family=Ubuntu:wght@300&display=swap');

	h1, .canvas, .tools, .file {
		color: white;
		display: flex;
		justify-content: center;
		align-items: center;
	}
	h1{
		margin-top: 2.6em;
	}
	.tool {
		margin-right: 1em;
	}
</style>
