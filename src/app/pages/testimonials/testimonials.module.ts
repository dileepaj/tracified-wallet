import { NgModule, CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { TestimonialsPage } from './testimonials';

@NgModule({
  declarations: [
    TestimonialsPage,
  ],
  imports: [
    IonicPageModule.forChild(TestimonialsPage),
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class TestimonialsPageModule {}