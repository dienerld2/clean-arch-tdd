import validator from 'validator';
jest.mock('validator', () => ({
  isEmailValid: true,
  email: '',
  isEmail (email: string): boolean {
    this.email = email;
    return this.isEmailValid;
  }
}));

class EmailValidator {
  isValid (email: string): boolean {
    return validator.isEmail(email);
  }
}

const makeSut = (): EmailValidator => {
  return new EmailValidator();
};

describe('Email Validator', () => {
  it('should return true if validator returns true', () => {
    const sut = makeSut();

    const isEmailValid = sut.isValid('valid_email@mail.com');

    expect(isEmailValid).toBe(true);
  });

  it('should return false if validator returns false', () => {
    const sut = makeSut();
    // @ts-ignore
    validator.isEmailValid = false;
    const isEmailValid = sut.isValid('invalid_email@mail.com');

    expect(isEmailValid).toBe(false);
  });

  it('should call validator with correct email', () => {
    const sut = makeSut();
    sut.isValid('any_email@mail.com');

    // @ts-ignore
    expect(validator.email).toBe('any_email@mail.com');
  });
});
