import { parseAbiItem, type Address, type PublicClient } from "viem";
import { FUJI_DEPLOY_BLOCK, FUJI_FACTORY_ADDRESS, SEP_DEPLOY_BLOCK, SEP_FACTORY_ADDRESS, parseBetInfo } from "./helpers";
import { bet_template } from "./contract";
import type { BetState } from "./interface";
import { bets, fujiClient as s_fujiClient, sepoliaClient as s_sepoliaClient} from "./stores";
import { get } from "svelte/store";
import { avalancheFuji, sepolia } from "viem/chains";

export const addBet = async (isSepolia: boolean, address: Address) => {
    const client = isSepolia ? get(s_sepoliaClient) : get(s_fujiClient)
    const state = await client.multicall({
        contracts: [
            { ...bet_template, address: address, functionName: 'betInfo'},
            { ...bet_template, address: address, functionName: 'cover'},
            { ...bet_template, address: address, functionName: 'ats'}
        ]
    })
    console.log(state)
    const bet = {
        ...parseBetInfo(state[0].result as bigint),
        coverAddr: state[1].result as `0x${string}`,
        atsAddr: state[2].result as `0x${string}`,
        contractAddr: address,
        chainId: isSepolia ? sepolia.id : avalancheFuji.id
    }
    const _bets = get(bets)
    bets.set([..._bets, bet])
}

export const getFullBetsCreated = async () : Promise<BetState[]> => {
    const fujiClient = get(s_fujiClient)
    const sepoliaClient = get(s_sepoliaClient)
    if (!fujiClient && !sepoliaClient) return [];
    const [lastSepBlock, lastFujiBlock] = await Promise.all([
        sepoliaClient.getBlockNumber(),
        fujiClient.getBlockNumber()
    ])
    // make an array of numbers from the last block to the deploy block, in increments of 2048
    const sep_block_range = parseInt(((lastSepBlock - BigInt(SEP_DEPLOY_BLOCK)) / BigInt(2047)).toString())
    const fuji_block_range = parseInt(((lastFujiBlock - BigInt(FUJI_DEPLOY_BLOCK)) / BigInt(2047)).toString())
    const sep_blocks = Array(sep_block_range + 1).fill(0).map( (_, i) => lastSepBlock - BigInt(i * 2047))
    const fuji_blocks = Array(fuji_block_range + 1).fill(0).map( (_, i) => lastFujiBlock - BigInt(i * 2047))
    console.log(lastSepBlock, lastFujiBlock, sep_block_range, fuji_block_range)
    console.log(lastSepBlock - BigInt(SEP_DEPLOY_BLOCK), lastFujiBlock - BigInt(FUJI_DEPLOY_BLOCK))
    console.log(sep_blocks)
    console.log(fuji_blocks)
    const [sep_logs, fuji_logs] = await Promise.all([
        ...(await Promise.all(
            sep_blocks.map( async (startBlock) => {
                return sepoliaClient.getLogs({  
                    address: SEP_FACTORY_ADDRESS,
                    event: parseAbiItem('event BetCreated(address indexed creator, uint indexed matchId, address indexed bet)'),
                    fromBlock: startBlock - BigInt(2047),
                    toBlock: startBlock 
                })
            })
        )),
        ...(await Promise.all(
            fuji_blocks.map( async (startBlock) => {
                return fujiClient.getLogs({  
                    address: FUJI_FACTORY_ADDRESS,
                    event: parseAbiItem('event BetCreated(address indexed creator, uint indexed matchId, address indexed bet)'),
                    fromBlock: startBlock - BigInt(2047),
                    toBlock: startBlock
                })
            })
        ))
    ])
    // multicall all bet addresses then return the active ones, non-started ones
    const [sep_states, fuji_states] = await Promise.all([
        sepoliaClient.multicall({
            contracts: [
                ...sep_logs.map( (log) => { return { ...bet_template, address: log.args.bet!, functionName: 'betInfo'}}),
                ...sep_logs.map( (log) => { return { ...bet_template, address: log.args.bet!, functionName: 'cover'}}),
                ...sep_logs.map( (log) => { return { ...bet_template, address: log.args.bet!, functionName: 'ats'}})
            ]
        }),
        fujiClient.multicall({
            contracts: [
                ...fuji_logs.map( (log) => { return { ...bet_template, address: log.args.bet!, functionName: 'betInfo'}}),
                ...fuji_logs.map( (log) => { return { ...bet_template, address: log.args.bet!, functionName: 'cover'}}),
                ...fuji_logs.map( (log) => { return { ...bet_template, address: log.args.bet!, functionName: 'ats'}})
            ]
        })
    ])
    const _bets = [
        ...sep_logs.map( (log, i) : BetState => {
            return {
                ...parseBetInfo(sep_states[i].result as bigint),
                coverAddr: sep_states[sep_logs.length + i].result as `0x${string}`,
                atsAddr: sep_states[sep_logs.length * 2 + i].result as `0x${string}`,
                contractAddr: log.args.bet!,
                chainId: sepolia.id
            }
        }),
        ...fuji_logs.map( (log, i) : BetState => {
            return {
                ...parseBetInfo(fuji_states[i].result as bigint),
                coverAddr: fuji_states[fuji_logs.length + i].result as `0x${string}`,
                atsAddr: fuji_states[fuji_logs.length * 2 + i].result as `0x${string}`,
                contractAddr: log.args.bet!,
                chainId: avalancheFuji.id
            }
        })
    ]
    bets.set(_bets)
    return _bets
}