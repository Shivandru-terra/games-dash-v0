import { generalFunctions } from "../generalFunctions";

class GameServices {
    async getAllGames(): Promise<string[]>{
        try {
            const url = generalFunctions.createGcpUrl("/games")
            const res = await fetch(url);
            const data = await res.json();
            return data;
        } catch (error) {
            throw new Error("Failed to fetch games");
        }
    }

    async createGame(game_id: string): Promise<void>{
        try {
            const url = generalFunctions.createGcpUrl(`/game/create?game_id=${game_id}`);
            const res = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
            });
            const data = await res.json();
            return data;
        } catch (error) {
            throw new Error("Error creating game");
        }
    }
}

export const gameServices = new GameServices();