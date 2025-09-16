import { generalFunctions } from "../generalFunctions";
import { FileMetaType, FileResponse } from "../types/GcpTypes";

class GcpServices {
  async getAllFiles(gameId: string): Promise<string[]> {
    try {
      const url = generalFunctions.createGcpUrl(`/?game_id=${gameId}`);
      const res = await fetch(url);
      const data = await res.json();
      console.log("data from gcp", data);
      return data;
    } catch (error) {
      throw new Error("Failed to fetch files");
    }
  }

  async getFile(
    gameId: string,
    fileName: string
  ): Promise<FileResponse> {
    try {
      const url = generalFunctions.createGcpUrl(
        `/content?path=${fileName}`
      );
      const res = await fetch(url);
      const data = await res.json();
      console.log("data from the file", data);
      return data;
    } catch (error) {
      throw new Error(`Failed to fetch file`);
    }
  }

  async updateFile(
    gameId: string,
    fileName: string,
    content: string,
    username: string
  ): Promise<void> {
    try {
      const fullPath = `${fileName}`;
      const url = generalFunctions.createGcpUrl(`/update?path=${fullPath}`);
      const res = await fetch(url, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content, username }),
      });
    } catch (error) {
      throw new Error(`Failed to update file`);
    }
  }

  async uploadFile(
    files: File[],
    gameId: string,
    uploadTargetPath: string,
    username: string
  ): Promise<void> {
    try {
      const url = generalFunctions.createGcpUrl("/upload");
      await Promise.all(
      files.map(async (file: File) => {
        const targetPath = `${gameId}/${uploadTargetPath}${file.name}`;
        const formData = new FormData();
        formData.append("file", file);
        formData.append("path", targetPath);
        formData.append("username", username);

        const res = await fetch(url, {
          method: "POST",
          body: formData,
        });

        const data = await res.json();
        console.log("Upload response:", data);
        if (!res.ok) {
        // 🔴 throw backend error
        throw new Error(data.detail || "Upload failed");
      }
      })
    );
    } catch (error) {
      throw new Error(`Failed to upload file`);
    }
  }

  async deleteFile(gameId: string, fileName: string): Promise<void> {
    try {
      console.log("fileName for delete", fileName);
      const target_path = `${gameId}/${fileName}`;
      const url = generalFunctions.createGcpUrl(`/delete?path=${target_path}`);
      await fetch(url, {
        method: "DELETE",
      });
    } catch (error) {
      throw new Error(`Failed to delete file`);
    }
  }

  async getMetaList(gameId: string): Promise<FileMetaType[]>{
    try {
      const url = generalFunctions.createGcpUrl(`/meta/${gameId}`);
      const res = await fetch(url);
      const data = await res.json();
      console.log("data from gcp", data);
      return data;
    } catch (error) {
      throw new Error("Failed to fetch files");
    }
  }

  async getArchiveList(isDeleted: boolean = true): Promise<FileMetaType[]>{
    try {
      const url = generalFunctions.createGcpUrl(`/meta/archive/?isDeleted=${isDeleted}`);
      const res = await fetch(url);
      const data = await res.json();
      console.log("data from gcp", data);
      return data;
    } catch (error) {
      throw new Error("Failed to fetch files");
    }
  }

  async renameFiles(old_path: string, new_path: string): Promise<string>{
    try {
      const url = generalFunctions.createGcpUrl("/rename");
      const payload = {
        old_path,
        new_path,
        username: generalFunctions.getUserName()
      }
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })
      const data: string = await res.json();
      return data;
    } catch (error) {
      throw new Error("Failed to rename the file");
    }
  }
}

export const gcpServices = new GcpServices();
