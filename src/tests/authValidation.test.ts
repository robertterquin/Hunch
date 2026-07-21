import { describe, expect, it } from 'vitest'
import { validateSignIn, validateSignUp } from '../services/authValidation'

describe('password account validation', () => {
  it('requires a name, email, an eight-character password, and matching confirmation when registering', () => {
    expect(validateSignUp({ displayName: ' ', email: 'student@example.com', password: 'password1', confirmPassword: 'password1' })).toBe('Enter your full name.')
    expect(validateSignUp({ displayName: 'Student Name', email: 'invalid-email', password: 'password1', confirmPassword: 'password1' })).toBe('Enter a valid email address.')
    expect(validateSignUp({ displayName: 'Student Name', email: 'student@example.com', password: 'short', confirmPassword: 'short' })).toBe('Use a password with at least 8 characters.')
    expect(validateSignUp({ displayName: 'Student Name', email: 'student@example.com', password: 'password1', confirmPassword: 'password2' })).toBe('Passwords do not match.')
  })

  it('accepts valid password registration credentials', () => {
    expect(validateSignUp({ displayName: 'Student Name', email: 'student@example.com', password: 'password1', confirmPassword: 'password1' })).toBeNull()
  })

  it('requires both credentials during sign-in', () => {
    expect(validateSignIn('student@example.com', '')).toBe('Enter your password.')
    expect(validateSignIn('student@example.com', 'password1')).toBeNull()
  })
})
