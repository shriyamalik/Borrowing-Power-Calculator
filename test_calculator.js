/**
 * Borrowing Power Calculator Test Suite
 */

const assert = require('assert');

const { BorrowingPowerCalculator } = require('./borrowingCalculator');

const TEST_BASE_URL = 'http://localhost:3000';
const TEST_API_TOKEN = 'test-token';

describe('Borrowing Power Calculator Tests', () => {
  let calculator;
  let originalFetch;

  beforeEach(() => {
    calculator = new BorrowingPowerCalculator(
      TEST_BASE_URL,
      TEST_API_TOKEN
    );

    originalFetch = global.fetch;
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  // Tax API tests

  // Test 1
  it('should return correct tax for a given income', async () => {
    global.fetch = async () => ({
      ok: true,
      status: 200,
      json: async () => ({
        income: 120000,
        tax: 24000
      })
    })
    const tax = await calculator.getTax(120000);
    assert.strictEqual(tax, 24000);
  });

  // Test 2
  it('should send the correct request to the tax API', async () => {
    let requestedUrl;
    let requestedOptions;

    global.fetch = async (url, options) => {
      requestedUrl = url;
      requestedOptions = options;

      return {
        ok: true,
        status: 200,
        json: async () => ({
          income: 120000,
          tax: 24000
        })
      };
    };

    await calculator.getTax(120000);

    assert.strictEqual(
      requestedUrl,
      'http://localhost:3000/api/tax?income=120000'
    );

    assert.strictEqual(
      requestedOptions.headers.Authorization,
      'Bearer test-token'
    );
  });

  //test 3
  it('should return correct HEM for given income and dependents', async () => {
    global.fetch = async () => ({
      ok: true,
      status: 200,
      json: async () => ({
        income: 120000,
        dependents: 2,
        hem: 3100
      })
    });

    const hem = await calculator.getHEM(120000, 2);

    assert.strictEqual(hem, 3100);
  });

  //test 4
  it('should send the correct request to the HEM API', async () => {
    let requestedUrl;
    let requestedOptions;

    global.fetch = async (url, options) => {
      requestedUrl = url;
      requestedOptions = options;

      return {
        ok: true,
        status: 200,
        json: async () => ({
          income: 120000,
          dependents: 2,
          hem: 3100
        })
      };
    };

    await calculator.getHEM(120000, 2);

    assert.strictEqual(
      requestedUrl,
      'http://localhost:3000/api/hem?income=120000&dependents=2'
    );

    assert.strictEqual(
      requestedOptions.headers.Authorization,
      'Bearer test-token'
    );
  });

  //test 5
  it('should calculate borrowing power for values provided', async () => {
    calculator.getTax = async () => 24000;
    calculator.getHEM = async () => 3100;

    const result = await calculator.calculateBorrowingPower(
      120000,
      2,
      3000,
      10000
    );

    assert.ok(
      result.maxLoanAmount > 0,
      'Should yield a positive borrowing power amount'
    );

    assert.strictEqual(
      result.monthlyRepayment,
      4600
    );
  });

  //test 6
  it('should return zero borrowing power when repayment capacity is not positive', async () => {
    calculator.getTax = async () => 5000;
    calculator.getHEM = async () => 4000;

    const result = await calculator.calculateBorrowingPower(
      30000,
      3,
      4000,
      5000
    );

    assert.strictEqual(result.maxLoanAmount, 0);
    assert.strictEqual(result.monthlyRepayment, 0);
    assert.strictEqual(result.interestRate, 7);
  });

  //test 7
  it('should throw an error when the tax API request fails', async () => {
    global.fetch = async () => ({
      ok: false,
      status: 401
    });

    await assert.rejects(
      () => calculator.getTax(120000),
      /Failed to fetch tax: 401/
    );
  });
  it('should throw an error when the HEM API request fails', async () => {
    global.fetch = async () => ({
      ok: false,
      status: 400
    });

    await assert.rejects(
      () => calculator.getHEM(120000, 2),
      /Failed to fetch HEM: 400/
    );
  });

});
