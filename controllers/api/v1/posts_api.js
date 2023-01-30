const Post = require('../../../models/post');
const Comment = require('../../../models/comment');

module.exports.index = async function(req,res){
   
   
    let posts =await  Post.find({})
  .sort('-createdAt')
  .populate('user')
  .populate({
   path:'comments',
   populate:({
     path:'user'
   })
  });
    
    
    return res.json(200,{
        message:"List of posts",
        posts:posts
    })
}

module.exports.destroy =async function(req,res){
    try{
       // console.log(req.params.id);
    let post = await Post.findById(req.params.id);
        //.id means converting objectID into string
        //console.log("post",post);
      //  console.log(post.user);
       // console.log(req.user.id);
        if(post.user == req.user.id){
            post.remove();
            await Comment.deleteMany({post: req.params.id});
            return res.json(200,{
                message:'post and comments deleted successfully'
            })
          
      
        }
        else{
            return res.json(401,{
                message:'u cannot delete this post'
            });
         }
        
    }catch(err){
    console.log(err);
   // return res.redirect('back');
   return res.json(500,{
    message:'internal server error'
   });
    }
}