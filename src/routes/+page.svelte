<script lang="ts">
    import Header from "../components/Header.svelte";
    import { sectionIndex, games, sepoliaClient, fujiClient, walletClient } from "$lib/stores";
	import { onDestroy, onMount } from "svelte";
	import Deposit from "../components/Deposit.svelte";
	import { avalancheFuji, mainnet, sepolia } from "viem/chains";
    import { createConfig, configureChains, getAccount, connect, watchAccount, getPublicClient, getWalletClient, type GetWalletClientResult, watchNetwork } from "@wagmi/core"
    import { EthereumClient, w3mConnectors, w3mProvider } from "@web3modal/ethereum"
    import { Web3Modal } from "@web3modal/html"
	import { getEnsName } from "viem/ens";
	import { FUJI_DEPLOY_BLOCK, FUJI_FACTORY_ADDRESS, SEP_DEPLOY_BLOCK, SEP_FACTORY_ADDRESS, parseBetInfo, truncateAddress } from "$lib/helpers";
	import Withdraw from "../components/Withdraw.svelte";
	import { goto } from "$app/navigation";
	import type { BetState } from "$lib/interface";
	import { getContract, parseAbi, parseAbiItem, zeroAddress } from "viem";
	import { bet_template } from "$lib/contract";

    export let data;
    $games = data.games;
    $: bets = getBetsCreated();
    $: activeWeek = 9;
    let textColor = "text-blue-800" 
    let changedTheme = false;
    $: if ($sectionIndex == 2) {
        textColor = "text-[#3be5f7]"
        changedTheme = true;
    }
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

    $: account = getAccount()
    $: ensName = "";
    const unwatchNetwork = watchNetwork(async (network) => {
        console.log("HERE", network.chain?.id)
        console.log("setting wallet", network.chain?.id)
        $walletClient = await getWalletClient({chainId: network.chain?.id})
    })
    // const unwatchAcct = watchAccount((acct) => {
    //     account = acct
    //     if (account.address) {
    //         console.log(account)
    //         // getEnsName($alchemyClient, { address: account.address }).then( name => ensName = name!)
    //         // $alchemyClient.getBalance({ address: account.address }).then( bal => mainnet_balance = bal)
    //         // $baseClient.getBalance({ address: account.address }).then( bal => base_balance = bal)
    //     }
    //     // outside of branch to force wallet disconnect
    //     console.log("connecting here")
    //     getWalletClient({chainId: 11155111}).then( (wc) => walletClient = wc )
    // })

    let web3modal: Web3Modal | undefined = undefined;
    let isMobile = false;

    const getBetsCreated = async () : Promise<BetState[]> => {
        if (!$fujiClient && !$sepoliaClient) return [];
        const [sep_logs, fuji_logs] = await Promise.all([
            $sepoliaClient.getLogs({  
                address: SEP_FACTORY_ADDRESS,
                event: parseAbiItem('event BetCreated(address indexed creator, uint indexed matchId, address indexed bet)'),
                fromBlock: BigInt(SEP_DEPLOY_BLOCK)
            }),
            $fujiClient.getLogs({  
                address: FUJI_FACTORY_ADDRESS,
                event: parseAbiItem('event BetCreated(address indexed creator, uint indexed matchId, address indexed bet)'),
                fromBlock: BigInt(FUJI_DEPLOY_BLOCK)
            })
        ])
        // multicall all bet addresses then return the active ones, non-started ones
        const [sep_states, fuji_states] = await Promise.all([
            $sepoliaClient.multicall({
                contracts: [
                    ...sep_logs.map( (log) => { return { ...bet_template, address: log.args.bet!, functionName: 'betInfo'}}),
                    ...sep_logs.map( (log) => { return { ...bet_template, address: log.args.bet!, functionName: 'cover'}}),
                    ...sep_logs.map( (log) => { return { ...bet_template, address: log.args.bet!, functionName: 'ats'}})
                ]
            }),
            $fujiClient.multicall({
                contracts: [
                    ...fuji_logs.map( (log) => { return { ...bet_template, address: log.args.bet!, functionName: 'betInfo'}}),
                    ...fuji_logs.map( (log) => { return { ...bet_template, address: log.args.bet!, functionName: 'cover'}}),
                    ...fuji_logs.map( (log) => { return { ...bet_template, address: log.args.bet!, functionName: 'ats'}})
                ]
            })
        ])
        return [
            ...sep_logs.map( (log, i) : BetState => {
                return {
                    ...parseBetInfo(sep_states[i].result as bigint),
                    coverAddr: sep_states[sep_logs.length + i].result as `0x${string}`,
                    atsAddr: sep_states[sep_logs.length * 2 + i].result as `0x${string}`,
                    contractAddr: log.args.bet!
                }
            }),
            ...fuji_logs.map( (log, i) : BetState => {
                return {
                    ...parseBetInfo(fuji_states[i].result as bigint),
                    coverAddr: fuji_states[fuji_logs.length + i].result as `0x${string}`,
                    atsAddr: fuji_states[fuji_logs.length * 2 + i].result as `0x${string}`,
                    contractAddr: log.args.bet!
                }
            })
        ]
    }

    const handleWithdraw = async () => {
        try {
            if (!$walletClient) return
            const bet = $walletClient.chain.id == 11155111 ? getContract({...bet_template, publicClient: $sepoliaClient, walletClient: $walletClient}) 
                                                            : getContract({...bet_template, publicClient: $fujiClient, walletClient: $walletClient})
            await bet.write.withdraw()
        } catch (e: any) {
            alert(e.message);
        }
    }
    const handleSettle = async () => {
        try {
            if (!$walletClient) return
            const bet = $walletClient.chain.id == 11155111 ? getContract({...bet_template, publicClient: $sepoliaClient, walletClient: $walletClient}) 
                                                            : getContract({...bet_template, publicClient: $fujiClient, walletClient: $walletClient})
            await bet.write.settle()
        } catch (e: any) {
            alert(e.message);
        }
    }

    onMount(() => {
        isMobile = window.innerWidth < 768;
        web3modal = new Web3Modal(
            { projectId },
            ethereumClient    
        )
        isMobile = window.innerWidth < 768;
    })
    onDestroy(() => {
        unwatchNetwork()
    })

    const test = async () => {
        try {
            if (!$walletClient) return
            const write_bet = getContract({...bet_template, walletClient: $walletClient, publicClient: $sepoliaClient, address: "0xa14DfbEcEA91df1f366f8ABfda621006Eb07b0FC"})
            // await write_bet.write._processResults([BigInt(2007236683), await write_bet.read.betInfo()])
        } catch (e: any) {
            alert(e.message);
        }
    }
