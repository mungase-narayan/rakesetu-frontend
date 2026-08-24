import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router';
import { useQueryClient } from '@tanstack/react-query';

import { logout } from '@/store';
import { apis } from '@/api/auth/apis';
import { successToast } from '@/lib/toast.lib';

/**
 * Clears auth state + cached server data and returns the user to the login
 * screen. The server call clears the httpOnly cookies; it is fire-and-forget
 * because the local session must end even if that request fails.
 */
const useLogout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return () => {
    apis.logout().catch(() => undefined);
    dispatch(logout());
    queryClient.clear();
    navigate('/auth/login', { replace: true });
    successToast({ message: 'You have been signed out.' });
  };
};

export default useLogout;
