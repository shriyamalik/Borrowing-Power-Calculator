/**
 * Borrowing Power Calculator Test Suite
 */

const assert = require('assert'); 
//change 1
const {BorrowingPowerCalculator} = require('./borrowingCalculator');

const TEST_Base_URL = 'https://localhost:3000';
const TEST_API_TOKEN = 'test-token';

describe('Term Deposit Calculator Tests', () => {
  let calculator;

  // change 2
  it ('should return correct tax for a given income', async () => {
    global.fetch = async () => ({
      ok: true,
      status: 200,
      json: async () => ({ 
        income: 120000,
        tax: 24000
      })
    })
    const tax= await calculator.getTax(120000);
    assert.strictEqual(tax, 24000);
  });

  it('should calculate borrowing power for standard values', () => {
    const result = calculateBorrowingPower(120000, 2, 3000, 10000, 7.5);
    assert.ok(result.maxLoanAmount > 0, 'Should yield a positive borrowing power amount');
    assert.strictEqual(result.monthlyRepayment, 4200);
  });

  it('should return 0 for invalid negative inputs', () => {
    const result = calculateBorrowingPower(30000, 3, 4000, 5000, 7.5);
    assert.strictEqual(result.maxLoanAmount, 0);
    assert.strictEqual(result.monthlyRepayment, 0);
  });

});

//changes we have made

1. updated the import calculateBorrowingPower with the new class BorrowingPowerCalculator
2. added the test api

Our code responsibilities changed here previously the code was just tesing for 2 outcomes normal result and zero borrowing result
now becuase we have API values coming for tax and HEM, the responsibilities we have to cover have expanded.
I wanted to make sure the tax api is working correctly and HEM api is working well

so the main thing i wanted to evaluate is if the getTax recieves an income does it return the correct tac value
this is where i built the first case - 
arrange- income 120000  & tax= 24000
act - behaviour being tested- getTax returns the correct tax value for a given income
assert- result that should be true- tax value returned is 24000
