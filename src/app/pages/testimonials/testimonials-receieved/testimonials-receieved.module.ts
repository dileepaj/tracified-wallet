import { NgModule } from '@angular/core';
import { ComponentsModule } from '../../../components/components.module';
import { IonicPageModule } from 'ionic-angular';
import { TestimonialsReceievedPage } from './testimonials-receieved';

@NgModule({
  declarations: [
    TestimonialsReceievedPage,
  ],
  imports: [
    ComponentsModule,
    IonicPageModule.forChild(TestimonialsReceievedPage),
  ],
})
export class TestimonialsReceievedPageModule {}