</script>

<!-- <Header /> -->

<main class="flex font-mont flex-col justify-center max-w-xl mx-auto pt-20 px-2 lg:px-0">
    <div class="mb-16">
        <div class="flex justify-between items-center pb-4">
            <div class="text-3xl font-bold">
                My Bets
            </div>
            {#if web3modal}
                <span class="flex justify-end">
                    <button class="p-2 px-3 bg-white outline outline-2 --outline-offset-2 outline-primary hover:outline-0 hover:bg-primary hover:text-white rounded-md text-primary font-bold font-mont" 
                    on:click={ web3modal.openModal }>
                        {#if account.address}
                            {!ensName || ensName == "" ? truncateAddress(account.address) ?? "Unknown" : ensName}
                        {:else}
                            Connect Wallet
                        {/if}
                    </button>
                </span>
            {/if}
        </div>
        <div class="flex flex-col gap-2">
        {#await bets}
            Loading
        {:then _bets} 
            {#if account}
                {#each _bets as bet}
                    {#if bet.coverAddr == account.address || bet.atsAddr == account.address }
                        {@const game = $games.find((x) => x.game.id == bet.matchId)}
                        {#if game}
                        <div class={`flex py-2 px-2 border rounded-lg justify-between items-center ${ bet.finished && "bg-gray"}`}>
                            <div class={`flex flex-col w-3/4 text-base gap-px items-start`}>
                                <div class="font-semibold">{game.game.date.date}: {game.teams.home.name} vs {game.teams.away.name}</div>
                                {#if bet.coverAddr == account.address}
                                <!-- Cover side available -->
                                    <div class="">Bet that the { bet.winner ? game.teams.away.name : game.teams.home.name } win by { Math.floor(bet.margin / 10 + 1)} points or more.</div>
                                {:else}
                                <!-- ATS side available -->
                                    <div class="">Bet that the { bet.winner ? game.teams.home.name : game.teams.away.name } win AT ALL {bet.margin / 10 > 1 ? `, or lose by ${Math.ceil(bet.margin / 10 - 1)} points or less.` : ""}</div>
                                {/if}
                            </div>
                            <div class={``}>
                                {#if bet.coverAddr != zeroAddress && bet.atsAddr != zeroAddress && game.game.status.short == 'FT'}
                                    <button 
                                        on:click={handleSettle}
                                        class="p-2 rounded-lg bg-green text-white font-semibold hover:outline outline-2 outline-gray">
                                        Process
                                    </button>
                                {:else if bet.coverAddr == zeroAddress || bet.atsAddr == zeroAddress}
                                    <button 
                                        on:click={handleWithdraw}
                                        class="p-2 rounded-lg bg-red text-white font-semibold hover:outline outline-2 outline-gray">
                                        Withdraw
                                    </button>
                                {:else if game.game.status.short != 'FT' && game.game.status.short != 'NS'}
                                    Live
                                {:else}
                                    <div class="font-semibold">🔒 Bet is on!</div>
                                {/if}
                            </div>
                        </div>
                        {/if}
                    {/if}
                {/each}
            {/if}
        {/await}
        <div>
    </div>
    <div class="text-3xl font-bold border-b">
        Find Games
    </div>
    <div>
        <h1 class="font-mont font-bold">Weeks</h1>
        <div class="flex flex-row flex-wrap gap-2">
            {#each Array(10).fill(9).map((x, i) => x + i) as week}
                <button on:click={() => activeWeek = week} class="font-mont font-bold text-white rounded-lg py-4 px-8 bg-primary">{week}</button>
            {/each}
        </div>
    </div>
    <div class="mt-5">
        <h1 class="font-mont font-bold">Week {activeWeek}</h1>
        <!-- {#if web3modal}
            <span class="flex justify-end ">
                <button class="p-2 px-3 bg-white outline outline-2 --outline-offset-2 outline-primary hover:outline-0 hover:bg-primary hover:text-white rounded-md text-primary font-bold font-mono" 
                on:click={ web3modal.openModal }>
                    {#if account.address}
                        {ensName ?? truncateAddress(account.address)}
                    {:else}
                        Connect Wallet
                    {/if}
                </button>
            </span>
        {/if} -->
        <!-- {Object.keys(data.games.response)} -->
        <div class="flex flex-col items-start justify-start gap-2">
            {#each data.games.filter((x) => x.game.week == `Week ${activeWeek}`) as game}
                <button on:click={() => {
                    goto(`/game/${game.game.id}`)
                }}
                class="p-2 w-full border text-left rounded-md hover:bg-gray"
                >                   
                    <div class="font-semibold text-2xl">
                            {game.teams.home.name} vs {game.teams.away.name}
                    </div>
                    <div>

                    </div>
                </button>
            {/each}
        </div>
    </div>
</main>
