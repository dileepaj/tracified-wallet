import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { TestimonialsReceievedPage } from './testimonials-receieved/testimonials-receieved';
import { TestimonialsSentPage } from './testimonials-sent/testimonials-sent';


@IonicPage()
@Component({
  selector: 'page-testimonials',
  templateUrl: 'testimonials.html',
})
export class TestimonialsPage {

  testimonialSent: any = TestimonialsSentPage;
  testimonialReceived: any = TestimonialsReceievedPage;

  public tab1Title: string = " ";
  public tab2Title: string = " ";

  constructor(public navCtrl: NavController, public translateService: TranslateService) {
    this.tab1Title = '';
    this.tab2Title = '';
  }


}
