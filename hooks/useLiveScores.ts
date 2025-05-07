import axios from 'axios';
import { createClient } from '@supabase/supabase-js';

interface GameScore {
    game_id: string;
    game_status: number;
    home_team: string;
    away_team: string;
    home_score: number | null;
    away_score: number | null;
    period: number | null;
    game_clock: string | null;
    game_date: string;
    game_time: string;
}

const BASE_URL = "https://cdn.nba.com/static/json";

async function fetchTodaysNbaGames(): Promise<any[]> {
    const url = `${BASE_URL}/staticData/scheduleLeagueV2_1.json`
    try {
        const response = await axios.get(url);
        const gameDates = response.data['leagueSchedule']['gameDates'];
        
        // Get today's date in MM/DD/YYYY format
        const today = new Date();
        const dd = String(today.getDate()).padStart(2, '0');
        const mm = String(today.getMonth() + 1).padStart(2, '0');
        const yyyy = today.getFullYear();
        const todayFormatted = `${mm}/${dd}/${yyyy} 00:00:00`;

        // Find the entry for today's date and return its games array
        const todaysGames = gameDates.find((dateEntry: any) => dateEntry.gameDate === todayFormatted);
        return todaysGames ? todaysGames.games : [];
    } catch (error) {
        console.error("Error fetching today's NBA games:", error);
        return [];
    }
}

export async function getLiveScores(): Promise<GameScore[]> {
    const games = await fetchTodaysNbaGames();
    const scores: GameScore[] = [];

    for (const game of games) {
        const game_id = game['gameId'];
        const home_team = game['homeTeam']['teamName']
        const away_team = game['awayTeam']['teamName']
        const game_date = game['gameDateTimeEst'].split('T')[0];
        const game_time = game['gameDateTimeEst'].split('T')[1].split('Z')[0];
        try {
            const boxResponse = await axios.get(`${BASE_URL}/liveData/boxscore/boxscore_${game_id}.json`);
            const box = boxResponse.data['game'];

            scores.push({
                game_id: game_id,
                home_team: home_team,
                away_team: away_team,
                game_date: game_date,
                game_time: game_time,
                game_status: box['gameStatus'],
                home_score: box['homeTeam']['score'],
                away_score: box['awayTeam']['score'],
                period: box['period'],
                game_clock: box['gameClock'],
            });
        } catch (error) {
            // Individual game endpoints are unavailable till closer to game time, so the GET request
            // will error out
            scores.push({
                game_id: game_id,
                home_team: home_team,
                away_team: away_team,
                game_date: game_date,
                game_time: game_time,
                game_status: game['gameStatus'],
                home_score: null,
                away_score: null,
                period: null,
                game_clock: null,
            });
        }
    }
    return scores;
}
