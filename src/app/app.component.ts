import { Component, OnInit } from '@angular/core';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'spotify-playlist-creator';

  constructor(
    private authService: AuthService
  ) { }

  ngOnInit() {
    this.authService.setToken();
  }

  get isLoggedIn(): boolean {
    return this.authService.token ? this.authService.token.length > 0 : false;
  }
}
