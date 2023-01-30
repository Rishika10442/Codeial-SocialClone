const Friendship = require('../models/friendship');
const Post = require('../models/post');
const User = require('../models/user');

// module.exports.home = function(req,res){
//  //  return res.end('<h1>Up for Codeial!</h1>')
  
// //  Post.find({},function(err,posts){
    
// //  });
 
// //populate the user of each post
//  Post.find({})
//  .populate('user')
//  .populate({
//   path:'comments',
//   populate:({
//     path:'user'
//   })
//  })
//  .exec(function(err,posts){
//   User.find({},function(err,users){
//     return res.render('home',{
//       title: 'Codeial|Home',
//       posts:posts,
//       all_users:users
//       });
//   });

  
//  });


// }

module.exports.home = async function(req,res){
  try{
    //populate the user of each post
    let posts = await Post.find({})
        .sort('-createdAt')
        .populate('user')
        .populate({
            path: 'comments',
            populate: {
                path: 'user'
            },
            populate: {
                path: 'likes'
            }
        }).populate('comments')
        .populate('likes');
  
// for(let i=0;i<posts.length;i++){
//  for(let j=0;j<posts[i].comments.length;j++){
//   console.log(posts[i].comments[j].likes[0]);
//  }
// }
let friends =await Friendship.find({from_user:req.user});
//console.log(friends);
for(let i=0;i<friends.length;i++){
  await  friends[i].populate('to_user');
}
//console.log('after *********');
//console.log(friends);
 let users = await User.find({});


 return res.render('home',{
  title: 'Codeial|Home',
  posts:posts,
  all_users:users,
  friends:friends
  });
  }catch(err){
    console.log("error in home controller",err)
    return;
  }
  
 
}

//using then
// Post.find({}).populate('comment').then(function());

//let posts = Post.find({}).populate('comment').exec();
//posts.then()



//module.exports.actionName = function(req,res)