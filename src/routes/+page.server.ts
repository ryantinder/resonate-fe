import { fetchGames } from '$lib/api.js';
import { games } from '$lib/stores.js';
import axios from 'axios';
/** @type {import('./$types').PageServerLoad} */
export async function load({ params }) : Promise<{ games: Game[]}>{
	return {
		games: await fetchGames()
	};
}

/*
    game:
        id
        stage
        week
        date
*/

