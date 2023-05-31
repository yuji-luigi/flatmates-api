import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import helmet from 'helmet';
import passport from 'passport';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import strategies from './passport';
import routes from '../api/routes/index';
// import error from '../middlewares/error';
import vars from './vars';
// import { handleQuery, handleUserFromRequest } from '../middlewares/auth';
// import { handleOrganization } from '../middlewares/handleQuery';
import fileUpload from 'express-fileupload';
// import logger from './logger';
// import { RequestCustom } from '../types/custom-express/express-custom';
// import { authClientRun } from './google-api';
/**
 * Express instance
 * @public
 */
const app = express();
// request logging. dev: console | production: file
app.enable('trust proxy');
app.use(morgan(vars.logs));

// parse body params and attache them to req.body
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(fileUpload());

// parse cookie
app.use(cookieParser());

// secure apps by setting various HTTP headers
app.use(helmet());

// enable CORS - Cross Origin Resource Sharing
app.use(cors({ credentials: true, origin: true }));

// enable authentication
app.use(passport.initialize());
// find user by token. then done.
passport.use('jwt', strategies.jwt);
passport.use('handleSpaceJwt', strategies.handleSpaceJwt);

// app.use(handleOrganization());
// mount api v1 routes
app.use('/api/v1', routes);

// (async () => {
//   await authClientRun();
// })();
// if error is not an instanceOf APIError, convert it.
// app.use(error.converter);

// catch 404 and forward to error handler
// app.use(error.notFound);
// Error handler middleware

export default app;
