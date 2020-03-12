import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ResetPasswordPage } from './reset-password';
import { ComponentsModule } from '../../components/components.module';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  declarations: [
    ResetPasswordPage,
    // ForgotPasswordComponent,
    // ResetPasswordComponent
  ],
  imports: [
    ComponentsModule,
    IonicPageModule.forChild(ResetPasswordPage),
    TranslateModule.forChild()
  ],
})
export class ResetPasswordPageModule { }
