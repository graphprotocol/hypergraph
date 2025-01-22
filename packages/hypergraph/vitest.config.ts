import { type UserConfigExport, mergeConfig } from 'vitest/config';
import shared from '../../vitest.shared.js';

const config: UserConfigExport = {};

export default mergeConfig(shared, config);
