import { Component, OnInit, OnDestroy } from "@angular/core";
import { Pagination, PaginatedResult } from "../_models/pagination";
import { UserService } from "../_services/user.service";
import { AuthService } from "../_services/auth.service";
import { ActivatedRoute } from "@angular/router";
import { AlertifyService } from "../_services/alertify.service";
import { Message } from "../_models/Message";
import { Subscription } from "rxjs";

@Component({
  selector: "app-messages",
  templateUrl: "./messages.component.html",
  styleUrls: ["./messages.component.css"]
})
export class MessagesComponent implements OnInit, OnDestroy {
  messages: Message[];
  pagination: Pagination;
  messageContainer = "Unread";
  dataSub: Subscription;
  getMessagesSub: Subscription;
  deleteMessageSub: Subscription;

  constructor(
    private userService: UserService,
    private authService: AuthService,
    private route: ActivatedRoute,
    private alertify: AlertifyService
  ) {}

  ngOnInit() {
    this.dataSub = this.route.data.subscribe(data => {
      this.messages = data["messages"].result;
      this.pagination = data["messages"].pagination;
    });
  }

  loadMessages() {
    this.getMessagesSub = this.userService
      .getMessages(
        this.authService.decodedToken.nameid,
        this.pagination.currentPage,
        this.pagination.itemsPerPage,
        this.messageContainer
      )
      .subscribe(
        (res: PaginatedResult<Message[]>) => {
          this.messages = res.result;
          this.pagination = res.pagination;
        },
        error => {
          this.alertify.error(error);
        }
      );
  }

  deleteMessage(id: number) {
    this.alertify.confirm(
      "Are you sure you want to delete this message",
      () => {
        this.deleteMessageSub = this.userService
          .deleteMessage(id, this.authService.decodedToken.nameid)
          .subscribe(
            () => {
              this.messages.splice(
                this.messages.findIndex(m => m.id === id),
                1
              );
              this.alertify.success("Message has been deleted");
            },
            error => {
              this.alertify.error("Failed to delete the message");
            }
          );
      }
    );
  }

  pageChanged(event: any): void {
    this.pagination.currentPage = event.page;
    this.loadMessages();
  }

  ngOnDestroy(): void {
    this.dataSub.unsubscribe();
    this.deleteMessageSub.unsubscribe();
    this.getMessagesSub.unsubscribe();
  }
}
