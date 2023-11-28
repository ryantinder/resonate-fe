import { GetPair, GetPairHistory, GetUserHistory } from '$lib/graph.js';
import type { Pair, Swap } from '$lib/interface.js';

/** @type {import('./$types').PageServerLoad} */
export async function load({ params, fetch }) : Promise<{ swaps: Swap[], pair: Pair | null, user: Swap[]}>{
    console.log("fetching swaps")
    const [swaps, pair, user] = await Promise.all([
        GetPairHistory(params.pair),
        GetPair(params.pair),
        GetUserHistory(params.pair)
    ])
	return {
		swaps,
        pair,
        user
	};
}

/*
    game:
        id
        stage
        week
        date
*/

