<script lang="ts">
    import { baseClient, sectionIndex, alchemyClient, games } from "$lib/stores";
	import { onDestroy, onMount } from "svelte";
	import { mainnet, sepolia } from "viem/chains";
    import { createConfig, configureChains, getAccount, connect, watchAccount, getPublicClient, getWalletClient, type GetWalletClientResult, erc20ABI } from "@wagmi/core"
    import { EthereumClient, w3mConnectors, w3mProvider } from "@web3modal/ethereum"
    import { Web3Modal } from "@web3modal/html"
	import { getEnsName } from "viem/ens";
	import { truncateAddress } from "$lib/helpers";
	import { goto } from "$app/navigation";
	import { page } from "$app/stores";
	import { fetchGames } from "$lib/api.js";
	import { etherUnits, getContract, maxUint256, parseUnits } from "viem";
	import { ERC20_ABI, FACTORY_ABI } from "$lib/abi.js";
	import { writable } from "svelte/store";

    export let data;
    let game: Game;
    $: cover = true 
    $: winner = 0
    $: wager = 0
    $: margin = 0.5
    $: activeWeek = 9;
    let textColor = "text-blue-800" 
    let changedTheme = false;
    $: if ($sectionIndex == 2) {
        textColor = "text-[#3be5f7]"
        changedTheme = true;
    }

    const chains = [sepolia]
    const projectId = '7a27253eb43a160e20a5c5130cda68fe'
    const { publicClient } = configureChains(
        chains,
        [w3mProvider({ projectId})]
    )

    const config = createConfig({
        autoConnect: true,
        connectors: w3mConnectors({ 
            projectId,
            chains: [sepolia]
        }),
        publicClient
    })
    const ethereumClient = new EthereumClient(config, chains)

    let walletClient: GetWalletClientResult | undefined = undefined
    $: showDeposit = true;
    $: didDeposit = false;
    $: account = getAccount()
    $: ensName = "";
    $: mainnet_block_number = 0n;
    $: mainnet_balance = 0n;
    $: base_block_number = 0n;
    $: base_balance = 0n;
    const MOCK20 = "0xB97183D2e5FA8954dcf7fbf16FC065d343278593"
    const FACTORY_ADDRESS = "0x064AA994e3D69c9d5531BcA7502E2F35df09EB25"
    const factory = getContract({
        address: FACTORY_ADDRESS,
        abi: FACTORY_ABI,
        publicClient: $alchemyClient
    })
    const usdc = getContract({
        address: MOCK20,
        abi: erc20ABI,
        publicClient: $alchemyClient
    })
    const unwatchAcct = watchAccount((acct) => {
        account = acct
        if (account.address) {
            console.log(account)
            // getEnsName($alchemyClient, { address: account.address }).then( name => ensName = name!)
            // $alchemyClient.getBalance({ address: account.address }).then( bal => mainnet_balance = bal)
            // $baseClient.getBalance({ address: account.address }).then( bal => base_balance = bal)
        } else {
            mainnet_balance = 0n
            base_balance = 0n
            ensName = ''
        }
        // outside of branch to force wallet disconnect
        getWalletClient({chainId: 11155111}).then( (wc) => walletClient = wc )
    })

    const BetCreatedFilter = factory.createEventFilter.BetCreated()
    let web3modal: Web3Modal | undefined = undefined;
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
    const handleExecute = async () => {
        try {
            if (!walletClient) {
                return
            }
            const allowance = await usdc.read.allowance([walletClient.account.address, FACTORY_ADDRESS])

            if (allowance < parseUnits(wager.toString(), 6)) {
                await handleApprove()
            } else {
                console.log("already approved")
            }

            await handleCreateBet()
        } catch (e: any) {
            alert(e.message);
        }
    }

    const handleCreateBet = async () => {
        try {
            console.log("creating")
            if (!walletClient) return
            let matchId = $page.params.id
            let wagerAmount = parseUnits(wager.toString(), 6);
            let marginAmount = margin * 10;
            const write_factory = getContract({
                address: FACTORY_ADDRESS,
                abi: FACTORY_ABI,
                walletClient: walletClient
            })
            console.log(matchId, wagerAmount, marginAmount, cover, winner)
            write_factory.write.createBet([matchId, wager, marginAmount, cover, winner])
            .then(( hash ) => {
                didDeposit = true
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
    const handleApprove = async () => {
        try {
            txPending = true
            if (!walletClient) return
            const write_usdc = getContract({
                address: MOCK20,
                abi: ERC20_ABI,
                walletClient: walletClient
            })
            await write_usdc.write.approve([FACTORY_ADDRESS, maxUint256])
            
        } catch (e: any) {
            alert(e.message);
        }
        txPending = false
    }
    onMount(async () => {
        isMobile = window.innerWidth < 768;
        web3modal = new Web3Modal(
            { projectId },
            ethereumClient    
        )
        isMobile = window.innerWidth < 768;
        console.log($games)
        const _games = $games.length != 0 ? $games : await fetchGames();
        game = _games.find((x) => x.game.id.toString() == $page.params.id)!
    })
    onDestroy(() => {
        unwatchAcct()
    })
</script>

<!-- <Header /> -->

<main class="flex font-mont flex-col justify-center max-w-xl mx-auto pt-20 gap-2">
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
    {#if game}
    <div class="w-full py-6 px-16 flex gap-2 justify-center items-center bg-primary">
        <div class="text-3xl font-bold text-white text-center ">{game.teams.home.name}</div>
        <div class="text-xl text-white">vs</div>
        <div class="text-3xl font-bold text-white text-center ">{game.teams.away.name}</div>
    </div>
    <div class="w-full px-12 gap-3 py-4 flex flex-col justify text-black text-xl border-2 mb-3">
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
        <div class="flex justify-between">
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
        <button on:click={() => { handleExecute() }} class="transition-all bg-primary text-white mx-auto p-2 rounded-lg w-1/2 font-bold outline-1 outline-black hover:outline" >Submit Bet</button>
    </div>
    <div class="text-3xl font-bold border-b">
        <div>Available Bets</div>
    </div>
    {/if}
</main>
