// Нативный мост лаунчера (Android): плеер и чтение папки. В браузере его нет — вызовы не делаем.
import { Capacitor, registerPlugin } from '@capacitor/core';

export const isNative = () => Capacitor.isNativePlatform();
export const Launcher = registerPlugin('Launcher');
