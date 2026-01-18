import dotenv from 'dotenv';

dotenv.config({ path: '.env' });

export const PORT = process.env.PORT || 3000;
export const JWTSECRET = process.env.JWTSECRET!;
export const DATABASE_URL = process.env.DATABASE_URL!;
export const TOKEN_EXPIRY = process.env.TOKEN_EXPIRY || '1d';
export const EMAIL_USER = process.env.EMAIL_USER!;
export const EMAIL_PASS = process.env.EMAIL_PASS!;
export const NODE_ENV = process.env.NODE_ENV || 'development';
