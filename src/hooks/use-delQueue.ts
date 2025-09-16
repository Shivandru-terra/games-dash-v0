import {useQuery, useQueryClient, useMutation} from '@tanstack/react-query';
import { deleteQueueService } from "@/lib/services/DeleteQueueServices";
import { DeleteQueueTypeDTO } from '@/lib/types/DeleteQueueType';

export function useGetallDelQueue(){
    return useQuery({
        queryKey: ["delQueue"],
        queryFn: () => deleteQueueService.getAllDeleteQueues(),
    })
}

export function useCreateDelQueue(){
    const queryClient = useQueryClient();
    return useMutation({
        mutationKey: ["create-delQueue"],
        mutationFn: (payload: DeleteQueueTypeDTO) => deleteQueueService.createDeleteQueue(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ["delQueue"]});
        },
    })
}

export function useDeleteDelQueue(gameId: string){
    const queryClient = useQueryClient();
    return useMutation({
        mutationKey: ["delete-delQueue"],
        mutationFn: ( requestId: string ) => deleteQueueService.delDeleteQueue(requestId),
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ["delQueue"]});
            queryClient.invalidateQueries({queryKey: ["gcp-meta", gameId]});
            queryClient.invalidateQueries({
                queryKey: ["gcp-archive"]
            });
        },
    })
}

export function useRestore(){
    const queryClient = useQueryClient();
    return useMutation({
        mutationKey: ["restore-file"],
        mutationFn: ({ fileId }: { fileId: string; gameId: string }) => deleteQueueService.restoreFiles(fileId),
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({
                queryKey: ["gcp-meta", variables.gameId]
            });
            queryClient.invalidateQueries({
                queryKey: ["gcp-archive"]
            });
        }
    })
}

export function useRejectDelQueue(){
    const queryClient = useQueryClient();
    return useMutation({
        mutationKey: ["reject-delQueue"],
        mutationFn: (requestId: string) => deleteQueueService.rejectDelReq(requestId),
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ["delQueue"]});
        },
        onError: () => {
            console.log("unable to reject the request");
        }
    })
}