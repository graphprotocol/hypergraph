import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Boot } from './Boot.js';

import 'unfonts.css';
import '@/css/index.css';

// biome-ignore lint/style/noNonNullAssertion: root element is always there
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Boot />
  </StrictMode>,
);
