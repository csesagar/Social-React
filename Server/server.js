const express = require('express');
const app = express();
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

// configure cors
app.use(cors());

// configure to receive form data
app.use(express.json());
// configure dotEnv
dotenv.config({
    path : './.env'
});

const port = process.env.PORT || 5000;
// mongo configuration 
let dbURL  = process.env.MONGO_DB_CLOUD;
if(dbURL){
    mongoose.connect(dbURL).then((response) => {
        console.log(`Connected to MongoDB Successfully....`);
    }).catch((error) => {
        console.error(error);
        process.exit(1); // stops node js process
    });
} 

//simple url 
app.get('/', (request, response) => {
    response.status(200).send(`<h2>Welcome to React Social Server App</h2>`);
});


// configure the routers
app.use('/api/users', require('./routers/userRouter'));
app.use('/api/profiles', require('./routers/ProfileRouter'));
app.use('/api/posts', require('./routers/postRouter'));


app.listen(port, () => {
    console.log(`Express Server is Started at http://localhost:${port} `);
});