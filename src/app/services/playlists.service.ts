import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class PlaylistsService {

  constructor(
    private http: HttpClient
  ) { }

  createPlaylist(userId: string, name: string, description: string, isPublic: boolean) {
    return this.http.post<any>(`/v1/users/${userId}/playlists`, {
      name: name ? name : 'New playlist',
      description: description ? description : '',
      public: isPublic
    });
  }

  editPlaylistDescription(playlist_id: string, description: string) {
    return this.http.put(`/v1/playlists/${playlist_id}`, { description });
  }

  addTracks(playlistId: string, uris: string[]) {
    return this.http.post<any>(`/v1/playlists/${playlistId}/tracks`, {
      uris,
      position: 0
    })
  }
}
