import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { Label } from "@radix-ui/react-label";
import { FileText, Folder, Plus, Trash2, Upload } from "lucide-react";
import { useState } from "react";
import { Button } from "./ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "./ui/dialog";
// import { useAppContext } from "@/context/AppContext";
import { useParams } from "react-router-dom";
import { generalFunctions } from "@/lib/generalFunctions";
import { useDeleteFile, useUploadFile } from "@/hooks/use-gcp";

export type FileType = null;
export type FolderType = {[key: string]: FileType | FolderType};

export type TreeType = FolderType

// export function buildTree (paths: string[]) {
//   const tree: TreeType = {};
//   paths.forEach((path) => {
//     const parts = path.split("/");
//     let current = tree;
//     parts.forEach((part, idx) => {
//       if (!current[part]) {
//         current[part] = idx === parts.length - 1 ? null : {};
//       }
//       current = current[part] || {};
//     });
//   });
//   return tree;
// }

export default function FileTree({
  tree,
  basePath = "",
  onSelect,
  toggleModal,
}: {
  tree: TreeType;
  basePath?: string;
  onSelect: (path: string) => void;
  toggleModal: () => void;
}) {
  const [isFileDialogOpen, setIsFileDialogOpen] = useState(false);
  const [uploadTargetPath, setUploadTargetPath] = useState<string | null>(null);
  const [files, setFiles] = useState<File[]>([]);
  const { gameId } = useParams();
  // const { mutate : uploadFiles } = useUploadFile(gameId || "", uploadTargetPath || "");
  const { mutate: deleteFile } = useDeleteFile(gameId || "");

  console.log("gameId from filetree", gameId);
  console.log("tree, from filetree", tree);
  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    // if (e.target.files?.[0]) {
    //   setFile(e.target.files[0]);
    // }
    if (e.target.files) {
    const files = Array.from(e.target.files); // convert FileList → array
    setFiles(files); // store them in state
  }
  }

  const handleUpload = async () => {
    // uploadFiles(files, {
    //   onSuccess: () => {
    //     setIsFileDialogOpen(false);
    //   }
    // });
  };

  async function handleDelete(fileName: string) {
    deleteFile(fileName);
}


  return (
    <div className="">
      {Object.entries(tree)?.map(([key, value]) =>
        value === null ? (
          // === FILE ITEM ===
          <div
            key={key}
            className="group flex items-center justify-between ml-3 pl-1 pr-1 py-1 rounded hover:bg-muted/40 border-l-2 border-muted-foreground/20"
          >
            <div
              draggable
              onDragStart={(e) => {
                e.dataTransfer.setData(
                  "application/filepath",
                  `${basePath}${key}`
                );
              }}
              onClick={() => onSelect(`${basePath}${key}`)}
              className="flex items-center cursor-pointer w-full"
            >
              <FileText className="h-4 w-4 mr-2 text-muted-foreground" />
              <span className="text-xs">{key}</span>
            </div>

            {/* File Delete Button */}
            <Button
              size="icon"
              variant="ghost"
              className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={(e) => {
                e.stopPropagation();
                handleDelete(`${basePath}${key}`);
              }}
            >
              <Trash2 className="h-3 w-3 text-destructive" />
            </Button>
          </div>
        ) : (
          // === FOLDER ITEM ===
          <Accordion type="single" collapsible key={key}>
            <AccordionItem
              value={key}
              className="border-l-2 border-muted-foreground/30 pl-2 ml-2"
            >
              <AccordionTrigger className="flex items-center gap-2 py-1 hover:bg-muted/30 rounded-md">
                <Folder className="h-4 w-4 mr-2 text-blue-500" />
                <span className="font-medium">{key}</span>
              </AccordionTrigger>

              <AccordionContent className="ml-4 mt-1 space-y-1">
                {/* Subtree */}
                <FileTree
                  tree={value}
                  basePath={`${basePath}${key}/`}
                  onSelect={onSelect}
                  toggleModal={toggleModal}
                />

                {/* Add File Button */}
                <div className="mt-3">
                  <Dialog
                    open={
                      isFileDialogOpen &&
                      uploadTargetPath === `${basePath}${key}/`
                    }
                    onOpenChange={(open) => {
                      setIsFileDialogOpen(open);
                      if (!open) setFiles(null);
                    }}
                  >
                    <DialogTrigger asChild>
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full flex justify-center items-center"
                        onClick={() =>
                          setUploadTargetPath(`${basePath}${key}/`)
                        }
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add File
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="border-border/50 bg-card">
                      <DialogHeader>
                        <DialogTitle>Upload to {uploadTargetPath}</DialogTitle>
                        <DialogDescription>
                          {/* {file?.name || "Upload .txt or .md files"} */}
                          <ul>
                            {files?.map((file, i) => (
                              <li key={i}>{file.name}</li>
                            ))}
                          </ul>
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 pt-4 flex flex-col">
                        <div className="space-y-2">
                          <Label htmlFor="file-upload">Select Files</Label>
                          <div className="flex items-center justify-center w-full">
                            <label
                              htmlFor="file-upload"
                              className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-border/50 rounded-lg cursor-pointer bg-muted/30 hover:bg-muted/50 transition-colors"
                            >
                              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                <Upload className="w-8 h-8 mb-4 text-muted-foreground" />
                                <p className="mb-2 text-sm text-muted-foreground">
                                  <span className="font-semibold">
                                    Click to upload
                                  </span>{" "}
                                  or drag and drop
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  TXT or MD files only
                                </p>
                              </div>
                              <input
                                id="file-upload"
                                type="file"
                                className="hidden"
                                multiple
                                accept=".txt,.md"
                                onChange={handleFileUpload}
                              />
                            </label>
                          </div>
                        </div>
                        {files?.length > 0 && (
                          <Button variant="outline" onClick={handleUpload}>
                            Upload
                          </Button>
                        )}
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        )
      )}
    </div>
  );
}
