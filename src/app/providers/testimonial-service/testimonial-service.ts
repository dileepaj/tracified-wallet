import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable()
export class TestimonialServiceProvider {

  constructor(public http: HttpClient) {
    console.log('Hello TestimonialServiceProvider Provider');
  }

}
