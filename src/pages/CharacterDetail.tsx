import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useCreateCharacter, useSingleCharacter, useUpdateCharacter } from "@/hooks/useCharacter";
import { CharacterDTO } from "@/lib/types/CharacterTypes";
import { ArrowLeft, Save } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

const CharacterDetail = () => {
  const { gameId, characterId } = useParams<{
    gameId: string;
    characterId: string;
  }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [character, setCharacter] = useState<CharacterDTO>({
    characterName: "",
    gameName: gameId || "",
    characterDescription: "",
    characterTraits: {
      Charisma: 0,
      Empathy: 0,
      Wit: 0,
      Creativity: 0,
      Athleticism: 0,
      Diligence: 0,
    },
    characterStatus: {
      Mood: 0,
      Empathy: 0,
      Stress: 0,
      Confidence: 0,
      SocialVibe: 0,
      Focus: 0,
    },
    characterRelationshipStatus: {
      Friends: 0,
      Romance: 0,
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });

  const { data:characterData, isLoading, error } = useSingleCharacter(characterId || "");
  const {mutate: createCharacter, isPending} = useCreateCharacter(gameId || "");
  const {mutate: updateCharacter} = useUpdateCharacter(characterId || "")

  console.log("gameId agent detail", gameId, characterId);

  const handleCreateCharacter = async () => {
    createCharacter(character, {
      onSuccess: () => {
        toast({
        title: "Character Created",
        description: `${character.characterName} created successfully!`})
        navigate(`/game/${gameId}/canvas`);
      }
    })
  };

  async function handleUpdateCharacter(){
    if(!characterId) return;
    updateCharacter(character, {
      onSuccess: () => {
        toast({
        title: "Character Updated",
        description: `${character.characterName} updated successfully!`})
      }
    })
  }

  useEffect(() => {
    if (!characterId) return;
    if(characterData){
      setCharacter(characterData.toDTO());
    }
  }, [characterId, characterData]);

  const handleCancel = () => {
    navigate(`/game/${gameId}/canvas`);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCancel}
              className="border-border/50"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Canvas
            </Button>
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg"></div>
              <div>
                <h1 className="text-xl font-bold text-foreground">
                  {character?.characterName || "New Character"}
                </h1>
              </div>
            </div>
          </div>

          <div className="flex space-x-2">
            <Button variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            {characterId ? (
              <Button
              onClick={handleUpdateCharacter}
                className="bg-primary hover:bg-primary-glow"
              >
                <Save className="h-4 w-4 mr-2" />
                Update Changes
              </Button>
            ) : (
              <Button onClick={handleCreateCharacter} className="bg-primary hover:bg-primary-glow">
                <Save className="h-4 w-4 mr-2" />
                create
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8 max-w-4xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Agent Configuration */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Info */}
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>
                  Configure the character's identity and role
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Character Name</Label>
                    <Input
                      id="name"
                      value={character?.characterName}
                      onChange={(e) =>
                        setCharacter({
                          ...character,
                          characterName: e.target.value,
                        })
                      }
                      className="bg-muted/50 border-border/50"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    value={character?.characterDescription}
                    onChange={(e) =>
                      setCharacter({
                        ...character,
                        characterDescription: e.target.value,
                      })
                    }
                    className="bg-muted/50 border-border/50"
                    placeholder="Brief description of this agent's role"
                  />
                </div>
              </CardContent>
            </Card>
            {/* Character Traits */}
            <Card>
              <CardHeader>
                <CardTitle>Character Traits</CardTitle>
                <CardDescription>
                  Define the character’s core personality and abilities
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  {Object.entries(character?.characterTraits)?.map(
                    ([key, value]) => (
                      <div key={key} className="space-y-2">
                        <Label htmlFor={`trait-${key}`}>{key}</Label>
                        <Input
                          id={`trait-${key}`}
                          type="number"
                          value={value}
                          onChange={(e) =>
                            setCharacter({
                              ...character,
                              characterTraits: {
                                ...character?.characterTraits,
                                [key]: Number(e.target.value),
                              },
                            })
                          }
                          className="bg-muted/50 border-border/50"
                        />
                      </div>
                    )
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Character Status */}
            <Card>
              <CardHeader>
                <CardTitle>Character Status</CardTitle>
                <CardDescription>
                  Track the character’s current emotional and mental state
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  {Object.entries(character?.characterStatus)?.map(
                    ([key, value]) => (
                      <div key={key} className="space-y-2">
                        <Label htmlFor={`status-${key}`}>{key}</Label>
                        <Input
                          id={`status-${key}`}
                          type="number"
                          value={value}
                          onChange={(e) =>
                            setCharacter({
                              ...character,
                              characterStatus: {
                                ...character?.characterStatus,
                                [key]: Number(e.target.value),
                              },
                            })
                          }
                          className="bg-muted/50 border-border/50"
                        />
                      </div>
                    )
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Relationship Status */}
            <Card>
              <CardHeader>
                <CardTitle>Relationship Status</CardTitle>
                <CardDescription>
                  Define the character’s relationships with others
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  {Object.entries(character?.characterRelationshipStatus)?.map(
                    ([key, value]) => (
                      <div key={key} className="space-y-2">
                        <Label htmlFor={`relationship-${key}`}>{key}</Label>
                        <Input
                          id={`relationship-${key}`}
                          type="number"
                          value={value}
                          onChange={(e) =>
                            setCharacter({
                              ...character,
                              characterRelationshipStatus: {
                                ...character?.characterRelationshipStatus,
                                [key]: Number(e.target.value),
                              },
                            })
                          }
                          className="bg-muted/50 border-border/50"
                        />
                      </div>
                    )
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CharacterDetail;
