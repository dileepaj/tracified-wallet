import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { USER_SETTING } from 'src/environments/environment';
import { ENV } from 'src/environments/environment';

@Injectable({
   providedIn: 'root',
})
export class PhoneNumberService {
   reqOpts: any;
   constructor(public http: HttpClient) {}

   public validatePhoneNumber(phoneNo: string): Observable<any> {
      let url: string = `${ENV.API_ADMIN}/sign/checkmobile/`;
      url += phoneNo;
      return this.http.get(url);
   }
}
