//Once your application is deployed, copy an API id here so that the frontend could interact with it
const apiId = 'db650vr017'
export const apiEndpoint = `https://${apiId}.execute-api.us-east-1.amazonaws.com/dev`

export const authConfig = {
  //Create an Auth0 application and copy values from it into this map
  domain: 'fvo.auth0.com',            // Auth0 domain
  clientId: 'OHGKWlMDREqtHlIGvLFMPgeo33j7yKA4',          // Auth0 client id
  callbackUrl: 'http://localhost:3000/callback'
}
