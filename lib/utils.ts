import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-TZ", {
    style: "currency",
    currency: "TZS",
    minimumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat("en-TZ", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(date));
}

