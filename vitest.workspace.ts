import { defineWorkspace } from 'vitest/config';

export default defineWorkspace(['./packages/*', './apps/events', './apps/connect', './apps/typesync']);
