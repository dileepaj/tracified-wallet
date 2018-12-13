import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { BcAccountPage } from './bc-account';
import { ComponentsModule } from '../../components/components.module';

@NgModule({
  declarations: [
    BcAccountPage,
  ],
  imports: [ComponentsModule,
    IonicPageModule.forChild(BcAccountPage),
  ],
})
export class BcAccountPageModule {}
