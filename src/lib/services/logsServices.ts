import { generalFunctions } from "../generalFunctions";
import { LogsType } from "../types/LogsType";

class LogsServices{
    async getLogs(fileId: string): Promise<LogsType[]>{
        try {
            const url = generalFunctions.createGcpUrl(`/logs/${fileId}`);
            const res = await fetch(url);
            const data = await res.json();
            return data;
        } catch (error) {
            throw new Error("Failed to fetch logs");
        }
    }
}

export const logsServices = new LogsServices();