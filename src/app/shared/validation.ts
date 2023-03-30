import { FormControl } from '@angular/forms';

export function restrictedCharacters(control: FormControl): { [key: string]: any } {
   //    const pattern = /^[a-zA-Z0-9 ]*$/;
   const pattern = /^[a-zA-Z0-9]*$/;
   const value = control.value;

   if (!value || pattern.test(value)) {
      return null;
   }

   return { restrictedCharacters: true };
}
