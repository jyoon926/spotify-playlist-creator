import { HttpHandler, HttpInterceptor, HttpRequest } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { AuthService } from "../services/auth.service";

@Injectable()
export class TokenInterceptor implements HttpInterceptor {

  constructor(private authService: AuthService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler) {
    if (req.url.startsWith("/v1")) {
      const authToken = this.authService.token;
  
      let authReq = req.clone({
        url: 'https://api.spotify.com' + req.url,
        headers: req.headers.set('Authorization', 'Bearer ' + authToken)
      });
  
      return next.handle(authReq);
    }
    return next.handle(req);
  }
}