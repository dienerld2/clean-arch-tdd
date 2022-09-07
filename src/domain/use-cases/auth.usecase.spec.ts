import { MissingParamError } from '../../utils/errors';
import { AuthUseCase } from './auth.usecase';

const makeEncrypt = () => {
  class EncryptSpy {
    password: string;
    hashedPassword: string;
    isValid: boolean;

    async compare (password: string, hashedPassword: string): Promise<boolean> {
      this.password = password;
      this.hashedPassword = hashedPassword;
      return this.isValid;
    }
  }

  const encryptSpy = new EncryptSpy();
  encryptSpy.isValid = true;

  return encryptSpy;
};

const makeTokenGenerator = () => {
  class TokenGeneratorSpy {
    userId: string;
    accessToken: string;
    async generate (userId: string) {
      this.userId = userId;
      return this.accessToken;
    }
  }

  const tokenGeneratorSpy = new TokenGeneratorSpy();
  tokenGeneratorSpy.accessToken = 'any_token';

  return tokenGeneratorSpy;
};

const makeLoadUserByEmailRepositorySpy = () => {
  class LoadUserByEmailRepositorySpy {
    email: string;
    user: { id?: string, email?: string, password?: string };

    async load (email: string) {
      this.email = email;
      return this.user; ;
    }
  }

  const loadUserByEmailRepositorySpy = new LoadUserByEmailRepositorySpy();
  loadUserByEmailRepositorySpy.user = {
    id: 'any_id',
    password: 'hashed_password'
  };

  return loadUserByEmailRepositorySpy;
};

const makeSut = () => {
  const encryptSpy = makeEncrypt();
  const loadUserByEmailRepositorySpy = makeLoadUserByEmailRepositorySpy();
  const tokenGeneratorSpy = makeTokenGenerator();

  const sut = new AuthUseCase(loadUserByEmailRepositorySpy, encryptSpy, tokenGeneratorSpy);

  return { sut, loadUserByEmailRepositorySpy, encryptSpy, tokenGeneratorSpy };
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
    // @ts-ignore
    const sut = new AuthUseCase();

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
    const { sut, encryptSpy } = makeSut();
    encryptSpy.isValid = false;

    const accessToken = await sut.auth('valid_email@mail.com', 'invalid_password');

    expect(accessToken).toBeNull();
  });

  it('should call Encrypt with correct value', async () => {
    const { sut, loadUserByEmailRepositorySpy, encryptSpy } = makeSut();

    await sut.auth('valid_email@mail.com', 'any_password');

    expect(encryptSpy.password).toBe('any_password');
    expect(encryptSpy.hashedPassword).toBe(loadUserByEmailRepositorySpy.user.password);
  });

  it('should call tokenGenerator with correct value', async () => {
    const { sut, loadUserByEmailRepositorySpy, tokenGeneratorSpy } = makeSut();

    await sut.auth('valid_email@mail.com', 'any_password');

    expect(tokenGeneratorSpy.userId).toBe(loadUserByEmailRepositorySpy.user.id);
  });
});
