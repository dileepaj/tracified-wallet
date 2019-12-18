import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { AddAccountPage } from './add-account';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  declarations: [
    AddAccountPage,
  ],
  imports: [
    IonicPageModule.forChild(AddAccountPage),
    TranslateModule.forChild()
  ],
  exports: [
    AddAccountPage
  ],
})
export class AddAccountPageModule {}
