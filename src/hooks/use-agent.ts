import { Agent } from "@/lib/dataModel/AgentModel";
import { agentServices } from "@/lib/services/AgentServices";
import { AgentTypeDTO } from "@/lib/types/AgentTypes";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";


export function useGetAllAgents(gameId: string) {
    return useQuery<Agent[]>({
        queryKey: ["agents", gameId],
        queryFn: () => agentServices.getAllAgents(gameId),
        enabled: !!gameId
    })
}

export function useGetAgent(agentId: string){
    return useQuery<Agent>({
        queryKey:["agent", agentId],
        queryFn: () => agentServices.getAgent(agentId),
        enabled: !!agentId
    })
}

export function useCreateAgent(gameId: string){
    const queryClient = useQueryClient();
    return useMutation({
        mutationKey: ["create-agent"],
        mutationFn: (agentState: AgentTypeDTO) => agentServices.createAgent(agentState),
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ["agents", gameId]});
        },
        onError: () => {
            console.log("error while creating agent");
        }
    })
}

export function useUpdateAgent(agentId: string, gameId: string){
    const queryClient = useQueryClient();
    return useMutation({
        mutationKey: ["update-agent"],
        mutationFn: (agentState: AgentTypeDTO) => agentServices.updateAgent(agentId, agentState),
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ["agent", agentId]});
            queryClient.invalidateQueries({queryKey: ["agents", gameId]});
        },
        onError: () => {
            console.log("unable to update the agent");
        }
    })
}

export function useDeleteAgent( gameId: string){
    const queryClient = useQueryClient();
    return useMutation({
        mutationKey: ["delete-agent"],
        mutationFn: (agentId: string,) => agentServices.deleteAgent(agentId),
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ["agents", gameId]});
        }
    })
}