// import { useGetAllFiles } from "@/hooks/use-gcp";
// import { generalFunctions } from "@/lib/generalFunctions";
// import { createContext, Dispatch, SetStateAction, useContext, useEffect, useState } from "react";
// import { useLocation, useParams } from "react-router-dom";

// type AppContextType = {
//   gcpFiles: string[];
//   // setGcpFiles: Dispatch<SetStateAction<string[]>>;
//   // handleFilesFromGcp: (gameId?: string) => Promise<void>;
// };


// const AppContext = createContext<AppContextType | undefined>(undefined);

// const AppContextProvider = ({ children }: { children: React.ReactNode }) => {
//     const location = useLocation();
//     const pathParts = location.pathname.split("/");
//     let gameId: string | undefined;
//     if (pathParts[1] === "game" || pathParts[1] === "workspace") {
//     gameId = pathParts[2];
//   }
//   const { data: gcpFiles } = useGetAllFiles(gameId || "");
//     console.log("gameId from appContext", gameId);

//       console.log("gcpfiles from be", gcpFiles);

//     return (
//         <AppContext.Provider value={{ gcpFiles }}> 
//             {children}
//         </AppContext.Provider>
//     );
// };

// export const useAppContext = () => {
//     const context = useContext(AppContext);
//     if (!context) {
//         throw new Error("useAppContext must be used within a AppContextProvider");
//     }
//     return context;
// };

// export default AppContextProvider;