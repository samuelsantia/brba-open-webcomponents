export const JSON_TYPE = 'applicaiton/json';
export const TEXT_TYPE = 'text/';
export const URL_ENCODED_TYPE = 'application/x-www-form-urlencoded';

export const getContentTypeHeader = headers => headers.get('Content-Type');
