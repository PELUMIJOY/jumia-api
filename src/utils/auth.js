
const { betterAuth } = require("better-auth") ;
const { MongoClient } = require("mongodb") ;
const { mongodbAdapter } = require("better-auth/adapters/mongodb") ;
 const MONGOURL = process.env.MONGO_URI;
const client = new MongoClient(MONGOURL);
const db = client.db();
 

 const auth = betterAuth({
    //...other options
      database: mongodbAdapter(db),
    emailAndPassword: {  
        enabled: true
    },
    socialProviders: {
        google: { 
            clientId: process.env.GOOGLE_CLIENT_ID, 
            clientSecret: process.env.GOOGLE_CLIENT_SECRET , 
        }, 
         facebook: { 
            clientId: process.env.FACEBOOK_APP_ID, 
            clientSecret: process.env.FACEBOOK_APP_SECRET, 
        }, 
    },
    trustedOrigins : [
      "http://localhost:5000",
      "https://ecommerce-app-sgr3-git-main-pelumijoys-projects.vercel.app/",
    ],
});

module.exports={
 auth   
}