import { T, not, prop, cond, identity, compose, flip, includes, ifElse } from 'ramda';

import { EMPTY_CODES, isJSONType, isTextType, getContentTypeHeader } from './content-types.js';

/** Response -> boolean */
const isKo = compose(not, prop('ok'));
/** string -> boolean */
const isEmptyCode = flip(includes)(EMPTY_CODES);
/** Response -> boolean */
const isEmptyResponse = compose(isEmptyCode, prop('status'));

/** (string -> boolean) -> (Response -> string) -> boolean */
const makeIsResponseType = typePred => compose(typePred, getContentTypeHeader, prop('headers'));
/** Response -> boolean */
const isResponseJSON = makeIsResponseType(isJSONType);
/** Response -> boolean */
const isResponseText = makeIsResponseType(isTextType);

/** Response -> Promise<Object> */
const toJSON = response => response.json();
/** Response -> Promise<String> */
const toText = response => response.text();

// TODO: create custom errors to handle different types
/**
 * error thrower when response is Ko
 *
 * @param {Response} response - Original response
 * @throws {Error} error with response attached
 */
function throwKo(response) {
  const error = new Error(response.statusText);
  error.status = response.status;
  error.response = response;

  throw error;
}

// TODO: add more parser (arraybuffer, blob, formData) by content types
/**
 * parse response by content type header
 * if is empty content or has not type parser
 * returns original response to handle in fetch promise
 *
 * @sig Response -> Promise<*>|Response
 * @param {Response} response to parse
 * @return {Promise<*>|Response} parsed or original response
 */
export const parseResponse = cond([
  [isEmptyResponse, identity],
  [isResponseJSON, toJSON],
  [isResponseText, toText],
  [T, identity],
]);

/**
 * process response if is ko throws an error
 * otherwise returns parsed response
 *
 * @param {Response} response process
 * @return {Promise<*>|Response} parsed or original response
 */
export const processResponse = ifElse(isKo, throwKo, parseResponse);
