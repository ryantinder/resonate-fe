import { getContract, parseAbi, zeroAddress } from "viem";
import { SEP_FACTORY_ADDRESS, FUJI_FACTORY_ADDRESS, MOCK20 } from "./helpers";
import { FACTORY_ABI } from "./abi";
import { erc20ABI } from "@wagmi/core";

export const bet_template = getContract({
    address: zeroAddress,
    abi: parseAbi([
        'function betInfo() view returns (uint)',
        'function cover() view returns (address)',
        'function ats() view returns (address)',
        'function withdraw() external',
        'function settle() external',
    ])
})
export const SEP_FACTORY = getContract({
    address: SEP_FACTORY_ADDRESS,
    abi: FACTORY_ABI
})
export const FUJI_FACTORY = getContract({
    address: FUJI_FACTORY_ADDRESS,
    abi: FACTORY_ABI
})

export const SEP_TOKEN = getContract({
    address: MOCK20,
    abi: erc20ABI
})
export const FUJI_TOKEN = getContract({
    address: "0xD21341536c5cF5EB1bcb58f6723cE26e8D8E90e4",
    abi: erc20ABI
})