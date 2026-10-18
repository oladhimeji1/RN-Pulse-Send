import { router } from 'expo-router';
import { LoginScreen } from '../components/LoginScreen';

export default function LoginPage() {
  return (
    <LoginScreen
      onSuccess={() => {
        router.replace('/');
      }}
    />
  );
}
