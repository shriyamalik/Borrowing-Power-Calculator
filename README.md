# Borrowing Power Calculator

This project is a simplified borrowing power calculator completed as part of the Ferocia Junior Software Engineer coding exercise.

The calculator estimates how much a user may be able to borrow based on their:

* gross annual income
* number of dependents
* declared monthly expenses
* total credit card limits

The original calculator already contained the main borrowing power calculation, but used placeholder values for Tax and HEM (Household Expenditure Measure).

The main goal of my implementation was to replace these placeholders with the provided API, improve the structure of the code, and expand the tests while keeping the original borrowing logic as intact as possible.

---

## Setup

### Requirements

* Node.js
* npm

Install the project dependencies:

```bash
npm install
```

---

## Running the Development API

The provided API needs to be running for the calculator to retrieve Tax and HEM values.

Start the API in a separate terminal:

```bash
npm run api
```

The API will run at:

```text
http://localhost:3000
```

It provides the following endpoints:

```text
GET /api/tax?income={income}
```

and:

```text
GET /api/hem?income={income}&dependents={dependents}
```

Both endpoints require the provided Bearer token in the `Authorization` header.

---

## Running the Calculator

With the API running, open another terminal and run:

```bash
npm start
```

The calculator will ask for:

* Gross Annual Income
* Number of Dependents
* Declared Monthly Expenses
* Total Credit Card Limits

For example:

```text
Mortgage Borrowing Power Calculator
===================================
Gross Annual Income: $120000
Number of Dependents: 2
Declared Monthly Expenses: $3000
Total Credit Card Limits: $10000
```

The output for these values is:

```text
--- Calculation Summary ---
Maximum Borrowing Power at 7%: $524,173.77
Assumed Monthly Mortgage Repayment: $4,600 over 30 years
```

---

## Running the Tests

Run the test suite using:

```bash
npm test
```

The tests use mocked API responses, so the development API does not need to be running when the unit tests are executed.

I also added `c8` to provide test coverage information for:

* statements
* branches
* functions
* lines

---

# How the Calculator Works

The calculator first retrieves the user's annual Tax and monthly HEM value from the supplied API.

Once those values have been returned, the main calculation works through the following steps.

### 1. Calculate net monthly income

Annual Tax is deducted from gross annual income and the remaining income is divided by 12.

```text
Net Monthly Income =
(Gross Annual Income - Annual Tax) / 12
```

### 2. Determine living expenses

The calculator compares:

* the user's declared monthly expenses
* the HEM baseline returned by the API

The higher value is used.

```text
Living Expenses =
max(Declared Expenses, HEM)
```

This means HEM acts as a minimum expense baseline in the calculation.

### 3. Calculate credit card liability

The calculator treats 3% of the user's total credit card limits as a monthly liability.

```text
Credit Card Liability =
Credit Limits × 3%
```

### 4. Calculate monthly repayment capacity

```text
Maximum Monthly Repayment =
Net Monthly Income
- Living Expenses
- Credit Card Liability
```

If this value is zero or negative, the calculator returns zero borrowing power.

### 5. Calculate the assessment rate

The simplified calculator uses:

```text
Base Interest Rate:       7%
Assessment Rate Buffer:   3%
Assessment Rate:         10%
```

The assessment rate is used when calculating borrowing power.

### 6. Calculate maximum borrowing power

The monthly repayment capacity is converted into a maximum loan amount using the existing mortgage calculation:

```text
P = M × (1 - (1 + R)^-N) / R
```

Where:

```text
P = Maximum loan amount
M = Maximum monthly repayment
R = Monthly assessment interest rate
N = Number of monthly repayments
```

The loan term is fixed at:

```text
360 months / 30 years
```

---

# Project Structure

## `borrowingCalculator.js`

Contains the `BorrowingPowerCalculator` class and the main borrowing calculation.

It is responsible for:

* retrieving Tax
* retrieving HEM
* handling unsuccessful API responses
* determining living expenses
* calculating credit card liability
* calculating repayment capacity
* applying the interest rate and assessment buffer
* calculating borrowing power

## `index.js`

Contains the command-line user interaction.

