class EmailValidator {
  isValid (email: string): boolean {
    return true
  }
}

describe('Email Validator', () => {
  it('should return true if validator returns true', () => {
    const sut = new EmailValidator()

    const isEmailValid = sut.isValid('valid_email@mail.com')

    expect(isEmailValid).toBe(true)
  })
})
