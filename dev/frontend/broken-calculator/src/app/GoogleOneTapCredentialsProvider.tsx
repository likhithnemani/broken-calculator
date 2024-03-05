import { CredentialsProvider } from 'google-auth-library';

class GoogleOneTapCredentialsProvider extends CredentialsProvider {
  constructor(clientId: string) {
    super(clientId);
  }

  async getCredentials(): Promise<Credentials> {
    const googleOneTap = await import('@google/one-tap');
    const prompt = googleOneTap.prompt({
      client_id: this.clientId,
    });

    const response = await prompt.wait();
    const credentials = {
      accessToken: response.credential.accessToken,
      idToken: response.credential.idToken,
    };

    return credentials;
  }
}l