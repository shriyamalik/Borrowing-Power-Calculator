/**
 * Command-line interface for the Borrowing Power Calculator
 */

const readline = require('readline'); 

const {
    BorrowingPowerCalculator
} = require('./borrowingCalculator');

// API configuration and authentication token
const API_BASE_URL = 'http://localhost:3000';
const API_TOKEN = 'pat_abcdefghijklmnopqrstuvwxyz0123456789';

const calculator = new BorrowingPowerCalculator(
    API_BASE_URL,
    API_TOKEN
);

function runConsoleMode() {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

    console.log("Mortgage Borrowing Power Calculator");
    console.log("===================================");

    rl.question("Gross Annual Income: $", (income) => {
        rl.question("Number of Dependents: ", (dependents) => {
            rl.question("Declared Monthly Expenses: $", (expenses) => {
                rl.question("Total Credit Card Limits: $", (creditLimits) => {
                    calculator.calculateBorrowingPower(
                        parseFloat(income),
                        parseInt(dependents),
                        parseFloat(expenses),
                        parseFloat(creditLimits)
                    )
                        .then(result => {

                            console.log("\n--- Calculation Summary ---");
                            console.log(`Maximum Borrowing Power at ${result.interestRate}%: $${result.maxLoanAmount.toLocaleString()}`);
                            console.log(`Assumed Monthly Mortgage Repayment: $${result.monthlyRepayment.toLocaleString()} over 30 years`);

                            rl.close();
                        })
                        // Display API or calculation errors to the user
                        .catch(error => {
                            console.error("Error calculating borrowing power:", error.message);
                            rl.close();
                        });
                });
            });
        });
    });
}

runConsoleMode();