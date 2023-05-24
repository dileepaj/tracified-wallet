import { NgModule, CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { TestimonialComponent } from './testimonial.component';

@NgModule({
  declarations: [
    TestimonialComponent,
  ],
  imports: [
    IonicPageModule.forChild(TestimonialComponent),
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class TestimonialComponentModule {}