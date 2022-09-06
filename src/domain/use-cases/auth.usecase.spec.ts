import { MissingParamError } from '../../utils/errors';
import { AuthUseCase } from './auth.usecase';

const makeSut = () => {
  class LoadUserByEmailRepositorySpy {
    email: string;

    async load (email: string) {
      this.email = email;
      return null;
    }
  }

  const loadUserByEmailRepositorySpy = new LoadUserByEmailRepositorySpy();
  const sut = new AuthUseCase(loadUserByEmailRepositorySpy);

  return { sut, loadUserByEmailRepositorySpy };
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
    const sut = new AuthUseCase(null);

    const promise = sut.auth('any_email@mail.com', 'any_password');

    expect(promise).rejects.toThrow(new MissingParamError('loadUserByEmailRepository'));
  });

  it('should throw if noLoadUserByEmailRepository has no load method', async () => {
    const sut = new AuthUseCase({});

    const promise = sut.auth('any_email@mail.com', 'any_password');

    expect(promise).rejects.toThrow(new MissingParamError('loadUserByEmailRepository'));
  });

  it('should return null if LoadUserByEmailRepository returns null', async () => {
    const { sut } = makeSut();

    const accessToken = await sut.auth('invalid_email@mail.com', 'any_password');

    expect(accessToken).toBeNull();
  });
});
