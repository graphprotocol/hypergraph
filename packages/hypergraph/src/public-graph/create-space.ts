type Params = {
  initialEditorAddress: string;
  spaceName: string;
};

export const createSpace = async (params: Params) => {
  const result = await fetch('https://api-testnet.grc-20.thegraph.com/deploy', {
    method: 'POST',
    mode: 'cors',
    body: JSON.stringify(params),
    headers: {
      'Content-Type': 'application/json',
      'x-custom-header': 'myValue',
    },
  });

  const { spaceId } = await result.json();
  return { id: spaceId };
};
