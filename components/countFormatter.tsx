import React from 'react';

// This is the reusable component that formats and displays the number.
// It takes a 'count' prop and applies the formatting logic.
const CountFormatter = ({ count }) => {
  /**
   * Formats a number into a more readable string (e.g., 1000 becomes "1k", 1500000 becomes "1.5M").
   * @param {number} num The number to format.
   * @returns {string} The formatted number string.
   */
  const formatNumber = (num) => {
    // Check if the number is greater than or equal to one million.
    if (num >= 1000000) {
      // Return the number divided by 1 million, with one decimal place, followed by 'M'.
      // The .replace(/\.0$/, '') part removes the decimal point if the number is a whole number (e.g., 1.0M becomes 1M).
      return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
    }
    // Check if the number is greater than or equal to one thousand.
    if (num >= 1000) {
      // Return the number divided by 1 thousand, with one decimal place, followed by 'k'.
      return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
    }
    // If the number is less than 1000, just return the number as a string.
    return num.toString();
  };

  // The component returns a span with the formatted number.
  // You can wrap this in any other JSX you need.
  return <span>{formatNumber(count)}</span>;
};

export default CountFormatter;
