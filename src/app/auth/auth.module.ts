import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoginComponent } from './login/login.component';
import { JoinComponent } from './join/join.component';
import { AngularMaterialModule } from '../angular-material.module';
import { AppRoutingModule } from '../app-routing.module';
import { FormsModule } from '@angular/forms';
import { AuthRoutingModule } from './auth-routing.module';

@NgModule({
  declarations: [
    LoginComponent,
    JoinComponent
  ],
  imports: [
    CommonModule,
    AuthRoutingModule,
    FormsModule,
    AngularMaterialModule,
  ]
})
export class AuthModule { }
