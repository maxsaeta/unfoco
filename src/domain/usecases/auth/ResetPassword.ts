import { IAuthRepository } from '../../repositories';

export class ResetPasswordUseCase {
  constructor(private authRepository: IAuthRepository) {}

  async execute(email: string): Promise<void> {
    if (!email) {
      throw new Error('Email is required');
    }

    return this.authRepository.resetPassword(email);
  }
}
