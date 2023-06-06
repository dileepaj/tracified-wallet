import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiServiceProvider } from 'src/app/providers/api-service/api-service';

@Component({
   selector: 'app-request-delete',
   templateUrl: './request-delete.page.html',
   styleUrls: ['./request-delete.page.scss'],
})
export class RequestDeletePage implements OnInit {
   emailform: FormGroup | any;
   submitted = false;
   emailCheck: boolean | any;
   accessDenied: boolean | any;

   constructor(private http: HttpClient, private formBuilder: FormBuilder, private api: ApiServiceProvider) {
      this.accessDenied = false;
      this.emailCheck = false;
   }

   ngOnInit() {
      this.emailform = this.formBuilder.group({
         email: ['', [Validators.required, Validators.email, Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$')]],
      });
   }

   // convenience getter for easy access to form fields
   get e() {
      return this.emailform.controls;
   }

   onRequestDelete(requestemail: { email: string }) {
      //check if the email is valid
      this.submitted = true;
      // stop here if form is invalid
      if (this.emailform.invalid) {
         return;
      }

      this.api.post('sign/walletAppAccountDeletion', requestemail).subscribe(
         response => {
            this.accessDenied = true;
         },
         err => {
            this.accessDenied = true;
         }
      );
   }
}
