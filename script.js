/* ==========================================
   1. SELECT HTML ELEMENTS
========================================== */

// Select the mortgage form
const mortgageForm = document.querySelector("#mortgage-form");

// Select input fields
const mortgageAmount = document.querySelector("#mortgage-amount");
const mortgageTerm = document.querySelector("#mortgage-term");
const interestRate = document.querySelector("#interest-rate");

// Select mortgage type radio buttons
const mortgageTypes = document.querySelectorAll(
    'input[name="mortgageType"]'
);

// Select buttons
const clearButton = document.querySelector("#clear-all");

// Select result sections
const emptyState = document.querySelector("#empty-state");
const resultsState = document.querySelector("#results-state");

// Select result elements
const monthlyResult = document.querySelector("#monthly-result");
const totalResult = document.querySelector("#total-result");

// Select error messages
const amountError = document.querySelector("#amount-error");
const termError = document.querySelector("#term-error");
const rateError = document.querySelector("#rate-error");
const typeError = document.querySelector("#type-error");


/* ==========================================
   2. FORMAT CURRENCY
========================================== */

// Format numbers into British pounds
const currencyFormatter = new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
});

function formatCurrency(amount) {
    return currencyFormatter.format(amount);
}


/* ==========================================
   3. SHOW AND HIDE ERRORS
========================================== */

// Show an error message
function showError(input, errorElement, message) {

    errorElement.textContent = message;
    errorElement.classList.add("show");

    const inputWrapper = input.closest(".input-wrapper");

    if (inputWrapper) {
        inputWrapper.classList.add("error");
    }

    if (input) {
        input.setAttribute("aria-invalid", "true");
    }
}


// Hide an error message
function hideError(input, errorElement) {

    errorElement.classList.remove("show");

    const inputWrapper = input.closest(".input-wrapper");

    if (inputWrapper) {
        inputWrapper.classList.remove("error");
    }

    input.removeAttribute("aria-invalid");
}


/* ==========================================
   4. VALIDATE INPUT FIELDS
========================================== */

function validateForm() {

    let isValid = true;

    // Get input values
    const amount = Number(mortgageAmount.value);
    const term = Number(mortgageTerm.value);
    const rate = Number(interestRate.value);

    // Validate mortgage amount
    if (
        mortgageAmount.value.trim() === "" ||
        !Number.isFinite(amount) ||
        amount <= 0
    ) {

        showError(
            mortgageAmount,
            amountError,
            "Please enter a valid mortgage amount."
        );

        isValid = false;

    } else {

        hideError(mortgageAmount, amountError);

    }


    // Validate mortgage term
    if (
        mortgageTerm.value.trim() === "" ||
        !Number.isFinite(term) ||
        !Number.isInteger(term) ||
        term <= 0
    ) {

        showError(
            mortgageTerm,
            termError,
            "Please enter a valid mortgage term in years."
        );

        isValid = false;

    } else {

        hideError(mortgageTerm, termError);

    }


    // Validate interest rate
    if (
        interestRate.value.trim() === "" ||
        !Number.isFinite(rate) ||
        rate < 0
    ) {

        showError(
            interestRate,
            rateError,
            "Please enter a valid interest rate."
        );

        isValid = false;

    } else {

        hideError(interestRate, rateError);

    }


    // Validate mortgage type
    const selectedType = document.querySelector(
        'input[name="mortgageType"]:checked'
    );

    if (!selectedType) {

        typeError.classList.add("show");
        isValid = false;

    } else {

        typeError.classList.remove("show");

    }

    return isValid;
}


/* ==========================================
   5. CALCULATE REPAYMENT MORTGAGE
========================================== */

function calculateRepayment(amount, monthlyRate, totalMonths) {

    // If interest rate is 0%
    if (monthlyRate === 0) {

        return amount / totalMonths;

    }

    // Mortgage repayment formula
    const rateFactor = Math.pow(
        1 + monthlyRate,
        totalMonths
    );

    const monthlyPayment =
        amount *
        (
            monthlyRate * rateFactor
        ) /
        (
            rateFactor - 1
        );

    return monthlyPayment;
}


