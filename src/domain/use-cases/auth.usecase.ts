import { MissingParamError } from '../../utils/errors';

interface ILoadUserByEmailRepository{
  load(email: string): Promise<any>;
}
class AuthUseCase {
  constructor (readonly loadUserByEmailRepository: ILoadUserByEmailRepository) {}

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

    return null;
  }
}

export { AuthUseCase };
