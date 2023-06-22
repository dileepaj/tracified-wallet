import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { USER_SETTING } from 'src/app/shared/userSignUpSetting';
import { ENV } from 'src/environments/environment';

@Injectable({
   providedIn: 'root',
})
export class PhoneNumberService {
   reqOpts: any;
   constructor(public http: HttpClient) {}

   public validatePhoneNumber(phoneNo: string): Observable<any> {
      let url: string = `${ENV.API_ADMIN}/sign/checkmobile/`;
      this.reqOpts = {
         observe: 'response',
         headers: new HttpHeaders({
            Accept: 'application/json',
            'Content-Type': 'Application/json',
            Authorization: 'Bearer ' + USER_SETTING.BEARER_TOKEN,
         }),
      };

      url += phoneNo;
      return this.http.get(url, this.reqOpts);
   }
}
