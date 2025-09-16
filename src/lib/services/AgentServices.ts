import { Agent } from "../dataModel/AgentModel";
import { generalFunctions } from "../generalFunctions";
import { AgentTypeDTO } from "../types/AgentTypes";

class AgentServices {
  async getAllAgents(gameId: string): Promise<Agent[]> {
    try {
      const url = generalFunctions.createUrl(`agents?gameName=${gameId}`);
      const res = await fetch(url);
      const data: AgentTypeDTO[] = await res.json();
      console.log("res from agent cards", data);
      return data.map((dto) => Agent.fromDTO(dto));
    } catch (error) {
      throw new Error("Failed to fetch agents");
    }
  }

  async getAgent(agentId: string): Promise<Agent> {
    try {
      const url = generalFunctions.createUrl(`agents/${agentId}`);
      const res = await fetch(url);
      const data: AgentTypeDTO = await res.json();
      return Agent.fromDTO(data);
    } catch (error) {
      throw new Error("Failed to fetch agent");
    }
  }

  async createAgent(agentState: AgentTypeDTO): Promise<Agent> {
    try {
      const url = generalFunctions.createUrl("agents/create");
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(agentState),
      });
      const data = await res.json();
      return Agent.fromDTO(data);
    } catch (error) {
      throw new Error("Failed to create agent");
    }
  }

  async updateAgent(agentId: string, agentState: AgentTypeDTO): Promise<Agent> {
    try {
      const url = generalFunctions.createUrl(`update/${agentId}`);
      const res = await fetch(url, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(agentState),
      });
      console.log("res for updating agents", res);
      const data: AgentTypeDTO = await res.json();
      return Agent.fromDTO(data);
    } catch (error) {
      throw new Error("Failed to update agent");
    }
  }

  async deleteAgent(agentId: string): Promise<void> {
    try {
      const url = generalFunctions.createUrl(`delete/${agentId}`);
      const res = await fetch(url, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data = await res.json();
      console.log("res for deleting agent", data);
    } catch (error) {
      throw new Error("Failed to delete agent");
    }
  }
}

export const agentServices = new AgentServices();
