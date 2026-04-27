const AUTH_MESSAGES: Record<string, string> = {
  'Invalid login credentials': '이메일 또는 비밀번호가 올바르지 않습니다',
  'Invalid email or password': '이메일 또는 비밀번호가 올바르지 않습니다',
  'Email not confirmed': '이메일 인증이 필요합니다. 받은 편지함을 확인해주세요',
  'User already registered': '이미 사용 중인 이메일입니다',
  'Email rate limit exceeded': '잠시 후 다시 시도해주세요',
  'Too many requests': '요청이 너무 많습니다. 잠시 후 다시 시도해주세요',
  'Password should be at least 6 characters': '비밀번호는 6자 이상이어야 합니다',
  'Unable to validate email address: invalid format': '올바른 이메일 형식이 아닙니다',
  'signup is disabled': '현재 회원가입이 비활성화되어 있습니다',
}

export function toKoreanError(message: string, fallback = '오류가 발생했습니다. 다시 시도해주세요'): string {
  for (const [eng, kor] of Object.entries(AUTH_MESSAGES)) {
    if (message.includes(eng)) return kor
  }
  return fallback
}
