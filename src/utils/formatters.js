/**
 * Formats number in Indian numbering system (lakhs, crores)
 * @param {number|string} number - Number to format
 * @returns {string} Formatted number string
 */
export const formatIndianNumber = (number) => {
  if (!number || isNaN(number)) return number;
  
  const numStr = number.toString();
  const lastThree = numStr.substring(numStr.length - 3);
  const otherNumbers = numStr.substring(0, numStr.length - 3);
  
  if (otherNumbers !== '') {
    return otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + "," + lastThree;
  } else {
    return lastThree;
  }
};

/**
 * Formats number with Indian currency symbol
 * @param {number|string} number - Number to format
 * @returns {string} Formatted currency string
 */
export const formatIndianCurrency = (number) => {
  if (!number || isNaN(number)) return number;
  return `₹${formatIndianNumber(number)}`;
};

/**
 * Alternative using Intl.NumberFormat (modern browsers)
 * @param {number|string} number - Number to format
 * @returns {string} Formatted number string
 */
export const formatIndianNumberIntl = (number) => {
  if (!number || isNaN(number)) return number;
  
  return new Intl.NumberFormat('en-IN').format(number);
};