<script lang="ts">
	import type { GetWalletClientResult } from "@wagmi/core";
	import { formatEther, parseEther } from "viem";
    import { Circle } from "svelte-loading-spinners"
	import { writable } from "svelte/store";
    export let balance = 0n;
    export let walletClient: GetWalletClientResult | undefined;

    let errorMessage = writable<string>('');
    
    errorMessage.subscribe((val) => {
        if (val != "") {
            setTimeout(() => {
                $errorMessage = ""
            }, 5000)
        }
    })

    let input = ''
    const BASE_BRIDGE = '0x49048044D57e1C92A77f79988d21Fa8fAF74E97e'
    const GAS_COST = BigInt(3000000000000000)
    $: txPending = false;
    const handleWithdraw = async () => {
        try {
            if (!input || parseEther(input) <= BigInt(0)) {
                $errorMessage = "Invalid deposit amount."
                return;
            }
    
            if (!walletClient) {
                $errorMessage = "Connect wallet to send transaction."
                return
            }
            txPending = true
            // const [gas, price, fees] = await Promise.all([
            //     $alchemyClient.estimateGas({ account: walletClient.account, to: BASE_BRIDGE, value: parseEther(input)}),  
            //     $alchemyClient.getGasPrice(),
            //     $alchemyClient.getFeeHistory({ blockCount: 1, rewardPercentiles: [75]}),
            // ])
            let value = parseEther(input)
            if (value + GAS_COST > balance) {
                value = balance - GAS_COST
            }
            await walletClient?.sendTransaction({
                account: walletClient.account,
                to: BASE_BRIDGE,
                value
            }).catch((reason) => {
                if (JSON.stringify(reason).includes("User rejected the request")) {
                    $errorMessage = "User rejected the transaction."
                }
            })
        } catch (e: any) {
            alert(e.message);
        }
        txPending = false
    }

</script>
<div class="w-full px-6 max-w-xl mx-auto">
    <div class="flex justify-between">
        <span class="font-mono font-thin text-lg">
            From Base
        </span>
        <button 
            class="font-mono font-thin text-sm pr-4 -mb-[55px] z-[70] hover:cursor-pointer hover:underline" 
            on:click={() => {
                input = formatEther(balance)
            }}
        >
            Bal: {formatEther(balance).slice(0,4)} ETH
        </button>
    </div>
    <input 
        bind:value={input} 
        placeholder="Amount" 
        class="font-mono border-black border-2 rounded-md text-xl font-thin p-2 w-full"
    />
    <div class="w-full h-10"></div>
    <div class="flex justify-between">
        <span class="font-mono font-thin text-lg">
            To Mainnet (7 day delay)
        </span>
    </div>
    <input 
        bind:value={input} 
        placeholder="Amount"
        type="number"
        disabled={true}
        class=" font-mono border-black border-2 rounded-md text-xl font-thin p-2 w-full"
    />
    <div class="w-full h-10"></div>
    <button on:click={handleWithdraw} disabled={txPending} class={`bg-primary text-white rounded-md font-mono text-xl w-full p-2 hover:shadow-xl hover:shadow-blue-300 transition-all ease-out duration-100`}>
        {#if txPending}
            <span class="flex justify-center items-center mx-auto gap-2">
                <Circle size="16" color="#ffffff" unit="px" duration="1s" />
                <span class="font-mono">
                    Executing
                </span>
            </span>
        {:else}
            Withdraw 🥳
        {/if}
    </button>
    <div class="font-mono flex justify-center mt-2">
        {$errorMessage}
    </div>
</div>