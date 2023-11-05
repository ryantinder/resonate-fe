import axios from "axios"
import type { Game } from "./interface"
export const fetchGames = async () : Promise<Game[]> => {
    console.log("fetching games")
    const res_url = 'https://v1.american-football.api-sports.io/games?season=2023&league=1'
    const res = await axios.get(res_url, { headers: { 'Content-Type': 'application/json', 'x-rapidapi-key': '0d7371b74cfe8afb33bf3dbc9abaa414', 'x-rapidapi-host': 'v1.american-football.api-sports.io' } })
    // console.log(JSON.stringify(res.data, null, 2))
    return res.data.response
}