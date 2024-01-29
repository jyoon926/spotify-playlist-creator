import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-callback',
  templateUrl: './callback.component.html'
})
export class CallbackComponent implements OnInit {
  constructor(private authService: AuthService, private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.authService.callback(this.route.snapshot.queryParams['code']);
  }
}
