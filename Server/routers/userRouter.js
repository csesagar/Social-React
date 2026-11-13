const expresss = require("express");
const userRouter = expresss.Router();
const { validationResult, body} = require("express-validator");
const bcrypt = require("bcryptjs");
const gravatr = require("gravatar");
const UserTable = require("../models/User");
const jwt = require("jsonwebtoken");

/*
    @usage : Register a User
    @url : http://127.0.0.1:5000/api/users/register
    @fields : name , email, password
    @method : POST
    @access : PUBLIC
 */
userRouter.post('/register',[
    body('name').not().isEmpty().withMessage('Name is Required'),
    body('email').not().isEmpty().withMessage('Email is Required'),
    body('password').not().isEmpty().withMessage('Password is Required'),
], async (request, response) => {
    const errors = validationResult(request);
    if (!errors.isEmpty()) {
        return response.status(400).json({ errors: errors.array() });
    }

    try {
        let {name , email , password} = request.body;

        // check if the user is exists
        let user = await UserTable.findOne({email : email});
        if(user){
            return response.status(401).json({
                errors : [
                    {
                        msg : 'User is Already Exists!!'
                    }
                ]
            });
        }

        // encrypt the password
        let salt = await bcrypt.genSalt(10);
        let encryptPassword = await bcrypt.hash(password, salt);

        // avatar url of email
        let avatar = gravatr.url(email, {
            s : '200',
            r : 'pg',
            d : 'mm'
        });

        // save to db
        user = new UserTable({
            name : name,
            email : email,
            password : encryptPassword,
            avatar : avatar
        });
        user = await user.save();
        response.status(200).json({
            msg : 'Registration is Success'
        });
    }
    catch (error) {
        response.status(500).json({
            errors : [
                {
                    msg : error
                }
            ]
        });
    }
});
module.exports = userRouter;