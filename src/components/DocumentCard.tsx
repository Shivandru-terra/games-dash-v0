import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  CheckCheck,
  Clock,
  Copy,
  Edit3,
  History,
  Trash2,
  User,
} from "lucide-react";
import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import FileContentDialog from "./workspace/FileContentDialog";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Label } from "@radix-ui/react-label";
import { useLogs } from "@/hooks/use-logs";
import { Download } from "lucide-react";
import { useGetFile } from "@/hooks/use-gcp";
import { useParams } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { gcpServices } from "@/lib/services/GcpServices";
import { FileResponse } from "@/lib/types/GcpTypes";
import { useToast } from "@/hooks/use-toast";
import Spinner from "./Spinner";
import remarkGfm from "remark-gfm";
import { Skeleton } from "./ui/skeleton";
import { useCreateDelQueue } from "@/hooks/use-delQueue";
import { generalFunctions } from "@/lib/generalFunctions";
const formatTimeAgo = (dateString: string) => {
  const now = new Date();
  const date = new Date(dateString);
  const diffInHours = Math.floor(
    (now.getTime() - date.getTime()) / (1000 * 60 * 60)
  );

  if (diffInHours < 1) return "Just now";
  if (diffInHours < 24) return `${diffInHours}h ago`;
  if (diffInHours < 48) return "Yesterday";
  return `${Math.floor(diffInHours / 24)}d ago`;
};

function formatTime(isoString: string) {
  if (!isoString) return "";

  const date = new Date(isoString);

  // Options for formatting
  const options: Intl.DateTimeFormatOptions = {
    weekday: "short", // Mon, Tue, etc.
    day: "numeric", // 1, 2, 3
    month: "short", // Jan, Feb
    hour: "2-digit",
    minute: "2-digit",
    hour12: false, // 24-hour format; set true for 12-hour
  };

  return date.toLocaleString("en-US", options);
}

