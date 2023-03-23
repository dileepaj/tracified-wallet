
import { Injectable } from '@angular/core';
import { share } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { ApiServiceProvider } from '../api-service/api-service';
import { rejects } from 'assert';

/**
 * Most apps have the concept of a User. This is a simple provider
 * with stubs for login/signup/etc.
 *
 * This User provider makes calls to our API at the `login` and `signup` endpoints.
 *
 * By default, it expects `login` and `signup` to return a JSON object of the shape:
 *
 * ```json
 * {
 *   status: 'success',
 *   user: {
 *     // User fields your app needs, like "id", "name", "email", etc.
 *   }
 * }Ø
 * ```
 *
 * If the `status` field is not `success`, then an error is detected and returned.
 */
@Injectable({
   providedIn: 'root',
})
export class User {
   _user: any;

   constructor(public api: ApiServiceProvider) {}

   /**
    * Send a POST request to our signup endpoint with the data
    * the user entered on the form.
    */
   signup(accountInfo: any) {
      let seq = this.api.post('signup', accountInfo).pipe(share());

      seq.subscribe(
         (res: any) => {
            // If the API returned a successful response, mark the user as logged in
            if (res.status == 'success') {
               this._loggedIn(res);
            }
         },
         err => {
            console.log('ERROR', err);
         }
      );

      return seq;
   }

   /**
    * Log the user out, which forgets the session
    */
   logout() {
      this._user = null;
      localStorage.removeItem('_user');
   }

   /**
    * Process a login/signup response to store user data
    */
   _loggedIn(resp) {
      this._user = resp.user;
      localStorage.setItem('_user', JSON.stringify(resp.user));
   }
}
