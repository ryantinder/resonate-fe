<script lang="ts">
    import { sectionIndex, games, sepoliaClient, fujiClient, walletClient, bets } from "$lib/stores";
	import { onDestroy, onMount } from "svelte";
	import { avalancheFuji, mainnet, sepolia } from "viem/chains";
    import { createConfig, configureChains, getAccount, connect, watchAccount, getPublicClient, getWalletClient, type GetWalletClientResult, erc20ABI, watchNetwork, type GetPublicClientResult, type PublicClient } from "@wagmi/core"
    import { EthereumClient, w3mConnectors, w3mProvider } from "@web3modal/ethereum"
	import { getEnsName } from "viem/ens";
	import { B128, B29, B30, B31, B32, B64, MOCK20, ONE, ONE_MASK, truncateAddress, parseBetInfo, SEP_FACTORY_ADDRESS, FUJI_FACTORY_ADDRESS, SEP_DEPLOY_BLOCK, FUJI_DEPLOY_BLOCK } from "$lib/helpers";
	import { goto } from "$app/navigation";
	import { page } from "$app/stores";
	import { fetchGames } from "$lib/api.js";
	import { etherUnits, getContract, maxUint256, maxUint32, maxUint64, parseAbi, parseAbiItem, parseUnits, zeroAddress, type Address, formatUnits } from "viem";
	import { BET_ABI, ERC20_ABI, FACTORY_ABI } from "$lib/abi.js";
	import { writable } from "svelte/store";
	import type { BetInfo, BetState, Game } from "$lib/interface.js";
	import { FUJI_FACTORY, FUJI_TOKEN, SEP_FACTORY, SEP_TOKEN, bet_template } from "$lib/contract.js";

    export let data;
    let game: Game;
    $: cover = true 
    $: winner = 0
    $: wager = 0
    $: margin = 0.5
    $: account = getAccount()
    $: ensName = "";


    const unwatchAcct = watchAccount(async (acct) => {
        account = acct
        if (account.address) {
            console.log(account)
        } else {
            ensName = ''
        }
    })

    let isMobile = false;
    
    let errorMessage = writable<string>('');
    errorMessage.subscribe((val) => {
        if (val != "") {
            setTimeout(() => {
                $errorMessage = ""
            }, 5000)
        }
    })

    let input = ''
    $: txPending = false;
    $: successValue = 0n;
    $: txHash = '';
    const handleExecute = async (client: GetWalletClientResult) => {
        try {
            console.log("executing", client)
            if (!client) {
                return
            }
            await handleApprove(client)

            await handleCreateBet(client)
        } catch (e: any) {
            alert(e.message);
        }
    }

    const handleCreateBet = async (client: GetWalletClientResult) => {
        try {
            if (!client) return;
            let matchId = $page.params.id
            let wagerAmount = parseUnits(wager.toString(), 6);
            let marginAmount = margin * 10;
            console.log(matchId, wagerAmount, marginAmount, client.chain.id);
            const factory = client.chain.id == 11155111 ? getContract({...SEP_FACTORY, publicClient: $sepoliaClient, walletClient: client}) 
                                                : getContract({...FUJI_FACTORY, publicClient: $fujiClient, walletClient: client})
                                                
            factory.write.createBet([matchId, wagerAmount, marginAmount, cover, winner])
            .then(( hash ) => {
                txHash = hash
            })
            .catch((reason) => {
                if (JSON.stringify(reason).includes("User rejected the request")) {
                    $errorMessage = "User rejected the transaction."
                }
                successValue = 0n
                return;
            })
            .finally(() => {
                txPending = false
            })
        } catch (e: any) {
            alert(e.message);
        }
    } 
    const handleApprove = async (client: GetWalletClientResult) => {
        try {
            txPending = true
            if (!client) return
            const factory = client.chain.id == 11155111 ? SEP_FACTORY_ADDRESS : FUJI_FACTORY_ADDRESS
            const token = client.chain.id == 11155111 ? getContract({...SEP_TOKEN, publicClient: $sepoliaClient, walletClient: client}) 
                                              : getContract({...FUJI_TOKEN, publicClient: $fujiClient, walletClient: client})
            const allowance = await token.read.allowance([client.account.address, factory])

            if (allowance < parseUnits(wager.toString(), 6)) {
                await token.write.approve([factory, maxUint256])
            } else {
                console.log("already approved")
            }
        } catch (e: any) {
            alert(e.message);
        }
    }

    const handleTakeBet = async (client: GetWalletClientResult, bet: BetState) => {
        try {
            if (!client) return
            // console.log(walletClient.account.address, bet.contractAddr)
            const token = client.chain.id == 11155111 ? getContract({...SEP_TOKEN, publicClient: $sepoliaClient, walletClient: client}) 
                                                            : getContract({...FUJI_TOKEN, publicClient: $fujiClient, walletClient: client})
            const allowance = await token.read.allowance([client.account.address, bet.contractAddr])
            console.log(allowance, parseUnits(bet.wager.toString(), 6))
            if (allowance <= parseUnits(bet.wager.toString(), 6)) {
                await token.write.approve([bet.contractAddr, maxUint256])
            } else {
                console.log("already approved", allowance)
            }
            const balance = await token.read.balanceOf([client.account.address])
            console.log(balance)
            const write_bet = getContract({
                address: bet.contractAddr,
                abi: BET_ABI,
                walletClient: client
            })
            await write_bet.write.takeBet()
        } catch (e: any) {
            alert(e.message);
        }
    }
    onMount(async () => {
        isMobile = window.innerWidth < 768;

        $walletClient = await getWalletClient({chainId: sepolia.id})
        isMobile = window.innerWidth < 768;
        const _games = $games.length != 0 ? $games : await fetchGames();
        game = _games.find((x) => x.game.id.toString() == $page.params.id)!
    })
    onDestroy(() => {
        unwatchAcct()
    })


