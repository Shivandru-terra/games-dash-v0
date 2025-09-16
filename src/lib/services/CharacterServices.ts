import { generalFunctions } from "../generalFunctions";
import { Character } from "../dataModel/CharacterModel";
import { CharacterDTO } from "../types/CharacterTypes";

class CharacterServices {
  async getAllCharacters(gameId: string): Promise<Character[]> {
    if (!gameId) return [];
    try {
      const url = generalFunctions.createUrl(`characters?gameName=${gameId}`);
      const res = await fetch(url);
      const data: CharacterDTO[] = await res.json();
      //   console.log("data of all characters", data);
      return data.map((dto) => Character.fromDTO(dto));
    } catch (error) {
      console.log("error: ", error);
      throw new Error("Failed to fetch characters");
    }
  }

  async getCharacter(characterId: string): Promise<Character> {
    try {
      const url = generalFunctions.createUrl(`character/${characterId}`);
      const res = await fetch(url);
      const data = await res.json();
      console.log("data of character", data);
      return Character.fromDTO(data);
    } catch (error) {
      throw new Error("Failed to fetch character");
    }
  }

  async createCharacter(character: CharacterDTO): Promise<Character> {
    try {
      const url = generalFunctions.createUrl("character");
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(character),
      });
      const data: CharacterDTO = await res.json();
      return Character.fromDTO(data);
    } catch (error) {
      throw new Error("Failed to create character");
    }
  }

  async bulkUploadCharacters(characters: CharacterDTO[]){
    return Promise.all(characters.map(character => this.createCharacter(character)));
  }

  async updateCharacter(
    characterId: string,
    characterData: CharacterDTO
  ): Promise<Character> {
    try {
      const url = generalFunctions.createUrl(`character/${characterId}`);
      const res = await fetch(url, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(characterData),
      });
      console.log("res", res);
      const data: CharacterDTO = await res.json();
      return Character.fromDTO(data);
    } catch (error) {
      throw new Error(`unable to update character`);
    }
  }

  async deleteCharacter(characterId: string): Promise<void>{
    try {
      const url = generalFunctions.createUrl(`character/delete/${characterId}`)
      const res = await fetch(url, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json"
        }
      })
      const data = await res.json();
      console.log("res from deleting", data);
    } catch (error) {
      throw new Error("Failed to delete character")
    }
  }
}

export const characterServices = new CharacterServices();
