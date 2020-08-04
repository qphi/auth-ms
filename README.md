# Auth WS
Actually, we use mock in order to simulate client application. 
In the future, application using AuthWS should use a `.env` file like following and send theses data to AuthWS (probably via a private DB)

`txt
NODE_ENV=development
PORT=8626


JWT_ACCESS_TTL= 180000 # 3 min

JWT_SECRET_ACCESSTOKEN=bd715a978b0d2caa370a925755f83a20bc68572279e7f93d9bec79c8904ef12f #hash('sha256', "jwt-qp-access-token")
JWT_SECRET_REFRESHTOKEN=b4153dedfdbd22b188689f3bac33461679269b1770f522c269563fd6d5c17da2 #hash('sha256', "jwt-qp-refresh-token")

#Obfuscation: if you cant read the name of my cookie, it's harder to steal my jwt
COOKIE_JWT_ACCESS_NAME=9c7b76bbec593fc568e6eb05b65dcbdbd1c918b31f5aca6201c1520361b222c0 #hash('sha256', 'cookie_name_jwt_access_book');
COOKIE_JWT_REFRESH_NAME=247b8b85d3b7706b866e4eb1890e82d23c7ad4d1cec9f9e2ce02e250271f8847 #hash('sha256', "jwt-qp-refresh-token")
`

#Before using in prod
- Be sure that run with TLS
- Use a db to list all client app instead of mock
- Use a redis server instead of array to store token (improve scalability)