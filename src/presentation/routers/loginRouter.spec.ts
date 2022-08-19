import { InvalidParamError, MissingParamError, ServerError, UnauthorizedError } from '../errors'
import { LoginRouter } from './loginRouter'

const makeEmailValidator = () => {
  class EmailValidatorSpy {
    email: any
    isEmailValid: any
    isValid (email) {
      this.email = email
      return this.isEmailValid
    }
  }
  const emailValidatorSpy = new EmailValidatorSpy()
  emailValidatorSpy.isEmailValid = true
  return emailValidatorSpy
}
const makeAuthUseCase = () => {
  class AuthUseCaseSpy {
    email: any
    password: any
    accessToken: any
    async auth (email, password) {
      this.email = email
      this.password = password

      return this.accessToken
    }
  }
  return new AuthUseCaseSpy()
}

const makeSut = () => {
  const authUseCaseSpy = makeAuthUseCase()
  authUseCaseSpy.accessToken = 'valid_token'
  const emailValidatorSpy = makeEmailValidator()
  const sut = new LoginRouter(authUseCaseSpy, emailValidatorSpy)

  return { sut, authUseCaseSpy, emailValidatorSpy }
}

describe('Login Router', () => {
  test('Should return 400 if no email is provided', async () => {
    const { sut } = makeSut()
    const httpRequest = {
      body: {
        password: 'any_password'
      }
    }

    const httpResponse = await sut.route(httpRequest)
    expect(httpResponse.statusCode).toBe(400)
    expect(httpResponse.body).toEqual(new MissingParamError('email'))
  })

  test('Should return 400 if no password is provided', async () => {
    const { sut } = makeSut()
    const httpRequest = {
      body: {
        email: 'any_mail@mail.com'
      }
    }

    const httpResponse = await sut.route(httpRequest)
    expect(httpResponse.statusCode).toBe(400)
    expect(httpResponse.body).toEqual(new MissingParamError('password'))
  })

  test('Should return 500 if no httpRequest is provided', async () => {
    const { sut } = makeSut()

    const httpResponse = await sut.route({})
    expect(httpResponse.statusCode).toBe(500)
    expect(httpResponse.body).toEqual(new ServerError())
  })

  test('Should return 500 if httpRequest has no body ', async () => {
    const { sut } = makeSut()
    const httpRequest = {}

    const httpResponse = await sut.route(httpRequest)
    expect(httpResponse.statusCode).toBe(500)
    expect(httpResponse.body).toEqual(new ServerError())
  })

  test('Should call AuthUseCase with correct params', async () => {
    const { sut, authUseCaseSpy } = makeSut()
    const httpRequest = {
      body: {
        email: 'any_mail@mail.com',
        password: 'any_password'
      }
    }

    await sut.route(httpRequest)
    expect(authUseCaseSpy.email).toBe(httpRequest.body.email)
    expect(authUseCaseSpy.password).toBe(httpRequest.body.password)
  })

  test('Should return 401 when invalid credentials are provided', async () => {
    const { sut, authUseCaseSpy } = makeSut()
    authUseCaseSpy.accessToken = null
    const httpRequest = {
      body: {
        email: 'invalid_mail@mail.com',
        password: 'invalid_password'
      }
    }

    const httpResponse = await sut.route(httpRequest)
    expect(httpResponse.statusCode).toBe(401)
    expect(httpResponse.body).toEqual(new UnauthorizedError())
  })

  test('Should return 200 when valid credentials are provided', async () => {
    const { sut, authUseCaseSpy } = makeSut()
    const httpRequest = {
      body: {
        email: 'valid_email@mail.com',
        password: 'valid_password'
      }
    }

    const httpResponse = await sut.route(httpRequest)
    expect(httpResponse.statusCode).toBe(200)
    expect(httpResponse.body.accessToken).toBe(authUseCaseSpy.accessToken)
  })

  test('Should return 500 if no AuthUseCase is provided', async () => {
    const sut = new LoginRouter({}, {})

    const HttpRequest = {
      body: {
        email: 'any_email@mail.com',
        password: 'any_password'
      }
    }

    const httpResponse = await sut.route(HttpRequest)
    expect(httpResponse.statusCode).toBe(500)
    expect(httpResponse.body).toEqual(new ServerError())
  })

  test('Should return 500 if AuthUseCase has no auth method', async () => {
    class AuthUseCaseSpy {}
    const sut = new LoginRouter(AuthUseCaseSpy, {})

    const HttpRequest = {
      body: {
        email: 'any_email@mail.com',
        password: 'any_password'
      }
    }

    const httpResponse = await sut.route(HttpRequest)
    expect(httpResponse.statusCode).toBe(500)
    expect(httpResponse.body).toEqual(new ServerError())
  })

  test('Should return 500 if AuthUseCase throws', async () => {
    class AuthUseCaseSpy {
      async auth () {
        throw new Error()
      }
    }
    const sut = new LoginRouter(AuthUseCaseSpy, {})

    const HttpRequest = {
      body: {
        email: 'any_email@mail.com',
        password: 'any_password'
      }
    }

    const httpResponse = await sut.route(HttpRequest)
    expect(httpResponse.statusCode).toBe(500)
  })

  test('Should return 400 if an invalid email is provided', async () => {
    const { sut, emailValidatorSpy } = makeSut()

    emailValidatorSpy.isEmailValid = false
    const httpRequest = {
      body: {
        email: 'invalid_mail.com',
        password: 'any_password'
      }
    }

    const httpResponse = await sut.route(httpRequest)
    expect(httpResponse.statusCode).toBe(400)
    expect(httpResponse.body).toEqual(new InvalidParamError('email'))
  })

  test('Should return 500 if no EmailValidator is provided', async () => {
    const sut = new LoginRouter(makeAuthUseCase(), {})

    const HttpRequest = {
      body: {
        email: 'any_email@mail.com',
        password: 'any_password'
      }
    }

    const httpResponse = await sut.route(HttpRequest)
    expect(httpResponse.statusCode).toBe(500)
    expect(httpResponse.body).toEqual(new ServerError())
  })

  test('Should return 500 if no EmailValidator ha no isValid method', async () => {
    const sut = new LoginRouter(makeAuthUseCase(), {})

    const HttpRequest = {
      body: {
        email: 'any_email@mail.com',
        password: 'any_password'
      }
    }

    const httpResponse = await sut.route(HttpRequest)
    expect(httpResponse.statusCode).toBe(500)
    expect(httpResponse.body).toEqual(new ServerError())
  })

  test('Should return 500 if EmailValidator throws', async () => {
    class EmailValidatorSpyWithError {
      isValid (email) {
        throw new Error()
      }
    }
    const authUseCaseSpy = makeAuthUseCase()

    const emailValidatorSpy = new EmailValidatorSpyWithError()
    const sut = new LoginRouter(authUseCaseSpy, emailValidatorSpy)

    const HttpRequest = {
      body: {
        email: 'any_email@mail.com',
        password: 'any_password'
      }
    }

    const httpResponse = await sut.route(HttpRequest)
    expect(httpResponse.statusCode).toBe(500)
  })

  test('Should call EmailValidator with correct email', async () => {
    const { sut, emailValidatorSpy } = makeSut()
    const httpRequest = {
      body: {
        email: 'any_mail@mail.com',
        password: 'any_password'
      }
    }

    await sut.route(httpRequest)
    expect(emailValidatorSpy.email).toBe(httpRequest.body.email)
  })
})
