import { configureChains, createConfig } from "@wagmi/core"
import { EthereumClient, w3mConnectors, w3mProvider } from "@web3modal/ethereum"
import { Web3Modal } from "@web3modal/html"
import { avalancheFuji, sepolia } from "viem/chains"

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

export const web3modal = new Web3Modal(
    { projectId },
    ethereumClient    
)
