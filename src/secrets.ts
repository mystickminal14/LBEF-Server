import dotenv from 'dotenv';

dotenv.config({ path: '.env' });

export const PORT = process.env.PORT || 3000;
export const JWTSECRET = process.env.JWTSECRET!;
export const DATABASE_URL = process.env.DATABASE_URL!;
export const TOKEN_EXPIRY = process.env.TOKEN_EXPIRY || '1d';
export const BREVO_SENDER_EMAIL = process.env.BREVO_SENDER_EMAIL!;
export const BREVO_SENDER_NAME = process.env.BREVO_SENDER_NAME!;
export const BREVO_API_KEY = process.env.BREVO_API_KEY!;
export const RECIEVER_EMAIL = process.env.RECIEVER_EMAIL!;
export const RECIEVER_NAME = process.env.RECIEVER_NAME!;
export const NODE_ENV = process.env.NODE_ENV || 'development';
