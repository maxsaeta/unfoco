import { useState } from 'react';
import { container } from '../../di/container';

export interface LoginState {
  email: string;
  password: string;
  isLogin: boolean;
  loading: boolean;
  error: string | null;
}

export function useLoginViewModel() {
  const [state, setState] = useState<LoginState>({
    email: '',
    password: '',
    isLogin: true,
    loading: false,
    error: null,
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

  return {
    state,
    setEmail,
    setPassword,
    toggleMode,
    handleSubmit,
  };
}
