import { generalFunctions } from "@/lib/generalFunctions";
import { gcpServices } from "@/lib/services/GcpServices";
import { FileResponse } from "@/lib/types/GcpTypes";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { useToast } from "./use-toast";
export function useGetAllFiles(gameId: string){
    return useQuery({
        queryKey: ["gcp-files", gameId],
        queryFn: () => gcpServices.getAllFiles(gameId),
        enabled: !!gameId
    })
}

export function useMetaList(gameId: string){
    return useQuery({
        queryKey: ["gcp-meta", gameId],
        queryFn: () => gcpServices.getMetaList(gameId),
        enabled: !!gameId
    })
}

export function useGetFile(gameId: string, fileName: string, options?: {enabled?: boolean}){
    return useQuery<FileResponse, Error>({
        queryKey: ["gcp-file", gameId, fileName],
        queryFn: () => gcpServices.getFile(gameId, fileName),
        enabled: options?.enabled
    })
}


export function useUpdateFile(gameId: string, fileName: string){
    const queryClient = useQueryClient();
    const username = generalFunctions.getUserName();
    return useMutation({
        mutationKey: ["update-file"],
        mutationFn: (content: string) => gcpServices.updateFile(gameId, fileName, content, username),
        onSuccess: () => { 
            queryClient.invalidateQueries({queryKey: ["gcp-file", gameId, fileName]})
        
        },
        onError: () => { console.log("unable to update the file"); }
    })
}

type UploadVariables = {
  files: File[];
  uploadTargetPath: string;
};
export function useUploadFile(gameId: string){
    const queryClient = useQueryClient();
    const username = generalFunctions.getUserName();
    const { toast } = useToast()
    return useMutation({
        mutationKey: ["upload-file"],
        mutationFn: ({files, uploadTargetPath}: UploadVariables) => gcpServices.uploadFile(files, gameId, uploadTargetPath, username),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["gcp-files", gameId]
            });
            queryClient.invalidateQueries({
                queryKey: ["gcp-meta", gameId],
                 refetchType: "active" 
            });
        },
        onError: (err) => {
            console.log("unable to upload the file");
            toast({
    title: "Error",
    description: err.message,
  })
        }
    })
}

export function useDeleteFile(gameId: string){
    const queryClient = useQueryClient();
    return useMutation({
        mutationKey: ["delete-file"],
        mutationFn: (fileName: string) => gcpServices.deleteFile(gameId, fileName),
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ["gcp-files", gameId]});
        },
        onError: () => {
            console.log("unable to delete the file");
        }
    })
}

export function useArchive(){
    return useQuery({
        queryKey: ["gcp-archive"],
        queryFn: () => gcpServices.getArchiveList(),
    })
}

type RenameVariables = {
  old_path: string;
  new_path: string;
};
export function useRenameFile(gameId: string){
    const queryClient = useQueryClient();
    return useMutation({
        mutationKey: ["rename-file"],
        mutationFn: ({old_path, new_path}: RenameVariables) => gcpServices.renameFiles(old_path, new_path),
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ["gcp-files", gameId]});
            queryClient.invalidateQueries({queryKey: ["gcp-meta", gameId]});
            queryClient.invalidateQueries({queryKey: ["gcp-archive"]});
        },
        onError: () => {
            console.log("unable to rename the file");
        }
    })
}