import { Component, OnInit, Injectable, OnDestroy } from "@angular/core";
import { AuthService } from "../_services/auth.service";
import { AlertifyService } from "../_services/alertify.service";
import { Router } from "@angular/router";
import { Subscription } from "rxjs";

@Component({
  selector: "app-nav",
  templateUrl: "./nav.component.html",
  styleUrls: ["./nav.component.css"]
})
@Injectable()
export class NavComponent implements OnInit, OnDestroy {
  model: any = {};
  photoUrl: string;
  currentPhotoUrlSub: Subscription = new Subscription();
  loginSub: Subscription = new Subscription();
  constructor(
    public authService: AuthService,
    private alertify: AlertifyService,
    private router: Router
  ) {}

  ngOnInit() {
    this.currentPhotoUrlSub = this.authService.currentPhotoUrl.subscribe(
      photoUrl => {
        this.photoUrl = photoUrl;
      }
    );
  }

  login() {
    this.loginSub = this.authService.login(this.model).subscribe(
      next => {
        this.alertify.success("Logged in successfully");
      },
      error => {
        this.alertify.error(error);
      },
      () => {
        this.router.navigate(["/members"]);
      }
    );
  }

  loggedIn() {
    return this.authService.loggedIn();
  }

  logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    this.authService.decodedToken = null;
    this.authService.currentUser = null;
    this.alertify.message("logged out");
    this.router.navigate(["/home"]);
  }

  ngOnDestroy(): void {
    this.currentPhotoUrlSub.unsubscribe();
    this.loginSub.unsubscribe();
  }
}
