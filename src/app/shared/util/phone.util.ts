export function formatPhone(value: string): string {
  const digits = (value || '').replace(/\D/g, '').slice(0, 11);
  if (!digits) return '';

  const part1 = digits.slice(0, 2);
  const part2 = digits.length > 10 ? digits.slice(2, 7) : digits.slice(2, 6);
  const part3 = digits.length > 10 ? digits.slice(7, 11) : digits.slice(6, 10);

  if (part3) return `(${part1}) ${part2}-${part3}`;
  if (part2) return `(${part1}) ${part2}`;
  return `(${part1}`;
}

export function stripPhoneMask(value: string): string {
  return (value || '').replace(/\D/g, '').slice(0, 11);
}
