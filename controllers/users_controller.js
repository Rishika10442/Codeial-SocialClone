const User = require('../models/user');
const fs = require('fs');
const path = require('path');
const resetEmailWorker = require('../workers/resetPassword_mailer');
const queue = require('../config/kue');
const Token = require('../models/token');
const Friendship = require('../models/friendship');


// //profile page , manual-authentication
// module.exports.profile= function(req,res){
//     if(req.cookies.user_id){
//         User.findById(req.cookies.user_id,function(err,user){
//             //user is found
//             if(user){
//                 res.render('user_profile',{
//                     title:'profile-page',
//                     user:user
//                 });
//                 return;
//             }
//             //user is not present
//             return res.redirect('/users/sign-in');
//         })
//     }else{
//         return res.redirect('/users/sign-in');
//     }    
// }

//profile page
module.exports.profile=async function(req,res){
   try{
   let user = await User.findById(req.params.id);

   let friend1 =await Friendship.findOne({from_user:req.params.id, to_user:req.user.id});
   let friend2 =await Friendship.findOne({from_user:req.user.id, to_user:req.params.id});
   
   let friends=false ;
   if(friend1 || friend2)friends=true;
   res.render('user_profile',{
            title:'profile-page',
            profile_user:user,
            friends:friends
           
            });
        }catch(err){
            console.log(err);
        }
   // console.log(req);
               
}

//upload profile page before multer
// module.exports.update = function(req,res){
//     if(req.user.id == req.params.id){
        
//          User.findByIdAndUpdate(req.params.id,req.body,function(err,user){
//             req.flash('success','Updated');
//             return req.redirect('back');
//          });
//     }else{
//         req.flash('error','Unauthorized');
//         return res.status(401).send('Unauthorized');
//     }
// }



//update profile page
module.exports.update =async function(req,res){
    if(req.user.id == req.params.id){
        try{
        let user =await User.findById(req.params.id);
         User.uploadedAvatar(req,res,function(err){
            if(err){console.log('Multerrr',err); }
            //console.log(req.file);
           user.name = req.body.name;
           user.email=req.body.email;
           if(req.file){
            //if user already has a avatar
            if(user.avatar){
                fs.unlinkSync(path.join(__dirname,'..',user.avatar));
            }

            //this is saving the path of the uploaded file into the avatar field in the user
            user.avatar = User.avatarPath + '/' + req.file.filename;
           }
           user.save();
           //return res.redirect('back');
        });
        req.flash('success','Updated');
        return res.redirect('back');


        }catch(error){
            console.log(error);
            return res.redirect('back');
        }
    }else{
        req.flash('error','Unauthorized');
        return res.status(401).send('Unauthorized');
    }
}




//render sign up page
module.exports.signUp = function(req,res){
    if(req.isAuthenticated()){
        res.redirect('/users/profile');
        return;
    }

    return res.render('user_sign_up',{
        title:"Codeial | SignUP"
    })
}
//render sign In page
module.exports.signIn = function(req,res){
    console.log("hii");
    if(req.isAuthenticated()){
        res.redirect('/users/profile');
        return;
    }


    return res.render('user_sign_in',{
        title:"Codeial | SignIn"
    })
}

//get the sign up data
module.exports.create = function(req,res){
    //check whether password and confirm password are equal
    if(req.body.password != req.body.confirm_password){
        console.log("password not matching");
        //console.log(req.body.password, req.body.confirm_password);
       return  res.redirect('back');
    }

    //check if it already exists
    User.findOne({email:req.body.email},function(err,user){
        if(err){console.log("error in siging up user find"); return}

        if(!user){
            User.create(req.body,function(err,user){
                if(err){console.log("error in siging up user create");return}
            return res.redirect('/users/sign-in')
            });
        }
        else{
            res.redirect('back');
        }
        

    })

}

// // sign in and crete session for user,manual-authentication
// module.exports.createSession = function(req,res){
    
//     //check whether user exists
//     User.findOne({email:req.body.email},function(err,user){
//         if(err){console.log("error in finding user at sign in ");return}
    
//         //handle user found
//         if(user){

//             //handle password mismatch
//             if(user.password != req.body.password){
//                 return res.redirect('back');
//             }
//             //handle session creation

//             res.cookie('user_id',user.id);
//             return res.redirect('/users/profile')

//         }else{
//                 //not found
//                return res.redirect('back'); 
//         }
//     })
// }

// sign in and crete session for user,authentication
module.exports.createSession = function(req,res){
    req.flash('success','Logged In Successfully');
    return res.redirect('/');
    
}

module.exports.destroySession = function(req,res){
    req.logout(function(err) {
        if (err) { return next(err); }
        req.flash('success','Logged Out Successfully');
        res.redirect('/');
      });
    };

//render the forgot password page for user
module.exports.forgotPassword = function(req,res){
    res.render('forgot_password',{
        title:'Reset Password'
    });
}

//create token and send link to email for password change
module.exports.resetPassword =async function(req,res){
   // console.log(req.body);
   let user = await User.findOne({email:req.body.email});
   //console.log(user);
    let token =await Token.create({isValid:true,user:user})
   let job = queue.create('reset',token).save(function(err){
    if(err){
        console.log('error in creating queue',err);
        return;
    }
    console.log('enqueued',job.id);
    
});
res.render('reset_email_sent',{
    title:'Mail Inbox'
});   
}

//render the update password page
module.exports.changePassword =async function(req,res){
  //  console.log("ainside cahnge password in user controller",req.params.id);
   let token = await Token.findById(req.params.id);
   if(!token || token.isValid == false){
    res.render('user_sign_in',{
        title:'signIn'
    })
    return;
   } 
   else{
    await Token.findByIdAndUpdate(req.params.id,{isValid:false});
    res.render('changePassword',{
        title:'changePassword'
    })
   }
   
}


module.exports.updatePassword=async function(req,res){
    if(req.body.password != req.body.confirm_password){
        console.log("password not matching");
        //console.log(req.body.password, req.body.confirm_password);
       return  res.redirect('back');
    }
    let user =await  User.findOne({email:req.body.email});
    if(!user){
        res.render('user_sign_up',{
            title:'signUp'
        })
        return;
    }
    else{
        console.log(user);
    await User.findByIdAndUpdate(user.id,{password:req.body.password});
        console.log("changedddd******");
        console.log(user.password);
        res.render('user_sign_in',{
            title:'SignIn'
        })
    }

}