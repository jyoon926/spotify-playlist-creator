import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { lastValueFrom, of } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  token?: string;
  private spotify_client_id = environment.SPOTIFY_CLIENT_ID;
  private spotify_client_secret = environment.SPOTIFY_CLIENT_SECRET;
  private spotify_redirect_uri = 'http://localhost:4200/callback';

  constructor(private http: HttpClient) { }

  setToken() {
    this.token = this.getToken();
  }

  login() {
    const state = this.generateRandomString(16);
    const scope = 'user-read-email user-read-private playlist-modify-public playlist-modify-private';
    let params = new URLSearchParams({
      response_type: 'code',
      client_id: this.spotify_client_id,
      scope,
      redirect_uri: this.spotify_redirect_uri,
      state,
      show_dialog: 'true'
    });
    window.location.href = 'https://accounts.spotify.com/authorize/?' + params;
  }

  callback(code: string) {
    const params = {
      code: code,
      redirect_uri: this.spotify_redirect_uri,
      grant_type: 'authorization_code'
    };
    const authOptions: any = {
      headers: {
        'Authorization': 'Basic ' + btoa(this.spotify_client_id + ':' + this.spotify_client_secret),
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    };
    this.http.post('https://accounts.spotify.com/api/token', new URLSearchParams(params), authOptions).subscribe((res: any) => {
      localStorage.setItem('access_token', res.access_token);
      this.token = res.access_token;
      window.location.href = '/';
    });
  }

  getToken() {
    return localStorage.getItem('access_token')!;
  }

  logout() {
    localStorage.removeItem('access_token');
    window.location.href = '/';
  }
  
  generateRandomString(length: number) {
    let text = '';
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (var i = 0; i < length; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
  };
}
