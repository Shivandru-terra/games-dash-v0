import GameCardSkeleton from "@/components/GameCardSkeleton";
import Spinner from "@/components/Spinner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTrigger
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCreateGame, useGetAllGames } from "@/hooks/use-game";
import { useToast } from "@/hooks/use-toast";
import {
  Plus
} from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const [open, setOpen] = useState(false);
  const [newGameName, setNewGameName] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();
  const { data: games, isFetching } = useGetAllGames();
  const { mutate: createGame, isPending } = useCreateGame();

  console.log("games data", games);

  function handleCreateGame() {
    createGame(newGameName, {
      onSuccess: () => {
        setOpen(false);
        setNewGameName("");
        toast({
          title: "Game created",
          description: "You've successfully created a new game.",
        });
      },
      onError: () => {
        toast({
          title: "Error",
          description: "An error occurred while creating the game.",
          variant: "destructive",
        });
      },
    });
  }

  return (
    <div className="w-full h-full">
    {/* <div className="min-h-screen bg-background"> */}
      {/* Main Content */}
      <main>
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-3xl font-bold text-foreground">Your Games</h2>
              <p className="text-muted-foreground">
                Select a game to manage its AI agents and orchestration
              </p>
            </div>
            
          </div>
        </div>

        {/* Games Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isFetching
            ? Array.from({ length: 3 }).map((_, i) => (
                <GameCardSkeleton key={i} />
              ))
            : games?.map((game, i) => {
                return (
                  <Card
                    key={i}
                    className="cursor-pointer border border-[#e2e2e2]/15 bg-card/50 backdrop-blur-sm hover:bg-card/80 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 w-72 group"
                    onClick={() => navigate(`/game/${game}/canvas`)}
                  >
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center justify-center text-lg group-hover:text-primary transition-colors">
                        {game}
                      </CardTitle>
                    </CardHeader>
                  </Card>
                );
              })}
        </div>
        <div className="text-center py-12">
          <div className="mt-3">
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button className="bg-primary hover:bg-primary-glow">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Game
                </Button>
              </DialogTrigger>
              <DialogContent className="border-border/50 bg-card">
                <DialogHeader></DialogHeader>
                <div className="space-y-4 pt-4 flex flex-col">
                  <div className="space-y-2">
                    <Label htmlFor="name">Game Name</Label>
                    <Input
                      id="name"
                      className="bg-muted/50 border-border/50"
                      placeholder="Enter game name"
                      onChange={(e) => setNewGameName(e.target.value)}
                    />
                  </div>
                  <Button onClick={handleCreateGame}>
                    {isPending ? <Spinner /> : "Create"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
