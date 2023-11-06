<script lang="ts">
	import { configureChains, createConfig, getAccount, getWalletClient, sepolia, watchNetwork } from "@wagmi/core";
    import "../app.scss";
	import { bets, fujiClient, sepoliaClient, walletClient } from "$lib/stores";
	import { onDestroy, onMount } from "svelte";
	import { avalancheFuji } from "viem/chains";
	import { EthereumClient, w3mConnectors, w3mProvider } from "@web3modal/ethereum";
	import { Web3Modal } from "@web3modal/html";
	import { FUJI_FACTORY_ADDRESS, SEP_FACTORY_ADDRESS, truncateAddress } from "$lib/helpers";
	import { parseAbiItem } from "viem";
	import { addBet, getFullBetsCreated } from "$lib/bets";
	import { fetchGames } from "$lib/api";
    $: account = getAccount()
    const chains = [sepolia, avalancheFuji]
    const projectId = '7a27253eb43a160e20a5c5130cda68fe'
    const { publicClient } = configureChains(
        chains,
        [w3mProvider({ projectId})]
    )

    const config = createConfig({
        autoConnect: true,
        connectors: w3mConnectors({ 
            projectId,
            chains: chains
        }),
        publicClient
    })

    const ethereumClient = new EthereumClient(config, chains)

    let web3modal: Web3Modal | undefined = undefined 
    const unwatchNetwork = watchNetwork(async (network) => {
        console.log("HERE", network.chain?.id)
        console.log("setting wallet", network.chain?.id)
        $walletClient = await getWalletClient({chainId: network.chain?.id})
    })
    const unwatchSepBets = $sepoliaClient.watchEvent({  
        address: SEP_FACTORY_ADDRESS,
        event: parseAbiItem('event BetCreated(address indexed creator, uint indexed matchId, address indexed bet)'),
        onLogs: logs => {
            console.log(logs)
            for (const log of logs) {
                addBet(true, log.args.bet!) 
            }
        }
    })
    const unwatchFujiBets = $fujiClient.watchEvent({  
        address: FUJI_FACTORY_ADDRESS,
        event: parseAbiItem('event BetCreated(address indexed creator, uint indexed matchId, address indexed bet)'),
        onLogs: logs => {
            console.log(logs)
            for (const log of logs) {
                addBet(false, log.args.bet!) 
            }
        }
    })
    const switchChain = async (sep: boolean) => {
        console.log($walletClient)
        if (!$walletClient) return;
        if (sep) {
            await $walletClient?.switchChain({ id: sepolia.id} )
        } else {
            await $walletClient?.switchChain({ id: avalancheFuji.id} )
        }
        $walletClient = $walletClient
    }
    onMount(() => {
        web3modal = new Web3Modal(
        { projectId },
        ethereumClient
        )
        getFullBetsCreated()
        fetchGames()
    })
    onDestroy(() => {
        unwatchNetwork()
        unwatchSepBets()
        unwatchFujiBets()
    })
</script>

<title>ChainBet</title>
<div class="p-4 flex gap-6 justify-end">
    {#if web3modal}
        <div class="text-xl font-mont font-bold items-center flex gap-2 text-primary">
            <div>Chain:</div>
            <button on:click={() => { switchChain(true)}} class="p-2 px-3 bg-white outline outline-2 --outline-offset-2 outline-primary hover:outline-0 hover:bg-primary hover:text-white rounded-md text-primary font-bold font-mont" 
            >
            Sepolia
        </button>        
            <button on:click={() => { switchChain(false) }} class="p-2 px-3 bg-white outline outline-2 --outline-offset-2 outline-primary hover:outline-0 hover:bg-primary hover:text-white rounded-md text-primary font-bold font-mont" 
            >
            Fuji
        </button>
        </div>
        <button class="p-2 px-3 bg-white outline outline-2 --outline-offset-2 outline-primary hover:outline-0 hover:bg-primary hover:text-white rounded-md text-primary font-bold font-mont" 
        on:click={ web3modal.openModal }>
            {#if account.address}
                {truncateAddress(account.address)}
            {:else}
                Connect Wallet
            {/if}
    </button>
    {/if}
</div>
<slot />
<div class="h-[200px]">&nbsp;</div>

