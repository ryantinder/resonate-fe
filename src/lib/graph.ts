import { AllPairsQuery, PairHistoryQuery, PairQuery, UserHistoryQuery } from "./gql";
import type { Pair, PairHistoryResponse, Swap } from "./interface";
import axios from "axios";
export let API_URL = 'https://gateway.thegraph.com/api/1e57515ca68dc280a6365c3de5298d70/subgraphs/id/ELUcwgpm14LKPLrBRuVvPvNKHQ9HvwmtKgKSH6123cr7'

export const GetAllPairs = async () : Promise<Pair[]> => {
    const config = {
        method: 'post',
        url: API_URL,
        headers: {
            'Content-Type': 'application/json'
        },
        data: AllPairsQuery
    };
   
    console.log("sending pairs request");
    const pairs_res = await axios.post(config.url, config.data, {headers: config.headers})
    // console.log(pairs_res)
    if (pairs_res.data.errors) {
        console.log(pairs_res.data.errors)
        throw new Error("Error fetching pairs")
    }
    console.log(pairs_res.data.data.dexAmmProtocol.pools.length, " pairs found")
    const pairs = pairs_res.data.data.dexAmmProtocol.pools;
    console.log("pairs res received")
    return pairs.map( (x) => {
        return {
            ...x,
            cumulativeVolumeUSD: parseFloat(x.cumulativeVolumeUSD),
            cumulativeTotalRevenueUSD: parseFloat(x.cumulativeTotalRevenueUSD),
            totalValueLockedUSD: parseFloat(x.totalValueLockedUSD)
        }
    })
}
export const GetPair = async (pair: string) : Promise<Pair | null> => {
    const config = {
        method: 'post',
        url: API_URL,
        headers: {
            'Content-Type': 'application/json'
        },
        data: PairQuery(pair)
    };
   
    console.log("sending pairs request");
    const pairs_res = await axios.post(config.url, config.data, {headers: config.headers})
    console.log(PairQuery(pair), pairs_res.data)
    const pairs = pairs_res.data.data.liquidityPool;
    console.log("pairs res received", pairs )
    if (!pairs) return null;
    return {
        ...pairs,
        inputTokens: pairs.inputTokens.map( (x) => {
            return {
                ...x,
                decimals: parseInt(x.decimals)
            }
        })
    }
}
export const GetPairHistory = async (pair: string) : Promise<Swap[]> => {
    const config = {
        method: 'post',
        url: API_URL,
        headers: {
            'Content-Type': 'application/json'
        },
        data: PairHistoryQuery(pair)
    };

    console.log("sending swaps request");
    const swaps_res = await axios.post(config.url, config.data, {headers: config.headers}) as {data: PairHistoryResponse}
    // console.log(swaps_res)
    // console.log(swaps_res)
    // console.log(swaps_res.data.errors)
    const swaps = swaps_res.data.data.swaps;
    console.log("swaps res received")

    return swaps.map( (x) => {
        return {
            ...x,
            amountIn: BigInt(x.amountIn),
            amountOut: BigInt(x.amountOut),
        }
    })
}
export const GetUserHistory = async (user: string) : Promise<Swap[]> => {
    const config = {
        method: 'post',
        url: API_URL,
        headers: {
            'Content-Type': 'application/json'
        },
        data: UserHistoryQuery(user)
    };

    console.log("sending swaps request");
    const swaps_res = await axios.post(config.url, config.data, {headers: config.headers})
    // console.log(swaps_res)
    // console.log(swaps_res)
    console.log(swaps_res.data)
    const swaps = swaps_res.data.data.swaps;
    console.log("swaps res received", swaps)

    return swaps.map( (x) => {
        return {
            ...x,
            pool: {
                ...x.pool,
                cumulativeVolumeUSD: parseFloat(x.pool.cumulativeVolumeUSD),
                cumulativeTotalRevenueUSD: parseFloat(x.pool.cumulativeTotalRevenueUSD),
                totalValueLockedUSD: parseFloat(x.pool.totalValueLockedUSD),
                inputTokens: x.pool.inputTokens.map( (x) => {
                    return {
                        ...x,
                        decimals: parseInt(x.decimals)
                    }
                })
            },
            amountIn: BigInt(x.amountIn),
            amountOut: BigInt(x.amountOut),
        }
    })
}


