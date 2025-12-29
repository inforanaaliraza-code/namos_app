/**
 * @format
 */

// IMPORTANT: react-native-gesture-handler must be imported FIRST
import 'react-native-gesture-handler';

import { AppRegistry, I18nManager } from 'react-native';

// Enforce LTR layout application-wide
// This ensures that even if Arabic is selected, the layout remains LTR
try {
    if (I18nManager.isRTL) {
        I18nManager.allowRTL(false);
        I18nManager.forceRTL(false);
    }
} catch (e) {
    console.warn('Failed to enforce LTR:', e);
}
import App from './App';
import { name as appName } from './app.json';

AppRegistry.registerComponent(appName, () => App);
