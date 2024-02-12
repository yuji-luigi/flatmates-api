// make bluebird default Promise

// eslint-disable-next-line no-undef
// import app from './config/express';
import vars from './utils/globalVariables';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import fileUpload from 'express-fileupload';
import helmet from 'helmet';
import morgan from 'morgan';
import passport from 'passport';
import routes from './api/routes';
import strategies from './lib/jwt/resolveUserJwt';
import mongooseConnector from './lib/mongoose/initMongoose';
// import { seedRoles } from './lib/mongoose/seed/mongoose-seeder';

const { port, env } = vars;
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
// passport.use('handleSpaceJwt', strategies.handleSpaceJwt);
// passport.use('handleOrganizationJwt', strategies.handleOrganizationJwt);
// passport.use('handleMaintenanceJwt', strategies.handleMaintenanceJwt);

// app.use(handleOrganization());
// mount api v1 routes
app.use('/api/v1', routes);
// open mongoose connection
mongooseConnector.init();

app.listen(port, async () => {
  console.log(`server started on port ${port} (${env})`);
});

/**
 * Exports express
 * @public
 */

export default app;
