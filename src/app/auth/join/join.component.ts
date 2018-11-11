import { Component } from '@angular/core';
import { NgForm } from '@angular/forms';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-join',
  templateUrl: './join.component.html',
  styleUrls: ['./join.component.css']
})
export class JoinComponent {

  isLoading = false;

  constructor(private authService: AuthService) {}

  onJoin(form: NgForm) {
    console.log('Join');
    console.log(form.valid);
    if (form.invalid) {
      return;
    } else {
      this.authService.createUser(form.value.email, form.value.password);
    }
  }

}
