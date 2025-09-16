import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useDeleteAgent, useGetAllAgents } from "@/hooks/use-agent";
import { Bot, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function AgentCards({ gameId }: { gameId: string }) {
  const navigate = useNavigate();
  const {data: agentsData} = useGetAllAgents(gameId || "");
  const { mutate: deleteAgent } = useDeleteAgent(gameId || "");

  function handleAgentCardClick(agentId: string) {
    navigate(`/workspace/${gameId}/${agentId}`);
  }

  function handleDeleteAgent(agentId: string) {
    deleteAgent(agentId);
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {agentsData
        ?.filter((agent) => agent.gameName === gameId)
        .map((agent) => {
          return (
            <Card
              key={agent.agentId}
              className="cursor-pointer border-border/50 bg-card/50 backdrop-blur-sm 
                       hover:bg-card/80 transition-all duration-300 hover:shadow-lg 
                       hover:shadow-primary/10 group relative"
              onClick={() => handleAgentCardClick(agent.agentId)}
            >
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center justify-between text-lg group-hover:text-primary transition-colors uppercase">
                  {agent?.label}
                  <div
                    className={`p-3 rounded-lg bg-gradient-to-br from-primary to-primary/70 
                              group-hover:scale-110 transition-transform`}
                  >
                    <Bot className="h-4 w-4 text-white" />
                  </div>
                </CardTitle>
                <CardDescription className="text-sm">
                  {agent?.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <div className="flex items-center space-x-2 absolute bottom-6 right-4 w-full">
                    <Button
                      variant="outline"
                      className="hidden group-hover:block absolute right-0"
                      onClick={(e)=> {
                        e.stopPropagation();
                        handleDeleteAgent(agent.agentId)
                      }}
                    >
                      <Trash2 className="h-4 w-4 text-red-500 " />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
    </div>
  );
}
