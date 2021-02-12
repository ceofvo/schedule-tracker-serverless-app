import { CustomAuthorizerEvent, CustomAuthorizerResult } from 'aws-lambda'
import 'source-map-support/register'

import { verify } from 'jsonwebtoken'
import { createLogger } from '../../utils/logger'
//import Axios from 'axios'
//import { Jwt } from '../../auth/Jwt'
import { JwtPayload } from '../../auth/JwtPayload'

const logger = createLogger('auth')

// TODO: Provide a URL that can be used to download a certificate that can be used
// to verify JWT token signature.
// To get this URL you need to go to an Auth0 page -> Show Advanced Settings -> Endpoints -> JSON Web Key Set
//const jwksUrl = 'https://fvo.auth0.com/.well-known/jwks.json'

const cert = `-----BEGIN CERTIFICATE-----
MIIC4jCCAcqgAwIBAgIJK69E+CJQJHbqMA0GCSqGSIb3DQEBBQUAMBgxFjAUBgNV
BAMTDWZ2by5hdXRoMC5jb20wHhcNMTYxMDExMDYxMzE0WhcNMzAwNjIwMDYxMzE0
WjAYMRYwFAYDVQQDEw1mdm8uYXV0aDAuY29tMIIBIjANBgkqhkiG9w0BAQEFAAOC
AQ8AMIIBCgKCAQEAqqyAEfoXguiLPtZwUz10mPlfXtNJSHjJqvUQ/cDDjK74k0mv
pFt0OJoK7XFD4FqJ3lSEFXy3MTPULqzOr6fTTNupe61EIxG6v0w27b2YOxTy7tJc
n9Gr9MKYu4VXStUC+jWULqyFsuNQzafp3JTjEqTlEfAWKsqIAJGm0eUA9uGIaBc5
VOLhW1dWDmnxFzXamOV9Bc4Hfe/GipYx2TN7T328qaLlQVjxMPLhMDaDBpCejfIu
bVWY1n0JkY2+FPu4OZt6ZKzmM94h59M0dS9sHS8MxlDHfih+OZzDMKrzZ6tAKWEO
/t9hU+Pkqwi35DHTv+ca6fViEGDhnFR98/M5dQIDAQABoy8wLTAMBgNVHRMEBTAD
AQH/MB0GA1UdDgQWBBS71rFlyiAF2xyJM8Tj12MTAODPdjANBgkqhkiG9w0BAQUF
AAOCAQEAePjpo56GmkjCwldZPoJU6TI2nVz+76t9YyHMUsdKwQsAvRYBnBs2urVS
x4+GKosLJfFvUcGdqGGa3iRA/3gXy+6ZNEstOpcWAhu1/+7xS0GUZDPMst6fu0HX
mwJBiTrEqFJNgdFEi/dwvqtGauYEC4lIiKIFUTDOunPBPvEZu+RnuDBBKOXaaONR
x648azWoW1Kw08e8z1Ta0ZwNGUpCNi6bEradebM54tNo7I2BnpJfiTjXKA3qpBOn
UX3NKo23IQK7ZHejNpyqRsBile4iGPNehCPoYPNbmFfrQBjDxQA2NQDIu6/6VzHC
+glIKkEgIchsfivNy9440Gds50qu9g==
-----END CERTIFICATE-----`

export const handler = async (
  event: CustomAuthorizerEvent
): Promise<CustomAuthorizerResult> => {
  logger.info('Authorizing a user', event.authorizationToken)
  try {
    const jwtToken = await verifyToken(event.authorizationToken)
    logger.info('User was authorized', jwtToken)

    return {
      principalId: jwtToken.sub,
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Allow',
            Resource: '*'
          }
        ]
      }
    }
  } catch (e) {
    logger.error('User not authorized', { error: e.message })

    return {
      principalId: 'user',
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Deny',
            Resource: '*'
          }
        ]
      }
    }
  }
}

async function verifyToken(authHeader: string): Promise<JwtPayload> {
  //const token = getToken(authHeader)
  //const jwt: Jwt = decode(token, { complete: true }) as Jwt

  // TODO: Implement token verification
  // You should implement it similarly to how it was implemented for the exercise for the lesson 5
  // You can read more about how to do this here: https://auth0.com/blog/navigating-rs256-and-jwks/

  if (!authHeader)
  throw new Error('No authentication header')

  if (!authHeader.toLowerCase().startsWith('bearer '))
    throw new Error('Invalid authentication header')

  const split = authHeader.split(' ')
  const token = split[1]

  return verify(token, cert, { algorithms: ['RS256'] }) as JwtPayload
}
/*
function getToken(authHeader: string): string {
  if (!authHeader) throw new Error('No authentication header')

  if (!authHeader.toLowerCase().startsWith('bearer '))
    throw new Error('Invalid authentication header')

  const split = authHeader.split(' ')
  const token = split[1]

  return token
}*/
