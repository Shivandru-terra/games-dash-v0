import { AgentTypeDTO } from "../types/AgentTypes";

export class Agent {
  constructor(
    public readonly agentId: string,
    public agentName: string,
    public readonly gameName: string,
    public label: string,
    public isActive: boolean,
    public description: string,
    private _agentKnowledgeBase: string[],
    private _agentPrompts: string[]
  ) {}

  get agentKnowledgeBase(): string[]{
    return [...this._agentKnowledgeBase];
  }

  addKnowledgebase(item: string){
    this._agentKnowledgeBase.push(item);
  }

  get agentPrompts(): string[]{
    return [...this._agentPrompts];
  }

  addPrompts(item: string){
    this._agentPrompts.push(item);
  }

  toggleActive(){
    this.isActive = !this.isActive;
  }

  static fromDTO(dto: AgentTypeDTO): Agent {
    return new Agent(
      dto.agentId,
      dto.agentName,
      dto.gameName,
      dto.label,
      dto.isActive,
      dto.description,
      dto.agentKnowledgeBase,
      dto.agentPrompts
    )
  }

  toDTO(): AgentTypeDTO{
    return {
      agentId: this.agentId,
      agentName: this.agentName,
      gameName: this.gameName,
      label: this.label,
      isActive: this.isActive,
      description: this.description,
      agentKnowledgeBase: [...this._agentKnowledgeBase],
      agentPrompts: [...this._agentPrompts]
    }
  }
}
