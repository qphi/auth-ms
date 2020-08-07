// MS_UUID=uuidv5(MS_UUID(auth_ms), <servce_name>)

module.exports =  {
    servicesRecorded: {
        'books': {
            DB_TYPE: 'mysql',
            JWT_ACCESS_TTL: 180000,
            JWT_SECRET_ACCESSTOKEN: 'bd715a978b0d2caa370a925755f83a20bc68572279e7f93d9bec79c8904ef12f',
            JWT_SECRET_REFRESHTOKEN: "b4153dedfdbd22b188689f3bac33461679269b1770f522c269563fd6d5c17da2",
            MS_UUID: '7b22940b-688a-54e7-8741-cd9d4aaf4642',
            COOKIE_JWT_ACCESS_NAME: "9c7b76bbec593fc568e6eb05b65dcbdbd1c918b31f5aca6201c1520361b222c0",
            COOKIE_JWT_REFRESH_NAME: "247b8b85d3b7706b866e4eb1890e82d23c7ad4d1cec9f9e2ce02e250271f8847"
        },

        'test-2': {
            DB_TYPE: 'mysql',

            JWT_ACCESS_TTL: 180000,
            JWT_SECRET_ACCESSTOKEN: '84142917fb920fd28c1fee0cb004cc24cf0c61d883a6184174837acc913a9809',
            JWT_SECRET_REFRESHTOKEN: 'caf0b212b7f2cab81dbcaf685d98012eb881115b65cf7276b992cbac598265ef', 
            MS_UUID: 'ddb5640d-b8f6-538b-9bea-18b00bd2b236',
            COOKIE_JWT_ACCESS_NAME: 'eb328df29dcdf2b244c96d1263505f7599c3467a66bc6835cb664f119574b140',
            COOKIE_JWT_REFRESH_NAME: '19c55fce5840eb6a3fcb5087e0ff5478069be9fc82cbaf83e66e574a9e2da3ec'
        }
    },

    users: [
        {
            username: 'john',
            password: 'password123admin',
            role: 'admin'
        }, {
            username: 'anna',
            password: 'password123member',
            role: 'member'
        }
    ]
}