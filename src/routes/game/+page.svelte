<script lang="ts">
    import Header from "../../components/Header.svelte";
    import { baseClient, sectionIndex, alchemyClient } from "$lib/stores";
	import { onDestroy, onMount } from "svelte";
	import Deposit from "../../components/Deposit.svelte";
	import { mainnet } from "viem/chains";
    import { createConfig, configureChains, getAccount, connect, watchAccount, getPublicClient, getWalletClient, type GetWalletClientResult } from "@wagmi/core"
    import { EthereumClient, w3mConnectors, w3mProvider } from "@web3modal/ethereum"
    import { Web3Modal } from "@web3modal/html"
	import { getEnsName } from "viem/ens";
	import { truncateAddress } from "$lib/helpers";
	import Withdraw from "../../components/Withdraw.svelte";

    let textColor = "text-blue-800" 
    let changedTheme = false;
    $: if ($sectionIndex == 2) {
        textColor = "text-[#3be5f7]"
        changedTheme = true;
    }

    let isMobile = false;
    const chains = [mainnet]
    const projectId = '7a27253eb43a160e20a5c5130cda68fe'
    const { publicClient } = configureChains(
        chains,
        [w3mProvider({ projectId})]
    )

    const config = createConfig({
        autoConnect: true,
        connectors: w3mConnectors({ 
            projectId,
            chains: [mainnet]
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
    alchemyClient
    const unwatchAcct = watchAccount((acct) => {
        account = acct
        if (account.address) {
            console.log(account)
            getEnsName($alchemyClient, { address: account.address }).then( name => ensName = name!)
            $alchemyClient.getBalance({ address: account.address }).then( bal => mainnet_balance = bal)
            $baseClient.getBalance({ address: account.address }).then( bal => base_balance = bal)
        } else {
            mainnet_balance = 0n
            base_balance = 0n
            ensName = ''
        }
        // outside of branch to force wallet disconnect
        getWalletClient({chainId: 1}).then( (wc) => walletClient = wc )
    })

    $alchemyClient.getBlockNumber().then(bn => mainnet_block_number = bn)
    $baseClient.getBlockNumber().then(bn => base_block_number = bn)

    $: if (account && account.address && mainnet_block_number) {
        $alchemyClient.getBalance({ address: account.address }).then(bn => mainnet_balance = bn)
    }
    $: if (account && account.address && base_block_number) {
        $baseClient.getBalance({ address: account.address }).then( bal => base_balance = bal)        
    }

    $alchemyClient.watchBlockNumber({
        onBlockNumber: (_bn) => { mainnet_block_number = _bn }
    })
    $baseClient.watchBlockNumber({
        onBlockNumber: (_bn) => { base_block_number = _bn }
    })
    let web3modal: Web3Modal | undefined = undefined;
    onMount(() => {
        web3modal = new Web3Modal(
            { projectId },
            ethereumClient    
        )
        isMobile = window.innerWidth < 768;
    })
    onDestroy(() => {
        unwatchAcct()
    })
</script>

<Header />

<main class="flex flex-col justify-center max-w-xl mx-auto pt-20">
    <div class="flex flex-col-reverse gap-4 lg:gap-0 lg:flex lg:flex-row lg:justify-between items-center p-6">
        <div class="flex gap-10">
            <button class={`font-mono text-xl ${showDeposit ? 'underline text-primary' : ''}`} on:click={() => { showDeposit = true}}>
                Deposit
            </button>
            <button class={`font-mono text-xl ${showDeposit ? '' : 'underline text-primary'}`} on:click={() => { showDeposit = false}}>
                Withdraw
            </button>
        </div>
        {#if web3modal}
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
        {/if}
    </div>
    {#if showDeposit}
        <Deposit {didDeposit} balance={mainnet_balance} {walletClient} />
    {:else}
        <Withdraw balance={base_balance} {walletClient} />
    {/if}
</main>
