import { User, AuthCredentials } from '../../types';
import { IAuthRepository } from '../../repositories';

export class LoginUseCase {
  constructor(private authRepository: IAuthRepository) {}

  async execute(credentials: AuthCredentials): Promise<User> {
    if (!credentials.email || !credentials.password) {
      throw new Error('Email and password are required');
    }

    return this.authRepository.login(credentials);
  }
}
