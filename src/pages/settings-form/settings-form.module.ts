import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { SettingsFormPage } from './settings-form';

@NgModule({
  declarations: [
    SettingsFormPage,
  ],
  imports: [
    IonicPageModule.forChild(SettingsFormPage),
  ],
})
export class SettingsFormPageModule {}
