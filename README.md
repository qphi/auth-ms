# Auth WS
Actually, we use mock in order to simulate client application. 
In the future, application using AuthWS should use a `.env` file like following and send theses data to AuthWS (probably via a private DB)

# Install

## Prerequis

First, you need to clone this repo, of course. Docker settings are not ready yet, be sure that the following programs are availalble on your device:
- `redis`
- `mysql` (or `mariadb`)
- `nodeJS`

## Install dependancies :
```npm install```

## Mock your db
`/bin` contains two files. Run theses command under your mysql-cli.
- `/bin/create_db.sql` create your db and a system user
- `/bin/books.mock.sql` create a mock for a `book` application.

## Setup your ENV
Copy `./authenticator/.env-example` in `/.env` file. You probably should not rewrite all entry. `/.env` will contains your credentials, do not commit it. Add data to `./authenticator/.env-example` if you want to share any updates.


```
REDIS_HOST=127.0.0.1
REDIS_PORT=16379 # or 6379 by default without docker
REDIS_PASSWORD=<your redis password for auth>

# replace with values set in your create_db.sql
DB_HOST=localhost
DB_PORT= 13306 # or 3306 by default without docker
DB_USER=auth_ms_user
DB_NAME=auth_ms_db
DB_PASSWORD=UJB8BK3d6keLPMrwMQq9ezPG8VjBR4dZb7qxEb5BQRCzug2gMQCPEwMZ2nWYNzEg3V9rYJUMYKrY5vwfAyHw9p4ne69JjwEDt4FzWMQwHedH39K4u7E48rjY6fQGH4bypgfERa7j4NVZVThZBgYSzDSp6sGBmWSpVpPb2vnzXwkVyYWbStSxS5ewgE2eX7yzMG8eCgnZ6kJQ4pGFLjbFsjTLxEKMJCtjXKhBna33YpwDVjvURVfMZ2P6Rd5TL4u8bTLYaaK75bE3PqmSqG3ZTBKUXMP6xMTFFHuGMSUzhzegSbSUw8PuMJ8NhM3ghfNtWEge8sVRx9QMZM2JmZY2G4XuyTvBMb4EG5kzpT8zscQcDh683Mpxz54a2YSBAEVWNuMeH5QEZwp6zANTf6B8r5RGxexERfSBDmQ9L4YncvkRdWSBCY3NnE3u5DdpBjKSfGnLgUHwAmxRSbtR3DVNdKUwFttGRJj4UQvGnShs6Uymw4M6neASWThkHDQm3T6qVW5Q77wfwq336aLQB6WLE4jGZDDueMmRrG7V4sJTHGpXaHmPQPqMRnkAmnuhQ2WqRy7skXMBwgSpdMbZg57AjbFwcx4F25AduxrSYtEmDtLVrES4TLuSnrtSRTHqu968G9JxJdTQWWEhYqKNbpzC3xLyj7pv9MDzQ33pGYgrERpHMtmM9RzxXB7jsxQvk8u5npyGDCQjXJQ2HhDjTCyxuNGTXEyY38LDuDVFjCSedhYGajF6Hb8kzKL6Pb3Az8ZabsNQJRA5v2hfKSTgzHgAEMw2XWqVrqmdkLaZPuyZ4Ct9Pzhkz2BkDExnGgDwuvh2nUHKMD6XCTjZhBxAz2FFUA6cVXzJuBWt7f835bdMDxkybzZegyVgcfyP32w4JrrYjUaYSJ2PFyjSca9KVSfUTDzaXFrmXeCNkChjf2fWgtgsKaLytcsvGY9vFu4jhgJk6BHZLgXY65VauGH6qSkL6QXjtu4af9aSb7tECBKTWQbZaVkq7q8EAxEYBQswecN5
```

# Env File example
```
NODE_ENV=development
PORT=8626

REDIS_HOST=127.0.0.1
REDIS_PORT=16379 # or 6379 by default without docker
REDIS_PASSWORD=<PASSWORD>

# replace with correct UUID, of course
MS_UUID=uuidv5(MS_UUID(auth_ms), <servce_name>)


DB_HOST=localhost
DB_PORT= 13306 # or 3306 by default without docker
DB_USER=auth_ms_user
DB_NAME=auth_ms_db
DB_PASSWORD=<PASSWORD>

JWT_ACCESS_TTL= 180000 # 3 min
JWT_SECRET_ACCESSTOKEN=bd715a978b0d2caa370a925755f83a20bc68572279e7f93d9bec79c8904ef12f #hash('sha256', "jwt-qp-access-token")

JWT_SECRET_REFRESHTOKEN=b4153dedfdbd22b188689f3bac33461679269b1770f522c269563fd6d5c17da2 #hash('sha256', "jwt-qp-refresh-token")

#Obfuscation: if you cant read the name of my cookie, it's harder to steal my jwt
COOKIE_JWT_ACCESS_NAME=9c7b76bbec593fc568e6eb05b65dcbdbd1c918b31f5aca6201c1520361b222c0 #hash('sha256', 'cookie_name_jwt_access_book');
COOKIE_JWT_REFRESH_NAME=247b8b85d3b7706b866e4eb1890e82d23c7ad4d1cec9f9e2ce02e250271f8847 #hash('sha256', "jwt-qp-refresh-token")
```

## Run 
``` node ./authenticator```

# Recordin a new application
This prototype still use a mock to record application. If you need to test with custom value, edit `/authenticator/authenticator.mock.js`. Add an entry to `serviceRecorded` object like the following:

```
 servicesRecorded: {
        'my-app': {
            DB_TYPE: 'mysql',
            JWT_ACCESS_TTL: 180000,
            JWT_SECRET_ACCESSTOKEN: <hash('sha256', "my-app-jwt-access")>,
            JWT_SECRET_REFRESHTOKEN: <hash('sha256', "my-app-jwt-refresh") >,
            JWT_SECRET_FORGOTPASSWORDTOKEN: <hash('sha256', "my-app-jwt-forgotpassword")>,
            MS_UUID: <MS_UUID=uuidv5(MS_UUID(auth_ms), <servce_name>)>,
            COOKIE_JWT_ACCESS_NAME: <hash('sha256', "my-app-cookie-jwt-access")>,
            COOKIE_JWT_REFRESH_NAME: <hash('sha256', "my-app-cookie-jwt-refresh")>,
            ICON_SRC: 'https://freesvg.org/img/1489798288.png'
        },
    }
```

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