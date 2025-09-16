type FileType = null;
type FolderType = { [key: string]: FileType | FolderType };

export type TreeType = FolderType;

export type FileMetaType = {
  createdAt: string;
  fileId: string;
  fileName: string;
  filePath: string;
  gameName: string;
  geminiFileId: string;
  geminiUploadTime: string;
  lastUpdatedAt: string;
  raw_preview: string;
  isCorrupted?: boolean;
};

export type FileResponse = {
  filenameOfContent: string;
  content: string;
};

