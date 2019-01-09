import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { AddAccountPage } from './add-account';

@NgModule({
  declarations: [
    AddAccountPage,
  ],
  imports: [
    IonicPageModule.forChild(AddAccountPage),
  ],
  exports: [
    AddAccountPage
  ],
})
export class AddAccountPageModule {}
