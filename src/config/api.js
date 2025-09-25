import { Platform } from 'react-native';

const getDefaultBaseUrl = () => {
  if (Platform.OS === 'android') {
    // Android emulator loopback
    return 'http://10.0.2.2:5000';
  }
  // iOS simulator / web
  return 'http://localhost:5000';
};

export const API_BASE_URL = 'https://kasneb-9kh1r5hiu-joseph-kiilus-projects.vercel.app';


