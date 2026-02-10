import { useState } from 'react';

type CreatePublicSpaceParams = {
  name: string;
};

export const usePrivyAuthCreatePublicSpace = () => {
  const [isLoading] = useState(false);

  const createPublicSpace = async ({ name: _name }: CreatePublicSpaceParams) => {
    alert('Graph.createSpace has been removed. Public space creation needs to be re-implemented.');
    return undefined;
  };
  return { createPublicSpace, isLoading };
};
