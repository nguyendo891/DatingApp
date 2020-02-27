import { Component, OnInit, ViewChild, OnDestroy } from "@angular/core";
import { User } from "src/app/_models/user";
import { UserService } from "src/app/_services/user.service";
import { AlertifyService } from "src/app/_services/alertify.service";
import { ActivatedRoute } from "@angular/router";
import {
  NgxGalleryOptions,
  NgxGalleryImage,
  NgxGalleryAnimation
} from "@nomadreservations/ngx-gallery";
import { TabsetComponent } from "ngx-bootstrap";
import { Subscription } from "rxjs";

@Component({
  selector: "app-member-detail",
  templateUrl: "./member-detail.component.html",
  styleUrls: ["./member-detail.component.css"]
})
export class MemberDetailComponent implements OnInit, OnDestroy {
  @ViewChild("memberTabs", { static: true }) memberTabs: TabsetComponent;
  user: User;
  galleryOptions: NgxGalleryOptions[];
  galleryImages: NgxGalleryImage[];
  dataSubscription: Subscription = new Subscription();
  queryParamsSubscription: Subscription = new Subscription();

  constructor(
    private userService: UserService,
    private alertify: AlertifyService,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    // this route.data is used when using resolver,
    // the resolver will resolve  user object into the route,
    // therefore we dont have to call userService.getUser from component.
    this.dataSubscription = this.route.data.subscribe(data => {
      const user = "user";
      this.user = data[user];
    });

    this.queryParamsSubscription = this.route.queryParams.subscribe(params => {
      const selectedTab = params["tab"];
      this.memberTabs.tabs[selectedTab > 0 ? selectedTab : 0].active = true;
    });

    this.galleryOptions = [
      {
        width: "500px",
        height: "500px",
        imagePercent: 100,
        thumbnailsColumns: 4,
        imageAnimation: NgxGalleryAnimation.Slide,
        preview: false
      }
    ];

    this.galleryImages = this.getImages();
  }

  getImages() {
    const imageUrls = [];
    for (const photo of this.user.photos) {
      imageUrls.push({
        small: photo.url,
        medium: photo.url,
        big: photo.url,
        description: photo.description
      });
    }
    return imageUrls;
  }

  selectTab(tabId: number) {
    this.memberTabs.tabs[tabId].active = true;
  }

  ngOnDestroy(): void {
    this.dataSubscription.unsubscribe();
    this.queryParamsSubscription.unsubscribe();
  }
}
