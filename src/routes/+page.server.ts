import { GetAllPairs } from '$lib/graph.js';
import type { Pair } from '$lib/interface.js';
/** @type {import('./$types').PageServerLoad} */
export async function load({ params, fetch }) : Promise<{ pairs: Pair[]}>{
	return {
		pairs: await GetAllPairs()
	};
}

/*
    game:
        id
        stage
        week
        date
*/

