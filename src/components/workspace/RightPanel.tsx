import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  Activity,
  Clock,
  MessageSquare,
  Pause,
  Play,
  Square,
  TestTube,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ScrollArea } from "../ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";

interface Message {
  id: string;
  role: "user" | "ai";
  content: string;
  timestamp: Date;
}
interface GameLogEntry {
  id: string;
  timestamp: string;
  userQuery: string;
  relevantDocs: string[];
  promptsUsed: string[];
  output: string;
}

type SimulationStatus = "stopped" | "running" | "paused";

type PacketLogEntry = {
  id: string;
  timestamp: string;
  userQuery: string;
  relevantDocs: string[];
  promptsUsed: string[];
  output: string;
};

const mockPackets = [
  {
    userQuery: "Who won the mafia round?",
    relevantDocs: ["doc1.txt", "game_rules.md"],
    promptsUsed: ["Summarize outcome", "Format as narration"],
    output: "The mafia successfully eliminated the villager last night.",
  },
  {
    userQuery: "What should the doctor do?",
    relevantDocs: ["strategy_guide.txt"],
    promptsUsed: ["Suggest next move"],
    output: "The doctor should protect the villager suspected by the mafia.",
  },
];

export const RightPanel = () => {
  const { gameId } = useParams();
  const { toast } = useToast();
  const [simulationStatus, setSimulationStatus] =
    useState<SimulationStatus>("stopped");
  const [gameLog, setGameLog] = useState<GameLogEntry[]>([]);
  const [packetLog, setPacketLog] = useState<PacketLogEntry[]>([]);
  const simulationSpeed = 1000;

  const addLogEntry = (
    userQuery: string,
    relevantDocs: string[],
    promptsUsed: string[],
    output: string
  ) => {
    const newEntry: GameLogEntry = {
      id: Date.now().toString(),
      timestamp: new Date().toLocaleTimeString(),
      userQuery,
      relevantDocs,
      promptsUsed,
      output,
    };

    setGameLog((prev) => [...prev, newEntry]);
  };

  const startSimulation = () => {
    setSimulationStatus("running");
    // setGameLog([
    //   {
    //     id: Date.now().toString(),
    //     timestamp: new Date().toLocaleTimeString(),
    //     agent: "System",
    //     type: "system",
    //     content: "🎮 Simulation started - Game initialization...",
    //     agentType: "system",
    //   },
    // ]);
  };
  const pauseSimulation = () => {
    setSimulationStatus("paused");
    toast({
      title: "Simulation paused",
      description: "You can now edit agents and resume.",
    });
  };

  const resumeSimulation = () => {
    setSimulationStatus("running");
    // addLogEntry("System", "system", "▶️ Simulation resumed...");
  };

  const stopSimulation = () => {
    setSimulationStatus("stopped");
    setGameLog([]);
  };

  // Simulate game interactions
  useEffect(() => {
    if (simulationStatus !== "running") return;

    const interval = setInterval(() => {
      const actions = [
        // {
        //   agent: "Narrator",
        //   type: "message" as const,
        //   content: "🌙 Night falls on the village. The mafia awakens...",
        //   agentType: "narrator",
        // },
        // {
        //   agent: "Sequencing Agent",
        //   type: "action" as const,
        //   content: "⚙️ Initiating night phase - enabling mafia actions",
        //   agentType: "sequencing",
        // },
        // {
        //   agent: "Mafia",
        //   type: "message" as const,
        //   content: "🔪 The mafia discusses their target in whispers...",
        //   agentType: "character",
        // },
        // {
        //   agent: "Memory Agent",
        //   type: "action" as const,
        //   content: "💾 Storing night phase decisions and voting patterns",
        //   agentType: "memory",
        // },
        // {
        //   agent: "Narrator",
        //   type: "message" as const,
        //   content: "☀️ Dawn breaks. The villagers gather to discuss...",
        //   agentType: "narrator",
        // },
        // {
        //   agent: "Doctor",
        //   type: "message" as const,
        //   content: "🩺 I may have information that could help us...",
        //   agentType: "character",
        // },
        // {
        //   agent: "Villager",
        //   type: "message" as const,
        //   content: "🤔 We must be careful about who we trust...",
        //   agentType: "character",
        // },
        // {
        //   agent: "Sequencing Agent",
        //   type: "action" as const,
        //   content: "⚙️ Day phase voting window now open",
        //   agentType: "sequencing",
        // },
        {
          userQuery: "Who won the mafia round?",
          relevantDocs: ["doc1.txt", "game_rules.md"],
          promptsUsed: ["Summarize outcome", "Format as narration"],
          output: "The mafia successfully eliminated the villager last night.",
        },
        {
          userQuery: "What should the doctor do?",
          relevantDocs: ["strategy_guide.txt"],
          promptsUsed: ["Suggest next move"],
          output:
            "The doctor should protect the villager suspected by the mafia.",
        },
      ];

      const randomAction = actions[Math.floor(Math.random() * actions.length)];

      addLogEntry(
        randomAction.userQuery,
        randomAction.relevantDocs,
        randomAction.promptsUsed,
        randomAction.output
      );
    }, simulationSpeed);

    return () => clearInterval(interval);
  }, [simulationStatus, simulationSpeed]);

  return (
    <div className="w-full border-l border-border/50 bg-card/30 backdrop-blur-sm flex flex-col">
      <div className="h-full bg-background flex flex-col">
        {/* Simulation Header */}
        <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center justify-between space-x-4 w-full">
              <div className="flex items-center space-x-2">
                <TestTube className="h-5 w-5 text-primary" />
                <div>
                  <h1 className="text-xl font-semibold text-foreground uppercase">
                    {gameId} Simulation
                  </h1>
                  <div className="flex items-center space-x-2">
                    <Badge
                      variant={
                        simulationStatus === "running"
                          ? "default"
                          : simulationStatus === "paused"
                          ? "secondary"
                          : "outline"
                      }
                    >
                      {simulationStatus === "running" && (
                        <Activity className="h-3 w-3 mr-1" />
                      )}
                      {simulationStatus.toUpperCase()}
                    </Badge>
                  </div>
                </div>
              </div>
              <Button
                onClick={startSimulation}
                className="bg-green-600 hover:bg-green-700"
              >
                <Play className="h-4 w-4 mr-2" />
                Run Simulation
              </Button>
            </div>

            <div className="flex items-center ml-2 space-x-2">
              {simulationStatus === "running" && (
                <Button onClick={pauseSimulation} variant="outline">
                  <Pause className="h-4 w-4 mr-2" />
                  Pause
                </Button>
              )}
              {simulationStatus === "paused" && (
                <>
                  <Button
                    onClick={resumeSimulation}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Play className="h-4 w-4 mr-2" />
                    Resume
                  </Button>
                  <Button onClick={stopSimulation} variant="destructive">
                    <Square className="h-4 w-4 mr-2" />
                    Stop
                  </Button>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Three-Panel Simulation Layout */}
        <div className="flex-1 flex overflow-hidden">
          <div className="w-full flex flex-col">
            <div className="flex-1">
              <div className="p-4 border-b border-border/50 bg-card/30">
                <div className="flex items-center space-x-2">
                  <MessageSquare className="h-4 w-4 text-primary" />
                  <h3 className="font-semibold">Live Game Log</h3>
                  <Badge variant="outline" className="text-xs">
                    {gameLog.length} events
                  </Badge>
                </div>
              </div>
              <ScrollArea className="h-[calc(100vh-220px)] p-4 overflow-y-auto">
                <div className="space-y-4">
                  {gameLog.map((entry) => (
                    <div
                      key={entry.id}
                      className="flex items-start space-x-3 group animate-fadeIn"
                    >
                      {/* Card */}
                      <div className="flex-1">
                        <div className="p-3 rounded-2xl border bg-card shadow-sm hover:shadow-md transition">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs text-muted-foreground flex items-center">
                              <Clock className="h-3 w-3 mr-1" />
                              {entry.timestamp}
                            </span>
                          </div>

                          <p className="text-sm text-foreground leading-relaxed">
                            {entry.userQuery}
                          </p>
                          {(entry.relevantDocs?.length > 0 ||
                            entry.promptsUsed?.length > 0) && (
                            <Dialog>
                              <DialogTrigger asChild>
                                <button className="text-xs text-blue-600 hover:underline cursor-pointer">
                                  Debug details
                                </button>
                              </DialogTrigger>
                              <DialogContent className="max-w-2xl max-h-[80vh]">
                                <DialogHeader>
                                  <DialogTitle>Debug Details</DialogTitle>
                                </DialogHeader>
                                <ScrollArea className="max-h-[65vh] pr-4">
                                  <div className="space-y-4 text-sm text-muted-foreground">
                                    {entry.relevantDocs?.length > 0 && (
                                      <div>
                                        <p className="font-medium mb-1">
                                          Relevant Docs:
                                        </p>
                                        <ul className="list-disc list-inside space-y-1">
                                          {entry.relevantDocs.map(
                                            (doc, idx) => (
                                              <li key={idx}>{doc}</li>
                                            )
                                          )}
                                        </ul>
                                      </div>
                                    )}
                                    {entry.promptsUsed?.length > 0 && (
                                      <div>
                                        <p className="font-medium mb-1">
                                          Prompts Used:
                                        </p>
                                        <ul className="list-decimal list-inside space-y-1">
                                          {entry.promptsUsed.map(
                                            (prompt, idx) => (
                                              <li
                                                key={idx}
                                                className="whitespace-pre-wrap"
                                              >
                                                {prompt}
                                              </li>
                                            )
                                          )}
                                        </ul>
                                      </div>
                                    )}
                                    <div>
                                      <p className="font-medium mb-1">Response: {entry.output}</p>
                                    </div>
                                  </div>
                                </ScrollArea>
                              </DialogContent>
                            </Dialog>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Empty State */}
                  {gameLog.length === 0 && (
                    <div className="text-center py-12 text-muted-foreground animate-pulse">
                      <MessageSquare className="h-10 w-10 mx-auto mb-3 opacity-40" />
                      <p className="font-medium">No simulation events yet</p>
                      <p className="text-xs">
                        Start the simulation to see agent interactions
                      </p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
