import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ResetPasswordPage } from './reset-password';
import { ComponentsModule } from '../../components/components.module';

@NgModule({
  declarations: [
    ResetPasswordPage,
    // ForgotPasswordComponent,
    // ResetPasswordComponent
  ],
  imports: [
    ComponentsModule,
    IonicPageModule.forChild(ResetPasswordPage),
  ],
})
export class ResetPasswordPageModule { }
