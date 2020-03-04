import { expect } from '@open-wc/testing';

import * as types from '../src/content-types.js';
import { parseResponse, processResponse } from '../src/response-helpers.js';

describe('parseResponse', () => {
  it('should handle empty response returning original Response', async () => {
    const response = new Response(undefined, { status: types.EMPTY_CODES[0] });
    const actual = await parseResponse(response);
    const expected = response;

    expect(actual).to.equal(expected);
  });

  it('should handle json response', async () => {
    const body = '{ "foo": "bar" }';
    const response = new Response(body, {
      status: 200,
      headers: { 'Content-Type': `${types.JSON_TYPE}; charset=utf-8` },
    });
    const actual = await parseResponse(response);
    const expected = JSON.parse(body);

    expect(actual).to.eql(expected);
  });

  it('should handle text response', async () => {
    const body = 'Hello world';
    const response = new Response(body, {
      status: 200,
      headers: { 'Content-Type': `${types.TEXT_TYPE}plain; carset=utf-8` },
    });
    const actual = await parseResponse(response);
    const expected = body;

    expect(actual).to.equal(expected);
  });

  it('should handle other response returning original Response', async () => {
    const response = new Response('hello', {
      headers: { 'Content-Type': 'test' },
    });
    const actual = await parseResponse(response);
    const expected = response;

    expect(actual).to.equal(expected);
  });
});

describe('processResponse', () => {
  it('should throw error if response is ko', async () => {
    const response = new Response('fails', {
      status: 400,
      statusText: 'Force fail',
    });
    try {
      await processResponse(response);
    } catch (error) {
      expect(error).to.be.an.instanceof(Error);
      expect(error.message).to.equal(response.statusText);
      expect(error.status).to.equal(response.status);
      expect(error.response).to.equal(response);
    }
  });

  it('should parseResponse if response is ok', async () => {
    const body = 'success';
    const response = new Response(body, {
      status: 200,
      statusText: 'ok',
    });
    const actual = await processResponse(response);
    const expected = body;

    expect(actual).to.equal(expected);
  });
});
