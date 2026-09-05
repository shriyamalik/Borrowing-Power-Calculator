const readline = require('readline'); // readline was moved out of the function to the top of the file to avoid avoide redeclaring multiple times

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

                    // Change #6
                    //Performing the borrowing power calculation using the new class 
                    calculator.calculateBorrowingPower(
                        parseFloat(income),
                        parseInt(dependents),
                        parseFloat(expenses),
                        parseFloat(creditLimits)
                    )
                        // change #7
                        .then(result => {

                            console.log("\n--- Calculation Summary ---");
                            console.log(`Maximum Borrowing Power at ${result.interestRate}%: $${result.maxLoanAmount.toLocaleString()}`);
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
Change 1
This is where i tried to implement seperation of concerns 
i wanted to make the logic and user interface to be seperate to make sure the code is more maintainable and testable 
hence the new file by the name of intex.js for the user interaction

Change 2
I felt the seperation of concerns wansnt done well enough since some of the business/evaluation logic was being done in index.js

I felt, calculating the assessment rate(interest rate + assessment rate buffer) would better fit in borrowing Calculator so that is what I implemented next

I moved the calculation to the borrowing Calculator. One thing that showed up as a problem was that index.js no longer knew the interest rate that was being implemented. So, the 
*/