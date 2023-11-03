export const truncateAddress = (address: `0x${string}`) => {
    return address.slice(0, 6) + '...' + address.slice(address.length - 4);
}

export const BLOCK_EXPLORERS: {[chainid: number] : string } = {
    1: 'https://etherscan.io/',
    8453: 'https://basescan.org/'
}