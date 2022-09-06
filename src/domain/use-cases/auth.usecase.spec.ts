import { MissingParamError } from '../../utils/errors';
import { AuthUseCase } from './auth.usecase';

const makeSut = () => {
  class LoadUserByEmailRepositorySpy {
    email: string;
    user: {
      email?: string;
      password?: string;
    };

    async load (email: string) {
      this.email = email;
      return this.user; ;
    }
  }

  class EncryptSpy {
    password: string;
    hashedPassword: string;

    async compare (password: string, hashedPassword: string) {
      this.password = password;
      this.hashedPassword = hashedPassword;
    }
  }

  const encryptSpy = new EncryptSpy();
  const loadUserByEmailRepositorySpy = new LoadUserByEmailRepositorySpy();
  loadUserByEmailRepositorySpy.user = {
    password: 'hashed_password'
  };

  const sut = new AuthUseCase(loadUserByEmailRepositorySpy, encryptSpy);

  return { sut, loadUserByEmailRepositorySpy, encryptSpy };
};

describe('Auth UseCase', () => {
  it('should return null if email is provided', async () => {
    const { sut } = makeSut();

    const promise = sut.auth(null, null);

    expect(promise).rejects.toThrow(new MissingParamError('email'));
  });

  it('should return null if password is provided', async () => {
    const { sut } = makeSut();

    const promise = sut.auth('any_email@mail.com', '');

    expect(promise).rejects.toThrow(new MissingParamError('password'));
  });

  it('should call LoadUserByEmailRepository with correct email', async () => {
    const { sut, loadUserByEmailRepositorySpy } = makeSut();

    await sut.auth('any_email@mail.com', 'any_password');

    expect(loadUserByEmailRepositorySpy.email).toBe('any_email@mail.com');
  });

  it('should throw if no repository is provided', async () => {
    const sut = new AuthUseCase(null, null);

    const promise = sut.auth('any_email@mail.com', 'any_password');

    expect(promise).rejects.toThrow();
  });

  it('should return null if an invalid email is provided', async () => {
    const { sut, loadUserByEmailRepositorySpy } = makeSut();

    loadUserByEmailRepositorySpy.user = null;
    const accessToken = await sut.auth('invalid_email@mail.com', 'any_password');

    expect(accessToken).toBeNull();
  });

  it('should return null if an invalid password is provided', async () => {
    const { sut } = makeSut();

    const accessToken = await sut.auth('valid_email@mail.com', 'invalid_password');

    expect(accessToken).toBeNull();
  });

  it('should call Encrypt with correct value', async () => {
    const { sut, loadUserByEmailRepositorySpy, encryptSpy } = makeSut();

    await sut.auth('valid_email@mail.com', 'any_password');

    expect(encryptSpy.password).toBe('any_password');
    expect(encryptSpy.hashedPassword).toBe(loadUserByEmailRepositorySpy.user.password);
  });
});
