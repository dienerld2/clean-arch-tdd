import validator from 'validator';

class EmailValidator {
  isValid (email: string): boolean {
    return validator.isEmail(email);
  }
}

export { EmailValidator };
