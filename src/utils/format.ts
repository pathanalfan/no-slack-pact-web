export function formatDate(dateString: string | undefined): string {
  if (!dateString) return 'Not set';
  
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return 'Invalid date';
  }
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
  }).format(amount);
}

export function formatDateRange(startDate?: string, endDate?: string): string {
  if (!startDate && !endDate) return 'Not set';
  if (startDate && endDate) {
    const start = formatDate(startDate);
    const end = formatDate(endDate);
    return `${start} - ${end}`;
  }
  if (startDate) {
    return `Starts ${formatDate(startDate)}`;
  }
  return `Ends ${formatDate(endDate)}`;
}

