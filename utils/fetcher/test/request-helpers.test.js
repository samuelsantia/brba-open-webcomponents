import { expect } from '@open-wc/testing';
import { stub, fake } from 'sinon';

import { JSON_TYPE, URL_ENCODED_TYPE } from '../src/content-types.js';
import {
  makeQS,
  getRequestFullURL,
  makeRequestHeaders,
  defaultBodyCompilers,
  compileBody,
  makeRequestOptions,
} from '../src/request-helpers.js';

describe('makeQS', () => {
  it('should return empty string if no params passed', () => {
    const actual = makeQS();
    const expected = '';

    expect(actual).to.equal(expected);
  });

  it('should return empty string if empty object passed', () => {
    const actual = makeQS({});
    const expected = '';

    expect(actual).to.equal(expected);
  });

  it('should create the query string from params', () => {
    const params = { foo: 'bar' };
    const actual = makeQS(params);
    const expected = '?foo=bar';

    expect(actual).to.equal(expected);
  });

  it('should encodeURIComponent value', () => {
    const params = { hello: 'hello World' };
    const actual = makeQS(params);
    const expected = `?hello=${encodeURIComponent(params.hello)}`;

    expect(actual).to.equal(expected);
  });

  it('should concatenate multiple params with "&"', () => {
    const params = { foo: 'bar', hello: 'hello World' };
    const actual = makeQS(params);
    const expected = `?foo=bar&hello=${encodeURIComponent(params.hello)}`;

    expect(actual).to.equal(expected);
  });
});

describe('getRequestFullURL', () => {
  const baseURL = 'https://my-api.com';
  const endpoint = '/test';
  const params = { foo: 'bar' };

  it('should return endpoint if no additional params passed', () => {
    const actual = getRequestFullURL(endpoint);
    const expected = endpoint;

    expect(actual).to.equal(expected);
  });

  it('should prepend baseURL if provided', () => {
    const actual = getRequestFullURL(endpoint, { baseURL });
    const expected = `${baseURL}${endpoint}`;

    expect(actual).to.equal(expected);
  });

  it('should append query string if params provided', () => {
    const actual = getRequestFullURL(endpoint, { params });
    const expected = `${endpoint}${makeQS(params)}`;

    expect(actual).to.equal(expected);
  });

  it('should create full URL with all params', () => {
    const actual = getRequestFullURL(endpoint, { params, baseURL });
    const expected = `${baseURL}${endpoint}${makeQS(params)}`;

    expect(actual).to.equal(expected);
  });
});

describe('makeRequestHeaders', () => {
  it('should return empty headers if no headers provided', () => {
    const actual = makeRequestHeaders();
    const expected = new Headers();

    expect(actual).to.eql(expected);
  });

  it('should return initialized Headers', () => {
    const headers = { hello: 'world' };
    const actual = makeRequestHeaders(headers);
    const expected = new Headers(headers);

    expect(actual).to.eql(expected);
  });
});

describe('defaultBodyCompilers', () => {
  it('shoulde exists and be an object', () => {
    expect(defaultBodyCompilers).to.be.an('object');
  });

  describe('#JSON_TYPE compiler', () => {
    const compiler = defaultBodyCompilers[JSON_TYPE];

    it('should be a function', () => {
      expect(compiler).to.be.a('function');
    });

    it('should JSON.stringify body', () => {
      const body = { hello: 'world' };
      const actual = compiler(body);
      const expected = JSON.stringify(body);

      expect(actual).to.equal(expected);
    });
  });

  describe('#URL_ENCODED compiler', () => {
    const compiler = defaultBodyCompilers[URL_ENCODED_TYPE];

    it('should be a function', () => {
      expect(compiler).to.be.a('function');
    });

    it('should compile body as query string', () => {
      const body = { foo: 'bar' };
      const actual = compiler(body);
      const expected = makeQS(body);

      expect(actual).to.equal(expected);
    });
  });
});

describe('compileBody', () => {
  const body = {};
  const makeHeaders = type => new Headers({ 'Content-Type': type });

  it('should use defaultCompilers if no passed', () => {
    const compiler = stub(defaultBodyCompilers, JSON_TYPE);

    compileBody({ body, headers: makeHeaders(JSON_TYPE) });

    expect(compiler).to.have.callCount(1);
    expect(compiler).to.have.calledWith(body);
  });

  it('should use passed compilers', () => {
    const compilers = { test: fake() };

    compileBody({ body, headers: makeHeaders('test'), compilers });

    expect(compilers.test).to.have.callCount(1);
    expect(compilers.test).to.have.calledWith(body);
  });

  it('should use identity function if no compiler found', () => {
    const compilers = {};
    const actual = compileBody({ body, headers: makeHeaders('noop'), compilers });
    const expected = body;

    expect(actual).to.equal(expected);
  });
});

describe('makeFetchOptions', () => {
  it('should return defaults options if no options provided', () => {
    const actual = makeRequestOptions();
    const expected = {
      method: 'GET',
      headers: new Headers({
        'Content-Type': JSON_TYPE,
      }),
    };

    expect(actual).to.eql(expected);
  });

  it('should override method if passed', () => {
    const { method: actual } = makeRequestOptions({ method: 'POST' });
    const expected = 'POST';

    expect(actual).to.equal(expected);
  });

  it('should override the Content-Type header if provided', () => {
    const { headers: actual } = makeRequestOptions({
      headers: {
        'Content-Type': 'text/plain',
      },
    });
    const expected = new Headers({ 'Content-Type': 'text/plain' });

    expect(actual).to.eql(expected);
  });

  it('should merge and create new Headers if provided', () => {
    const { headers: actual } = makeRequestOptions({ headers: { test: 'foo' } });
    const expected = new Headers({
      'Content-Type': JSON_TYPE,
      test: 'foo',
    });

    expect(actual).to.eql(expected);
  });

  it('should merge rest of options', () => {
    const options = { test: 'test' };
    const { test: actual } = makeRequestOptions(options);
    const { test: expected } = options;

    expect(actual).to.equal(expected);
  });

  it('should compile body if provided', () => {
    const compiler = fake.returns('test');
    const body = { test: 'test' };

    const { body: actual } = makeRequestOptions({ body, compilers: { [JSON_TYPE]: compiler } });
    const expected = 'test';

    expect(actual).to.equal(expected);
    expect(compiler).to.have.callCount(1);
    expect(compiler).to.have.calledWith(body);
  });

  it('should not include body if not provided', () => {
    const { body: actual } = makeRequestOptions();

    expect(actual).to.not.exist;
  });

  it('should remove compilers if passed', () => {
    const { compilers: actual } = makeRequestOptions({ compilers: {} });

    expect(actual).to.not.exist;
  });
});
