<script lang="ts">
	import { goto } from "$app/navigation";
    import "../app.scss";
    // onMount(() => {
    //     web3modal = new Web3Modal(
    //     { projectId },
    //     ethereumClient
    //     )
    //     getFullBetsCreated()
    //     fetchGames()
    // })
    // onDestroy(() => {
    //     unwatchNetwork()
    //     unwatchSepBets()
    //     unwatchFujiBets()
    // })
</script>

<title>Uni-Vestigator</title>
<div class="px-20 bg-dark text-white min-h-screen">
    <div on:click={() => {goto('/')}} class="hover:cursor-pointer py-8 text-5xl font-bold">
        Uni-vestigator
    </div>
    <slot />
    <div class="h-[200px]">&nbsp;</div>
</div>

