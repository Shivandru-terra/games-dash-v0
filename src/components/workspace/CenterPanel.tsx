import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { generalFunctions } from "@/lib/generalFunctions";
import { Settings, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "../ui/checkbox";
import { useEffect, useState } from "react";
import { AgentTypeDTO } from "@/lib/types/AgentTypes";
import { Button } from "../ui/button";
import { useParams } from "react-router-dom";
import { useCreateAgent, useUpdateAgent } from "@/hooks/use-agent";

export const CenterPanel = ({
  selectedAgent,
  knowledgeBaseFiles,
  promptFiles,
  onFileDrop,
  setPromptFiles,
  setKnowledgeBaseFiles,
  mode,
}) => {
  const { gameId } = useParams();
  const [agentState, setAgentState] = useState<AgentTypeDTO>({
    agentName: "",
    gameName: gameId || "",
    label: "",
    isActive: false,
    description: "",
    agentKnowledgeBase: [],
    agentPrompts: [],
  });
  const { toast } = useToast();
  const { mutate: createAgent } = useCreateAgent(gameId);
  const {mutate: updateAgent} = useUpdateAgent(selectedAgent?.agentId || "", gameId || "")

  useEffect(() => {
    if (mode === "edit" && selectedAgent) {
      setAgentState(selectedAgent);
    }
  }, [mode, selectedAgent]);

  useEffect(()=>{
    setAgentState((prev)=>({
      ...prev,
      agentKnowledgeBase: knowledgeBaseFiles || [],
      agentPrompts: promptFiles || []
    }))
  },[knowledgeBaseFiles, promptFiles])

  function handleCreateAgent(){
    createAgent(agentState);
  }
  function handleUpdateAgent(){
    updateAgent(agentState);
  }
  const handleRemoveFile = (index: number, type: "knowledge" | "prompts") => {
    if (type === "knowledge") {
      setKnowledgeBaseFiles((prev) => prev.filter((_, i) => i !== index));
    } else {
      setPromptFiles((prev) => prev.filter((_, i) => i !== index));
    }
  };

  console.log("agentState from central panel", agentState);

  return (
    <div className="flex flex-col py-6 overflow-auto min-w-[45%]">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center space-x-2 mb-2 ">
            <Settings className="h-5 w-5 text-primary" />
            <h2 className="text-2xl font-bold text-foreground">
              {selectedAgent?.label || "New Agent"} Docs
            </h2>
          </div>
            <Button onClick={mode === "edit" ? handleUpdateAgent : handleCreateAgent}>{mode === "edit" ? "update": "create"}</Button>
        </div>

        <Card className="w-[600px] min-h-40 h-auto border-border/50 bg-card/50 p-4 mb-6 overflow-y-auto">
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>
              Configure the character's identity and role
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Agent Name</Label>
                <Input
                  id="name"
                  value={agentState?.agentName}
                  onChange={(e) =>
                    setAgentState((prev) => ({
                      ...prev,
                      agentName: e.target.value,
                    }))
                  }
                  className="bg-muted/50 border-border/50"
                  placeholder="Name your Agent"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={agentState?.description}
                onChange={(e) =>
                  setAgentState((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                className="bg-muted/50 border-border/50"
                placeholder="Brief description of this agent's role"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="label">Label</Label>
                <Input
                  id="label"
                  value={agentState?.label}
                  onChange={(e) =>
                    setAgentState((prev) => ({
                      ...prev,
                      label: e.target.value,
                    }))
                  }
                  className="bg-muted/50 border-border/50"
                  placeholder="Label your Agent"
                />
              </div>
              <div className="space-x-2 flex items-end justify-center">
                <Checkbox
                  checked={agentState.isActive}
                  onCheckedChange={(checked) =>
                    setAgentState((prev) => ({
                      ...prev,
                      isActive: checked === true,
                    }))
                  }
                />
                <Label htmlFor="name">isActive</Label>
              </div>
            </div>
          </CardContent>
        </Card>
        {/* Knowledge DropArea */}
        <Card
          className="w-[600px] min-h-40 h-auto border-border/50 bg-card/50 p-4 mb-6 overflow-y-auto"
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            const filePath = e.dataTransfer.getData("application/filepath");
            if (filePath.startsWith("knowledge-base/")) {
              onFileDrop(filePath, "knowledge"); // ✅ only allow knowledge-base
            } else {
              alert("Only knowledge-base files allowed here");
            }
          }}
        >
          <h3 className="font-semibold mb-2">Knowledge Base</h3>
          {knowledgeBaseFiles.length === 0 ? (
            <p className="text-muted-foreground">
              Drop knowledge-base files here
            </p>
          ) : (
            <ul className="space-y-2">
              {generalFunctions
                .sanitizeGcpFileName(knowledgeBaseFiles)
                .map((file, idx) => (
                  <li
                    key={idx}
                    className="p-2 rounded bg-muted/30 border border-border/50 flex items-center justify-between"
                  >
                    {file.shortName}
                    <button
                      onClick={() => handleRemoveFile(idx, "knowledge")}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </li>
                ))}
            </ul>
          )}
        </Card>

        {/* Prompts DropArea */}
        <Card
          className="w-[600px] min-h-40 h-auto border-border/50 bg-card/50 p-4 overflow-y-auto"
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            const filePath = e.dataTransfer.getData("application/filepath");
            if (filePath.startsWith("prompts/")) {
              onFileDrop(filePath, "prompts");
            } else {
              alert("Only prompts files allowed here");
            }
          }}
        >
          <h3 className="font-semibold mb-2">Prompts</h3>
          {promptFiles.length === 0 ? (
            <p className="text-muted-foreground">Drop prompts here</p>
          ) : (
            <ul className="space-y-2">
              {generalFunctions
                .sanitizeGcpFileName(promptFiles)
                .map((file, idx) => (
                  <li
                    key={idx}
                    className="p-2 rounded bg-muted/30 border border-border/50 flex items-center justify-between"
                  >
                    {file.shortName}
                    <button
                      onClick={() => handleRemoveFile(idx, "prompts")}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </li>
                ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
};
