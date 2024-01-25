import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { lastValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UsersService {
  
  constructor(
    private http: HttpClient
  ) { }

  async getCurrentUser() {
    return lastValueFrom(this.http.get<any>('/v1/me'));
  }
}