/* ==========================================
   6. CALCULATE INTEREST-ONLY MORTGAGE
========================================== */

function calculateInterestOnly(amount, monthlyRate) {

    // Monthly payment is only the interest
    const monthlyPayment = amount * monthlyRate;

    return monthlyPayment;
}


/* ==========================================
   7. DISPLAY CALCULATED RESULTS
========================================== */

function displayResults(monthlyPayment, totalPayment) {

    // Format the calculated numbers
    monthlyResult.textContent = formatCurrency(monthlyPayment);

    totalResult.textContent = formatCurrency(totalPayment);

    // Hide initial empty state
    emptyState.style.display = "none";

    // Show calculated results
    resultsState.style.display = "block";

}


/* ==========================================
   8. HANDLE FORM SUBMISSION
========================================== */

mortgageForm.addEventListener("submit", function(event) {

    // Prevent the page from refreshing
    event.preventDefault();

    // Validate all inputs
    if (!validateForm()) {

        // Focus the first invalid input
        const firstInvalidInput = mortgageForm.querySelector(
            '[aria-invalid="true"]'
        );

        if (firstInvalidInput) {
            firstInvalidInput.focus();
        } else {
            document.querySelector(
                'input[name="mortgageType"]'
            ).focus();
        }

        return;

    }


    // Get values from input fields
    const amount = Number(mortgageAmount.value);

    const years = Number(mortgageTerm.value);

    const annualRate = Number(interestRate.value);


    // Convert annual interest rate to monthly rate
    const monthlyRate = annualRate / 100 / 12;


    // Convert years into months
    const totalMonths = years * 12;


    // Get selected mortgage type
    const selectedType = document.querySelector(
        'input[name="mortgageType"]:checked'
    ).value;


    // Variables for calculated results
    let monthlyPayment;
    let totalPayment;


    // Check mortgage type
    if (selectedType === "repayment") {

        // Calculate repayment mortgage
        monthlyPayment = calculateRepayment(
            amount,
            monthlyRate,
            totalMonths
        );

        // Calculate total amount paid
        totalPayment = monthlyPayment * totalMonths;

    } else if (selectedType === "interest-only") {

        // Calculate interest-only mortgage
        monthlyPayment = calculateInterestOnly(
            amount,
            monthlyRate
        );

        // Total payments include interest and original loan principal
        totalPayment = (monthlyPayment * totalMonths) + amount;

    }


    // Display results
    displayResults(monthlyPayment, totalPayment);

});


/* ==========================================
   9. CLEAR ALL INPUTS AND RESULTS
========================================== */

clearButton.addEventListener("click", function() {

    // Reset the form
    mortgageForm.reset();


    // Hide all error messages
    amountError.classList.remove("show");
    termError.classList.remove("show");
    rateError.classList.remove("show");
    typeError.classList.remove("show");
    // Remove error styling from input fields
    [mortgageAmount, mortgageTerm, interestRate].forEach(
        function(input) {

            input.closest(".input-wrapper").classList.remove("error");

            input.removeAttribute("aria-invalid");

        }
    );


    // Hide calculated results
    resultsState.style.display = "none";


    // Show initial empty state
    emptyState.style.display = "flex";


    // Clear displayed results
    monthlyResult.textContent = formatCurrency(0);
    totalResult.textContent = formatCurrency(0);

});


/* ==========================================
   10. CLEAR ERRORS WHILE TYPING
========================================== */

mortgageAmount.addEventListener("input", function() {

    hideError(mortgageAmount, amountError);

});


mortgageTerm.addEventListener("input", function() {

    hideError(mortgageTerm, termError);

});


interestRate.addEventListener("input", function() {

    hideError(interestRate, rateError);

});


mortgageTypes.forEach(function(radio) {

    radio.addEventListener("change", function() {

        typeError.classList.remove("show");

    });

});