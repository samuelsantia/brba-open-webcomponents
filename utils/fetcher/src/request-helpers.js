import {
  defaultTo,
  toPairs,
  reduce,
  slice,
  propOr,
  identity,
  compose,
  evolve,
  converge,
  assoc,
  mergeDeepRight,
  propSatisfies,
  unless,
  isNil,
  omit,
} from 'ramda';
import { JSON_TYPE, URL_ENCODED_TYPE, getContentTypeHeader } from './content-types.js';

const defaultRequestHeaders = {
  'Content-Type': JSON_TYPE,
};

/**
 * returns the object keyed function or the identity function
 * @sig string -> Object -> function
 */
const propOrIdentity = propOr(identity);

/**
 * Generates the query string from keyed values
 *
 * @sig Object -> String
 * @param {Object.<string, string|number>} [params={}] - key values params
 * @returns {String} encoded query string
 * @example
 *    makeQS({ foo: 'bar' }) //=> ?foo=bar
 *    makeQS({ foo: 'bar', hello: 'Hello World' }) //=> ?foo=bar&hello=Hello%20World
 */
export const makeQS = compose(
  slice(0, -1),
  reduce((qs, [key, value]) => `${qs}${key}=${encodeURIComponent(value)}&`, '?'),
  toPairs,
  defaultTo({}),
);

/**
 * Creates request full url with base, endpoint and query string params
 *
 * @sig (String, Object) -> String
 * @param {String} endpoint - request endpoint
 * @param {{ baseURL: string, params: Object.<string, string|number> }} [options]
 *  - request baseURL and query string params
 * @returns {String} request full url
 */
export const getRequestFullURL = (endpoint, { baseURL = '', params = {} } = {}) =>
  `${baseURL}${endpoint}${makeQS(params)}`;

/**
 * converts plain object headers to request Headers
 *
 * @sig object -> Headers
 * @param {Object.<string, string>} headers - plain object headers
 * @returns {Headers} transformed Headers
 */
export const makeRequestHeaders = headers => new Headers(headers);

/**
 * Body compiler function
 *
 * @typedef {function} bodyCompiler
 * @param {*} body - body to compile
 * @return {*} compiled body
 */
/**
 * Object with default body compilers
 * @type {Object.<string, bodyCompiler>}
 */
export const defaultBodyCompilers = {
  [JSON_TYPE]: JSON.stringify,
  [URL_ENCODED_TYPE]: makeQS,
};

/**
 * Compiles the body from compiler option content type header
 *
 * @param {Object} options - request parsed options
 * @param {*} body - request body to compile
 * @param {Headers} options.headers - request headers
 * @param {Object.<string, bodyCompiler>} [compilers=defaultBodyCompilers]
 *  keyed object with compilers by content type
 * @return {bodyCompiler} function to compile body
 */
export const compileBody = ({ body, headers, compilers = defaultBodyCompilers }) =>
  propOrIdentity(getContentTypeHeader(headers), compilers)(body);

/**
 * compile request options using defaults
 *
 * @param {Object} [options]
 * @param {string} [options.method="GET"] request method
 * @param {Object.<string, string>} [options.headers=defaultRequestHeaders] request headers
 * @param {*} [options.body] request body
 * @param {Object.<string, bodyCompiler>} [options.compilers] body compilers
 * @param {...*} [options...rest] rest parameters to pass to request
 * @returns {Object} with compiled request options
 * @see {@link https://developer.mozilla.org/es/docs/Web/API/Request|Request} for more options to pass
 */
export const makeRequestOptions = compose(
  omit(['compilers']),
  unless(propSatisfies(isNil, 'body'), converge(assoc('body'), [compileBody, identity])),
  evolve({
    headers: makeRequestHeaders,
  }),
  mergeDeepRight({
    method: 'GET',
    headers: defaultRequestHeaders,
  }),
  defaultTo({}),
);
