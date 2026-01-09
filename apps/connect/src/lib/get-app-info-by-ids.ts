// const apps = {
//   '93bb8907085a4a0e83dd62b0dc98e793': {
//     name: 'Todos',
//   },
// };

export const getAppInfoByIds = async (appIds: string[]) => {
  // sleep for 1 second
  // await new Promise((resolve) => setTimeout(resolve, 1000));
  // return apps;
  const appInfo: Record<string, { name: string }> = {};
  for (const appId of appIds) {
    appInfo[appId] = { name: appId };
  }
  return appInfo;
};
