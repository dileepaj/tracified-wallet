import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { BcAccountPage } from './bc-account';
import { ComponentsModule } from '../../components/components.module';
import { AddAccountPageModule } from '../add-account/add-account.module';

@NgModule({
  declarations: [
    BcAccountPage,
  ],
  imports: [ComponentsModule,
    AddAccountPageModule,
    IonicPageModule.forChild(BcAccountPage),
  ],
  exports: [
    BcAccountPage
  ],
})
export class BcAccountPageModule {}
