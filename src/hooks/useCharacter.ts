import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { characterServices } from "@/lib/services/CharacterServices";
import { Character } from "@/lib/dataModel/CharacterModel";
import { CharacterDTO } from "@/lib/types/CharacterTypes";

export function useCharacters(gameId: string){
    return useQuery<Character[]>({
        queryKey: ["characters", gameId],
        queryFn: () => characterServices.getAllCharacters(gameId),
        enabled: !!gameId,
    })
}

export function useSingleCharacter(characterId: string){
    return useQuery<Character>({
        queryKey: ["character", characterId],
        queryFn: () => characterServices.getCharacter(characterId),
        enabled: !!characterId,
    })
}

export function useCreateCharacter(gameId: string) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (character: CharacterDTO) => characterServices.createCharacter(character),
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ["characters", gameId]});
        },
        onError: () => {
            console.log("error while creating character");
        }
    })
}

export function useBulkUpdateCharacters(gameId: string){
    const queryClient = useQueryClient();
    return useMutation({
        mutationKey: ["bulk-update-characters"],
        mutationFn: (characters: CharacterDTO[]) => characterServices.bulkUploadCharacters(characters),
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ["characters", gameId]});
        },
        onError: () => {
            console.log("unable to bulk update the characters");
        }
    })
}

export function useUpdateCharacter(characterId: string){
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (characterData: CharacterDTO) => characterServices.updateCharacter(characterId, characterData),
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ["character", characterId]});
        },
        onError: () => {
            console.log("unable to update the character");
        }
    })
}

export function useDeleteCharacter( gameId: string ){
    const queryClient = useQueryClient();
    return useMutation({
        mutationKey: ["delete-character"],
        mutationFn: (characterId: string) => characterServices.deleteCharacter(characterId),
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ["characters", gameId]});
        },
        onError: () => {
            console.log("unable to delete the character");
        }
    })
}