import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';

@Component({
  selector: 'app-join',
  templateUrl: './join.component.html',
  styleUrls: ['./join.component.css']
})
export class JoinComponent implements OnInit {

  isLoading = false;

  ngOnInit() {

  }

  onJoin(form: NgForm) {
    console.log(form.value);
  }

}
