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
    if (!this.loadUserByEmailRepository) {
      throw new MissingParamError('loadUserByEmailRepository');
    }

    if (!this.loadUserByEmailRepository.load) {
      throw new MissingParamError('loadUserByEmailRepository');
    }

    const user = await this.loadUserByEmailRepository.load(email);
    if (!user) {
      return null;
    }
  }
}

export { AuthUseCase };
