import { writable } from "svelte/store";
import { type PublicClient, createPublicClient, webSocket, http } from "viem";
import { mainnet } from "viem/chains";

export const sectionIndex = writable(0);

export const games = writable<Game[]>([]);

export const alchemyClient = writable<PublicClient>(
    createPublicClient({
        transport: webSocket('wss://eth-sepolia.g.alchemy.com/v2/yTwOfGQDI2ZUToBzyqDMmJAtL-H0YP9E'),
        chain: mainnet
    })
)
export const baseClient = writable<PublicClient>(
    createPublicClient({
        transport: http('https://rpc.ankr.com/base/641846b46ef7d4319ba8b43509ecb8f9d4399745f60f0d0d573a6d0db5efb337'),
        chain: {
            id: 8453, 
            name: "Base", 
            nativeCurrency: { name: 'Base ETH', symbol: 'ETH (Base)', decimals: 18},
            network: "Base",
            rpcUrls: {
                default: { http: ['https://rpc.ankr.com/base/641846b46ef7d4319ba8b43509ecb8f9d4399745f60f0d0d573a6d0db5efb337'] },
                public: { http: ['https://rpc.ankr.com/base/641846b46ef7d4319ba8b43509ecb8f9d4399745f60f0d0d573a6d0db5efb337'] },
            }
        }
    })
)