import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { CohereClient } from 'cohere-ai';

@Injectable({
  providedIn: 'root'
})
export class CohereService {
  cohere = new CohereClient({
    token: environment.envVar.COHERE_API_KEY
  });

  constructor() { }

  async generatePlaylistInfo(playlist: any[], selectedTracks: any[], parameters: any[]): Promise<{title: string, description: string}> {
    const data = {
      playlist: playlist.map(track => `${track.name} by ${track.artists[0].name}`),
      // seed_tracks: selectedTracks.map(track => `'${track.name}' by ${track.artists[0].name}`),
      parameters: parameters.filter(p => p.on).map(({description, step, displayName, on, ...rest}) => rest)
    }

    const prompt = JSON.stringify(data) + "\nGiven this playist, generate a title (<5 words) and description (<10 words). Use slightly self-deprecating humor and sass. Take into consideration the type of songs in the playlist as well as the parameters. Return the title and description as a stringified JSON object. Don't write any other text.";

    let response: any = (await this.generate(prompt, 0.2)).trim();
    try {
      response = JSON.parse(response);
    } catch {
      return { title: "", description: "" };
    }

    const title = response.title.trim().replaceAll('"', '').toLowerCase();
    const description = response.description.trim().replaceAll('"', '').toLowerCase();

    return { title, description };
  }

  async generate(prompt: string, temperature: number) {
    const prediction = await this.cohere.generate({
      prompt,
      model: 'command',
      temperature
    }).catch(e => {
      return null;
    });
    return prediction ? prediction.generations[0].text : "";
  }
}
