import { useState } from 'react';
import { container } from '../../di/container';

export interface LoginState {
  email: string;
  password: string;
  isLogin: boolean;
  loading: boolean;
  error: string | null;
  showForgotPassword: boolean;
  resetSent: boolean;
}

export function useLoginViewModel() {
  const [state, setState] = useState<LoginState>({
    email: '',
    password: '',
    isLogin: true,
    loading: false,
    error: null,
    showForgotPassword: false,
    resetSent: false,
  });

  const setEmail = (email: string) => {
    setState(prev => ({ ...prev, email }));
  };

  const setPassword = (password: string) => {
    setState(prev => ({ ...prev, password }));
  };

  const toggleMode = () => {
    setState(prev => ({ ...prev, isLogin: !prev.isLogin, error: null }));
  };

  const handleSubmit = async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      if (state.isLogin) {
        await container.loginUseCase.execute({
          email: state.email,
          password: state.password,
        });
      } else {
        await container.registerUseCase.execute({
          email: state.email,
          password: state.password,
        });
      }
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error.message || 'An error occurred',
      }));
    }
  };

  const showForgotPasswordScreen = () => {
    setState(prev => ({ ...prev, showForgotPassword: true, resetSent: false, error: null }));
  };

  const hideForgotPasswordScreen = () => {
    setState(prev => ({ ...prev, showForgotPassword: false, resetSent: false, error: null }));
  };

  const handleResetPassword = async () => {
    if (!state.email) {
      setState(prev => ({ ...prev, error: 'Ingresa tu email' }));
      return;
    }

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      await container.resetPasswordUseCase.execute(state.email);
      setState(prev => ({ ...prev, loading: false, resetSent: true }));
    } catch (error: any) {
      let message = 'Error al enviar el email';
      if (error.code === 'auth/user-not-found') {
        message = 'No existe una cuenta con este email';
      } else if (error.code === 'auth/invalid-email') {
        message = 'Email inválido';
      } else if (error.message) {
        message = error.message;
      }
      setState(prev => ({ ...prev, loading: false, error: message }));
    }
  };

  return {
    state,
    setEmail,
    setPassword,
    toggleMode,
    handleSubmit,
    showForgotPasswordScreen,
    hideForgotPasswordScreen,
    handleResetPassword,
  };
}
