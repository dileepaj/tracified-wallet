import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { SettingsProfilePage } from './settings-profile';

@NgModule({
  declarations: [
    SettingsProfilePage,
  ],
  imports: [
    IonicPageModule.forChild(SettingsProfilePage),
  ],
  exports: [
    SettingsProfilePage
  ],
})
export class SettingsProfilePageModule {}
