import { redirect } from 'next/navigation';

import { AuthCallback } from '../../Components/Login/AuthCallback';

export default async function AuthenticateSuccessPage(
  props: Readonly<{
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
  }>,
) {
  const searchParams = await props.searchParams;
  const authSuccessParams = validateAuthenticateSuccessParams(searchParams);
  if (authSuccessParams == null) {
    return redirect('/404');
  }

  return <AuthCallback nonce={authSuccessParams.nonce} ciphertext={authSuccessParams.ciphertext} />;
}

function validateAuthenticateSuccessParams(
  params: Readonly<{
    [key: string]: string | string[] | undefined;
  }>,
) {
  if (!params['ciphertext'] || !params['nonce']) {
    return null;
  }

  return {
    ciphertext: Array.isArray(params.ciphertext) ? params.ciphertext[0] : params.ciphertext,
    nonce: Array.isArray(params.nonce) ? params.nonce[0] : params.nonce,
  };
}
