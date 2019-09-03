import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { CameraSettingsPage } from './camera-settings';

@NgModule({
  declarations: [
    CameraSettingsPage,
  ],
  imports: [
    IonicPageModule.forChild(CameraSettingsPage),
  ],
})
export class CameraSettingsPageModule {}
