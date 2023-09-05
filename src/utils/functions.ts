import { Chance } from 'chance';
import { RequestCustom } from '../types/custom-express/express-custom';

const chance = new Chance();

/** @description not a pure function. returning the req.body, but the original object is modified by reference. */
export const deleteEmptyFields = function <T = any>(obj: any): T {
  // const objCopy = { ...obj };
  for (const key in obj) {
    if (Array.isArray(obj[key])) {
      // TODO: HERE ONLY ARRAY EXISTS BUT THIS ERROR.... had to make a assertion.
      const sameObj = obj;
      sameObj[key] = sameObj[key].filter((el: string) => el !== '');
    }
    if (!obj[key]) {
      delete obj[key];
    }
  }
  //todo: fix this
  return obj as unknown as T;
};
/**
 *
 * @description the difference between this and deleteEmptyFields is that this function will convert empty fields to undefined thus mongoose will delete field from original document.
 */
export const emptyFieldsToUndefined = function <T = any>(obj: any): T {
  // const objCopy = { ...obj };
  for (const key in obj) {
    if (Array.isArray(obj[key])) {
      const sameObj = obj;
      sameObj[key] = sameObj[key].filter((el: string) => el !== '');
    }
    if (!obj[key]) {
      obj[key] = undefined;
    }
  }
  //todo: fix this
  return obj as unknown as T;
};

// get /THISPART/of/url
const regex = /\//;
/** split the url by "/"  then get index 1 */

// export const getEntity = (url: string) => url.split(regex)[1];
// export const cutQuery = (url: string) => url.split(/\?/)[0];

export const pipe =
  <T>(...fns: Array<(fns: T) => T>) =>
  (value: T) =>
    fns.reduce((v, f) => f(v), value);

export const getFirstPath = (url: string) => url.split(regex)[1];
export const getSecondPath = (url: string) => url.split(regex)[2];
export const getThirdPath = (url: string) => url.split(regex)[3];

export const cutQuery = (url: string) => url.split(/\?/)[0];

interface GetEntityType {
  /**
   * @param url - as req.url
   * @returns string - entity name.
   * @description accepts argument -> req.url. : split by '/' get the first second string in array. then dispose string after '?' if there were query or not.
   * */
  (url: string): string;
}
export const getEntity: GetEntityType = pipe(getFirstPath, cutQuery);
/** pass req.originalUrl as argument */
// export const getEntityWithPaginationRoute: GetEntityType = pipe(getSecondPath, cutQuery);
/** if not calling at root route then pass req.original url. returns the /api/v1/returnString/...etc. */
export const getEntityFromOriginalUrl: GetEntityType = pipe(getThirdPath, cutQuery);

export const getSplittedPath = (url: string) => url.split(regex);

export const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

//  Returns necessary date object
const NEXT_WEEK = 7;
const TWO_WEEKS = 14;
export const getDatesObjects = (days = 0) => {
  // Se lo chiama con arg number, getFuterDate(2.custom ti da Date di 2 giorni dopo.
  const today = new Date();
  const nextWeek = new Date(today.getFullYear(), today.getMonth(), today.getDate() + NEXT_WEEK);
  const twoWeeksAhead = new Date(today.getFullYear(), today.getMonth(), today.getDate() + TWO_WEEKS);
  const custom = new Date(today.getFullYear(), today.getMonth(), today.getDate() + days);
  const todayFormatted = formatDate(today);
  return {
    nextWeek,
    twoWeeksAhead,
    custom,
    today,
    todayFormatted
  };
};
type TolocaleOptions = {
  weekToDay: Intl.DateTimeFormatOptions;
  detailedDate: Intl.DateTimeFormatOptions;
};

const options: TolocaleOptions = {
  weekToDay: {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  },
  detailedDate: {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }
};

export const formatDate = (date: Date): string => date.toLocaleString('it-IT', options.weekToDay);
export const detailedDate = (date: Date): string => date.toLocaleString('it-IT', options.detailedDate);
export const formatDateASCII = (date: Date) => {
  const year = date.toLocaleDateString('en-US', { year: 'numeric' });
  const month = date.toLocaleDateString('en-US', { month: '2-digit' });
  const day = date.toLocaleDateString('en-US', { day: '2-digit' });
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};

export const formatDateASCII2 = (date: Date) => {
  return replaceSpecialChars(date.toISOString().replace('T', ' ').substring(0, 19));
};

/**
 *
 * @param str - string to be replaced
 * @param replacer - default is empty string
 * @returns
 */
export const replaceSpaces = (str: string, replacer = '') => str.trim().replace(/\s+/g, replacer);

export const replaceHyphens = (str: string, replacer = '_') => str.replace(/-/g, replacer);

export const replaceSlash = (str: string, replacer = '_') => str.replace(/\//g, replacer);
// to under score
export const replaceSpecialChars = (str: string) => str.replace(/[^\w\s]/gi, '_').replace(/\s+/g, '_');
export const replaceSpecialCharsWith = (str: string, replacer: string) => {
  return str.replace(/[^\w\s-]/gi, replacer).replace(/\s+/g, replacer);
};

export function formatDateForFlights(date: Date) {
  let dateStr = date.toLocaleDateString('en-US', {
    weekday: 'short'
  });
  dateStr += `, ${date.toLocaleDateString('en-US', {
    day: 'numeric'
  })}`;
  dateStr += ` ${date.toLocaleDateString('en-US', {
    month: 'short'
  })}`;

  return dateStr;
}
export function formatDateAndTimev3(date: string | Date) {
  const dateObject = new Date(date);
  const dateStr = formatDateForFlights(dateObject);
  const year = dateObject.toLocaleDateString('en-US', {
    year: 'numeric'
  });
  const time = dateObject.toLocaleTimeString('en-US', {
    hour: '2-digit',
    hour12: false,
    minute: '2-digit'
  });
  return `${dateStr} ${time} ${year}`;
}

export function hasDuplicatesInArray(array: string[], compare: string) {
  return array.some((el) => el === compare);
  // return new Set(array).size !== array.length;
}

export function generateWord() {
  return chance.word();
}

// create 6 digit random number
export function generateNonceCode() {
  return chance.integer({ min: 100000, max: 999999 });
}

// generate  long random string by number of characters
export function generateRandomStringByLength(length: number) {
  return chance.string({ length });
}

export function chunkArray<T>(arr: T[], chunkSize: number): T[][] {
  const result = [];
  // increment by chunkSize, 1 => 100 => 200 => 300...
  for (let i = 0; i < arr.length; i += chunkSize) {
    result.push(arr.slice(i, i + chunkSize));
  }
  return result;
}

export const showBodyAsJson = (req: RequestCustom) => console.log(JSON.stringify(req.body, null, 2));

/** @returns {Date} 24h ahead from time of execution */
export const getJwtExpirationDate = () => new Date(Date.now() + 24 * 60 * 60 * 1000);
