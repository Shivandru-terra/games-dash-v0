export type AgentTypeDTO = {
  agentId?: string;
  agentName: string;
  gameName: string;
  label: string;
  isActive: boolean;
  description: string;
  agentKnowledgeBase: string[];
  agentPrompts: string[];
};
