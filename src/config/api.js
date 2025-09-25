import { Platform } from 'react-native';

const getDefaultBaseUrl = () => {
  if (Platform.OS === 'android') {
    // Android emulator loopback
    return 'http://10.0.2.2:5000';
  }
  // iOS simulator / web
  return 'http://localhost:5000';
};

// For testing: Use local backend when available, otherwise use Vercel
export const API_BASE_URL = __DEV__ ? 'http://localhost:5000' : 'https://kasneb-quvna24vw-joseph-kiilus-projects.vercel.app';


