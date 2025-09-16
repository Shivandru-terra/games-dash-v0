// import { useAppContext } from "@/context/AppContext";
import { useToast } from "@/hooks/use-toast";
import { FileText } from "lucide-react";
import { useState } from "react";
import { useParams } from "react-router-dom";
import FileTree from "../FileTree";
import { generalFunctions } from "@/lib/generalFunctions";

interface LeftPanelProps {
  toggleModal: () => void;
  setFileName: React.Dispatch<React.SetStateAction<string>>;
}

export const LeftPanel = ({ toggleModal, setFileName }: LeftPanelProps) => {

  // const { gcpFiles } = useAppContext();
  // const tree = generalFunctions.buildTree(gcpFiles);
  // console.log("trees left panel", tree);

  return (
    <div className="w-96 border-r border-border/50 bg-card/30 backdrop-blur-sm flex flex-col h-[100%] overflow-y-auto scrollbar-none">
      {/* Knowledge Files Section */}
      <div className="border-b border-border/50">
        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-sm text-foreground flex items-center">
              <FileText className="h-4 w-4 mr-2" />
              Knowledge Files
            </h3>
          </div>

          {/* <FileTree
            tree={tree}
            onSelect={(path) => {
              setFileName(path);
              toggleModal();
            }}
            toggleModal={toggleModal}
          /> */}
        </div>
      </div>
    </div>
  );
};
