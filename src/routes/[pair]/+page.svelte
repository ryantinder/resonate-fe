<script lang="ts">
	import { page } from '$app/stores';
	import { fixDecimalPlaces, fixTimestamp } from '$lib/helpers.js';
	import { aliases } from '$lib/stores.js';
	import { formatUnits } from 'viem';

    export let data;
    $: highlighted = ''
    console.log(data)
    $: isUser = data.swaps.length == 0
    $: swaps = isUser ? data.user : data.swaps;
</script>

<!-- <Header /> -->

<main class="flex font-mont flex-col justify-center gap-2 px-2 lg:px-0 text-clip">
    <div class="py-2 text-2xl font-bold border-b-2 border-white">
        {#if data.pair}
            {data.pair.name}
        {:else}
            Address: {$page.params.pair}
        {/if}
    </div>
    <div class="w-full flex p-2">
        <div class="w-1/6">Time</div>
        <div class="w-1/12">Type</div>
        <div class="w-1/12">{data.pair?.inputTokens[0].name ?? "Out"}</div>
        <div class="w-1/12">{data.pair?.inputTokens[1].name ?? "In"}</div>
        <div class="w-1/4">{isUser ? 'Pair' : 'Sender (click address to label)'}</div>
        <div class="w-1/4">Transaction</div>
    </div>
    {#each swaps as swap}
        <div class={`w-full flex p-2 border-2 border-black text-clip`}>
            <span class="w-1/6">{fixTimestamp(swap.timestamp)}</span>
            {#if swap.tokenIn.id == swap.pool.inputTokens[0].id}
                <span class="w-1/12 text-red-500">Sell</span> 
                <span class="w-1/12">
                    {fixDecimalPlaces(formatUnits(swap.amountIn, swap.pool.inputTokens[0].decimals), 2)} 
                    {isUser ? swap.pool.inputTokens[0].name : ''}
                </span>
                <span class="w-1/12">
                    {fixDecimalPlaces(formatUnits(swap.amountOut, swap.pool.inputTokens[1].decimals), 2)}
                    {isUser ? swap.pool.inputTokens[1].name : ''}
                </span>
            {:else}
                <span class="w-1/12 text-green-500">Buy</span> 
                <span class="w-1/12">
                    {fixDecimalPlaces(formatUnits(swap.amountOut, swap.pool.inputTokens[0].decimals), 2)} 
                    {isUser ? swap.pool.inputTokens[0].name : ''}
                </span>
                <span class="w-1/12">
                    {fixDecimalPlaces(formatUnits(swap.amountIn, swap.pool.inputTokens[1].decimals), 2)}
                    {isUser ? swap.pool.inputTokens[1].name : ''}
                </span>
            {/if}
            {#if isUser}
                <div class="w-1/4">
                    <a href={`/${swap.pool.id}`} class="hover:cursor-pointer hover:underline">{swap.pool.name}</a>
                </div>
            {:else}
                <div class="w-1/4">
                    <a data-sveltekit-preload-data="hover" href={`/${swap.from}`}>🔎</a>
                    <input
                        id="address"
                        class={`w-3/4 outline-none ${highlighted == swap.from ? 'bg-yellow-500 bg-opacity-20' : 'bg-transparent'} `}
                        on:focus={(event) => {
                            highlighted = swap.from;
                            event.currentTarget.select();
                        }}
                        on:input={(event) => {
                            $aliases[swap.from] = event.currentTarget.value;
                        }}
                        value={$aliases[swap.from] || swap.from}
                    />
                </div>
            {/if}
            {#if true}
            {@const tx = swap.id.split('-')[0]}
            <a href={`https://etherscan.io/tx/${tx}`} target="_blank" class="w-1/4 hover:cursor-pointer hover:underline">{swap.id.split('-')[0]}</a>
            {/if}
        </div>
    {/each}
</main>

<style>
    #address::selection {
        background-color: transparent;
    }
</style>