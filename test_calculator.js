/**
 * Borrowing Power Calculator Test Suite
 */

const assert = require('assert');

//change 1
const { BorrowingPowerCalculator } = require('./borrowingCalculator');

const TEST_BASE_URL = 'https://localhost:3000';
const TEST_API_TOKEN = 'test-token';

describe('Borrowing Power Calculator Tests', () => {
  let calculator;
  beforeEach(() => {
    calculator = new BorrowingPowerCalculator(
      TEST_BASE_URL,
      TEST_API_TOKEN
    );
  });

  // change 2
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
the 2nd important test is checking if correct request is being sent

*/