It is responsible for:

* collecting user input
* converting input into numbers
* calling `BorrowingPowerCalculator`
* displaying the result
* displaying top-level calculation errors

## `test_calculator.js`

Contains the unit tests for:

* Tax API response handling
* Tax request construction
* HEM API response handling
* HEM request construction
* borrowing power calculation
* zero repayment capacity
* unsuccessful Tax API responses
* unsuccessful HEM API responses

## `server.js`

The provided development API used to retrieve Tax and HEM values.

## `server.md`

Documentation for the provided development API.

---

# Development Approach and Changes

I worked on the assignment in steps rather than changing everything at once. I wanted to make sure I understood what each change was doing and why it was needed before moving on to the next part.

## Borrowing Calculator Changes

The first main change I made was creating a `BorrowingPowerCalculator` class.

Originally, the code had separate functions for Tax, HEM and borrowing power. I felt grouping them into one class would give the code better structure and make it easier to manage and extend later.

I added a constructor that takes the API base URL and token. This allows the calculator to use those values when making requests to `server.js`.

The next change was replacing the placeholder `getTax()` and `getHEM()` functions with API calls. Instead of calculating fake values locally, these functions now request the actual Tax and HEM values from the provided API.

Because API calls do not return immediately, `getTax()` and `getHEM()` had to become asynchronous functions.

This also meant `calculateBorrowingPower()` needed to become asynchronous so it could wait for both values before continuing with the calculation.

The main borrowing logic itself was kept the same. I did not want to unnecessarily change working calculation logic when the main requirement was to replace Tax and HEM with API values.

At first, I kept the existing `runConsoleMode()` structure and handled the Promise returned by `calculateBorrowingPower()` using `.then()` and `.catch()`.

I could also have made the callback itself `async` and used `await`, but that would have changed more of the existing callback structure. At that stage I wanted to keep the change smaller, so I used `.then()`.

---

## Test Changes

The original code was mainly testing two outcomes:

* a normal borrowing result
* a zero borrowing result

Once Tax and HEM started coming from APIs, I felt the responsibilities we needed to test had expanded as well.

The main questions I wanted to answer were:

* Is `getTax()` returning the correct Tax value?
* Is the correct Tax request being sent?
* Is `getHEM()` returning the correct HEM value?
* Is the correct HEM request being sent?
* Is the borrowing calculation still working correctly?
* Does the calculator correctly return zero when repayment capacity is not positive?
* What happens when the Tax or HEM API returns an unsuccessful response?

For the first Tax test, I followed the Arrange/Act/Assert structure.

* **Arrange:** income `120000` and a mocked Tax value of `24000`
* **Act:** call `getTax(120000)`
* **Assert:** confirm the returned Tax value is `24000`

The next Tax test checks whether the correct request is actually being sent. I wanted to make sure the correct URL and authentication header were both included.

I then followed the same pattern for HEM. It required both income and dependents.

For the borrowing calculation test, I mocked:

```js
calculator.getTax = async () => 24000;
calculator.getHEM = async () => 3100;
```

This allowed me to focus only on whether the borrowing calculation itself was working, rather than testing the API behaviour again at the same time.

I also included a test for the case where repayment capacity is zero or negative, since the calculator has a separate early-return path for this.

Finally, I added tests for unsuccessful Tax and HEM responses to ensure the code throws an error rather than continuing with missing or invalid values.

---

## Separation of Concerns

After the first implementation was working, I felt the separation of concerns was still not good enough because `borrowingCalculator.js` was handling both calculation logic and user interaction.

I created a new `index.js` file for the user interaction.

The goal was to keep:

* user input
* input conversion
* output
* top-level error handling

inside `index.js`, while keeping the actual borrowing logic inside `borrowingCalculator.js`.

After making that split, I noticed another issue.

The assessment rate was still being calculated in `index.js` using:

```text
interest rate + assessment rate buffer
```

I felt this was business/calculation logic rather than user-interface logic, so I moved that calculation back into `borrowingCalculator.js`.

This also meant `index.js` no longer directly knew the interest rate being used. I still felt the interest rate was important information to display, so I returned the applied base interest rate as part of the calculation result.

