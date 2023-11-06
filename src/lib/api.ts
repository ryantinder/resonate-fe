import axios from "axios"
import type { Game } from "./interface"
import { games } from "./stores"
export const fetchGames = async () : Promise<Game[]> => {
    console.log("fetching games")
    const res_url = 'https://v1.american-football.api-sports.io/games?season=2023&league=1'
    // const res = await axios.get(res_url, { headers: { 'Content-Type': 'application/json', 'x-rapidapi-key': '0d7371b74cfe8afb33bf3dbc9abaa414', 'x-rapidapi-host': 'v1.american-football.api-sports.io' } })
    const res = await fetch(res_url, { headers: { 'x-rapidapi-key': '0d7371b74cfe8afb33bf3dbc9abaa414', 'x-rapidapi-host': 'v1.american-football.api-sports.io' } })
    // console.log(JSON.stringify(res.data, null, 2))
    const json = (await res.json()).response as Game[]
    console.log(json)
    games.set(json)
    return json
}