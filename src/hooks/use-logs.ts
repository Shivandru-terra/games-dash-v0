import { logsServices } from "@/lib/services/logsServices";
import { useQuery } from "@tanstack/react-query";

export function useLogs(fileId: string, options?: {enabled?: boolean}) {
    return useQuery({
        queryKey: ["logs", fileId],
        queryFn: () => logsServices.getLogs(fileId),
        enabled: options.enabled ??!!fileId,
    });
}