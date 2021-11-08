import { NgModule } from '@angular/core';
import { ComponentsModule } from '../../../components/components.module';
import { IonicPageModule } from 'ionic-angular';
import { TestimonialsSentPage } from './testimonials-sent';

@NgModule({
  declarations: [
    TestimonialsSentPage,
  ],
  imports: [
    ComponentsModule,
    IonicPageModule.forChild(TestimonialsSentPage),
  ],
})
export class TestimonialsSentPageModule {}
