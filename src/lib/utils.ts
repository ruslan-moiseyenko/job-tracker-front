import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Generates a default job search title based on the current date
 * Format: "Search campaign DD/MM/YYYY"
 * @returns A formatted title string
 */
export function generateDefaultSearchTitle(): string {
  const now = new Date();
  const day = now.getDate().toString().padStart(2, '0');
  const month = (now.getMonth() + 1).toString().padStart(2, '0');
  const year = now.getFullYear();

  return `Search ${day}/${month}/${year}`;
}
