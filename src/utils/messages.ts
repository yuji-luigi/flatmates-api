/* eslint-disable quotes */
// devi chiamare function. nel caso possiamo passare parametro
// ex: const MSG = require('./messages')()
import { StringSchemaDefinition } from 'mongoose';
import { detailedDate } from './functions';
import { RequestCustom } from '../types/custom-express/express-custom';
import { INTERNAL_SERVER_ERROR } from 'http-status';
type message = { message: string };
type argument = {
  employee?: string;
  error?: message;
  entity?: string;
  id?: string;
  fileType?: StringSchemaDefinition;
  detailedDate?: any;
  result?: { accepted?: string[] };
  numDocuments?: string;
  lineNumber?: string;
};

/**
 * @description is a function that returns an object with all the messages.
 * takes parameter to be used in the messages(not required).
 */
const MSG = (arg?: argument) => ({
  OBJ_CREATED: 'Creazione oggetto avvenuto con successo',
  OBJ_UPDATED: 'Aggiornamento oggetto avvenuto con successo',
  OBJ_DELETED: 'Eliminazione oggetto avvenuto con successo',
  OBJ_NOT_FOUND: 'Oggetto non trovato',
  OBJ_NOT_DELETED: 'Oggetto non eliminato',
  OBJ_NOT_UPDATED: 'Oggetto non aggiornato',
  OBJ_NOT_CREATED: 'Oggetto non creato',
  EMPLOYEE_CREATED: 'Creazione dipendente avvenuto con successo',
  EMPLOYEE_UPDATED: 'Aggiornamento dipendente avvenuto con successo',
  EMPLOYEE_DELETED: 'Eliminazione dipendente avvenuto con successo',
  EMPLOYEE_NOT_FOUND: 'Dipendente non trovato',
  USER_CREATED: 'Creazione utente avvenuto con successo',
  USER_UPDATED: 'Aggiornamento utente avvenuto con successo',
  USER_DELETED: 'Eliminazione utente avvenuto con successo',
  USER_NOT_FOUND: 'Utente non trovato',
  NOT_AUTHORIZED: "Non hai permesso per l'azione.",
  NOT_FOUND_ID: `Model ${arg?.entity} con id:${arg?.id} non trovato`,
  ERR_CREATING_FILE: `Errore durante la creazione del file: ${arg?.fileType}, del dipendente: ${arg?.employee}`,
  LOG_ERROR_CREATING_FILE: `Tipo Documento: ${arg?.fileType}, errore durante la creazione del documento`,
  MAIL_SEND_ERROR: "Errore durante l'invio della mail. Riprovo esecuzione del checkForExpiration la mail tra 1 minuto",
  NODEMAILER_ERROR: `${detailedDate(new Date())} ${arg?.lineNumber}, \x1b[31m error: ${arg?.error?.message}. rinvio la mail tra 1 minuto\x1b[0m`,
  MAIL_SEND_SUCCEEDED: `\n===============\n Email sent to\n${arg?.result?.accepted?.join('\n')}\n\nNumber of expringDocuments: ${
    arg?.numDocuments
  }\n=================`
});

export default MSG;
// TODO: MAKE THEM INDIVUSUAL SO THAT SINGLE MSG WILL BE EXPORTED

export const _MSG = {
  INVALID_PIN: 'Pin non valido',
  EXPIRED: 'Link scaduto',
  SUCCESS: 'operazione avvenuta con successo',
  OBJ_CREATED: 'Creazione oggetto avvenuto con successo',
  OBJ_UPDATED: 'Aggiornamento oggetto avvenuto con successo',
  OBJ_DELETED: 'Eliminazione oggetto avvenuto con successo',
  OBJ_NOT_FOUND: 'Oggetto non trovato',
  OBJ_NOT_DELETED: 'Oggetto non eliminato',
  OBJ_NOT_UPDATED: 'Oggetto non aggiornato',
  OBJ_NOT_CREATED: 'Oggetto non creato',
  EMPLOYEE_CREATED: 'Creazione dipendente avvenuto con successo',
  EMPLOYEE_UPDATED: 'Aggiornamento dipendente avvenuto con successo',
  EMPLOYEE_DELETED: 'Eliminazione dipendente avvenuto con successo',
  EMPLOYEE_NOT_FOUND: 'Dipendente non trovato',
  USER_CREATED: 'Creazione utente avvenuto con successo',
  USER_UPDATED: 'Aggiornamento utente avvenuto con successo',
  USER_DELETED: 'Eliminazione utente avvenuto con successo',
  USER_NOT_FOUND: 'Utente non trovato',
  NOT_AUTHORIZED: "Non hai permesso per l'azione.",
  NOT_FOUND: 'Not found',
  NOT_FOUND_ID: (entity: string, id: string) => `Model ${entity} con id:${id} non trovato`,
  MAIL_SEND_ERROR: "Errore durante l'invio della mail. Riprovo esecuzione del checkForExpiration la mail tra 1 minuto",
  NOT_ALLOWED: 'you are not allowed to do this',
  MAINTAINER_EXISTS: 'maintainer already exists. search maintainer by email and add to your Building/Space',
  INVALID_ACCESS: 'Invalid access',
  INVALID_CREDENTIALS: 'Invalid credentials',
  NOT_IMPLEMENTED: 'Not implemented',
  PASSWORD_REQUIRED: 'Password is required',
  REGISTER_FIRST: 'Account must initialize first. Password or active is not set',
  AUTH_TOKEN_EXPIRED: 'Please contact your admin to get a new link. Your link has expired',
  ERRORS: {
    GENERIC: 'Something went wrong',
    INTERNAL_SERVER_ERROR: 'Internal server error'
  },
  RESPONSE: {
    NOT_FOUND: (req: RequestCustom) => NOTFOUND_HTML(req)
  }
};

export function NOTFOUND_HTML(req: RequestCustom) {
  return `
  <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="utf-8">
            <title>Error</title>
        </head>
        <body>
            <pre>Cannot ${req.method} ${req.originalUrl}</pre>
        </body>
        </html>
  `;
}
