import { generalFunctions } from "../generalFunctions";
import { DeleteQueueTypeDTO } from "../types/DeleteQueueType";

class DeleteQueueService {

    async getAllDeleteQueues(): Promise<DeleteQueueTypeDTO[]>{
        try {
            const url = generalFunctions.createGcpUrl("/deleteQueue")
            const res = await fetch(url);
            const data: DeleteQueueTypeDTO[] = await res.json();
            return data;
        } catch (error) {
            throw new Error("Failed to fetch delete queues");
        }
    }

    async createDeleteQueue(payload: DeleteQueueTypeDTO): Promise<void>{
        try {
            const url = generalFunctions.createGcpUrl("/deleteQueue");
            const res = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            })
            const data = await res.json();
            console.log("data from delete queue", data);
        } catch (error) {
            throw new Error("Failed to create delete queue");
        }
    }

    async delDeleteQueue(requestId: string): Promise<void>{
        try {
            const url = generalFunctions.createGcpUrl(`/deleteQueue/${requestId}`);
            const res = await fetch(url, {
                method: "DELETE",
            })
            const data = await res.json();
            console.log("data from delete queue", data);
        } catch (error) {
            throw new Error("Failed to delete delete queue");
        }
    }

    async restoreFiles(fileId: string): Promise<void> {
    try {
      const url = generalFunctions.createGcpUrl(`/deleteQueue/restore/${fileId}?updatedBy=${generalFunctions.getUserName()}`)
      const res = await fetch(url, {
        method: "POST"
      })
      const data = await res.json()
      console.log("data from restore", data);
    } catch (error) {
      throw new Error("error while restoring the file")
    }
  }

  async rejectDelReq(requestId: string): Promise<void> {
    try {
        const url = generalFunctions.createGcpUrl(`/deleteQueue/reject/${requestId}`);
        const res = await fetch(url, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
            },
        })
        const data = await res.json();
        console.log("data from reject", data);
    } catch (error) {
        throw new Error(`Failed to reject delete request`);
    }
  }
}

export const deleteQueueService = new DeleteQueueService();