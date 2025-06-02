import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import './index.css';
import { Providers } from './Providers.js';

// biome-ignore lint/style/noNonNullAssertion: root is guaranteed to exist
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Providers />
  </StrictMode>,
);
