import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  useArchive,
  useDeleteFile,
  useGetAllFiles,
  useGetFile,
  useMetaList,
  useRenameFile,
  useUpdateFile,
  useUploadFile,
} from "@/hooks/use-gcp";
import { useToast } from "@/hooks/use-toast";
import {
  AlertTriangle,
  ArrowLeft,
  Brain,
  CheckCheck,
  ChevronDown,
  Copy,
  Cross,
  Download,
  DownloadIcon,
  FileText,
  Pencil,
  Plus,
  Search,
  Trash2,
  XCircle,
} from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "recharts";
import Spinner from "@/components/Spinner";
import { generalFunctions } from "@/lib/generalFunctions";
import { useCreateDelQueue } from "@/hooks/use-delQueue";
import { Collapsible } from "@radix-ui/react-collapsible";
import {
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { v4 as uuid } from "uuid";
import { Input } from "@/components/ui/input";
import { FileMetaType, FileResponse } from "@/lib/types/GcpTypes";
import { useQueryClient } from "@tanstack/react-query";
import { gcpServices } from "@/lib/services/GcpServices";
const DocViewer = () => {
  const navigate = useNavigate();
  const { gameId } = useParams();
  const { data: gcpMetaDataList, isLoading } = useMetaList(gameId || "");
  const { data: archiveData } = useArchive();
  const { data: bucketFiles } = useGetAllFiles(gameId || "");
  const [content, setContent] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [fileName, setFileName] = useState("");
  const isMarkdown =
    fileName?.endsWith(".md") || fileName?.endsWith(".markdown");
  const { data: fileContent } = useGetFile(gameId || "", fileName || "", {
    enabled: !!gameId && !!fileName,
  });
  const { mutate: updateFile, isPending } = useUpdateFile(
    gameId || "",
    fileName || ""
  );
  const { toast } = useToast();
  const { mutate: createDelQueue } = useCreateDelQueue();
  const [copyTitle, setCopyTitle] = useState(false);
  const [copying, setCopying] = useState(false);
  const knowledgeBaseRef = useRef<HTMLInputElement>(null);
  const promptRefs = useRef<HTMLInputElement>(null);
  const { mutate: uploadFiles } = useUploadFile(gameId! || "");
  const [searchQuery, setSearchQuery] = useState("");
  const [mergedFiles, setMergedFiles] = useState([]);
  const { mutate: deleteFile } = useDeleteFile(gameId);
  const { mutate: renameFile } = useRenameFile(gameId || "");
  const [editingFileId, setEditingFileId] = useState<string | null>(null);
  const [tempName, setTempName] = useState("");
  const [isCorrupted, setIsCorrupted] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [isOpenKnowledgeCollapsible, setIsOpenKnowledgeCollapsible] = useState(true);
  const [isOpenPromptsCollapsible, setIsOpenPromptsCollapsible] = useState(true);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (bucketFiles && gcpMetaDataList) {
      const merged = mergeFiles(
        gameId!,
        bucketFiles,
        gcpMetaDataList || [],
        archiveData || []
      );
      setMergedFiles(merged);
    }
  }, [gameId, bucketFiles, gcpMetaDataList, archiveData]);
  useEffect(()=>{
    if(searchQuery && !isOpenKnowledgeCollapsible && !isOpenPromptsCollapsible){
      setIsOpenKnowledgeCollapsible(true);
      setIsOpenPromptsCollapsible(true);
    }
  },[searchQuery, isOpenKnowledgeCollapsible, isOpenPromptsCollapsible])

  const filteredFiles = mergedFiles?.filter((file) => {
    return file.fileName.toLowerCase().includes(searchQuery.toLowerCase());
  });

  function mergeFiles(
    gameId: string,
    bucketFiles: string[],
    firestoreFiles: FileMetaType[],
    archiveFiles: FileMetaType[]
  ): FileMetaType[] {
    // helper: remove `_archived` before extension
    const normalizePath = (path: string) => {
      return path.replace(/_archived(?=\.[^.]+$)/, ""); // e.g. file_archived.md -> file.md
    };

    const firestorePaths = new Set(
      firestoreFiles.map((f) =>
        normalizePath(f.filePath.split("/").slice(1).join("/"))
      )
    );

    const archivePaths = new Set(
      archiveFiles.map((f) =>
        normalizePath(f.filePath.split("/").slice(1).join("/"))
      )
    );

    const corruptedFiles: FileMetaType[] = bucketFiles
      .filter(
        (path) =>
          !firestorePaths.has(normalizePath(path)) &&
          !archivePaths.has(normalizePath(path))
      )
      .map((path) => ({
        fileId: `corrupted-${uuid()}`,
        fileName: path.split("/").at(-1) || path,
        filePath: `${gameId}/${path}`,
        gameName: gameId,
        geminiFileId: "",
        geminiUploadTime: "",
        createdAt: new Date().toISOString(),
        lastUpdatedAt: new Date().toISOString(),
        raw_preview: "",
        isDeleted: false,
        isCorrupted: true,
      }));

    return [...firestoreFiles, ...corruptedFiles];
  }

  function handleCreateDelQueue(fileData) {
    const payload = {
      gameName: gameId,
      fileId: fileData.fileId,
      fileName: fileData.fileName,
      createdBy: generalFunctions.getUserName(),
      filePath: fileData.filePath,
    };

    createDelQueue(payload, {
      onSuccess: () => {
        toast({
          title: "Success",
          description: "Your request for delete has been sent to admin.",
        });
        //   setIsDelModalOpen(false);
      },
      onError: () => {
        toast({
          title: "Error",
          description: "Failed to create delete queue",
        });
      },
    });
  }

  useEffect(() => {
    if (fileContent) {
      setContent(fileContent?.content);
    }
  }, [fileContent]);

  async function handleSave() {
    updateFile(content, {
      onSuccess: () => {
        setIsEditing(false);
        toast({
          title: "File updated",
          description: "You've successfully updated the file.",
        });
      },
      onError: () => {
        toast({
          title: "Error",
          description: "An error occurred while updating the file.",
          variant: "destructive",
        });
      },
    });
  }

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!fileName) return;

    try {
      await navigator.clipboard.writeText(fileName?.split("/").at(-1));
      setCopyTitle(true);
      setTimeout(() => setCopyTitle(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  async function handleCopyContent(e: React.MouseEvent) {
    e.stopPropagation();
    setCopying(true);
    try {
      navigator.clipboard.writeText(fileContent?.content);

      toast({
        title: "Copied",
        description: `${fileName
          ?.split("/")
          .at(-1)} content copied to clipboard`,
      });

      setCopying(false);
    } catch (error) {
      console.error("error", error);
      setCopying(false);
      toast({
        title: "Error",
        description: "Failed to copy file content",
        variant: "destructive",
      });
    }
  }

  function handleFileUpload(
    e: React.ChangeEvent<HTMLInputElement>,
    mainFoler: string
  ) {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);
    const uploadTargetPath = `${mainFoler}/`;

    // Call your existing mutation
    uploadFiles(
      { files, uploadTargetPath },
      {
        onSuccess: () => {
          console.log("Files uploaded to", uploadTargetPath);
          e.target.value = "";
        },
        onError: (err) => {
          console.log("error while uploading files");
          toast({
            title: "Error",
            description:
              "Failed to upload, please check the file name and try again.",
          });
        },
      }
    );
  }

  function handleDownload() {
    setDownloading(true);
    try {
      // Create a Blob with the file content
      const blob = new Blob([content], {
        type: "text/plain;charset=utf-8",
      });
      const url = window.URL.createObjectURL(blob);

      // Create a hidden <a> tag to trigger download
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName || "download.txt"; // default filename
      document.body.appendChild(a);
      a.click();

      // Cleanup
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      setDownloading(false);
    } catch (error) {
      console.log("error", error);
      setDownloading(false);
      toast({
        title: "Error",
        description: "Failed to download file",
        variant: "destructive",
      });
    }
  }

  async function handleDownloadSidebar(fileData: FileMetaType) {
      setDownloading(true);
      try {
        let data = queryClient.getQueryData<FileResponse>([
          "gcp-file",
          gameId,
          fileData.filePath,
        ]);
  
        // 🛠️ If not cached, fetch manually
        if (!data) {
          data = await queryClient.fetchQuery<FileResponse>({
            queryKey: ["gcp-file", gameId, fileData.filePath],
            queryFn: () => gcpServices.getFile(gameId, fileData.filePath),
          });
        }
  
        // Create a Blob with the file content
        const blob = new Blob([data.content], {
          type: "text/plain;charset=utf-8",
        });
        const url = window.URL.createObjectURL(blob);
  
        // Create a hidden <a> tag to trigger download
        const a = document.createElement("a");
        a.href = url;
        a.download = fileName || "download.txt"; // default filename
        document.body.appendChild(a);
        a.click();
  
        // Cleanup
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        setDownloading(false);
      } catch (error) {
        console.log("error", error);
        setDownloading(false);
        toast({
          title: "Error",
          description: "Failed to download file",
          variant: "destructive",
        });
      }
    }
  
  console.log("gcpMetaDataList from doc viewer", gcpMetaDataList);

  return (
    <div className="h-auto bg-background">
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm flex items-center justify-between ml-4">
        <div className="w-96 relative h-auto p-2  flex flex-col gap-2 mt-4">
          <Button
                variant="outline"
                size="sm"
                onClick={() => navigate(`/dashboard`)}
                className="border-border/50"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
          {/* Search icon inside input */}
          <Search className="absolute left-6 top-[65%]  h-4 w-4 text-muted-foreground" />

          <Input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            className="pl-9 pr-4 py-2 w-full rounded-xl border border-border bg-background/50 
                   focus:ring-2 focus:ring-primary focus:border-primary
                   text-sm placeholder:text-muted-foreground transition-all"
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <XCircle className="h-4 w-4" />
            </button>
          )}
        </div>
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Brain className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-foreground uppercase">
                    {gameId}
                  </h1>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>
      <div className="flex h-auto">
      {/* <div className="flex h-[calc(100vh-80px)]"> */}
        {/* Sidebar */}
        <div className="w-96 max-h-[77vh] border-r border-border/50 bg-card/30 backdrop-blur-sm flex flex-col h-full overflow-y-auto scrollbar-thin scrollbar-thumb-rounded scrollbar-thumb-border/30">
          <Collapsible open={isOpenKnowledgeCollapsible} onOpenChange={setIsOpenKnowledgeCollapsible}>
            {/* Header */}
            <div className="p-4 border-b border-border/50 flex items-center justify-between">
              <CollapsibleTrigger asChild>
                <button className="group flex items-center text-sm font-semibold text-foreground hover:text-primary transition-colors">
                  <ChevronDown className="h-4 w-4 mr-2 transition-transform duration-200 group-data-[state=open]:rotate-0 group-data-[state=closed]:-rotate-90" />
                  <FileText className="h-4 w-4 mr-2 text-[#0C4160]" />
                  Knowledge Files
                </button>
              </CollapsibleTrigger>

              <Button
                size="sm"
                variant="outline"
                className="flex justify-center items-center"
                onClick={() => knowledgeBaseRef.current?.click()}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add File
              </Button>
            </div>

            {/* Hidden file input */}
            <input
              id="file-upload"
              ref={knowledgeBaseRef}
              type="file"
              className="hidden"
              multiple
              accept=".txt,.md"
              onChange={(e) => handleFileUpload(e, "knowledge-base")}
            />

            {/* Content */}
            <CollapsibleContent>
              <ul className="flex-1 p-3 space-y-2 bg-[#0C4160]/10">
                {filteredFiles
                  ?.filter((file) =>
                    file.filePath?.split("/")?.at(1)?.includes("knowledge-base")
                  )
                  ?.sort((a, b) => a.fileName.localeCompare(b.fileName))
                  ?.map((file) => (
                    <Card
                      key={file.fileId}
                      className="relative cursor-pointer border border-border/20 bg-card/40 backdrop-blur-md 
               hover:bg-card/70 transition-all duration-300 
               hover:shadow-md hover:shadow-primary/20 w-[22rem] group rounded-xl overflow-hidden"
                      onClick={() => {
                        setFileName(file.filePath);
                        setIsEditing(false);
                      }}
                    >
                      <CardTitle
                        className={`flex items-center justify-between h-12 px-4 text-sm group-hover:text-primary transition-colors ${
                          fileName === file.filePath ? "text-primary" : ""
                        }`}
                        onClick={() =>
                          setIsCorrupted(file?.isCorrupted || false)
                        }
                      >
                        <div>
                          <span className="flex items-center">
                            <FileText className="h-4 w-4 mr-2 text-muted-foreground" />
                            {editingFileId === file.fileId ? (
                              <input
                                autoFocus
                                className="border px-2 py-1 rounded text-sm bg-background"
                                value={tempName}
                                onChange={(e) => setTempName(e.target.value)}
                                onClick={(e) => e.stopPropagation()}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") {
                                    const newPath = file.filePath.replace(
                                      file.fileName,
                                      tempName
                                    );
                                    renameFile(
                                      {
                                        old_path: file.filePath,
                                        new_path: newPath,
                                      },
                                      {
                                        onSuccess: () => setEditingFileId(null),
                                      }
                                    );
                                  }
                                  if (e.key === "Escape") {
                                    setEditingFileId(null);
                                  }
                                }}
                              />
                            ) : (
                              file.fileName
                            )}
                          </span>
                          {file?.isCorrupted && (
                            <span className="text-xs text-red-500 font-bold">
                              ⚠ Corrupted
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          {!file?.isCorrupted && (
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDownloadSidebar(file);
                              }}
                            >
                              {downloading ? <Spinner/> :<DownloadIcon className="h-3 w-3 text-muted-foreground" />}
                            </Button>
                          )} 
                          {!file?.isCorrupted && (
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingFileId(file.fileId);
                                setTempName(file.fileName); // preload current name
                              }}
                            >
                              <Pencil className="h-3 w-3 text-muted-foreground" />
                            </Button>
                          )}
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (file.isCorrupted) {
                                deleteFile(
                                  file.filePath.split("/").slice(1).join("/")
                                );
                              } else {
                                handleCreateDelQueue(file);
                              }
                            }}
                          >
                            <Trash2 className="h-3 w-3 text-destructive" />
                          </Button>
                        </div>
                      </CardTitle>
                    </Card>
                  ))}
              </ul>
            </CollapsibleContent>
          </Collapsible>
          <Collapsible open={isOpenPromptsCollapsible} onOpenChange={setIsOpenPromptsCollapsible}>
            {/* Header */}
            <div className="p-4 border-b border-border/50 flex items-center justify-between">
              <CollapsibleTrigger asChild>
                <button className="group flex items-center text-sm font-semibold text-foreground hover:text-primary transition-colors">
                  <ChevronDown className="h-4 w-4 mr-2 transition-transform duration-200 group-data-[state=open]:rotate-0 group-data-[state=closed]:-rotate-90" />
                  <FileText className="h-4 w-4 mr-2 text-[#613659]" />
                  Prompts Files
                </button>
              </CollapsibleTrigger>
              <Button
                size="sm"
                variant="outline"
                className="flex justify-center items-center"
                onClick={() => promptRefs.current?.click()}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add File
              </Button>
            </div>

            <input
              type="file"
              ref={promptRefs}
              className="hidden"
              multiple
              accept=".txt,.md"
              onChange={(e) => handleFileUpload(e, "prompts")}
            />

            {/* Content */}
            <CollapsibleContent>
              <ul className="flex-1 p-3 space-y-2 bg-[#613659]/10">
                {filteredFiles
                  ?.filter((file) =>
                    file.filePath.split("/").at(1)?.includes("prompts")
                  )
                  ?.sort((a, b) => a.fileName.localeCompare(b.fileName))
                  ?.map((file) => (
                    <Card
                      key={file.fileId}
                      className="relative cursor-pointer border border-border/20 bg-card/40 backdrop-blur-md 
               hover:bg-card/70 transition-all duration-300 
               hover:shadow-md hover:shadow-primary/20 w-[22rem] group rounded-xl overflow-hidden"
                      onClick={() => {
                        setFileName(file.filePath);
                        setIsEditing(false);
                      }}
                    >
                      <CardTitle
                        className={`flex items-center justify-between h-12 px-4 text-sm group-hover:text-primary transition-colors ${
                          fileName === file.filePath ? "text-primary" : ""
                        }`}
                        onClick={() =>
                          setIsCorrupted(file?.isCorrupted || false)
                        }
                      >
                        <div>
                          <span className="flex items-center">
                            <FileText className="h-4 w-4 mr-2 text-muted-foreground" />
                            {editingFileId === file.fileId ? (
                              <input
                                autoFocus
                                className="border px-2 py-1 rounded text-sm bg-background overflow-hidden whitespace-nowrap text-ellipsis"
                                value={tempName}
                                onChange={(e) => setTempName(e.target.value)}
                                onClick={(e) => e.stopPropagation()}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") {
                                    const newPath = file.filePath.replace(
                                      file.fileName,
                                      tempName
                                    );
                                    renameFile(
                                      {
                                        old_path: file.filePath,
                                        new_path: newPath,
                                      },
                                      {
                                        onSuccess: () => setEditingFileId(null),
                                      }
                                    );
                                  }
                                  if (e.key === "Escape") {
                                    setEditingFileId(null);
                                  }
                                }}
                              />
                            ) : (
                              file.fileName
                            )}
                          </span>
                          {file?.isCorrupted && (
                            <span className="text-xs text-red-500 font-bold">
                              ⚠ Corrupted
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          {!file?.isCorrupted && (
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDownloadSidebar(file);
                              }}
                            >
                              {/* <DownloadIcon className="h-3 w-3 text-muted-foreground" /> */}
                              {downloading ? <Spinner/> :<DownloadIcon className="h-3 w-3 text-muted-foreground" />}
                            </Button>
                          )} 
                          {!file?.isCorrupted && (
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingFileId(file.fileId);
                                setTempName(file.fileName); // preload current name
                              }}
                            >
                              <Pencil className="h-3 w-3 text-muted-foreground" />
                            </Button>
                          )}
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (file.isCorrupted) {
                                deleteFile(
                                  file.filePath.split("/").slice(1).join("/")
                                );
                              } else {
                                handleCreateDelQueue(file);
                              }
                            }}
                          >
                            <Trash2 className="h-3 w-3 text-destructive" />
                          </Button>
                        </div>
                      </CardTitle>
                    </Card>
                  ))}
              </ul>
            </CollapsibleContent>
          </Collapsible>
        </div>

        {/* Main Content Area */}
        <div className="flex flex-1 flex-col p-4">
          {!fileName && <p>Select a file to see details</p>}
          {fileName && (
            <div className="flex items-center justify-center gap-4">
              <p className="text-2xl font-semibold">
                {fileName?.split("/").at(-1)}
              </p>
              {copyTitle ? (
                <CheckCheck className="ml-2 w-4 h-4 text-green-500" />
              ) : (
                <Copy
                  className="ml-2 w-4 h-4 cursor-pointer hover:text-primary"
                  onClick={handleCopy}
                />
              )}
              {!isEditing && !isCorrupted && (
                <Button
                  variant="outline"
                  onClick={() => setIsEditing((prev) => !prev)}
                >
                  Edit File
                </Button>
              )}
            </div>
          )}
          {!isEditing && fileName && (
            <div className="max-h-[65vh] w-[47vw] space-y-4 pt-4 overflow-y-auto overflow-x-auto pr-3">
              <div className="p-4 rounded-lg markdown-body">
                {(() => {
                  const content = fileContent?.content ?? "";

                  // 🔍 Try detecting JSON
                  let hasJson = false;
                  try {
                    // match JSON-like structure
                    const match = content.match(/{[\s\S]*}/);
                    if (match) {
                      JSON.parse(match[0]); // attempt parsing first {...} block
                      hasJson = true;
                    }
                  } catch {
                    hasJson = false;
                  }

                  if (hasJson) {
                    // If JSON detected, show raw (no markdown)
                    return (
                      <pre className="whitespace-pre-wrap break-words text-sm font-mono bg-muted/30 p-3 rounded-lg">
                        {content}
                      </pre>
                    );
                  }

                  // Otherwise render markdown normally
                  return (
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        code({ inline, className, children, ...props }) {
                          const match = /language-(\w+)/.exec(className || "");
                          return !inline && match ? (
                            <SyntaxHighlighter
                              style={vscDarkPlus}
                              language={match[1]}
                              PreTag="div"
                              {...props}
                            >
                              {String(children).replace(/\n$/, "")}
                            </SyntaxHighlighter>
                          ) : (
                            <code className={className} {...props}>
                              {children}
                            </code>
                          );
                        },
                      }}
                    >
                      {content}
                    </ReactMarkdown>
                  );
                })()}
              </div>
            </div>
          )}
          {isEditing && (
            <div className="space-y-4 flex-1 pt-4">
              <Label>Edit Content</Label>
              <Textarea
                className="min-h-[65vh] max-h-[65vh]"
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setIsEditing((prev) => !prev)}
                >
                  Cancel
                </Button>
                <Button onClick={handleSave}>
                  {isPending ? <Spinner /> : "Save"}
                </Button>
              </div>
            </div>
          )}
          <div className="flex w-full justify-end items-center gap-4">
            {!isEditing && fileName && (
              <div className="flex mt-4 items-center justify-end">
                <Button size="sm" variant="ghost" onClick={handleDownload}>
                  {copying ? (
                    <Spinner />
                  ) : (
                    <>
                      <Download className="w-4 h-4" />
                      Download
                    </>
                  )}
                </Button>
              </div>
            )}
            {!isEditing && fileName && (
              <div className="flex mt-4 items-center justify-end">
                <Button size="sm" variant="ghost" onClick={handleCopyContent}>
                  {copying ? (
                    <Spinner />
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      Copy
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocViewer;