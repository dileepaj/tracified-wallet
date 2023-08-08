export class Properties {
   public userName: string;
   public token: string;
   public tenant: string;
   public displayName: string;
   public company: string;
   public userType: string;
   public displayImage: string;
   public bcAccounts;
   public defaultAccount;
   public firstName: string;
   public lastName: string;
   public skipConsoleLogs: boolean;
   public writeToFile: boolean;
}

// TODO:switch to singleton instance
// export class PropertiesSingleton {
//    private static instance: PropertiesSingleton;

//    public userName: string;
//    public token: string;
//    public tenant: string;
//    public displayName: string;
//    public company: string;
//    public userType: string;
//    public displayImage: string;
//    public bcAccounts;
//    public defaultAccount;
//    public firstName: string;
//    public lastName: string;
//    public skipConsoleLogs: boolean;
//    public writeToFile: boolean;

//    private constructor() {
//       // Initialize your properties here if needed
//    }

//    public static getInstance(): PropertiesSingleton {
//       if (!PropertiesSingleton.instance) {
//          PropertiesSingleton.instance = new PropertiesSingleton();
//       }
//       console.log("instance : ",PropertiesSingleton.instance)
//       return PropertiesSingleton.instance;
//    }
// }
