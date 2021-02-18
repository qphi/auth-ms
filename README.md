# Auth WS
Actually, we use mock in order to simulate client application. 
In the future, application using AuthWS should use a `.env` file like following and send theses data to AuthWS (probably via a private DB)

# Install

## Install dependancies :
```npm install```


## Setup your ENV
Copy `/.env-example` in `/.env` or `/<dev | test>.env`' file. You probably should not rewrite all entry. `/.env` will contains your credentials, do not commit it. Add data to `./authenticator/.env-example` if you want to share any updates.

# Env File example
```
DB_TYPE=dynamo
DYNAMO_ACCESS_KEY_ID=<YOUR_DYNAMO_ACCESS_KEY_ID>
DYNAMO_SECRET_KEY_ID=<DYNAMO_SECRET_KEY_ID>
DYNAMO_REGION=eu-west-3
DYNAMO_API_KEY_INDEX_NAME=API_KEY-index
DYNAMO_TOKEN_TARGET_INDEX_NAME=TOKEN_TARGET-index
DYNAMO_USER_FindByUUID_INDEX_NAME=FindByUUID

PORT=3370

AUTH_MS_HOST=localhost:3370

REDIS_HOST=127.0.0.1
REDIS_PORT=6379

USER_ENTITY=dev-auth-ms-user
JWT_ENTITY=dev-auth-ms-jwt
MS_RECORDED_ENTITY=dev-auth-ms-recorded
MS_UUID=f04c1676-8a0f-5f05-b279-f0f8829c5e36
```

## Signature HTTP
Le serveur utilise une signature HTTP, avec la configuration actuelle :
```
cd ./app
mkdir keys
cd ./keys
```

Puis renseigner le couple clé publiques/privées comme :
* `app/keys/auth-ms-dev-private.ppk`
* `app/keys/auth-ms-dev-public`
## Run 
``` npm run dev-env ```


Quelques recommandations pour construire ses tokens:
- Les tokens servant à chiffrer / obfusquer des données seront construit de la façon suivante : SHA256(SALT + APPNAME + FUNCTION)

Example : sha256('025782-my-app-cookie-jwt-access) with SALT = 025782, APPNAME = my-app and FUNCTION = cookie-jwt-access

- Pour les ID "utiles" on préfère utiliser des UID qui sont quasi-uniques et lisibles ! Pour les générer à la main => https://www.uuidtools.com/v5, avec le namespace correspondant à la valeur `MS_UUID` dans le fichier `/.env`, et en valeur le nom de l'application.

Note :

- L'utilisation des UUID est utile pour générer des ID lisibles et uniques au sein d'un même namespace. Donner un UUID à l'application est utile afin d'associer à tous les utilisateurs un UUID namespacé par le UUID de l'application. Cela diminue drastiquement la probabilité de collision entre les UUID des utilisateurs de l'application. En contexte de dev, cet aspect peut être négligé.

- Lorsque j'aurai fait un Back Office (BO), toutes ces données seront générés automatiquement. Pour enregistrer l'application on donnera juste un APP_NAME, une icone, et tous les autres champs seront générés par défaut. On pourra évidemment les modifier depuis l'admin, auquel cas ce sera à l'utilisateur du BO de s'assurer que ses données sont hashées.


# Using the API

## Register
``` 
POST /register
```

```
{
    "email": "aaa",
    "password": "hello-1",
    "confirmPassword": "hello-1",
    "app": "books"
}
```
#Before using in prod
- Be sure that run with TLS
- Use a db to list all client app instead of mock
- Use defaut img for forgot-password page
- Allow upload file for back-office solution
- Check MySQL injection
- use POW, captcha, rate-limiter, idempotency, client-side avoid multiples submit
- use redis to cache userExists
- implement BO CRUD (restrict by IP + user account)


# DevStack
## How to ?
- [Send email in dev](https://stackabuse.com/how-to-send-emails-with-node-js/)

## todo
- Support RSA key pair to sign and verify jwt in order to increase security and prevent rewrite jwt by other services
- Add and store a salt and use it to sign all password and eventually some secrets
- fix cannot load img store on aws s3
- test SQL injection

- delete by id & kind for DynamoJWTPersister (should update rest api, all providers)
- dynamo: in case of ConditionalCheckFailedException on create, make an additionnal request in order to verify is user already exists
- bloquer un utilisateur si la demande de refresh est trop élevée, ou si l'on détecte deux identityToken valide simultanément
- remonter les erreurs dans la gestion du JWT pour l'afficher dans le dashboard