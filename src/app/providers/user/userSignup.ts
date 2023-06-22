import { HttpClient, HttpHeaders, HttpParams } from "@angular/common/http";
import { Observable, timeout } from "rxjs";
import { LoggerService } from "../logger-service/logger.service";
import { Properties } from "src/app/shared/properties";
import { USER_SETTING } from "src/app/shared/userSignUpSetting";
import { ENV } from "src/environments/environment";
import { Injectable } from "@angular/core";

@Injectable({
    providedIn: 'root',
})
export class UserSignUp {
    public url: string = `${ENV.API_ADMIN}/api/walletUser`
    reqOpts: any;
    constructor(
        public http: HttpClient,
        private properties: Properties,
        private logger: LoggerService
    ) { }
    public registerUser(user: any): Observable<any> {
        this.reqOpts = {
            observe: 'response',
            headers: new HttpHeaders({
                Accept: 'application/json',
                'Content-Type': 'Application/json',
                Authorization: 'Bearer ' + USER_SETTING.BEARER_TOKEN,
                
            }),
        };
        return this.http.post(this.url, user, this.reqOpts)
    }
}