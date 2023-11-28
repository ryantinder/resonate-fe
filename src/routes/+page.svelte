<script lang="ts">
	import { goto } from "$app/navigation";
	import { getContract } from "viem";
	import { bet_template } from "$lib/contract";

    export let data;

    let pair = ''

    const test = async () => {
        try {
            // const write_bet = getContract({...bet_template, walletClient: $walletClient, publicClient: $sepoliaClient, address: "0xa14DfbEcEA91df1f366f8ABfda621006Eb07b0FC"})
            // await write_bet.write._processResults([BigInt(2007236683), await write_bet.read.betInfo()])
        } catch (e: any) {
            alert(e.message);
        }
    }
</script>

<!-- <Header /> -->

<main class="flex  font-mont flex-col justify-center px-2 lg:px-0">
    <input
        bind:value={pair}
        placeholder="Search Uniswap pair"
        class="w-full mb-4 h-12 px-3 rounded-lg border-2 border-gray-300 focus:outline-none focus:border-indigo-500 text-black"
    />
    <div class="flex">
        <div class="w-1/3">Name</div>
        <div class="w-1/6">USD Volume</div>
        <div class="w-1/6">USD Revenue</div>
        <div class="w-1/6">USD TVL</div>
    </div>
    {#each data.pairs.sort( (a, b) => b.cumulativeVolumeUSD - a.cumulativeVolumeUSD) as _pair}
        {#if !pair || _pair.id.includes(pair) || (_pair.name.includes(pair))}
            <button 
                on:click={() => {
                    console.log(_pair)
                    goto('/' + _pair.id)
                }} 
                class="py-2 text-left flex w-full hover:bg-white hover:bg-opacity-10 font-semibold hover:cursor-pointer"
            >
            <div class="w-1/3">
                {_pair.name}
            </div>
            <div class="w-1/6">
                ${_pair.cumulativeVolumeUSD.toLocaleString('en-US')}
            </div>
            <div class="w-1/6">
                ${_pair.cumulativeTotalRevenueUSD.toLocaleString('en-US')}
            </div>
            <div class="w-1/6">
                ${_pair.totalValueLockedUSD.toLocaleString('en-US')}
            </div>
            </button>
        {/if}
    {/each}
</main>
