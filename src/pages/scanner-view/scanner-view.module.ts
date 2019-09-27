import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ScannerViewPage } from './scanner-view';

@NgModule({
  declarations: [
    ScannerViewPage,
  ],
  imports: [
    IonicPageModule.forChild(ScannerViewPage),
  ],
  exports: [
     ScannerViewPage,
  ]
})
export class ScannerViewPageModule {}
