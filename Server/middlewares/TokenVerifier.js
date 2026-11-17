
const jwt = require('jsonwebtoken');

let verifyToken = async (request , response , next) => {
    try {
        let token = request.headers['x-auth-token'];
        if(!token){
            return response.status(401).json({
                errors : [
                    {msg : 'No Token provided, Authentication Denied'}
                ]
            });
        }
        let secretKey = process.env.JWT_SECRET_KEY;
        if(secretKey){
            let decode = await jwt.verify(token, secretKey);
            request.headers['user'] = decode.user;
            next();     // next function it will call the next middleware or route handler
        }
    }
    catch (error) {
        return response.status(500).json({
            errors : [
                {msg : 'Invalid Token, Authentication Denied'}
            ]
        });
    }
};
module.exports = verifyToken;