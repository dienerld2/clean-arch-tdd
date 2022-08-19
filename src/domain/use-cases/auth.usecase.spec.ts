class AuthUseCase {
  async auth (email: string) {
    if (!email) {
      throw new Error('');
    }
  }
}

describe('Auth UseCase', () => {
  it('should return null if email is provided', async () => {
    const sut = new AuthUseCase();

    const promise = sut.auth(null);

    expect(promise).rejects.toThrow();
  });
});
