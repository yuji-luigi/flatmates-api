import path from 'path';
import dotenvSafe from 'dotenv-safe';

dotenvSafe.config({
  path: path.join(__dirname, '../../.env'),
  example: path.join(__dirname, '../../.env.example')
});

const nodeEnv = process.env.NODE_ENV || 'dev';

const vars = {
  env: process.env.NODE_ENV,
  port: nodeEnv === 'prod' ? process.env.PORT_PROD : process.env.PORT_DEV,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpirationInterval: process.env.JWT_EXPIRATION_SECONDS,
  mongo: {
    uri: nodeEnv === 'dev' ? <string>process.env.MONGO_URI_DEV : <string>process.env.MONGO_URI_PROD
  },
  logs: nodeEnv === 'prod' ? 'combined' : 'dev',
  cookieDomain: nodeEnv === 'dev' ? process.env.DEV_COOKIE_DOMAIN : process.env.PROD_COOKIE_DOMAIN,
  cron_schedule: nodeEnv === 'prod' ? process.env.CRON_SCHEDULE_PROD : process.env.CRON_SCHEDULE_DEV,
  // cron_timeout: '0 1 * * *', runs at 1:00 AM
  cron_schedule_options: nodeEnv === 'prod' ? { scheduled: true, timeZone: 'Europe/Rome' } : {}, // set this as a 3rd argument to cron.schedule
  slack_webhook: process.env.SLACK_WEBHOOK_URL,
  storageAccessKeyId: process.env.S3_ACCESS_KEY,
  storageSecretAccessKey: process.env.S3_SECRET_KEY,
  storageBucketName: process.env.S3_BUCKET,
  storageEndPoint: process.env.S3_ENDPOINT,
  storageRegion: process.env.S3_REGION,
  googleAuthClientId: process.env.GOOGLE_AUTH_CLIENT_ID,
  googleAuthSecret: process.env.GOOGLE_AUTH_SECRET,
  redirectUrl: process.env.REDIRECT_URL,
  gmailAppPassword: process.env.GMAIL_APP_PASSWORD,
  displayMail: process.env.DISPLAY_MAIL,
  gmailAddress: process.env.GMAIL_ADDRESS,
  testMail: process.env.TEST_MAIL
};

export const sensitiveCookieOptions = {
  httpOnly: true,
  sameSite: true,
  maxAge: 1000 * 60 * 60 * 24 * 30,
  domain: vars.cookieDomain
};

export default vars;
