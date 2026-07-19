export interface SignUpCredentials {
  displayName: string
  email: string
  password: string
  confirmPassword: string
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function validateEmail(email: string) {
  return EMAIL_PATTERN.test(email.trim()) ? null : 'Enter a valid email address.'
}

export function validatePassword(password: string) {
  return password.length >= 8 ? null : 'Use a password with at least 8 characters.'
}

export function validateSignIn(email: string, password: string) {
  return validateEmail(email) ?? (password ? null : 'Enter your password.')
}

export function validateSignUp({ displayName, email, password, confirmPassword }: SignUpCredentials) {
  if (!displayName.trim()) return 'Enter your full name.'
  return validateEmail(email)
    ?? validatePassword(password)
    ?? (password === confirmPassword ? null : 'Passwords do not match.')
}
