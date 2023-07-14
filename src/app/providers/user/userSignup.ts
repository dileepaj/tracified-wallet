import { HttpClient, HttpHeaders, HttpParams } from "@angular/common/http";
import { Observable, timeout } from "rxjs";
import { LoggerService } from "../logger-service/logger.service";
import { Properties } from "src/app/shared/properties";
import { USER_SETTING } from 'src/environments/environment';
import { ENV } from "src/environments/environment";
import { Injectable } from "@angular/core";

@Injectable({
    providedIn: 'root',
})
export class UserSignUp {
    public url: string = `${ENV.API_ADMIN}/external/walletUser`
    reqOpts: any;
    constructor(
        public http: HttpClient,
        private properties: Properties,
        private logger: LoggerService
    ) { }
    public registerUser(user: any): Observable<any> {
        return this.http.post(this.url, user)
    }
}