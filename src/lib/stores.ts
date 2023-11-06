import { writable } from "svelte/store";
import { type PublicClient, createPublicClient, webSocket, http } from "viem";
import { avalancheFuji, mainnet, sepolia } from "viem/chains";
import type { BetState, Game } from "./interface";
import type { GetWalletClientResult } from "@wagmi/core";

export const sectionIndex = writable(0);

export const games = writable<Game[]>([]);
export const bets = writable<BetState[]>([]);
export const walletClient = writable<GetWalletClientResult>(undefined);
export const sepoliaClient = writable<PublicClient>(
    createPublicClient({
        transport: webSocket('wss://eth-sepolia.g.alchemy.com/v2/yTwOfGQDI2ZUToBzyqDMmJAtL-H0YP9E'),
        chain: sepolia
    })
)

export const fujiClient = writable<PublicClient>(
    createPublicClient({
        transport: webSocket('wss://api.avax-test.network/ext/bc/C/ws'),
        chain: avalancheFuji
    })
)