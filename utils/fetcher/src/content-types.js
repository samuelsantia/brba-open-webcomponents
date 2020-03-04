export const JSON_TYPE = 'applicaiton/json';
export const TEXT_TYPE = 'text/';
export const URL_ENCODED_TYPE = 'application/x-www-form-urlencoded';
export const EMPTY_CODES = [204];

/** string -> string -> boolean */
const startsWith = start => str => str.startsWith(start);

/** Headers -> string */
export const getContentTypeHeader = headers => headers.get('Content-Type');

/** string -> boolean */
export const isJSONType = startsWith(JSON_TYPE);
/** string -> boolean */
export const isTextType = startsWith(TEXT_TYPE);
