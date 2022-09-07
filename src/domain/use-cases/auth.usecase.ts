import { MissingParamError } from '../../utils/errors';

interface ILoadUserByEmailRepository{
  load(email: string): Promise<any>;
}

interface IEncrypt{
  compare(password: string, hashedPassword: string): Promise<any>;
}

interface ITokenGenerator{
  generate(userId: string): Promise<any>;
}
class AuthUseCase {
  constructor (
    private readonly loadUserByEmailRepository: ILoadUserByEmailRepository,
    private readonly encrypt: IEncrypt,
    private readonly tokenGenerator: ITokenGenerator
  ) {}

  async auth (email: string, password: string) {
    if (!email) {
      throw new MissingParamError('email');
    }
    if (!password) {
      throw new MissingParamError('password');
    }

    const user = await this.loadUserByEmailRepository.load(email);
    if (!user) {
      return null;
    }

    const isValid = await this.encrypt.compare(password, user.password);
    if (!isValid) {
      return null;
    }

    await this.tokenGenerator.generate(user.id);
  }
}

export { AuthUseCase };
