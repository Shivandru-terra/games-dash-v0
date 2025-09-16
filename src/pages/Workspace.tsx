import { Button } from "@/components/ui/button";
import { CenterPanel } from "@/components/workspace/CenterPanel";
import FileContentDialog from "@/components/workspace/FileContentDialog";
import { LeftPanel } from "@/components/workspace/LeftPanel";
import { RightPanel } from "@/components/workspace/RightPanel";
// import { useAppContext } from "@/context/AppContext";
import { useGetAgent } from "@/hooks/use-agent";
import { useToast } from "@/hooks/use-toast";
import { generalFunctions } from "@/lib/generalFunctions";
import {
  ArrowLeft,
  Brain
} from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";

const Workspace = () => {
  const { gameId, agentId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [knowledgeBaseFiles, setKnowledgeBaseFiles] = useState<string[]>([]);
  const [promptFiles, setPromptFiles] = useState<string[]>([]);
  const [showFileContentModal, setShowFileContentModal] = useState(false);
  // const { gcpFiles } = useAppContext();
  const [fileName, setFileName] = useState("");
  const { data:selectedAgent } = useGetAgent(agentId || "");
  const [ mode, setMode ] = useState<"create" | "edit">(()=>{
    return agentId ? "edit" : "create";
  });
  

  console.log("agentId from workspace", agentId);

  useEffect(() => {
  if (selectedAgent) {
    setKnowledgeBaseFiles(selectedAgent.agentKnowledgeBase || []);
    setPromptFiles(selectedAgent.agentPrompts || []);
  }
}, [selectedAgent]);
  const handleFileDrop = (filePath: string, target: "knowledge" | "prompts") => {
  if (target === "knowledge") {
    setKnowledgeBaseFiles((prev) =>
      prev.includes(filePath) ? prev : [...prev, filePath]
    );
  } else {
    setPromptFiles((prev) =>
      prev.includes(filePath) ? prev : [...prev, filePath]
    );
  }
};

  console.log("agentId from workspace", agentId)
  console.log("selectedAgent from workspace", selectedAgent);

// async function handleUpdateAgent(){
//   try {
//     const url = generalFunctions.createUrl(`update/${agentId}`)
//     const res = await fetch(url, {
//       method: "PUT",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify({
//         agentKnowledgeBase: knowledgeBaseFiles,
//         agentPrompts: promptFiles
//       }),
//     })
//     console.log("res for updating agents", res);
//   } catch (error) {
//     console.log("error", error);
//   }
// }

// useEffect(()=>{
//   if(selectedAgent?.agentId){
//     handleUpdateAgent();
//   }
// },[knowledgeBaseFiles, promptFiles])
  

  // console.log("gcpFiles from workspace", gcpFiles);

  function toggleModal() {
    setShowFileContentModal((prev) => !prev);
  }

  // if (!gcpFiles) {
  //   return (
  //     <div className="min-h-screen bg-background flex items-center justify-center">
  //       <div className="text-center">
  //         <Brain className="h-12 w-12 text-primary mx-auto mb-4" />
  //         <p className="text-muted-foreground">No Docs...</p>
  //       </div>
  //     </div>
  //   );
  // }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate(`/game/${gameId}/canvas`)}
                className="border-border/50"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Brain className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-foreground uppercase">{selectedAgent?.gameName}</h1>
                  {/* <h1 className="text-xl font-bold text-foreground uppercase">{selectedAgent?.gameName}</h1> */}
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Three Panel Layout */}
      <div className="flex h-[calc(100vh-80px)]">
        {/* Left Panel */}
        <LeftPanel toggleModal={toggleModal} setFileName={setFileName} />

        {/* Center Panel */}
        <CenterPanel
        selectedAgent={selectedAgent} 
        knowledgeBaseFiles={knowledgeBaseFiles}
        promptFiles={promptFiles}
        onFileDrop={handleFileDrop}
        setKnowledgeBaseFiles={setKnowledgeBaseFiles}
        setPromptFiles={setPromptFiles}
        mode={mode}
        />

        {/* Right Panel */}
        <div className="w-[40%]">
        <RightPanel />
        </div>
        <FileContentDialog
          isOpen={showFileContentModal}
          onClose={toggleModal}
          fileName={fileName}
        />
      </div>
    </div>
  );
};

export default Workspace;
