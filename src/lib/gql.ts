
export const AllPairsQuery = 
    JSON.stringify({
    query: `query {
        dexAmmProtocol(
            id: "0x1f98431c8ad98523631ae4a59f267346ea31f984"
        ) {
            pools(
                first: 100
            ) {
                id
                name
                cumulativeVolumeUSD
                cumulativeTotalRevenueUSD
                totalValueLockedUSD
                inputTokens {
                    id
                    name
                    decimals
                    symbol
                }
          }
        }
    }`,
    variables: { }
});
export const PairQuery = (pair: string) : string => {
    return JSON.stringify({
    query: `query {
        liquidityPool(id: "${pair.toLowerCase()}") {
            id
            name
            cumulativeVolumeUSD
            cumulativeTotalRevenueUSD
            totalValueLockedUSD
            inputTokens {
                id
                name
                decimals
                symbol
            }
        }
    }`,
    variables: {}
})}
export const PairHistoryQuery = (pair: string) : string => {
    return JSON.stringify({
    query: `query {
        swaps(
            where: {
                pool: "${pair.toLowerCase()}"
            }
            first: 100
            orderBy: timestamp
            orderDirection: desc
        ) {
            id
            pool {
                id
                name
                cumulativeVolumeUSD
                cumulativeTotalRevenueUSD
                totalValueLockedUSD
                inputTokens {
                    id
                    name
                    decimals
                    symbol
                }
            }
            timestamp
            from
            amountIn
            amountOut
            tokenIn {
                id
                name
                decimals
                symbol
            }
            tokenOut {
                id
                name
                decimals
                symbol
            }
        }
    }`,
    variables: {}
})}
export const UserHistoryQuery = (user: string) : string => {
    return JSON.stringify({
    query: `query {
        swaps(
            where: {
                from: "${user.toLowerCase()}"
            }
            first: 100
            orderBy: timestamp
            orderDirection: desc
        ) {
            id
            pool {
                id
                name
                cumulativeVolumeUSD
                cumulativeTotalRevenueUSD
                totalValueLockedUSD
                inputTokens {
                    id
                    name
                    decimals
                    symbol
                }
            }
            timestamp
            from
            amountIn
            amountOut
            tokenIn {
                id
                name
                decimals
                symbol
            }
            tokenOut {
                id
                name
                decimals
                symbol
            }
        }
    }`,
    variables: {}
})}