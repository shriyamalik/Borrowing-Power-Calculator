/**
 * Borrowing Power Calculator Test Suite
 */

const assert = require('assert');

//change 1
const { BorrowingPowerCalculator } = require('./borrowingCalculator');

const TEST_BASE_URL = 'http://localhost:3000';
const TEST_API_TOKEN = 'test-token';

describe('Borrowing Power Calculator Tests', () => {
  let calculator;
  beforeEach(() => {
    calculator = new BorrowingPowerCalculator(
      TEST_BASE_URL,
      TEST_API_TOKEN
    );
  });

  // Test 1 : correct tax value returned for a given income
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
    // test 1 correct tax value returned
    assert.strictEqual(tax, 24000);
  });

  // Test 2 : correct request sent for getTax
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

  //test 3 : correct HEM value returned for a given income and dependents
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

  //test 4 : correct request sent for getHEM
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

  //test 5 : calculateBorrowingPower returns correct borrowing power and monthly repayment configuration
  it('should calculate borrowing power for values provided', async () => {
    calculator.getTax = async () => 24000;
    calculator.getHEM = async () => 3100;

    const result = await calculator.calculateBorrowingPower(
      120000,
      2,
      3000,
      10000,
      10
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

  //test 6: value returned is zero when capcity to repay is not enough
  it('should return zero borrowing power when repayment capacity is not positive', async () => {
    calculator.getTax = async () => 5000;
    calculator.getHEM = async () => 4000;

    const result = await calculator.calculateBorrowingPower(
      30000,
      3,
      4000,
      5000,
      10
    );

    assert.strictEqual(result.maxLoanAmount, 0);
    assert.strictEqual(result.monthlyRepayment, 0);
  });

});


//changes we have made

/*
1. updated the import calculateBorrowingPower with the new class BorrowingPowerCalculator
2. added the test api

Our code responsibilities changed here previously the code was just tesing for 2 outcomes normal result and zero borrowing result
now becuase we have API values coming for tax and HEM, the responsibilities we have to cover have expanded.
I wanted to make sure the tax api is working correctly and HEM api is working well

Test 1:
so the main thing i wanted to evaluate is if the getTax recieves an income does it return the correct tac value
this is where i built the first case - 
arrange- income 120000  & tax= 24000
act - behaviour being tested- getTax returns the correct tax value for a given income
assert- result that should be true- tax value returned is 24000

Test 2:
the 2nd important test is checking if correct request is being sent for getTax
Arrange- let requestedUrl;
        let requestedOptions;
Act- await calculator.getTax(120000);
Assert- requestedUrl should be 'http://localhost:3000/api/tax?income=120000'
authentication header should be 'Bearer test-token

Test 3:
the 3rd important test is checking if correct HEM value is returned for a given income and dependents
Arrange- income 120000, dependents 2, hem=3100
Act- await calculator.getHEM(120000, 2);
Assert- hem value returned is 3100

Test 4: is correct HEM request being sent
arrange- let requestedUrl;
        let requestedOptions;
Act- await calculator.getHEM(120000, 2);
Assert- requestedUrl should be 'http://localhost:3000/api/hem?income=120000&dependents=2'
authentication header should be 'Bearer test-token'

Test 5: this test us used to check if our code is calculating the borrowing power correctly for the values provided

arrange- calculator.getTax = async () => 24000;
        calculator.getHEM = async () => 3100;
Act- const result = await calculator.calculateBorrowingPower
assert- result.maxLoanAmount > 0,
        result.monthlyRepayment should be 4600

Test 6: this test check for the case where income is low and borrowing power is zero. the borrowing power calcultor has a return value zero in this case and we want to make sure that behaviour is correctly implemented.

*/