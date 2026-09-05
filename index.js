const readline = require('readline'); // readline was moved out of the function to the top of the file to avoid avoide redeclaring multiple times

const {
    BorrowingPowerCalculator
} = require('./borrowingCalculator');

// API configuration and authentication token
const API_BASE_URL = 'http://localhost:3000';
const API_TOKEN = 'pat_abcdefghijklmnopqrstuvwxyz0123456789';

const INTEREST_RATE = 7.0;
const ASSESSMENT_RATE_BUFFER = 3.0;

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

runConsoleMode();

/*
This is where i tried to implement seperation of concerns 
i wanted to make the logic and user interface to be seperate to make sure the code is more maintainable and testable 
hence the new file by the name of intex.js for the user interaction
*/