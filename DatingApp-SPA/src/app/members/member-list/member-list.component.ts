import { Component, OnInit, OnDestroy } from "@angular/core";
import { UserService } from "../../_services/user.service";
import { AlertifyService } from "../../_services/alertify.service";
import { User } from "../../_models/user";
import { ActivatedRoute } from "@angular/router";
import { Pagination, PaginatedResult } from "src/app/_models/pagination";
import { Subscription } from "rxjs";

@Component({
  selector: "app-member-list",
  templateUrl: "./member-list.component.html",
  styleUrls: ["./member-list.component.css"]
})
export class MemberListComponent implements OnInit, OnDestroy {
  users: User[];
  user: User = JSON.parse(localStorage.getItem("user"));
  genderList = [
    { value: "male", display: "Males" },
    { value: "female", display: "Females" }
  ];
  userParams: any = {};
  pagination: Pagination;
  dataSub: Subscription = new Subscription();
  getUsersSub: Subscription = new Subscription();

  constructor(
    private userService: UserService,
    private alertify: AlertifyService,
    private route: ActivatedRoute
  ) {}
  ngOnInit() {
    //this route.data is used when using resolver
    this.dataSub = this.route.data.subscribe(data => {
      this.users = data["users"].result;
      this.pagination = data["users"].pagination;
    });

    this.userParams.gender = this.user.gender === "female" ? "male" : "female";
    this.userParams.minAge = 18;
    this.userParams.maxAge = 99;
    this.userParams.orderBy = "lastActive";
  }

  pageChanged(event: any): void {
    this.pagination.currentPage = event.page;
    this.loadUsers();
  }

  resetFilters() {
    this.userParams.gender = this.user.gender === "female" ? "male" : "female";
    this.userParams.minAge = 18;
    this.userParams.maxAge = 99;
    this.loadUsers();
  }

  loadUsers() {
    this.getUsersSub = this.userService
      .getUsers(
        this.pagination.currentPage,
        this.pagination.itemsPerPage,
        this.userParams
      )
      .subscribe(
        (res: PaginatedResult<User[]>) => {
          this.users = res.result;
          //this.pagination = res.pagination;
        },
        error => {
          this.alertify.error(error);
        }
      );
  }

  ngOnDestroy(): void {
    this.dataSub.unsubscribe();
    this.getUsersSub.unsubscribe();
  }
}
