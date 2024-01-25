import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { lastValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TracksService {

  constructor(
    private http: HttpClient
  ) { }

  searchTracks(term: string) {
    return this.http.get<any>(`/v1/search`, { params: {
      q: term,
      type: 'track',
      limit: 5,
      offset: 0
    } });
  }

  getRecommendations(seed_tracks: string, limit: number, parameters: any[]) {
    let params: any = {
      limit,
      seed_tracks
    };
    parameters.forEach(param => {
      if (param.on) {
        params[param.name] = param.value;
      }
    })
    return this.http.get<any>('/v1/recommendations', { params });
  }
}
