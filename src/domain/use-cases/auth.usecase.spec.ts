import { MissingParamError } from '../../utils/errors';

class AuthUseCase {
  async auth (email: string, password: string) {
    if (!email) {
      throw new MissingParamError('email');
    }
    if (!password) {
      throw new MissingParamError('password');
    }
  }
}

describe('Auth UseCase', () => {
  it('should return null if email is provided', async () => {
    const sut = new AuthUseCase();

    const promise = sut.auth(null, null);

    expect(promise).rejects.toThrow(new MissingParamError('email'));
  });

  it('should return null if password is provided', async () => {
    const sut = new AuthUseCase();

    const promise = sut.auth('any_email@mail.com', '');

    expect(promise).rejects.toThrow(new MissingParamError('password'));
  });
});
