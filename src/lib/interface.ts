/*
       "game": {
            "id": 7670,
            "stage": "Regular Season",
            "week": "Week 10",
            "date": {
                "timezone": "UTC",
                "date": "2023-11-12",
                "time": "18:00",
                "timestamp": 1699812000
            },
            "venue": {
                "name": "Acrisure Stadium",
                "city": "Pittsburgh"
            },
            "status": {
                "short": "NS",
                "long": "Not Started",
                "timer": null
            }
        },
        "league": {
            "id": 1,
            "name": "NFL",
            "season": "2023",
            "logo": "https://media-4.api-sports.io/american-football/leagues/1.png",
            "country": {
                "name": "USA",
                "code": "US",
                "flag": "https://media-4.api-sports.io/flags/us.svg"
            }
        },
        "teams": {
            "home": {
                "id": 22,
                "name": "Pittsburgh Steelers",
                "logo": "https://media-4.api-sports.io/american-football/teams/22.png"
            },
            "away": {
                "id": 15,
                "name": "Green Bay Packers",
                "logo": "https://media-4.api-sports.io/american-football/teams/15.png"
            }
        },
        "scores": {
            "home": {
                "quarter_1": null,
                "quarter_2": null,
                "quarter_3": null,
                "quarter_4": null,
                "overtime": null,
                "total": null
            },
            "away": {
                "quarter_1": null,
                "quarter_2": null,
                "quarter_3": null,
                "quarter_4": null,
                "overtime": null,
                "total": null
            }
        }
*/
interface Game {
    game: {
        id: number,
        stage: string,
        week: string,
        date: {
            timezone: string,
            date: string,
            time: string,
            timestamp: number
        },
        venue: {
            name: string,
            city: string
        },
        status: {
            short: string,
            long: string,
            timer: number | null 
        }
    }
    league: {
        id: number,
        name: string,
        season: string,
        logo: string,
        country: {
            name: string,
            code: string,
            flag: string
        }
    },
    teams: {
        home: {
            id: number,
            name: string,
            logo: string
        },
        away: {
            id: number,
            name: string,
            logo: string
        }
    },
    scores: {
        home: {
            quarter_1: number | null,
            quarter_2: number | null,
            quarter_3: number | null,
            quarter_4: number | null,
            overtime: number | null,
            total: number | null
        },
        away: {
            quarter_1: number | null,
            quarter_2: number | null,
            quarter_3: number | null,
            quarter_4: number | null,
            overtime: number | null,
            total: number | null
        }
    }
}