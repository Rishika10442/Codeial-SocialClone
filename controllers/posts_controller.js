const Post = require("../models/post")
const Comment = require('../models/comment');
const Like = require('../models/like');

module.exports.create = async function(req,res){
    try{
    let post = await Post.create({
        content:req.body.content,
        user:req.user._id
    });
    await  post.populate('user', 'name');
    if(req.xhr){
        return res.status(200).json({
            data:{
                post:post
            },
            message:"post created"
        });
    }
    req.flash('success','post created!');
    return res.redirect('back');
    }catch(err){
        console.log(err);
        req.flash('error',err);
        return;
    }
}

//using normal way
// module.exports.create = function(req,res){
//     Post.create({
//         content:req.body.content,
//         user:req.user._id
//     },function(err,post){
//         if(err){console.log("error in creating post");return;}
//         return res.redirect('back');
//     });
// }


module.exports.destroy =async function(req,res){
    try{
    let post = await Post.findById(req.params.id);
        //.id means converting objectID into string
        //console.log("post",post);
        //console.log(post.user);
        if(post.user == req.user.id){

        //deleted the associated likes on post and its comments
        await Like.deleteMany({likeable:post,onModel:'post'});
        await Like.deleteMany({_id:{$in:post.comments}});

            post.remove();
            await Comment.deleteMany({post: req.params.id});
          //  console.log(req.params.id+"===================");
            if(req.xhr){
                return res.status(200).json({
                    data:{
                        post_id : req.params.id
                    },
                    message:"post deleted successfully"
                })
            }
                req.flash('success','post deleted!');
                return res.redirect('back');
        }
        else{
            req.flash('error','You cannot delete this post');
            return res.redirect('back');
        }
        
    }catch(err){
    console.log(err);
    return res.redirect('back');
    }
}