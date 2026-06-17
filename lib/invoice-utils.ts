export function numberToWords(num: number): string {
  const ones = [
    "", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine",
    "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen",
    "Sixteen", "Seventeen", "Eighteen", "Nineteen"
  ];

  const tens = [
    "", "", "Twenty", "Thirty", "Forty", "Fifty",
    "Sixty", "Seventy", "Eighty", "Ninety"
  ];

  const convertLessThanThousand = (n: number): string => {
    let str = "";

    if (n >= 100) {
      str += ones[Math.floor(n / 100)] + " Hundred ";
      n %= 100;
    }

    if (n >= 20) {
      str += tens[Math.floor(n / 10)] + " ";
      n %= 10;
    }

    if (n > 0) {
      str += ones[n] + " ";
    }

    return str.trim();
  };

  if (num === 0) return "Zero Rupees Only";

  let result = "";
  let n = Math.floor(num);

  const crore = Math.floor(n / 10000000);
  n %= 10000000;

  const lakh = Math.floor(n / 100000);
  n %= 100000;

  const thousand = Math.floor(n / 1000);
  n %= 1000;

  if (crore) result += convertLessThanThousand(crore) + " Crore ";
  if (lakh) result += convertLessThanThousand(lakh) + " Lakh ";
  if (thousand) result += convertLessThanThousand(thousand) + " Thousand ";
  if (n) result += convertLessThanThousand(n);

  return result.trim() + " Rupees Only";
}

export const TERMS_AND_CONDITIONS = [
  "Payment: 100% advance.",
  "Delivery: As per stock availability.",
  "GST and transport charges extra if applicable.",
  "Material once sold will not be taken back.",
];