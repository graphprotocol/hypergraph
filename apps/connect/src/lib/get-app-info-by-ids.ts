const apps = {
  '93bb8907-085a-4a0e-83dd-62b0dc98e793': {
    name: 'Todos',
  },
};

export const getAppInfoByIds = async (appIds: string[]) => {
  // sleep for 1 second
  await new Promise((resolve) => setTimeout(resolve, 1000));
  return apps;
};
