import { InvalidParamError, MissingParamError } from '../errors';
import { HttpResponse, IHttpResponse } from '../helpers/httpResponse';

class LoginRouter {
  emailValidator: any;
  authUseCase: any;

  constructor (authUseCase, emailValidator) {
    this.authUseCase = authUseCase;
    this.emailValidator = emailValidator;
  }

  async route (httpRequest): Promise<IHttpResponse> {
    try {
      const { email, password } = httpRequest.body;

      if (!email) {
        return HttpResponse.badRequest(new MissingParamError('email'));
      }
      if (!this.emailValidator.isValid(email)) {
        return HttpResponse.badRequest(new InvalidParamError('email'));
      }

      if (!password) {
        return HttpResponse.badRequest(new MissingParamError('password'));
      }

      const accessToken = await this.authUseCase.auth(email, password);

      if (!accessToken) {
        return HttpResponse.unauthorizedError();
      }
      return HttpResponse.ok({ accessToken });
    } catch (error) {
      // console.error(error)
      return HttpResponse.serverError();
    }
  }
}

export { LoginRouter };
