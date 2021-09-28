import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { AddTestimonialPage } from './add-testimonial';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  declarations: [
    AddTestimonialPage,
  ],
  imports: [
    IonicPageModule.forChild(AddTestimonialPage),
    TranslateModule.forChild()
  ],
})
export class AddTestimonialPageModule {}
