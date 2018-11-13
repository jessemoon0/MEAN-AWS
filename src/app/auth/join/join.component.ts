import { Component, OnDestroy, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { AuthService } from '../auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-join',
  templateUrl: './join.component.html',
  styleUrls: ['./join.component.css']
})
export class JoinComponent implements OnInit, OnDestroy {

  private authStatusSub: Subscription;

  isLoading = false;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.authStatusSub = this.authService.getAuthStatusListener()
      .subscribe(
        (authStatus: boolean) => {
          this.isLoading = false;
        }
      );
  }

  ngOnDestroy(): void {
    this.authStatusSub.unsubscribe();
  }

  onJoin(form: NgForm) {
    console.log('Join');
    console.log(form.valid);
    if (form.invalid) {
      return;
    } else {
      this.isLoading = true;
      this.authService.createUser(form.value.email, form.value.password);
    }
  }

}
