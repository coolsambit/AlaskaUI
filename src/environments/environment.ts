export const environment = {
  production: false,
  documentHubEndpoint: process.env['NG_APP_DOCUMENT_HUB_ENDPOINT'] || 'http://localhost:7071/api',
  // set azure.enabled to true when you want to use real Azure AD authentication
  azure: {
    enabled: true,
    tenantId: '3c373eae-82b1-4e6e-9697-91ecfa5a5d5f',
    clientId: '8cfdc94e-c452-4dd4-b10e-0910afc6395f',
    redirectUri: 'https://document-hub-aids-djh3frdhe5exfvcb.centralus-01.azurewebsites.net'
    //redirectUri: 'http://localhost:4200'
  },
  // Function App API configuration
  functionApp: {
    baseUrl: 'https://alaskaoperations-a8g0d9hfbqbccmf4.centralus-01.azurewebsites.net',
    // Delegated scope exposed on the app registration
    scopes: ['api://8cfdc94e-c452-4dd4-b10e-0910afc6395f/access_as_user']
  },
  storage: {
    enabled: true,
    // instead of uploading directly from the client, specify the
    // Function App URL that performs the ADLS upload server-side.
    // the UI will POST the form to this endpoint.
    functionUrl: 'https://alaskaoperations-a8g0d9hfbqbccmf4.centralus-01.azurewebsites.net/api/uploadfiles'
  }
};