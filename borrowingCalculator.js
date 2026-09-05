/**
 * Borrowing Power Calculator
 *
 * Calculates a user's borrowing power over a 30-year loan term.
 * Tax and HEM values are retrieved from the provided development API.
 */

// Borrowing assumptions used by the simplified calculator
const LOAN_TERM_MONTHS = 360; // 30 Years
const INTEREST_RATE = 7.0; // 7.0% baseline interest rate
const ASSESSMENT_RATE_BUFFER = 3.0; // 3.0% buffer added to interest rates

class BorrowingPowerCalculator {

    constructor(baseUrl, token) {
        this.baseUrl = baseUrl;
        this.token = token;
    }

    // fetch tax amount from the API
    async getTax(income) {
        const response = await fetch(`${this.baseUrl}/api/tax?income=${income}`, {
            headers: { 'Authorization': `Bearer ${this.token}` }
        });
        // Stop the calculation if the API response is unsuccessful
        if (!response.ok) {
            throw new Error(`Failed to fetch tax: ${response.status}`);
        }
        const data = await response.json();
        return data.tax;
    }

    // Retrieve the monthly HEM baseline for the given income and dependents
    async getHEM(income, dependents) {
        const response = await fetch(
            `${this.baseUrl}/api/hem?income=${income}&dependents=${dependents}`,
            {
                headers: { 'Authorization': `Bearer ${this.token}` }
            }
        );
        if (!response.ok) {
            throw new Error(`Failed to fetch HEM: ${response.status}`);
        }

        const data = await response.json();
        return data.hem;
    }

        /**
     * Calculates maximum borrowing power and monthly repayment capacity.
     */
    async calculateBorrowingPower(income, dependents, expenses, creditLimits) {
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
            return { maxLoanAmount: 0, monthlyRepayment: 0, interestRate: INTEREST_RATE};
        }

        // 5. Apply the base interest rate plus the assessment buffer
        const annualAssessmentRate = INTEREST_RATE + ASSESSMENT_RATE_BUFFER;

        // 6. Calculate the monthly interest rate
        const monthlyRate = (annualAssessmentRate / 100) / 12;

        // 7. Calculate maximum borrowing power using the following formula:
        // P = M * (1 - (1 + R)^-N) / R
        const maxLoanAmount = maxMonthlyRepayment * ((1 - Math.pow(1 + monthlyRate, - LOAN_TERM_MONTHS)) / monthlyRate);

        return {
            maxLoanAmount: Number(maxLoanAmount.toFixed(2)),
            monthlyRepayment: Number(maxMonthlyRepayment.toFixed(2)),
            interestRate: INTEREST_RATE
        };
    }

}

module.exports = { BorrowingPowerCalculator };