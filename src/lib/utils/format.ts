/** 금액을 한국 원화 형식으로 포맷 (예: 150000 → "150,000원") */
export function formatCurrency(amount: number): string {
  return `${amount.toLocaleString("ko-KR")}원`;
}

/** 전화번호 포맷 (예: "01012345678" → "010-1234-5678") */
export function formatPhone(phone: string): string {
  return phone.replace(/(\d{3})(\d{4})(\d{4})/, "$1-$2-$3");
}

/** 세션 수 포맷 (예: 10 → "10회") */
export function formatSessions(count: number): string {
  return `${count}회`;
}
