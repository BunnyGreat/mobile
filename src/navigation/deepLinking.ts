import { Linking } from 'react-native';
import { CommonActions } from '@react-navigation/native';

let navigator: any = null;
export const setNavigator = (nav: any) => { navigator = nav; };

// Parse query param helper
const getQueryParam = (url: string, key: string) => {
  try {
    const query = url.split('?')[1] || '';
    const params = new URLSearchParams(query);
    return params.get(key);
  } catch {
    return null;
  }
};

export const handleDeepLink = async (url: string) => {
  if (!url) return;
  // Expecting something like: barangay://reset-password?oobCode=CODE
  if (url.startsWith('barangay://reset-password')) {
    const oobCode = getQueryParam(url, 'oobCode');
    if (!oobCode) return;
    // Navigate to ResetPassword screen and pass oobCode via params
    if (navigator) {
      navigator.dispatch(
        CommonActions.navigate({ name: 'ResetPassword', params: { oobCode } })
      );
    }
  }
};

export const subscribeToLinking = (navigationRef: any) => {
  // handle initial url
  Linking.getInitialURL().then((url) => {
    if (url) handleDeepLink(url);
  });

  // subscribe to linking events
  const sub = Linking.addEventListener('url', (event) => {
    handleDeepLink(event.url);
  });

  setNavigator(navigationRef);
  return () => {
    sub.remove();
  };
};
