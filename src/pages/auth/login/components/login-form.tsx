import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { setAuth } from '@/store';
import { useLogin } from '@/api/auth';
import { handleNavigate } from '@/lib/utils';
import { Form } from '@/components/ui/form';
import type { LoginResponse } from '@/types/user.types';

import EmailField from './email-field';
import PasswordField from './password-field';
import LoginButton from './login-button';
import { loginSchema, type LoginFormValues } from '../schema';

const LoginForm = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { login, isLoading } = useLogin();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = (values: LoginFormValues) => {
    login(
      { data: values },
      {
        onSuccess: ({ data }) => {
          const loginData: LoginResponse = data.data;
          dispatch(setAuth(loginData));
          // Every seeded account holds exactly one role, so the first role
          // decides the landing path. A role-selector dialog for multi-role
          // users slots in here later.
          navigate(handleNavigate(loginData.roles), { replace: true });
        },
        // Failures are surfaced by the axios response interceptor as a toast
        // carrying the backend's own message.
      }
    );
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        <EmailField disabled={isLoading} />
        <PasswordField disabled={isLoading} />
        <LoginButton isPending={isLoading} />
      </form>
    </Form>
  );
};

export default LoginForm;
