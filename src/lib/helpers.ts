import { maxUint256, maxUint32, maxUint64 } from "viem";
import { aliases } from "./stores";
import { get } from "svelte/store";

export const truncateAddress = (address: `0x${string}`) => {
    return address.slice(0, 6) + '...' + address.slice(address.length - 4);
}

export const BLOCK_EXPLORERS: {[chainid: number] : string } = {
    1: 'https://etherscan.io/',
    8453: 'https://basescan.org/'
}

export const B128 = BigInt(128)
export const B64 = BigInt(64)
export const B32  = BigInt(32)
export const B31  = BigInt(31)
export const B30  = BigInt(30)
export const B29 = BigInt(29) 
export const ONE = BigInt(1)
export const ONE_MASK = ~(maxUint256 << ONE)

export const MOCK20 = "0xB97183D2e5FA8954dcf7fbf16FC065d343278593"
export const SEP_FACTORY_ADDRESS = "0x038DBF7D4a81F904C91c6c7a8FC05c8bC0DFd6a2"
export const SEP_DEPLOY_BLOCK = 4638682

export const FUJI_FACTORY_ADDRESS = "0x383179f368e86eab1ADA5E31869cc5168FD4AF26"
export const FUJI_DEPLOY_BLOCK = 27452541

export function fixDecimalPlaces(str: string, decimals = 4): string {
    return parseFloat(str).toLocaleString('fullwide', { maximumFractionDigits: decimals, notation: "compact", compactDisplay: "short" })
  }

export function fixTimestamp(str: string): string {
    return new Date(parseInt(str) * 1000).toLocaleString()
}

export function getAlias(str: string) : string {
    return get(aliases)[str] ?? str
}