import { ENV } from '@app/env';

const gateway = ENV.GATEWAY;
const admin = ENV.API_ADMIN;

// Admin GET

export const blockchainAccs: string = admin + '/api/bc/keys'; // GET

// Admin POST

export const login: string = admin + '/sign/login'; // POST
export const publicAccount: string = admin + '/api/bc/key/account/public'; // POST
export const addMainAcc: string = admin + '/api/bc/key/main' // POST
export const getNames: string = admin + '/api/bc/names/account/public'; // POST
export const addSubAcc: string = admin + '/api/bc/key/sub'; // PUT
export const subAccStatus: string = admin + '/transaction/coc/subAccountStatus'; // POST
export const validateMainAcc: string = admin + '/api/bc/key/main/account'; // POST
export const verifyEmail: string = admin + '/sign/forgetpassword'; // POST 
export const resetPassword: string = admin + '/sign/forgetpassword'; // POST

// Gateway GET

export const previosTxnId: string = gateway + '/transaction/lastTxn/'; // GET

// Gateway POST



// stellar access point

export const stellarNet: string = 'https://horizon.stellar.org';