This kept the separation cleaner because the calculator still owns the borrowing rules, while `index.js` only displays the values it receives.

The final separation is roughly:

```text
index.js
    ↓
collect user input
    ↓
convert input
    ↓
call BorrowingPowerCalculator
    ↓
display returned result


borrowingCalculator.js
    ↓
retrieve Tax and HEM
    ↓
apply borrowing rules
    ↓
calculate repayment capacity
    ↓
calculate maximum loan
    ↓
return result
```

---

## Coverage

I added `c8` to measure test coverage.

The coverage report showed that most of the uncovered lines were part of the interactive console code rather than the borrowing calculation itself.

This helped confirm that separating the CLI into `index.js` was useful because it allowed the calculator logic to be tested independently instead of adding complicated tests just to exercise terminal interaction.

My goal with the tests was not only to increase the coverage percentage but also to ensure each test checked a meaningful behaviour.

---

# Design Decisions and Trade-offs

## Using a Class

I chose a class because Tax retrieval, HEM retrieval and the borrowing calculation all belong to the same calculator responsibility.

The assignment also mentioned that the calculator may need to be extended later, and I felt the class provided a clear place for those future changes.

I did not want to add multiple extra service classes when there were only two small API integrations.

If the application became significantly larger, separating API communication into its own service would be something I would consider.

## Keeping the Existing Borrowing Logic

I intentionally kept the main borrowing logic as close as possible to the original implementation.

The requirement was mainly to replace the Tax and HEM placeholders and make the calculator more manageable.

I did not want to rewrite existing working calculation logic without a reason.

## Mocking API Calls in Tests

I chose to mock the API calls for the unit tests rather than requiring `server.js` to be running.

This makes the tests:

* faster
* predictable
* independent of the local server
* focused on the behaviour of the calculator

For the borrowing calculation tests, I mocked `getTax()` and `getHEM()` directly because those methods already had their own API tests.

This meant the calculation tests could focus specifically on the calculation logic.

## Error Handling

If the Tax or HEM API returns an unsuccessful response, the calculator throws an error.

I preferred this to using a fallback value because using an incorrect Tax or HEM value could produce a borrowing power result that looks valid even though the required data was unavailable.

The top-level command-line interface catches these errors and displays them to the user.

---

# Assumptions

The following assumptions are used by this simplified calculator:

* Tax values are retrieved from the provided Tax API.
* HEM values are retrieved from the provided HEM API.
* HEM and declared expenses represent monthly expenses.
* The higher of HEM and declared expenses is used.
* Credit card liability is estimated as 3% of total credit card limits.
* The base interest rate is 7%.
* A 3% assessment buffer is applied.
* Borrowing capacity is therefore assessed at 10%.
* The loan term is fixed at 30 years / 360 months.
* If monthly repayment capacity is zero or negative, borrowing power is zero.
* The Bendigo Bank borrowing power calculator can be used as a reasonableness check, but exact values may differ because this exercise uses a simplified calculation model.

---

# Possible Improvements

There are a few improvements I would consider if the project became larger or I had more time.

### Configuration

The API URL, token, interest rate and assessment buffer could be moved into configuration or environment variables instead of being stored directly in the source code.

### Input Validation

The command-line input could be validated before beginning the calculation.

For example:

* negative income
* negative expenses
* invalid numbers
* missing values

could be caught before making an API request.

### API Layer

If more API endpoints were added, I would consider separating API communication from `BorrowingPowerCalculator` into its own service.

For the current scope, I felt introducing another abstraction for only two small requests would add unnecessary complexity.

### Integration Testing

The current unit tests mock API behaviour.

An additional integration test could run against the real development API to confirm that the calculator and supplied server work together correctly.

### Configurable Lending Rules

The interest rate, assessment buffer, loan term and credit card liability percentage are currently fixed assumptions.

If these values needed to change regularly, I would make them configurable rather than editing the calculator code directly.

### Different Interfaces

Because the command-line interaction is now separated from `BorrowingPowerCalculator`, another interface such as a web application could use the same calculator logic without reproducing the borrowing rules.