const CleanDocumentCard = ({ fileData }) => {
  const { gameId } = useParams();
  const [showDialog, setShowDialog] = useState(false);
  const [showLogsDialog, setShowLogsDialog] = useState(false);
  const { data: logsData, isFetching } = useLogs(fileData?.fileId, {
    enabled: showLogsDialog && !!fileData?.fileId,
  });
  const [downloading, setDownloading] = useState(false);
  const [fileName, setFileName] = useState(
    fileData.filePath?.split("/").at(-1) || ""
  );
  const queryClient = useQueryClient();
  const { toast } = useToast();
  console.log("fileData test", fileData);
  const { mutate: createDelQueue } = useCreateDelQueue();
  const [isDelModalOpen, setIsDelModalOpen] = useState(false);
  const [copyTitle, setCopyTitle] = useState(false);
  const [copying, setCopying] = useState(false);

  async function toggleModal() {
    setShowDialog((prev) => !prev);
  }

  function handleCreateDelQueue() {
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
        setIsDelModalOpen(false);
      },
      onError: () => {
        toast({
          title: "Error",
          description: "Failed to create delete queue",
        });
      },
    });
  }

  console.log("gameId from docCard", gameId);
  console.log("fileName from docCard", fileName);

  async function handleDownload() {
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

  const truncatePreview = (text: string, maxLength = 200) => {
    if (!text) return "No preview available...";
    return text.length > maxLength
      ? text.substring(0, maxLength) + "..."
      : text;
  };

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation(); // prevents parent click (toggleModal) from firing
    if (!fileData?.fileName) return;

    try {
      await navigator.clipboard.writeText(fileData.fileName);
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
      let data = queryClient.getQueryData<FileResponse>([
        "gcp-file",
        gameId,
        fileData.filePath,
      ]);

      if (!data) {
        data = await queryClient.fetchQuery<FileResponse>({
          queryKey: ["gcp-file", gameId, fileData.filePath],
          queryFn: () => gcpServices.getFile(gameId, fileData.filePath),
        });
      }

      // Copy to clipboard
      await navigator.clipboard.writeText(data.content);

      toast({
        title: "Copied",
        description: `${fileName} content copied to clipboard`,
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

  return (
    <div>
      <Card
        className="cursor-pointer border bg-card/50 backdrop-blur-sm 
             hover:bg-card/80 transition-all duration-300 
             hover:shadow-lg hover:shadow-primary/10 group flex flex-col h-full rounded-lg overflow-hidden"
      >
        {/* File Title */}
        <CardTitle
          className="text-base font-medium group-hover:text-primary transition-colors truncate px-4 pt-4 flex items-center justify-start gap-4"
          onClick={toggleModal}
        >
          {fileData?.fileName}
          {copyTitle ? (
            <CheckCheck className="ml-2 w-4 h-4 text-green-500" />
          ) : (
            <Copy
              className="ml-2 w-4 h-4 cursor-pointer hover:text-primary"
              onClick={handleCopy}
            />
          )}
        </CardTitle>

        {/* Preview Area */}
        <div className="px-4 mt-2" onClick={toggleModal}>
          <div className="h-24 bg-muted/10 border border-border/70 rounded-md p-2 overflow-hidden relative">
            <div className="text-sm text-muted-foreground font-mono leading-relaxed line-clamp-5">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {truncatePreview(fileData?.raw_preview ?? "")}
              </ReactMarkdown>
              {/* {truncatePreview(fileData?.raw_preview)} */}
            </div>
            {/* <div className="absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-card to-transparent pointer-events-none" /> */}
          </div>
        </div>

        {/* Spacer to push actions to bottom */}
        <div className="flex-1" />
        {/* Actions & Meta */}
        <CardContent className="pt-4 px-4 pb-4">
          <div className="flex justify-between items-center gap-2">
            <div className="w-1/3 flex items-center gap-2">
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDownload();
                }}
                size="default"
                className="font-medium"
              >
                {downloading ? (
                  <Spinner />
                ) : (
                  <>
                    <Download className="w-4 h-4 mr-2" />
                    Download{" "}
                  </>
                )}
              </Button>
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
            <div className="flex items-center gap-3">
              <div className="mt-3 absolute bottom-11 right-16 opacity-0 group-hover:opacity-100 transition-opacity">
                <Dialog open={isDelModalOpen} onOpenChange={setIsDelModalOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm" variant="outline" className="font-medium">
                      <Trash2 className="w-3 h-3 text-red-500" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="border-border/50 bg-card rounded-2xl shadow-xl">
                    <div className="flex flex-col items-center text-center space-y-4">
                      {/* Icon */}
                      <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-100">
                        <Trash2 className="w-6 h-6 text-red-600" />
                      </div>

                      {/* Title + description */}
                      <h2 className="text-lg font-semibold">Delete file?</h2>
                      <p className="text-sm text-muted-foreground">
                        Are you sure you want to delete{" "}
                        <span className="font-medium text-foreground">
                          {fileData?.fileName}{" "}
                        </span>
                        ? This action cannot be undone.
                      </p>

                      {/* Actions */}
                      <div className="flex w-full justify-end gap-3 pt-2">
                        <DialogClose asChild>
                          <Button variant="ghost" size="sm">
                            Cancel
                          </Button>
                        </DialogClose>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={handleCreateDelQueue}
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
              <div className="mt-3">
                <Dialog open={showLogsDialog} onOpenChange={setShowLogsDialog}>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => e.stopPropagation()}
                      className="border-border/50"
                    >
                      <History className="w-4 h-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="border-border/50 bg-card">
                    <DialogHeader>
                      <DialogTitle>{fileData?.fileName}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 pt-4 flex flex-col">
                      <div className="space-y-2">
                        <Label htmlFor="file-upload">Logs</Label>
                        <div className="flex flex-col w-full max-h-64 border-2 border-dashed border-border/50 rounded-lg bg-muted/30 p-2 overflow-y-auto">
                          {isFetching && <Skeleton />}
                          {logsData?.length
                            ? logsData.map((log) => (
                                <div
                                  key={log.logId}
                                  className="flex justify-between items-center gap-4 p-2 border-b border-border/30 last:border-b-0"
                                >
                                  {/* User who updated */}
                                  <div className="text-sm text-muted-foreground font-medium">
                                    {log.updatedBy}
                                  </div>

                                  {/* Formatted timestamp */}
                                  <div className="text-xs text-muted-foreground">
                                    {new Date(log.createdAt).toLocaleString(
                                      [],
                                      {
                                        day: "2-digit",
                                        month: "short",
                                        year: "numeric",
                                        hour: "2-digit",
                                        minute: "2-digit",
                                      }
                                    )}
                                  </div>
                                </div>
                              ))
                            : !isFetching && (
                                <p className="text-sm text-muted-foreground text-center py-4">
                                  No logs available.
                                </p>
                              )}
                        </div>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </div>

          {/* Metadata */}
          <div className="flex justify-between items-center gap-3 mt-3 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <User className="w-3 h-3" />
              {formatTime(fileData?.lastUpdatedAt)}
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {formatTimeAgo(fileData?.lastUpdatedAt)}
            </div>
          </div>
        </CardContent>
        {/* File Preview Dialog */}
      </Card>
      <FileContentDialog
        fileName={fileData.filePath}
        isOpen={showDialog}
        onClose={toggleModal}
      />
    </div>
  );
};

export default CleanDocumentCard;
