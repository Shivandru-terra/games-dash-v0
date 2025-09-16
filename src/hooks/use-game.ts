import { gameServices } from "@/lib/services/GameServices";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export function useGetAllGames(){
    return useQuery({
        queryKey: ["games"],
        queryFn: () => gameServices.getAllGames(),
    })
}

export function useCreateGame(){
    const queryClient = useQueryClient();
    return useMutation({
        mutationKey: ["create-game"],
        mutationFn: (gameId: string) => gameServices.createGame(gameId),
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ["games"]});
        },
        onError: () => {
            console.log("error while creating game");
        }
    })
}