const Comment = require('../models/comment');
const Post = require('../models/post');
const commentMailer = require('../mailers/comments_mailer');
const commentEmailWorker = require('../workers/comment_email_worker');
const queue = require('../config/kue');
const Like = require('../models/like');


module.exports.create = async function(req,res){
    //req.bosy.post is getting post id from the form
    try{
     // console.log(req.body);
    let post = await Post.findById(req.body.post)
        if(post){
        let comment= await Comment.create({
                content:req.body.content,
                post:req.body.post,
                user:req.user._id
            })
                 //jo post humne find ki hai vo
                post.comments.push(comment);
                post.save();
               // console.log(comment);
                await  comment.populate('user',{ name: 1 , email:1 });
                //comment = await comment.populate('user','name email').execPopulate();
               //commentMailer.newComment(comment);
                let job = queue.create('emails',comment).save(function(err){
                    if(err){
                        console.log('error in creating queue',err);
                        return;
                    }
                    console.log('enqueued',job.id);
                });
               if(req.xhr){
                    return res.status(200).json({
                        data:{
                            post:post,
                            comment:comment
                        },
                        message:"post created"
                    });
                }


                res.redirect('/');
            
        }
    }
    catch(err){
        console.log(err);
        req.flash('error',err);
        return;
    } 
    
}

module.exports.destroy=async function(req,res){
    //console.log(req.params);
    //comment me post ko populate kiya hai because, we want comment ki post ka user for authorization
    let comment = await Comment.findById(req.params.commentId)
    await comment.populate('post');
    // .exec(function(err,comment){
    //     if(err){console.log("erroe in fetching comment for deletion"); return;}
    //     //console.log("comment found");
        //console.log(comment.post);
        // comment.populate('post').exec(function(err,data){
        //     if(err){console.log(err);return;}   
        //     console.log(data);
        // })
        if(comment.user == req.user.id || comment.post.user == req.user.id){
             let postId = comment.post;
             comment.remove();
           //  console.log("comment deleted");

           await Like.deleteMany({likeable:comment._id,onModel:'Comment'});
             Post.findByIdAndUpdate(postId,{$pull : {comments:req.params.id}},function(err,post){
                if(err){console.log("could'nt find ost for comment"); return;}
                
                if(req.xhr){
                    return res.status(200).json({
                        data:{
                            comment:comment
                        },
                        message:"comment deleted"
                    });
                }


                    return res.redirect('back');
             })
        }else{
           // console.log("not valid condition");
            return res.redirect('back');  
        }
    }




