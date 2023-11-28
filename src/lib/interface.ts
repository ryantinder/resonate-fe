export interface AllPairsQueryResponse {
    data: {
        dexAmmProtocol: {
            pools: Pair[]
        }
    }
    errors?: any
}

export interface Pair {
    id: string;
    name: string
    cumulativeVolumeUSD: number
    cumulativeTotalRevenueUSD: number
    totalValueLockedUSD: number
    inputTokens: Token[];
}

export interface Token {
    id: string;
    name: string;
    decimals: number
}

export interface PairHistoryResponse {
    data: {
        swaps: Swap[]
    }
}
export interface Swap {
    id: string
    pool: Pair
    timestamp: string;
    from: string;
    amountIn: bigint;
    amountOut: bigint;
    tokenIn: Token;
    tokenOut: Token;
}