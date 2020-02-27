import { Component, OnInit, Input, OnDestroy } from "@angular/core";
import { User } from "src/app/_models/user";
import { AuthService } from "src/app/_services/auth.service";
import { AlertifyService } from "src/app/_services/alertify.service";
import { UserService } from "src/app/_services/user.service";
import { Subscription } from "rxjs";

@Component({
  selector: "app-member-card",
  templateUrl: "./member-card.component.html",
  styleUrls: ["./member-card.component.css"]
})
export class MemberCardComponent implements OnInit, OnDestroy {
  @Input() user: User;
  sendLikeSub: Subscription = new Subscription();

  constructor(
    private authService: AuthService,
    private alertify: AlertifyService,
    private userService: UserService
  ) {}

  ngOnInit() {}

  sendLike(id: number) {
    this.sendLikeSub = this.userService
      .sendLike(this.authService.decodedToken.nameid, id)
      .subscribe(
        data => {
          this.alertify.success("You have liked: " + this.user.knownAs);
        },
        error => {
          this.alertify.error(error);
        }
      );
  }

  ngOnDestroy(): void {
    this.sendLikeSub.unsubscribe();
  }
}
