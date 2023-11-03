<script lang="ts">
    import Header from "../../components/Header.svelte";
</script>

<Header />

<div class="w-screen h-screen flex flex-col">
    <h1 class="flex justify-center items-center w-full h-full soon-text text-5xl">
        Coming Soon
    </h1>
</div>

<style>
	:root {
		--angle: 290deg;
	}
	.soon-text {
		background: linear-gradient(var(--angle), #0015fc 10%,  #1b69f9 25%, rgb(97, 200, 255) 60%, #77fff1 100%);
		background-size: 250% 250%;
		-webkit-animation: gradient 3s ease infinite;
		-moz-animation: gradient 3s ease infinite;
		animation: gradient 3s ease infinite;
		background-clip: text;
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
	}

	@-webkit-keyframes gradient {
		0%{background-position:0% 49%}
		50%{
			background-position:100% 52%;
		}
		100%{background-position:0% 49%}
	}
	@-moz-keyframes gradient {
		0%{background-position:0% 49%}
		50%{
			background-position:100% 52%;
		}
		100%{background-position:0% 49%}
	}
	@keyframes gradient {
		0%{background-position:0% 49%}
		50%{
			background-position:100% 52%;
		}
		100%{background-position:0% 49%}
	}
</style>