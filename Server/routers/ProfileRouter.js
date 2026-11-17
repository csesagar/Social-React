const expresss = require("express");
const profileRouter = expresss.Router();
const { validationResult, body } = require("express-validator");
const bcrypt = require("bcryptjs");
const gravatr = require("gravatar");
const ProfileTable = require("../models/Profile");
const UserTable = require("../models/User");
const mongoose = require('mongoose');
const jwt = require("jsonwebtoken");
const verifyToken = require("../middlewares/TokenVerifier");


/*
    @usage : Create a Profile
    @url : http://127.0.0.1:5000/api/profiles/
    @fields : company , website , location , designation , skills , bio ,
    githubUsername, youtube , facebook , twitter , linkedin , instagram
    @method : POST
    @access : PRIVATE
 */
profileRouter.post('/',[
    body('company').not().isEmpty().withMessage('Company is Required'),
    body('website').not().isEmpty().withMessage('Website is Required'),
    body('location').not().isEmpty().withMessage('Location is Required'),
    body('designation').not().isEmpty().withMessage('Designation is Required'),
    body('skills').not().isEmpty().withMessage('Skills is Required'),
    body('bio').not().isEmpty().withMessage('Bio is Required'),
    body('githubUsername').not().isEmpty().withMessage('GithubUsername is Required'),
    body('youtube').not().isEmpty().withMessage('YouTube is Required'),
    body('facebook').not().isEmpty().withMessage('Facebook is Required'),
    body('twitter').not().isEmpty().withMessage('Twitter is Required'),
    body('linkedin').not().isEmpty().withMessage('Linkedin is Required'),
    body('instagram').not().isEmpty().withMessage('Instagram is Required'),
] ,verifyToken , async (request , response) => {
    const errors = validationResult(request);
    if (!errors.isEmpty()) {
        return response.status(400).json({ errors: errors.array() });
    }

    try {
        let requestedUser = request.headers['user'];

        let {company , website , location , designation , skills , bio, githubUsername ,
        youtube , facebook , twitter , linkedin , instagram} = request.body;

        let skillSet = skills.toString().split(',').map((skill) => skill.trim());
        let profileObj = {
            user : requestedUser?.id,
            company : company,
            website : website,
            location : location,
            designation : designation,
            githubUsername : githubUsername,
            bio : bio,
            skills : skillSet,
            experience : [] ,
            education : [] ,
        }
        // Social Object Creation
        profileObj.social = {};
        if(youtube) profileObj.social.youtube = youtube;
        if(facebook) profileObj.social.facebook = facebook;
        if(twitter) profileObj.social.twitter = twitter;
        if(linkedin) profileObj.social.linkedin = linkedin;
        if(instagram) profileObj.social.instagram = instagram;

        // save to db
        let profile = new ProfileTable(profileObj);
        profile = await profile.save();
        response.status(200).json({
            msg : 'Profile is Created Successfully',
            profile : profile
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

/*
    @usage : Get my Profile
    @url : http://127.0.0.1:5000/api/profiles/me
    @fields : no-fields
    @method : GET
    @access : PRIVATE
 */
profileRouter.get('/me', verifyToken, async (request , response) => {
    try {
        let requestedUser  = request.headers['user'];
        let profile = await ProfileTable.findOne({user : requestedUser.id}).populate('user', ['name' , 'avatar']);
        if(!profile){
            return response.status(500).json({
                errors : [
                    {
                        msg : 'No Profile Found for the User'
                    }
                ]
            });
        }
        response.status(200).json({
            profile : profile
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

/*
    @usage : Update a Profile
    @url : http://127.0.0.1:5000/api/profiles/
    @fields : company , website , location , designation , skills , bio ,
    githubUsername, youtube , facebook , twitter , linkedin , instagram
    @method : PUT
    @access : PRIVATE
 */
profileRouter.put('/',[
    body('company').not().isEmpty().withMessage('Company is Required'),
    body('website').not().isEmpty().withMessage('Website is Required'),
    body('location').not().isEmpty().withMessage('Location is Required'),
    body('designation').not().isEmpty().withMessage('Designation is Required'),
    body('skills').not().isEmpty().withMessage('Skills is Required'),
    body('bio').not().isEmpty().withMessage('Bio is Required'),
    body('githubUsername').not().isEmpty().withMessage('GithubUsername is Required'),
    body('youtube').not().isEmpty().withMessage('YouTube is Required'),
    body('facebook').not().isEmpty().withMessage('Facebook is Required'),
    body('twitter').not().isEmpty().withMessage('Twitter is Required'),
    body('linkedin').not().isEmpty().withMessage('Linkedin is Required'),
    body('instagram').not().isEmpty().withMessage('Instagram is Required'),
] ,verifyToken , async (request , response) => {
    const errors = validationResult(request);
    if (!errors.isEmpty()) {
        return response.status(400).json({ errors: errors.array() });
    }

    try {
        let requestedUser = request.headers['user'];

        let {company , website , location , designation , skills , bio, githubUsername ,
            youtube , facebook , twitter , linkedin , instagram} = request.body;

        let skillSet = skills.toString().split(',').map((skill) => skill.trim());
        let profileObj = {
            user : requestedUser?.id,
            company : company,
            website : website,
            location : location,
            designation : designation,
            githubUsername : githubUsername,
            bio : bio,
            skills : skillSet,
            experience : [] ,
            education : [],
            social : {
                youtube : youtube,
                twitter : twitter,
                linkedin : linkedin,
                facebook : facebook,
                instagram : instagram
            }
        }
        // save to db
        let profile = await ProfileTable.findOneAndUpdate({
            user : requestedUser.id
        }, {
            $set : profileObj
        }, {new : true});
        response.status(200).json({
            msg : 'Profile is Updated Successfully',
            profile : profile
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


/*
    @usage : Get Profile of a User
    @url : http://127.0.0.1:5000/api/profiles/users/:userId
    @fields : no-fields
    @method : GET
    @access : PUBLIC
 */
profileRouter.get('/users/:userId', async (request , response) => {
    try {
        let {userId} = request.params;     // getting userId from params
        // let mongoUserId = mongoose.Types.ObjectId(userId);
        console.log(userId);
        if(userId){
         let mongoUserId = new mongoose.Types.ObjectId(userId);
             console.log(true);
            let profile = await ProfileTable.findOne({user : mongoUserId}).populate('user', ['name' , 'avatar']);
            if(!profile){
                return response.status(500).json({
                    errors : [
                        {
                            msg : 'No Profile Found for the User'
                        }
                    ]
                });
            }
            response.status(200).json({
                profile : profile
            });
        }

        // console.log('userId is not present');
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

/*
    @usage : Delete a Profile , User , Post
    @url : http://127.0.0.1:5000/api/profiles/users/:userId
    @fields : no-fields
    @method : DELETE
    @access : PRIVATE
 */
profileRouter.delete('/users/:userId', verifyToken, async (request , response) => {
    try {
        let {userId} = request.params; 
        if(userId){
            let mongoUserId = new mongoose.Types.ObjectId(userId);
            // console.log(mongoUserId);

            // delete the profile
            let profile = await ProfileTable.findOne({user : mongoUserId});
            // console.log(profile);
            if(!profile){
                return response.status(500).json({
                    errors : [
                        {
                            msg : 'No Profile Found for the User'
                        }
                    ]
                });
            }
            console.log( profile._id);
            
           await ProfileTable.findByIdAndDelete(profile._id);
            // console.log('Profile deleted');

            // delete user
            let user = await UserTable.findById(mongoUserId);
            // console.log(user);
            if(!user){
                return response.status(500).json({
                    errors : [
                        {
                            msg : 'No User Found'
                        }
                    ]
                });
            }
            console.log('User found');
            await UserTable.findByIdAndDelete(mongoUserId);
            console.log('User deleted');

            // delete posts
            // TODO delete posts

            response.status(200).json(
                {
                    msg : 'Account is Deleted'
                }
            );
        }
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

/*
    @usage : Update an experience of a Profile
    @url : http://127.0.0.1:5000/api/profiles/experience
    @fields : title , company , location , from , to , current , description
    @method : PUT
    @access : PRIVATE
 */
profileRouter.put('/experience',[
    body('title').not().isEmpty().withMessage('Title is Required'),
    body('company').not().isEmpty().withMessage('Company is Required'),
    body('location').not().isEmpty().withMessage('Location is Required'),
    body('from').not().isEmpty().withMessage('From Date is Required'),
    body('description').not().isEmpty().withMessage('Description is Required'),
] , verifyToken,  async (request, response) => {
    const errors = validationResult(request);
    if (!errors.isEmpty()) {
        return response.status(400).json({ errors: errors.array() });
    }
    try {
        let {title , company , location , from , to , current , description} = request.body;
        let requestedUser  = request.headers['user'];
        let profile = await ProfileTable.findOne({user : requestedUser.id}).populate('user', ['name' , 'avatar']);
        if(!profile){
            return response.status(500).json({
                errors : [
                    {
                        msg : 'No Profile Found for the User'
                    }
                ]
            });
        }
        // update the profile
        let newExperience = {
            title : title,
            company : company,
            location : location,
            from : from,
            to : to ? to : ' ',
            current : current ? current : false,
            description : description
        };
        profile.experience.unshift(newExperience);     //unshift adds an element to the beginning of an array
        profile = await profile.save();
        response.status(200).json(
            {
                msg : 'Experience is Added Successfully',
                profile : profile
            }
        );
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

/*
    @usage : Delete an experience of a Profile
    @url : http://127.0.0.1:5000/api/profiles/experience/:experienceId
    @fields : no-fields
    @method : DELETE
    @access : PRIVATE
 */
profileRouter.delete('/experience/:experienceId', verifyToken, async (request , response ) => {
    try {
        let {experienceId} = request.params;
        const mongoExpId = new mongoose.Types.ObjectId(experienceId);
        console.log(`mongoExpId:`, mongoExpId);
        // let mongoUserId = new mongoose.Types.ObjectId(userId);
        let requestedUser  = request.headers['user'];
        console.log(`requestedUser:`, requestedUser);

        let profile = await ProfileTable.findOne({user : requestedUser.id}).populate('user', ['name' , 'avatar']);
        console.log(`profile:`, profile);
        if(!profile){
            return response.status(500).json({
                errors : [
                    {
                        msg : 'No Profile Found for the User'
                    }
                ]
            });
        }
        const removableIndex = profile.experience.findIndex(exp => exp._id.equals(mongoExpId));
        console.log(`removableIndex:`, removableIndex); 
        if(removableIndex !== -1){
            profile.experience.splice(removableIndex, 1); // remove an elem from array
            profile = await profile.save(); // save to db
            response.status(200).json(
                {
                    msg : 'Experience is Deleted Successfully',
                    profile : profile
                }
            );
        }
        // response.status(200).json({
        //     msg : 'Experience is Deleted Successfully',
        //     profile : profile
        // });
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

/*
    @usage : Update an education of a Profile
    @url : http://127.0.0.1:5000/api/profiles/education
    @fields : school, degree, fieldOfStudy , from , to , current , description
    @method : PUT
    @access : PRIVATE
 */
profileRouter.put('/education',[
    body('school').not().isEmpty().withMessage('School is Required'),
    body('degree').not().isEmpty().withMessage('Degree is Required'),
    body('fieldOfStudy').not().isEmpty().withMessage('FieldOfStudy is Required'),
    body('from').not().isEmpty().withMessage('From Date is Required'),
    body('description').not().isEmpty().withMessage('Description is Required'),
] , verifyToken,  async (request, response) => {
    const errors = validationResult(request);
    if (!errors.isEmpty()) {
        return response.status(400).json({ errors: errors.array() });
    }
    try {
        let {school , degree , fieldOfStudy , from , to , current , description} = request.body;
        let requestedUser  = request.headers['user'];
        let profile = await ProfileTable.findOne({user : requestedUser.id}).populate('user', ['name' , 'avatar']);
        if(!profile){
            return response.status(500).json({
                errors : [
                    {
                        msg : 'No Profile Found for the User'
                    }
                ]
            });
        }
        // update the profile
        let newEducation = {
            school : school,
            degree : degree,
            fieldOfStudy : fieldOfStudy,
            from : from,
            to : to ? to : ' ',
            current : current ? current : false,
            description : description
        };
        profile.education.unshift(newEducation);
        profile = await profile.save();
        response.status(200).json(
            {
                msg : 'Education is Added Successfully',
                profile : profile
            }
        );
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

/*
    @usage : Delete an education of a Profile
    @url : http://127.0.0.1:5000/api/profiles/education/:educationId
    @fields : no-fields
    @method : DELETE
    @access : PRIVATE
 */
profileRouter.delete('/education/:educationId', verifyToken, async (request , response ) => {
    try {
        let {educationId} = request.params;
        let mongoEduId = new mongoose.Types.ObjectId(educationId);
        let requestedUser  = request.headers['user'];

        let profile = await ProfileTable.findOne({user : requestedUser.id}).populate('user', ['name' , 'avatar']);
        if(!profile){
            return response.status(500).json({
                errors : [
                    {
                        msg : 'No Profile Found for the User'
                    }
                ]
            });
        }
        let removableIndex = profile.education.findIndex(edu => edu._id.equals(mongoEduId));
        if(removableIndex !== -1){
            profile.education.splice(removableIndex, 1); // remove an elem from array
            profile = await profile.save(); // save to db
            response.status(200).json(
                {
                    msg : 'Education is Deleted Successfully',
                    profile : profile
                }
            );
        }
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

/*
    @usage : Get all Profile
    @url : http://127.0.0.1:5000/api/profiles/all
    @fields : no-fields
    @method : GET
    @access : PUBLIC
 */
profileRouter.get('/all', async (request , response) => {
    try {
        let profiles = await ProfileTable.find().populate('user' , ['name' , 'avatar']);
        if(!profiles){
            return response.status(500).json({
                errors : [
                    {
                        msg : 'No Profiles Found'
                    }
                ]
            });
        }
        response.status(200).json({
            profiles : profiles
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

/*
    @usage : Get Profile of a User with Profile Id
    @url : http://127.0.0.1:5000/api/profiles/:profileId
    @fields : no-fields
    @method : GET
    @access : PUBLIC
 */
profileRouter.get('/:profileId', async (request , response) => {
    try {
        let {profileId} = request.params;
        if(profileId){
            let mongoProfileId = new mongoose.Types.ObjectId(profileId);
            let profile = await ProfileTable.findById(mongoProfileId).populate('user', ['name' , 'avatar']);
            if(!profile){
                return response.status(500).json({
                    errors : [
                        {
                            msg : 'No Profile Found for the User'
                        }
                    ]
                });
            }
            response.status(200).json({
                profile : profile
            });
        }
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

module.exports = profileRouter;