const expresss = require("express");
const userRouter = expresss.Router();
const { validationResult, body } = require("express-validator");
const bcrypt = require("bcryptjs");
const gravatr = require("gravatar");
const UserTable = require("../models/User");
const jwt = require("jsonwebtoken");
const verifyToken = require("../middlewares/TokenVerifier");

/*
    @usage : Register a User
    @url : http://127.0.0.1:5000/api/users/register
    @fields : name , email, password
    @method : POST
    @access : PUBLIC
 */
userRouter.post(
  "/register",
  [
    body("name").not().isEmpty().withMessage("Name is Required"),
    body("email").not().isEmpty().withMessage("Email is Required"),
    body("password").not().isEmpty().withMessage("Password is Required"),
  ],
  async (request, response) => {
    const errors = validationResult(request);
    if (!errors.isEmpty()) {
      return response.status(400).json({ errors: errors.array() });
    }

    try {
      let { name, email, password } = request.body;

      // check if the user is exists
      let user = await UserTable.findOne({ email: email });
      if (user) {
        return response.status(401).json({
          errors: [
            {
              msg: "User is Already Exists!!",
            },
          ],
        });
      }

      // encrypt the password
      let salt = await bcrypt.genSalt(10);
      let encryptPassword = await bcrypt.hash(password, salt);

      // avatar url of email
      let avatar = gravatr.url(email, {
        s: "200",
        r: "pg",
        d: "mm",
      });

      // save to db
      user = new UserTable({
        name: name,
        email: email,
        password: encryptPassword,
        avatar: avatar,
      });
      user = await user.save();
      response.status(200).json({
        msg: "Registration is Success",
      });
    } catch (error) {
      response.status(500).json({
        errors: [
          {
            msg: error,
          },
        ],
      });
    }
  },
);

/*
    @usage : Login a User
    @url : http://127.0.0.1:5000/api/users/login
    @fields : email, password
    @method : POST
    @access : PUBLIC
 */
userRouter.post(
  "/login",
  [
    body("email").not().isEmpty().withMessage("Email is Required"),
    body("password").not().isEmpty().withMessage("Password is Required"),
  ],
  async (request, response) => {
    const errors = validationResult(request);
    if (!errors.isEmpty()) {
      return response.status(400).json({ errors: errors.array() });
    }

    try {
      let { email, password } = request.body;

      // check if email is exists
      let user = await UserTable.findOne({ email: email });
      if (!user) {
        return response.status(401).json({
          errors: [{ msg: "Invalid Email id" }],
        });
      }

      // check if the password is correct
      let isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return response.status(401).json({
          errors: [{ msg: "Invalid Password" }],
        });
      }

      // create a payload & Token
      let payload = {
        user: {
          id: user.id, 
          name: user.name, 
        },
      };

      let secretKey = process.env.JWT_SECRET_KEY;
      if (secretKey) {
        let token = await jwt.sign(payload, secretKey);
        response.status(200).json({
          msg: "Login is Success",
          token: token,
        });
      } else {
        response.status(400).json({
          errors: [{ msg: "Server Error, unable to create a token" }],
        });
      }
    } catch (error) {
      response.status(500).json({
        errors: [
          {
            msg: error,
          },
        ],
      });
    }
  },
);

/*
    @usage : Get User Info
    @url : http://127.0.0.1:5000/api/users/me
    @fields : no-fields
    @method : GET
    @access : PRIVATE
 */
userRouter.get('/me', verifyToken, async (request , response) => {
    try {
        let requestedUser = request.headers['user'];
        let user = await UserTable.findById(requestedUser.id).select('-password'); // select('-password') means it will not return the password field
        if(!user){
            response.status(500).json({
                errors : [
                    {
                        msg : 'User Not Found'
                    }
                ]
            });
        }
        response.status(200).json({
            msg : 'Found User Info',
            user : user
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
