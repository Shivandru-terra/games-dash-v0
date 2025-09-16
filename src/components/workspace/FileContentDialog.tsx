import { Label } from "@radix-ui/react-label";
import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import { useParams } from "react-router-dom";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Textarea } from "../ui/textarea";
import { generalFunctions } from "@/lib/generalFunctions";
import { useGetFile, useUpdateFile } from "@/hooks/use-gcp";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import rehypeHighlight from "rehype-highlight";
import "github-markdown-css"; // adds GitHub-like styles
import "highlight.js/styles/github.css"; // code block theme
import Spinner from "../Spinner";
import { useToast } from "@/hooks/use-toast";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";

const FileContentDialog = ({ isOpen, onClose, fileName }) => {
  const [content, setContent] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const { gameId } = useParams();
  const isMarkdown =
    fileName?.endsWith(".md") || fileName?.endsWith(".markdown");
  const { data: fileContent } = useGetFile(gameId || "", fileName || "", {
    enabled: isOpen && !!gameId && !!fileName,
  });
  const { mutate: updateFile, isPending } = useUpdateFile(
    gameId || "",
    fileName || ""
  );
  const { toast } = useToast();

  console.log("fileName from edit content", fileName);

  console.log("isMarkdown", isMarkdown);

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

  function handleClose() {
    setIsEditing(false);
    onClose();
  }

  if (!fileName) return;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogTrigger asChild></DialogTrigger>
      <DialogContent className="border-border/50 bg-card max-w-4xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-8">
            {fileName?.split("/").at(-1)}{" "}
            {!isEditing && (
              <Button
                variant="outline"
                onClick={() => setIsEditing((prev) => !prev)}
              >
                Edit File
              </Button>
            )}
          </DialogTitle>
        </DialogHeader>
        {!isEditing && (
          <div className="max-h-[80vh] space-y-4 pt-4 overflow-y-auto pr-3">
            <div className="p-4 rounded-lg markdown-body">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  code({ inline, className, children, ...props }) {
                    const match = /language-(\w+)/.exec(className || "");
                    return !inline && match ? (
                      <SyntaxHighlighter
                        style={vscDarkPlus} // theme
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
                {fileContent?.content ?? ""}
              </ReactMarkdown>
            </div>
          </div>
        )}
        {isEditing && (
          <div className="space-y-4 pt-4">
            <Label>Edit Content</Label>
            <Textarea
              className="h-64"
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
            <DialogFooter className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setIsEditing((prev) => !prev)}
              >
                Cancel
              </Button>
              <Button onClick={handleSave}>
                {isPending ? <Spinner /> : "Save"}
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default FileContentDialog;
