import { CharacterDTO, characterRelationshipStatusType, characterStatusType, characterTraitsType } from "../types/CharacterTypes";

export class Character {
  constructor(
    public readonly characterId: string,
    public characterName: string,
    public characterDescription: string,
    public readonly gameName: string,
    protected characterTraits: characterTraitsType,
    protected characterStatus: characterStatusType,
    protected characterRelationshipStatus: characterRelationshipStatusType,
    private created_at: string,
    private updated_at: string
  ) {}

  get formattedUpdatedAt() {
    return new Date(this.updated_at).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }

  static fromDTO(dto: CharacterDTO): Character {
    const traits: characterTraitsType = {
      Charisma: dto.characterTraits.Charisma ?? 0,
      Empathy: dto.characterTraits.Empathy ?? 0,
      Wit: dto.characterTraits.Wit ?? 0,
      Creativity: dto.characterTraits.Creativity ?? 0,
      Athleticism: dto.characterTraits.Athleticism ?? 0,
      Diligence: dto.characterTraits.Diligence ?? 0,
    }
    const status: characterStatusType = {
      Mood: dto.characterStatus.Mood ?? 0,
      Empathy: dto.characterStatus.Empathy ?? 0,
      Stress: dto.characterStatus.Stress ?? 0,
      Confidence: dto.characterStatus.Confidence ?? 0,
      SocialVibe: dto.characterStatus.SocialVibe ?? 0,
      Focus: dto.characterStatus.Focus ?? 0,
    }
    const relationshipStatus: characterRelationshipStatusType = {
      Friends: dto.characterRelationshipStatus.Friends ?? 0,
      Romance: dto.characterRelationshipStatus.Romance ?? 0
    }
    return new Character(
      dto.characterId,
      dto.characterName,
      dto.characterDescription,
      dto.gameName,
      traits,
      status,
      relationshipStatus,
      dto.created_at,
      dto.updated_at
    );
  }

  toDTO(): CharacterDTO{
    return {
      characterId: this.characterId,
      characterName: this.characterName,
      characterDescription: this.characterDescription,
      gameName: this.gameName,
      characterTraits: this.characterTraits,
      characterStatus: this.characterStatus,
      characterRelationshipStatus: this.characterRelationshipStatus,
      created_at: this.created_at,
      updated_at: this.updated_at
    }
  }
}
