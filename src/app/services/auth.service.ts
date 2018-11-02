import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { catchError, tap, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  public response: any;

  constructor(private http: HttpClient) {
    this.response = { success: true,
                      message: 'message',
                      token: 'token',
                    };
}

//   login method to validate the incoming user
login(oUser): Observable<any> {
  console.log(oUser);
  const httpOptions = {
    headers: new HttpHeaders({'Content-Type': 'application/json'})
  };
  const url = `http://www.mocky.io/v2/5bdc0f833300005500813455`;
  return this.http.post(url, oUser, httpOptions)
    .pipe(
      map(this.extractData),
      catchError(this.handleError)
    );
}

private handleError(error: HttpErrorResponse) {
  if (error.error instanceof ErrorEvent) {
    // A client-side or network error occurred. Handle it accordingly.
    console.error('An error occurred:', error.error.message);
  } else {
    // The backend returned an unsuccessful response code.
    // The response body may contain clues as to what went wrong,
    console.error(
      `Backend returned code ${error.status}, ` +
      `body was: ${error.error}`);
      console.log(error);

  }
  // return an observable with a user-facing error message
  return throwError('Something bad happened; please try again later.');
}

private extractData(res: Response) {
  const body = res;
  return body || { };
  // return res;
}

}
