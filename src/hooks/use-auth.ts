import { type RootState } from '@/store';
import { useSelector } from 'react-redux';

const useAuth = () => {
  const auth = useSelector((state: RootState) => state.auth);
  return auth;
};

export default useAuth;
