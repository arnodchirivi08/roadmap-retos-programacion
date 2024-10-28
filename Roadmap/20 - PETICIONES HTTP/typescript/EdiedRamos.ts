// Author: EdiedRamos

interface PokemonType {
  name: string;
  url: string;
}

interface GameVersion {
  name: string;
  url: string;
}

interface PokemonResponse {
  id: number;
  name: string;
  weight: number;
  height: number;
  types: {
    type: PokemonType;
  }[];
  game_indices: {
    version: GameVersion;
  }[];
}

interface PokemonSpeciesResponse {
  evolution_chain: {
    url: string;
  };
}

interface Species {
  name: string;
  url: string;
}

interface Chain {
  evolves_to: Chain[];
  species: Species;
}

interface PokemonEvolutionResponse {
  chain: Chain;
}

class Pokemon {
  private name: string;
  private id: number;
  private weight: number;
  private height: number;
  private types: string[];
  private evolutions: string[];
  private games: string[];

  constructor(
    private pokemonBaseInformation: PokemonResponse,
    private pokemonEvolutions: PokemonEvolutionResponse
  ) {
    this.loadInformation();
  }

  private loadInformation() {
    this.id = this.pokemonBaseInformation.id;
    this.name = this.pokemonBaseInformation.name;
    this.weight = this.pokemonBaseInformation.weight;
    this.height = this.pokemonBaseInformation.height;
    this.types = this.pokemonBaseInformation.types.map(({ type }) => type.name);
    this.games = this.pokemonBaseInformation.game_indices.map(
      ({ version }) => version.name
    );
    this.evolutions = this.evolutionPath(this.pokemonEvolutions.chain, []);
  }

  private evolutionPath(chain: Chain, currentPath: string[]): string[] {
    currentPath.push(chain.species.name);
    if (chain.evolves_to.length === 0) return currentPath;
    return this.evolutionPath(chain.evolves_to[0], currentPath);
  }

  get toString(): string {
    return `
    ${"=".repeat(20)}
    Id: ${this.id}
    Nombre: ${this.name}
    Peso: ${this.weight}
    Altura: ${this.height}
    Tipos: ${this.types.join(",")}
    Juegos: ${this.games.join(",")}
    Evoluciones: ${this.evolutions.join(",")}
    ${"=".repeat(20)}
    `;
  }
}

class Fetcher {
  static async customFetch<T>(endpoint: string): Promise<T> {
    const response = await fetch(endpoint);
    const data = (await response.json()) as T;
    return data;
  }
}

class PokemonFetcher {
  private static baseUrl = "https://pokeapi.co/api/v2/";

  static async fetchPokemonInformation(
    pokemonTarget: string
  ): Promise<PokemonResponse> {
    return await Fetcher.customFetch<PokemonResponse>(
      `${this.baseUrl}pokemon/${pokemonTarget}`
    );
  }

  static async fetchPokemonSpecies(
    pokemonTarget: string
  ): Promise<PokemonSpeciesResponse> {
    return await Fetcher.customFetch<PokemonSpeciesResponse>(
      `${this.baseUrl}pokemon-species/${pokemonTarget}`
    );
  }

  static async fetchPokemonEvolutionFromURL(
    evolutionURL: string
  ): Promise<PokemonEvolutionResponse> {
    return await Fetcher.customFetch<PokemonEvolutionResponse>(evolutionURL);
  }
}

(async () => {
  try {
    const pokemonTarget = "pikachu";
    const pokemonBaseInformation = await PokemonFetcher.fetchPokemonInformation(
      pokemonTarget
    );
    const pokemonSpecies = await PokemonFetcher.fetchPokemonSpecies(
      pokemonTarget
    );
    const pokemonEvolutions = await PokemonFetcher.fetchPokemonEvolutionFromURL(
      pokemonSpecies.evolution_chain.url
    );

    const pokemon = new Pokemon(pokemonBaseInformation, pokemonEvolutions);

    console.log(pokemon.toString);
  } catch (error) {
    console.error(error);
  }
})();
