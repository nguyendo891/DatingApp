import {
  Component,
  OnInit,
  Input,
  OnDestroy,
  DoCheck,
  ElementRef
} from "@angular/core";
import { Message } from "src/app/_models/Message";
import { AuthService } from "src/app/_services/auth.service";
import { AlertifyService } from "src/app/_services/alertify.service";
import { UserService } from "src/app/_services/user.service";
import { tap } from "rxjs/operators";
import { Subscription, Observable, Subject } from "rxjs";
import * as _ from "lodash";

@Component({
  selector: "app-member-messages",
  templateUrl: "./member-messages.component.html",
  styleUrls: ["./member-messages.component.css"]
})
export class MemberMessagesComponent implements OnInit, OnDestroy, DoCheck {
  @Input() recipientId: number;
  messages: Message[];
  previousMessages: Message[];
  newMessage: any = {};
  getMessageThreadSub: Subscription = new Subscription();
  sendMessageSub: Subscription = new Subscription();
  currentUserId = +this.authService.decodedToken.nameid;
  el: ElementRef;

  constructor(
    private userService: UserService,
    private authService: AuthService,
    private alertify: AlertifyService
  ) {}

  ngOnInit() {
    this.getMessageThreadSub = this.loadMessages().subscribe(
      messages => {
        this.messages = _.sortBy(messages, ["messageSent"]);
      },
      error => {
        this.alertify.error(error);
      }
    );
  }

  /// THIS METHOD IS USED LATER
  ngDoCheck() {
    // if (
    //   this.messages[this.messages.length - 1].recipientId != this.recipientId
    // ) {
    //   this.getMessageThreadSub = this.loadMessages()
    //     .pipe(take(1))
    //     .subscribe(
    //       messages => {
    //         this.messages = _.sortBy(messages, ["messageSent"]);
    //         this.getMessageThreadSub.unsubscribe();
    //       },
    //       error => {
    //         this.alertify.error(error);
    //         this.getMessageThreadSub.unsubscribe();
    //       }
    //     );
    // }
  }

  loadMessages(): Observable<Message[]> {
    return this.userService
      .getMessageThread(this.authService.decodedToken.nameid, this.recipientId)
      .pipe(
        tap(messages => {
          // tslint:disable-next-line: prefer-for-of
          for (let i = 0; i < messages.length; i++) {
            if (
              messages[i].isRead === false &&
              messages[i].recipientId === this.currentUserId
            ) {
              this.userService.markAsRead(this.currentUserId, messages[i].id);
            }
          }
        })
      );
  }

  sendMessage() {
    this.newMessage.recipientId = this.recipientId;
    this.sendMessageSub = this.userService
      .sendMessage(this.authService.decodedToken.nameid, this.newMessage)
      .subscribe(
        (message: Message) => {
          this.messages.push(message);
          this.newMessage.content = "";
        },
        error => {
          this.alertify.error(error);
        }
      );
  }

  ngOnDestroy(): void {
    this.getMessageThreadSub.unsubscribe();
    this.sendMessageSub.unsubscribe();
  }
}
