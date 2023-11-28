import { fetchGames } from '$lib/api.js';
import { GetAllPairs } from '$lib/graph.js';
import type { Pair } from '$lib/interface.js';
import axios from 'axios';
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

