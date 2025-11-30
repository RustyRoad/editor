// Helper function for formatting currency
// @ts-nocheck
export var formatCurrency = function (amount, currency) {
    var numAmount = Number(amount);
    if (isNaN(numAmount)) {
        // Return a default or error string if amount is not a valid number
        return 'N/A';
    }
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency || 'USD', // Default to USD if not provided
    }).format(numAmount);
};
