export type characterTraitsType = {
  Charisma: number;
  Empathy: number;
  Wit: number;
  Creativity: number;
  Athleticism: number;
  Diligence: number;
};

export type characterStatusType = {
  Mood: number;
  Empathy: number;
  Stress: number;
  Confidence: number;
  SocialVibe: number;
  Focus: number;
};

export type characterRelationshipStatusType = {
  Friends: number;
  Romance: number;
};
export type CharacterDTO = {
  readonly characterId?: string;
  characterName: string;
  characterDescription: string;
  readonly gameName: string;
  characterTraits: Record<string, number>;
//   characterTraits: characterTraitsType;
  characterStatus: Record<string, number>;
//   characterStatus: characterStatusType;
  characterRelationshipStatus: Record<string, number>;
//   characterRelationshipStatus: characterRelationshipStatusType;
  created_at: string;
  updated_at: string;
};
