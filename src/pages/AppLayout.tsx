import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { useDeleteDelQueue, useGetallDelQueue, useRejectDelQueue, useRestore } from '@/hooks/use-delQueue';
import { useArchive, useRenameFile } from '@/hooks/use-gcp';
import { useToast } from '@/hooks/use-toast';
import { generalFunctions } from '@/lib/generalFunctions';
import { Archive, Brain, Check, History, LogOut, Pencil, Trash2 } from 'lucide-react';
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom';

const ADMINS = [
  "u-0b2eb9ce-d08d-4739-85db-ca980e1b8464",
  "u-12acca8e-e213-4570-86d3-a313fa79d46c",
  "u-dd579a92-a9c9-4958-964e-b323fa25813b",
]


const AppLayout = ({children}: {children: React.ReactNode}) => {
    const navigate = useNavigate();
    const [selectedGame, setSelectedGame] = useState<string | null>(null);
    const { data: delQueueData } = useGetallDelQueue();
    const { data: archiveData } = useArchive();
    const { mutate: rejectDelQueue} = useRejectDelQueue();
    const { mutate: delDeleteQueueEle } = useDeleteDelQueue();
    const [editingFileId, setEditingFileId] = useState<string | null>(null);
    const [tempName, setTempName] = useState("");
    const { mutate: renameFile } = useRenameFile(selectedGame || "");
    const restoreMutation = useRestore();
    const { toast } = useToast();
    const userId = generalFunctions.getUserId();
    function handleRejectDelQueue(requestId: string) {
    rejectDelQueue(requestId);
  }

  function handleRestore(fileId: string, gameId: string) {
    restoreMutation.mutate({ fileId, gameId });
  }

  function handleDeleteDelQueue(requestId: string, gameId: string) {
    delDeleteQueueEle({requestId, gameId});
  }

  const handleLogout = () => {
    generalFunctions.logout();
    navigate("/login");
    toast({
      title: "Logged out",
      description: "You've been successfully logged out.",
    });
  };


  return (
    <div className="h-screen bg-background flex flex-col">
        <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm h-20">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Brain className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  Agent Management Dashboard
                </h1>
                <p className="text-sm text-muted-foreground">Game Selection</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center gap-3 mr-4">
              <div>
                <Dialog>
                  <DialogTrigger asChild>
                    {ADMINS.includes(userId) && <div className="relative inline-block">
                      <Button
                        size="sm"
                        variant="outline"
                        className="font-medium"
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                        {delQueueData && delQueueData.length > 0 && (
                          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full h-4 min-w-[1rem] flex items-center justify-center">
                            {delQueueData.length ?? 0}
                          </span>
                        )}
                      </Button>
                    </div>}
                  </DialogTrigger>
                  <DialogContent className="border border-border/50 bg-card rounded-2xl shadow-xl max-h-[70vh] overflow-y-auto">
                    {delQueueData?.length  ? (
                      delQueueData.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())?.map((el) => (
                        <Card
                          key={el.requestId}
                          className="mb-4 border border-border/30 shadow-sm hover:shadow-md transition-shadow"
                          // onClick={() => setSelectedGame(el.gameName)}
                        >
                          <CardHeader>
                            <CardTitle className="text-sm font-semibold">
                              {el.fileName}
                            </CardTitle>
                            <p className="font-medium">{el.gameName}</p>
                          </CardHeader>
                          <CardContent className="text-xs space-y-1">
                            <div className="text-xs text-muted-foreground">
                              <span className="font-medium">Created By:</span>{" "}
                              {el.createdBy}
                            </div>
                            {el.createdAt && (
                              <div className="text-xs text-muted-foreground">
                                <span className="font-medium">Created At:</span>{" "}
                                {new Date(el.createdAt).toLocaleString()}
                              </div>
                            )}
                          </CardContent>
                          <CardFooter className="flex justify-end gap-4">
                            <Button
                              size="sm"
                              variant="default"
                              className=""
                              onClick={() => handleRejectDelQueue(el.requestId)}
                            >
                              <Check className="w-3 h-3 mr-1" />
                              Reject
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              className=""
                              onClick={() => handleDeleteDelQueue(el.requestId, el.gameName)}
                            >
                              <Trash2 className="w-3 h-3 mr-1" />
                              Delete
                            </Button>
                          </CardFooter>
                        </Card>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        No delete requests available.
                      </p>
                    )}
                  </DialogContent>
                </Dialog>
              </div>

              <div>
                <Dialog>
                  <DialogTrigger asChild>
                    { ADMINS.includes(userId) && <div className="relative inline-block">
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-border/50"
                      >
                        <Archive className="w-4 h-4 text-blue-500" />
                        {archiveData && archiveData.length > 0 && (
                          <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-[10px] font-bold rounded-full h-4 min-w-[1rem] flex items-center justify-center">
                            {archiveData.length ?? 0}
                          </span>
                        )}
                      </Button>
                    </div>}
                  </DialogTrigger>
                  <DialogContent className="border border-border/50 bg-card rounded-2xl shadow-xl max-h-[70vh] overflow-y-auto">
                    {archiveData?.length ? (
                      archiveData?.sort((a, b) => new Date(b.lastUpdatedAt).getTime() - new Date(a.lastUpdatedAt).getTime())?.map((el) => (
                        <Card
                          key={el.fileId}
                          className="mb-4 border border-border/30 shadow-sm hover:shadow-md transition-shadow"
                          onClick={() => setSelectedGame(el.gameName)}
                        >
                          <CardHeader>
                            <CardTitle className="text-sm font-semibold">
                              {/* {el.fileName} */}
                              {editingFileId === el.fileId ? (
                                <input
                                  autoFocus
                                  className="border px-2 py-1 rounded text-sm bg-background"
                                  value={tempName}
                                  onChange={(e) => setTempName(e.target.value)}
                                  onClick={(e) => e.stopPropagation()}
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                      const newPath = el.filePath.replace(
                                        el.fileName,
                                        tempName
                                      );
                                      renameFile(
                                        {
                                          old_path: el.filePath,
                                          new_path: newPath,
                                        },
                                        {
                                          onSuccess: () =>
                                            setEditingFileId(null),
                                        }
                                      );
                                    }
                                    if (e.key === "Escape") {
                                      setEditingFileId(null);
                                    }
                                  }}
                                />
                              ) : (
                                el.fileName
                              )}
                            </CardTitle>
                            <p className="font-medium">{el.gameName}</p>
                          </CardHeader>
                          <CardContent className="text-xs space-y-1">
                            {el.lastUpdatedAt && (
                              <div className="text-xs text-muted-foreground">
                                <span className="font-medium">Created At:</span>{" "}
                                {new Date(el.lastUpdatedAt).toLocaleString()}
                              </div>
                            )}
                          </CardContent>
                          <CardFooter className="flex justify-end gap-4">
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-6 w-6 p-0"
                              onClick={() => {
                                setEditingFileId(el.fileId);
                                setTempName(el.fileName);
                              }}
                            >
                              <Pencil className="h-3 w-3 text-muted-foreground" />
                            </Button>
                            <Button
                              size="sm"
                              variant="default"
                              className=""
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRestore(el.fileId, el.gameName);
                              }}
                            >
                              <History className="w-3 h-3 mr-1" />
                              Restore
                            </Button>
                          </CardFooter>
                        </Card>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        Nothing in Archive.
                      </p>
                    )}
                  </DialogContent>
                </Dialog>
              </div>
            </div>
              <p className="text-sm text-muted-foreground">
                {generalFunctions.getUserName()}
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="border-border/50 hover:bg-destructive hover:text-destructive-foreground"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>
      <main className="overflow-y-auto container">
        {children}
      </main>
    </div>
  )
}

export default AppLayout