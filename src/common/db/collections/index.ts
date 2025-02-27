import { DB } from '@common/db/firebase';

export const ORGANISATION_COLLECTION = DB.collection('organisations');
export const MULTISIG_COLLECTION = DB.collection('multisigAddresses');
export const PROXY_COLLECTION = DB.collection('proxy');
export const USER_COLLECTION = DB.collection('users');
export const TRANSACTION_COLLECTION = DB.collection('transactions');
export const ASSETS_COLLECTION = DB.collection('assets');
export const CURRENCIES_COLLECTION = DB.collection('currencies');
export const INVOICE_COLLECTION = DB.collection('invoice');
export const INVOICE_TEMPLATE_COLLECTION = DB.collection('invoice_template');
