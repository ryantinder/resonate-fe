import { fetchGames } from '$lib/api.js';
import { games } from '$lib/stores.js';
import axios from 'axios';
/** @type {import('./$types').PageServerLoad} */
// export async function load({ params, fetch }) : Promise<{ games: Game[]}>{
// 	return {
// 		fetch: await fetchGames()
// 	};
// }

/*
    game:
        id
        stage
        week
        date
*/

