import { Injectable } from '@angular/core';
import { Platform } from '@ionic/angular';

/*
  Generated class for the FileSystemServiceProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable({
  providedIn: 'root',
})
export class FileSystemService implements FileSystem {

  private _documentsDirectory: string;
  name: string;
  root: FileSystemDirectoryEntry;
  
  constructor(

  ) {
  }


//   public isIOS(): boolean {
//     return this.platform.is('ios');
//   }

//   public isAndroid(): boolean {
//     return this.platform.is('android');
//   }

//   public get documentsDirectory(): string {
//     if (!this._documentsDirectory) {
//       if (this.isIOS()) {
//         this._documentsDirectory = this.file.documentsDirectory;
//       } else if (this.isAndroid()) {
//         this._documentsDirectory = this.file.externalRootDirectory;
//       }
//     }
//     return this._documentsDirectory;
//   }

//   public checkDir(path: string, directory: string): Promise<boolean> {
//     return this.file.checkDir(path, directory);
//   }

//   public createDir(path: string, directory: string, replace?: boolean): Promise<any> {
//     return this.file.createDir(path, directory, !!replace);
//   }

//   public writeFile(path: string, file: string, data: string | Blob | ArrayBuffer, replace?: boolean): Promise<any> {
//     return this.file.writeFile(path, file, data, { replace: !!replace });
//   }

//   public readAsText(path: string, file: string): Promise<string> {
//     return this.file.readAsText(path, file);
//   }

//   public listDir(path: string, dirName: string): Promise<Entry[]> {
//     return this.file.listDir(path, dirName);
//   }

//   public removeFile(path: string, fileName: string): Promise<any> {
//     return this.file.removeFile(path, fileName);
//   }

}
