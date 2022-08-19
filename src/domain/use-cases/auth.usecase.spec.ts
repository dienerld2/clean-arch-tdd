import { MissingParamError } from '../../utils/errors';

class AuthUseCase {
  constructor (readonly loadUserByEmailRepository: any) {}

  async auth (email: string, password: string) {
    if (!email) {
      throw new MissingParamError('email');
    }
    if (!password) {
      throw new MissingParamError('password');
    }

    await this.loadUserByEmailRepository.load(email);
  }
}

const makeSut = (loadUserByEmailRepositorySpy?: any) => {
  return new AuthUseCase(loadUserByEmailRepositorySpy);
};

describe('Auth UseCase', () => {
  it('should return null if email is provided', async () => {
    const sut = makeSut();

    const promise = sut.auth(null, null);

    expect(promise).rejects.toThrow(new MissingParamError('email'));
  });

  it('should return null if password is provided', async () => {
    const sut = makeSut();

    const promise = sut.auth('any_email@mail.com', '');

    expect(promise).rejects.toThrow(new MissingParamError('password'));
  });

  it('should call LoadUserByEmailRepository with correct email', async () => {
    class LoadUserByEmailRepositorySpy {
      email: string;

      async load (email: string) {
        this.email = email;
        return null;
      }
    }

    const loadUserByEmailRepositorySpy = new LoadUserByEmailRepositorySpy();
    const sut = makeSut(loadUserByEmailRepositorySpy);

    await sut.auth('any_email@mail.com', 'any_password');

    expect(loadUserByEmailRepositorySpy.email).toBe('any_email@mail.com');
  });
});
