import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import FileContentDialog from "@/components/workspace/FileContentDialog";
import { RightPanel } from "@/components/workspace/RightPanel";
// import { useAppContext } from "@/context/AppContext";
import {
  useBulkUpdateCharacters,
  useCharacters,
  useDeleteCharacter,
} from "@/hooks/useCharacter";
import { generalFunctions } from "@/lib/generalFunctions";
import { ArrowLeft, FileText, Plus, Trash2, User2 } from "lucide-react";
import { useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AgentCards } from "./AgentCards";
import { useMetaList, useUploadFile } from "@/hooks/use-gcp";
import CleanDocumentCard from "@/components/DocumentCard";
import GameCardSkeleton from "@/components/GameCardSkeleton";

export default function StoryDashboard() {
  const { gameId } = useParams();
  const navigate = useNavigate();
  const [files, setFiles] = useState<File[]>([]);
  // const { gcpFiles } = useAppContext();
  const [selectedDoc, setSelectedDoc] = useState("");
  const [showDialog, setShowDialog] = useState(false);
  // const { data: gameCharacters, isLoading, error } = useCharacters(gameId);
  // const { mutate: deleteCharacter } = useDeleteCharacter(gameId || "");
  // const { mutate: bulkUpload } = useBulkUpdateCharacters(gameId || "");
  const { data: gcpMetaDataList, isLoading } = useMetaList(gameId || "");
  const fileInpRef = useRef<HTMLInputElement>(null);
  const knowledgeBaseRef = useRef<HTMLInputElement>(null);
  const promptRefs = useRef<HTMLInputElement>(null);
  const { mutate: uploadFiles } = useUploadFile(gameId! || "");

  console.log("gcpMetaDataList", gcpMetaDataList);

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
        onError: () => {
          console.log("error while uploading files");
        },
      }
    );
  }

  // function handleCharCardClicked(characterId: string) {
  //   navigate(`/game/${gameId}/agent/${characterId}`);
  // }

  // function handleAddCharacter() {
  //   navigate(`/game/${gameId}/agent/newCharacter`);
  // }

  // function handleAddAgent() {
  //   navigate(`/workspace/${gameId}/newAgent`);
  // }

  // function handleDeleteCharacter(characterId: string) {
  //   deleteCharacter(characterId);
  // }

  // async function handleFileUpload(event: React.ChangeEvent<HTMLInputElement>) {
  //   const file = event.target.files?.[0];
  //   if (!file) return;
  //   try {
  //     const text = await file.text();
  //     const data = JSON.parse(text);
  //     if (!Array.isArray(data)) {
  //       throw new Error("Invalid file format");
  //     }
  //     bulkUpload(data);
  //   } catch (error) {
  //     console.log("error while uploading file", error);
  //   }
  // }

  // console.log("selectedDoc from story dashboard", selectedDoc);

  return (
    <div className="p-6">
      <div className="w-[50%] flex items-center justify-between">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate(`/dashboard`)}
          className="border-border/50"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>
      </div>
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold mb-6 mt-8">
          Game Docs:{" "}
          <span className="uppercase font-bold text-2xl">{gameId}</span>
        </h2>
        {/* <h2 className="text-2xl font-semibold mb-6 mt-8">
          Characters & Agents
        </h2> */}
        {/* <div className="w-[40%]">
        <Drawer>
          <DrawerTrigger asChild>
            <Button variant="outline" size="lg">
              Start Debugger
            </Button>
          </DrawerTrigger>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>Debugger</DrawerTitle>
              <DrawerDescription>
                Inspect prompts, docs, and outputs in detail
              </DrawerDescription>
            </DrawerHeader>
            <div className="p-4 space-y-4 w-full border h-[calc(100vh - 200px)] overflow-y-auto">
              <RightPanel />
            </div>
            <DrawerFooter>
              <DrawerClose asChild>
                <Button variant="secondary">Close</Button>
              </DrawerClose>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      </div> */}
      </div>
      {/* Agents Grid */}
      {/* <div className="mb-8">
        <h3 className="text-xl font-medium mb-4 text-primary">Agents</h3>
        <AgentCards gameId={gameId} />
        <Button
          variant="outline"
          size="sm"
          className="mt-4"
          onClick={handleAddAgent}
        >
          Add Agent
        </Button>
      </div> */}

      {/* Characters Grid */}
      {/* <div>
        <h3 className="text-xl font-medium mb-4 text-primary">Characters</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {gameCharacters?.map((char) => (
            <Card
              key={char.characterId}
              className="cursor-pointer border-border/50 bg-card/50 backdrop-blur-sm 
                         hover:bg-card/80 transition-all duration-300 
                         hover:shadow-lg hover:shadow-primary/10 group relative"
              onClick={() => handleCharCardClicked(char.characterId)}
            >
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center justify-between text-lg group-hover:text-primary transition-colors">
                  {char.characterName}
                  <div
                    className={`p-3 rounded-lg bg-gradient-to-br group-hover:scale-110 transition-transform`}
                  >
                    <User2 className="h-4 w-4 text-white" />
                  </div>
                </CardTitle>
                <CardDescription className="text-sm">
                  {char.characterDescription}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span className="text-xs bg-muted/50 px-2 py-1 rounded-md">
                    {char.formattedUpdatedAt}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <div className="flex items-center space-x-2 absolute bottom-6 right-4 w-full">
                    <Button
                      variant="outline"
                      className="hidden group-hover:block absolute right-0"
                      onClick={(e)=>{
                        e.stopPropagation();
                        handleDeleteCharacter(char.characterId);
                      }}
                    >
                      <Trash2 className="h-4 w-4 text-red-500 " />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        <Button
          variant="outline"
          size="sm"
          className="mt-4"
          onClick={handleAddCharacter}
        >
          Add Character
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="mt-4 ml-4"
          onClick={() => fileInpRef.current?.click()}
          
        >
          Bulk Upload Characters
        </Button>
        <input type="file" className="hidden" ref={fileInpRef} onChange={handleFileUpload}/>
      </div> */}
      <div className="mt-8">
        {/* <h3 className="text-xl font-medium mb-4 text-primary">Game Docs</h3> */}
        {/* <div className="grid grid-cols-3 gap-4">
          {generalFunctions
            .sanitizeGcpFileName(gcpFiles || [])
            ?.map(
              (file: { fullpath: string; shortName: string }, i: number) => (
                <Card
                  key={i}
                  className="cursor-pointer border-border/50 bg-card/50 backdrop-blur-sm 
                         hover:bg-card/80 transition-all duration-300 
                         hover:shadow-lg hover:shadow-primary/10 group"
                  onClick={() => {
                    setSelectedDoc(file.fullpath);
                    toggleModal();
                  }}
                >
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center justify-between text-lg group-hover:text-primary transition-colors">
                      {file.shortName}
                      <FileText className="h-4 w-4 text-muted-foreground" />
                    </CardTitle>
                  </CardHeader>
                </Card>
              )
            )}
        </div> */}
        <div className="space-y-8">
          {/* Knowledge Base Section */}
          <div className="bg-[#0C4160] p-6 rounded-md h-auto">
            <h2 className="text-xl font-semibold mb-4">Knowledge Base</h2>
            <div className="border-t pt-4 mb-4" />
            <div className="grid grid-cols-3 gap-4">
              {isLoading
                ? Array.from({ length: 3 }).map((_, i) => (
                    <GameCardSkeleton key={i} />
                  ))
                : gcpMetaDataList?.map(
                    (fileObj) =>
                      fileObj.filePath.includes("knowledge-base") && (
                        <CleanDocumentCard fileData={fileObj} />
                      )
                  )}
            </div>
            <Button
              size="sm"
              variant="outline"
              className="mt-4 flex justify-center items-center"
              onClick={() => knowledgeBaseRef.current?.click()}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add File
            </Button>
            <input
              id="file-upload"
              ref={knowledgeBaseRef}
              type="file"
              className="hidden"
              multiple
              accept=".txt,.md"
              onChange={(e) => handleFileUpload(e, "knowledge-base")}
            />
          </div>

          {/* Prompts Section */}
          <div className="bg-[#613659] p-6 rounded-md h-auto">
            <h2 className="text-xl font-semibold mb-4">Prompts</h2>
            <div className="border-t pt-4 mb-4" />
            <div className="grid grid-cols-3 gap-4">
              {isLoading
                ? Array.from({ length: 3 }).map((_, i) => (
                    <GameCardSkeleton key={i} />
                  ))
                : gcpMetaDataList?.map(
                    (fileObj) =>
                      fileObj.filePath.includes("prompts") && (
                        <CleanDocumentCard fileData={fileObj} />
                      )
                  )}
            </div>
          <Button
            size="sm"
            variant="outline"
            className="mt-4 flex justify-center items-center"
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
        </div>
      </div>
    </div>
  );
}
