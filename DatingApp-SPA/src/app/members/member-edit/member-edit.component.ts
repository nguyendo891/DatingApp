import {
  Component,
  OnInit,
  ViewChild,
  HostListener,
  OnDestroy
} from "@angular/core";
import { User } from "src/app/_models/user";
import { ActivatedRoute } from "@angular/router";
import { AlertifyService } from "src/app/_services/alertify.service";
import { NgForm } from "@angular/forms";
import { AuthService } from "src/app/_services/auth.service";
import { UserService } from "src/app/_services/user.service";
import { Photo } from "src/app/_models/photo";
import { Subscription } from "rxjs";

@Component({
  selector: "app-member-edit",
  templateUrl: "./member-edit.component.html",
  styleUrls: ["./member-edit.component.css"]
})
export class MemberEditComponent implements OnInit, OnDestroy {
  @ViewChild("editForm", { static: false }) editForm: NgForm;
  user: User;
  photoUrl: string;
  dataSub: Subscription = new Subscription();
  currentPhotoUrlSub: Subscription = new Subscription();
  updateUserSub: Subscription = new Subscription();

  // this hostlistener is used to prevent the user
  // ,who is clicking accidentally while editing Profile.
  @HostListener("window:beforeunload", ["$event"])
  unloadNotification($event: any) {
    if (this.editForm.dirty) {
      $event.returnValue = true;
    }
  }

  constructor(
    private route: ActivatedRoute,
    private alertify: AlertifyService,
    private userService: UserService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.route.data.subscribe(data => {
      this.user = data["user"];
    });

    this.authService.currentPhotoUrl.subscribe(
      photoUrl => (this.photoUrl = photoUrl)
    );
  }

  updateUser() {
    this.userService
      .updateUser(this.authService.decodedToken.nameid, this.user)
      .subscribe(
        next => {
          this.alertify.success("Profile updated successfully!");
          this.editForm.reset(this.user);
        },
        error => {
          this.alertify.error(error);
        }
      );
  }

  updateMainPhoto(photoUrl) {
    this.user.photoUrl = photoUrl;
  }

  ngOnDestroy(): void {
    this.dataSub.unsubscribe();
    this.currentPhotoUrlSub.unsubscribe();
    this.updateUserSub.unsubscribe();
  }
}
