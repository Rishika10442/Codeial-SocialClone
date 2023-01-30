const development = {
    name:'development',
    asset_path :'./assets',
    session_cookie_key :"blahsomething",
    db:'codeial_development',
    smtp:{
        service: 'gmail',
        host:'smtp.gmail.com',
        port:587,
        secure:false,
        auth:{
            user:'10442rishika@gmail.com',
            pass:'hrpouqvutrnrtklt'
        }
    },
    google_client_id : "1009440174879-4d929noi4vnkqvv5sgad7ln776osupge.apps.googleusercontent.com",
    google_client_secret:"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",
    google_call_back_URL:"http://localhost:8000/users/auth/google/callback",
    jwt_secret:'codeial',
    
}
const production = {
name:'production' 
}


module.exports = development;