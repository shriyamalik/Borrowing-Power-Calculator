/**
 * Borrowing Power Calculator
 * 
 * Gen's incomplete prototype. 
 * This currently calculates what a user can borrow over 30 years.
 * Currently this code uses placeholder methods for Tax and HEM values. 
 * 
 * TODO: Refactor the code to pull Tax and HEM values from an API call.
 * A server.js has been provided to supply these values.
 */

// Global constant for mortgage simulation
const LOAN_TERM_MONTHS = 360; // 30 Years
const INTEREST_RATE = 7.0; // 7.0% baseline interest rate
const ASSESSMENT_RATE_BUFFER = 3.0; // 3.0% buffer added to interest rates

// API configuration and authentication token
const API_BASE_URL = 'http://localhost:3000';
const API_TOKEN = 'pat_abcdefghijklmnopqrstuvwxyz0123456789';

class BorrowingPowerCalculator {

    constructor(baseUrl, token) {
        this.baseUrl = baseUrl;
        this.token = token;
    }

    // code to fetch tax amount from the API
    async getTax(income) {
        // Fetch amount
        const response = await fetch(`${this.baseUrl}/api/tax?income=${income}`, {
            headers: { 'Authorization': `Bearer ${this.token}` }
        });
        //error check
        if (!response.ok) {
            throw new Error(`Failed to fetch tax: ${response.status}`);
        }
        // return tax amount
        const data = await response.json();
        return data.tax;
    }

    async getHEM(income, dependents) {
        // Fetch amount
        const response = await fetch(
            `${this.baseUrl}/hem?income=${income}&dependents=${dependents}`,
            {
                headers: { 'Authorization': `Bearer ${this.token}` }
            }
        );
        //error check
        if (!response.ok) {
            // return message if API call fails
            throw new Error(`Failed to fetch HEM: ${response.status}`);
        }
        // return HEM amount
        const data = await response.json();
        return data.hem;
    }

    /**
     * Calculates the total borrowing power amount and the monthly repayment configuration
     */
    async calculateBorrowingPower(income, dependents, expenses, creditLimits, annualAssessmentRate) {
        // 1. Calculate Net Monthly Income after tax deductions
        const annualTax = await this.getTax(income);
        const netMonthlyIncome = (income - annualTax) / 12;

        // 2. Determine living expenses (User declared expenses vs HEM baseline, whichever is higher)
        const baselineHEM = await this.getHEM(income, dependents);
        const totalLivingExpenses = Math.max(expenses, baselineHEM);

        // 3. Calculate credit card liability (~3% of total limits)
        const creditCardLiability = creditLimits * 0.03;

        // 4. Calculate monthly repayment capacity
        const maxMonthlyRepayment = netMonthlyIncome - totalLivingExpenses - creditCardLiability;

        // Return early if user cannot afford a loan at all
        if (maxMonthlyRepayment <= 0) {
            return { maxLoanAmount: 0, monthlyRepayment: 0 };
        }

        // 5. Calculate the monthly interest rate
        const monthlyRate = (annualAssessmentRate / 100) / 12;

        // 6. Calculate maximum borrowing power using the following formula:
        // P = M * (1 - (1 + R)^-N) / R
        const maxLoanAmount = maxMonthlyRepayment * ((1 - Math.pow(1 + monthlyRate, - LOAN_TERM_MONTHS)) / monthlyRate);

        return {
            maxLoanAmount: Number(maxLoanAmount.toFixed(2)),
            monthlyRepayment: Number(maxMonthlyRepayment.toFixed(2))
        };
    }

}

const calculator = new BorrowingPowerCalculator(API_BASE_URL, API_TOKEN);


function runConsoleMode() {
    const readline = require('readline');
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

    console.log("Mortgage Borrowing Power Calculator");
    console.log("===================================");

    rl.question("Gross Annual Income: $", (income) => {
        rl.question("Number of Dependents: ", (dependents) => {
            rl.question("Declared Monthly Expenses: $", (expenses) => {
                rl.question("Total Credit Card Limits: $", (creditLimits) => {

                    // Banks assess loans using base rate + buffer for safety
                    const assessmentRate = INTEREST_RATE + ASSESSMENT_RATE_BUFFER;

                    // Change #6
                    //Performing the borrowing power calculation using the new class 
                    calculator.calculateBorrowingPower(
                        parseFloat(income),
                        parseInt(dependents),
                        parseFloat(expenses),
                        parseFloat(creditLimits),
                        assessmentRate
                    )
                        // change #7
                        .then(result => {

                            console.log("\n--- Calculation Summary ---");
                            console.log(`Maximum Borrowing Power at ${INTEREST_RATE}%: $${result.maxLoanAmount.toLocaleString()}`);
                            console.log(`Assumed Monthly Mortgage Repayment: $${result.monthlyRepayment.toLocaleString()} over 30 years`);

                            rl.close();
                        })
                        // throw error if calculation fails
                        .catch(error => {
                            console.error("Error calculating borrowing power:", error.message);
                            rl.close();
                        });
                });
            });
        });
    });
}

if (require.main === module) {
    runConsoleMode();
}

module.exports = { BorrowingPowerCalculator };

/*
// Notes on changes being made

1. we have made a new class called BorrowingPowerCalculator that contains the functions to calculate taxm HEM and borrrowing power. this is because we want better formatting ans structure to the code

2. we made a constructor for the class to take url and token. this allows us to make api calls to the server.js

3. the getTax() and getHEM() functions have been refactored to allow for API calls to fetch the Tax and HEM values instead of using the placeholder values.

4. calculateBorrowingPower() was mde to be an async function to wait for api calls to complete before proceeding with the calacultions.

5. All the borrowing logic was kept the same 

6. runConsoleMode() was kept the same, but now it will use the new BorrowingPowerCalculator class to perform the calculations.

7. we make the use of .then() because the rl.question is not an async function, so await can not be used inside it. we can use '.then()' to handle the promise returned by the async function and then calculate the result once the promise has been resolved. i could have async but it would have changed the ret of the code structure. so for this section i kept is .then() rather than async 
*/