import { User, RegisterData } from '../../types';
import { IAuthRepository } from '../../repositories';

export class RegisterUseCase {
  constructor(private authRepository: IAuthRepository) {}

  async execute(data: RegisterData): Promise<User> {
    if (!data.email || !data.password) {
      throw new Error('Email and password are required');
    }

    if (data.password.length < 6) {
      throw new Error('Password must be at least 6 characters');
    }

    return this.authRepository.register(data);
  }
}
