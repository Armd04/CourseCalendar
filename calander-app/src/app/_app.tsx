// src/app/_app.tsx
import 'bootstrap/dist/css/bootstrap.min.css';
import './globals.css';
import type { AppProps } from 'next/app';

function MyApp({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}

export default MyApp;