</script>

<!-- <Header /> -->

<main class="flex font-mont flex-col justify-center max-w-xl mx-auto pt-20 gap-2 px-2 lg:px-0">
    <span class="flex justify-between">
        <a class="p-2 px-3 bg-white outline outline-2 --outline-offset-2 outline-primary hover:outline-0 hover:bg-primary hover:text-white rounded-md text-primary font-bold font-mont" 
            href="/">
            Back
        </a>
    </span>
    {#if game}
    <div class="w-full py-6 px-16 flex gap-2 justify-center items-center bg-primary">
        <div class="text-3xl font-bold text-white text-center ">{game.teams.home.name}</div>
        <div class="text-xl text-white">vs</div>
        <div class="text-3xl font-bold text-white text-center ">{game.teams.away.name}</div>
    </div>
    <div class="w-full px-4 gap-3 py-4 flex flex-col justify text-black text-xl border-2 mb-3">
        <div class="border-b font-semibold flex justify-between items-center">
            <div>
                Create Bet Slip
            </div>
            <div>
                {">"}
            </div>
        </div>
        <div class="flex justify-between items-center">
            <div>
                Select winner
            </div>
            <div>
                <select bind:value={winner} placeholder={game.teams.home.name} class="bg-gray p-2 rounded-lg" >
                    <option selected value="0">{game.teams.home.name}</option>
                    <option value="1">{game.teams.away.name}</option>
                </select>
            </div>
        </div> 
        <div class="flex justify-between items-center">
            <div>
                by points:
            </div>
            <div>
                <input type="number" bind:value={margin} min="0.5" step="0.5" max="100" class="p-2 bg-gray text-left rounded-lg"/>
            </div>
        </div>
        <div class="border-b mb-2 font-semibold">
            I'm betting
        </div>
        <div class="flex justify-around">
            <button on:click={() => cover = true} class={`transition-all py-2 px-4 ${cover ? 'text-white bg-primary' : 'outline outline-1 bg-white hover:bg-gray'} rounded-lg`}>With Spread</button>
            <button on:click={() => cover = false} class={`transition-all py-2 px-4 ${cover ? 'outline outline-1 bg-white hover:bg-gray' : 'text-white bg-red'} rounded-lg`}>Against Spread</button>
        </div>
        <div class="flex justify-between items-center">
            <div>
                Wager amount:
            </div>
            <div>
                <span class="mr-2">$</span><input type="number" bind:value={wager} min="0" step="1" max="100000" class="p-2 bg-gray text-left rounded-lg"/>
            </div>
        </div>
        <div class="border-b h-2">&nbsp;</div>

        <div>
            {#if cover}
                Bet cashes if the { winner == 1 ? `${game.teams.away.name}` : `${game.teams.home.name}` } win by {Math.floor(margin + 1)} points or more.
            {:else}
                Bet cashes if the { winner == 1 ? `${game.teams.home.name}` : `${game.teams.away.name}` } win at ALL {margin > 1 ? `, or lose by ${Math.ceil(margin - 1)} points or less.` : ""}
            {/if}
        </div>
        <button on:click={() => { if(!walletClient) return; handleExecute($walletClient) }} class="transition-all bg-primary text-white mx-auto p-2 rounded-lg w-1/2 font-bold outline-1 outline-black hover:outline" >Submit Bet</button>
    </div>
    <div class="text-3xl font-bold">
        <div class="border-b mb-2">Available Bets</div>
        <div class="flex flex-col gap-2">
            {#each $bets as bet}
                <!-- OPEN BETS -->
                {#if (bet.coverAddr == zeroAddress || bet.atsAddr == zeroAddress) && !bet.finished }
                    <div class={`flex font-semibold text-base py-2 px-4 border justify-between items-center`}>
                        {#if bet.coverAddr == zeroAddress}
                        <!-- Cover side available -->
                            <div class="w-2/3">Bet that the { bet.winner ? game.teams.away.name : game.teams.home.name } win by { Math.floor(bet.margin / 10 + 1)} points or more.</div>
                        {:else}
                        <!-- ATS side available -->
                            <div class="w-[60%]">Bet that the { bet.winner ? game.teams.home.name : game.teams.away.name } win AT ALL {bet.margin / 10 > 1 ? `, or lose by ${Math.ceil(bet.margin / 10 - 1)} points or less.` : ""}</div>
                        {/if}
                        <div class="flex w-[40%] justify-end items-center gap-4">
                            <div class="font-bold text-3xl">${formatUnits(bet.wager, 6)}</div>
                            {#if bet.coverAddr == account.address || bet.atsAddr == account.address}
                                My bet
                            {:else}
                                {bet.chainId == 11155111 ? "Sepolia" : "Fuji"}
                                <button on:click={() => {handleTakeBet($walletClient, bet)}} class="py-2 px-4 outline outline-1 bg-white hover:bg-gray rounded-md">Accept</button>
                            {/if}
                        </div>
                    </div>
                {/if}
            {:else}
            <div class="font-semibold text-base">
                No bets available. Make one!
            </div>
            {/each}
        </div>
    </div>
    <div class="text-3xl font-bold">
        <div class="border-b mb-2">Bets in play</div>
        <div class="flex flex-col gap-2">
            {#each $bets as bet}
                <!-- OPEN BETS -->
                {#if bet.coverAddr != zeroAddress && bet.atsAddr != zeroAddress}
                <div class="flex font-semibold  py-2 px-4 border justify-between items-center">
                    <div class="font-bold w-1/text-3xl">${formatUnits(bet.wager, 6)}</div>
                    <div class="flex flex-1 ml-4 flex-col text-base justify-between items-start">
                        <!-- Cover side available -->
                            <div class="">{truncateAddress(bet.coverAddr)} has a { bet.winner ? game.teams.away.name : game.teams.home.name } win by { Math.floor(bet.margin / 10 + 1)} or more.</div>
                        <!-- ATS side available -->
                            <div class="">{truncateAddress(bet.atsAddr)} has a { bet.winner ? game.teams.home.name : game.teams.away.name } win {bet.margin / 10 > 1 ? ` or loss by ${Math.ceil(bet.margin / 10 - 1)} or more.` : "."}</div>
                    </div>
                </div>
                {/if}
            {:else}
                <div class="font-semibold text-base">
                    No bets in play.
                </div>
            {/each}
        </div>
    </div>
    {/if}
</main>
