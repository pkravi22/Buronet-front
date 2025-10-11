const formatDate = (dateString: string): string => {
  if (!dateString || typeof dateString !== 'string') return 'N/A';

  // 1. Split the "DD-MM-YYYY" string into parts.
  const parts = dateString.split('-');
  if (parts.length !== 3) {
    // If the format is not as expected, return an error message.
    return 'Invalid Format';
  }

  // 2. Reassemble into "YYYY-MM-DD", a format universally understood by new Date().
  //    const [day, month, year]
  const isoDateString = `${parts[2]}-${parts[1]}-${parts[0]}`;
  const date = new Date(isoDateString);

  // 3. Check if the created date is valid.
  if (isNaN(date.getTime())) {
    return 'Invalid Date';
  }

  // 4. Now, format this valid date object into your desired output.
  const options: Intl.DateTimeFormatOptions = {
    month: 'short',   // "Aug"
    day: '2-digit',   // "09"
    year: 'numeric',  // "2025"
  };
  return date.toLocaleDateString('en-US', options);
};

export { formatDate };