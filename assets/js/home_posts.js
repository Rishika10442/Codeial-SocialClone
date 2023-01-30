
{
    
  
    function done(msg,typ) { 
        new Noty({
            theme: 'relax',
            text: msg,
            type: typ,
            layout: 'topRight',
            timeout: 1500
        }).show();
    }
    
    //submit to submit the form data for new post using ajax
        let createPost = function(){
            let newPostForm = $('#new-post-form');
            newPostForm.submit(function(e){
                e.preventDefault();
                $.ajax({
                    type:'post',
                    url:'/posts/create',
                    data:newPostForm.serialize(),
                    success: function(data){
                       // console.log(data);
                        let newPost = newPostDom(data.data.post);
                       
                      //  console.log('hello',$('#posts-list-container>ul'));
                       //console.log(newPost);
                        $('#posts-lists-container>ul').prepend(newPost);
                        //window.location.reload();
                        deletePost($(' .delete-post-btn',newPost));
                        //new PostComments(data.data.post._id);
                        // Wrong
                        // deletePost($(' .delete-post-btn'),newPost); 
                        createComment(data.data.post._id);

                        // CHANGE :: enable the functionality of the toggle like button on the new post
                    new ToggleLike($(' .toggle-like-button', newPost));

                        done("Post Created!",'success');
                    },
                    error: function(err){
                        console.log(err.responseText);
                        done("Could'nt create post",'error');
                    }
                })
            })
        }
    
        
    
    //method to create a post in dom
    let newPostDom = function(post){
        return $(`<li id="post-${post._id}">
        <p>
           
            <small>
                <a class="delete-post-btn" href="/posts/destroy/${post._id}" >del</a>
            </small>
        
            ${post.content}
        <br>
        
        <small id="username">${post.user.name}</small>
        <br>
                        <small>
                            
                                <a class="toggle-like-button" data-likes="0" href="/likes/toggle/?id=${post._id}&type=Post">
                                    0 Likes
                                </a>
                            
                        </small>
        </p>
        <div class="post-comment" ">
                <form action="/comments/create" method="POST" id = "#post-${post._id}-comments-form">
                    <input type="text" name="content" placeholder="Type here to add comment.." required>
                    <input type="hidden" name="post" value="${post._id}">
                    <input type="submit" value="Add Comment">
                </form>
            <div class="post-comment-list">
                <ul id="post-comment-${post._id}">
                    
                </ul>
            </div>
        </div>
    
    </li>`)
    }
    
    //method to delete a post from dom
    let deletePost = function(deleteLink){
        $(deleteLink).click(function(e){
            e.preventDefault();
            $.ajax({
                type:'get',
                url:$(deleteLink).prop('href'),
                success:function(data){
                    //console.log(data.data);
                    $(`#post-${data.data.post_id}`).remove();
                    done('Post Deleted!','success')
                },
                error:function(err){
                    console.log(err.responseText);
                    done("Could'nt delete post",'error');
                }
            })
        })
    }
    
    
    
    //         // get the post's id by splitting the id attribute
    //        let postId = self = self.prop('id').split("-")[1]
    //        //console.log(postId);
    //         new createComments(postId);
    //     })
    // }

    let convertPostsToAjax = function(){
        $('#posts-lists-container>ul>li').each(function(){
            let self = $(this);
            let deleteButton = $(' .delete-post-button', self);
            deletePost(deleteButton);

            // get the post's id by splitting the id attribute
            let postId = self.prop('id').split("-")[1]
            createComment(postId);
        })
    }
    
    let createComment = function(postId){
  
        let Comment = $(`#post-${postId}-comments-form`);
     //console.log(Comment);
        Comment.submit(function(e){
            e.preventDefault();
        // console.log('hello');
            $.ajax({
                type:'post',
                url:'/comments/create',
                data:Comment.serialize(),
                success : function(data){
                    let newComment = newCommentDom(data.data.comment);

                    $(`#post-comment-${postId}`).prepend(newComment);
                    deleteComment($('.delete-comment-btn',newComment));
                    // CHANGE :: enable the functionality of the toggle like button on the new comment
                    new ToggleLike($(' .toggle-like-button', newComment));
                    done('Comment Created','success');

                },
                error:function(err){
                    //console.log(err.responseText);
                    done('cannot create comment','error');
                }
            })
        })    
    }
    

    let newCommentDom = function(comment){
       // console.log(comment);
        return $(`<li id="comment-${comment._id}">
        <p>
           
                <small>
                    <a href="/comments/destroy/${comment._id}" class="delete-comment-btn">del</a>
                </small>
                
                ${comment.content}
            <br>
            <small>
            ${comment.user.name}
            </small>
            <small>
                            
                                <a class="toggle-like-button" data-likes="0" href="/likes/toggle/?id=${comment._id}&type=Comment">
                                    0 Likes
                                </a>
                            
                            </small>
        </p>
        
    </li>`)
    }

    function deleteComment(deleteLink){
                $(deleteLink).click(function(e){
                    e.preventDefault();
        
                    $.ajax({
                        type: 'get',
                        url: $(deleteLink).prop('href'),
                        success: function(data){
                            console.log(data);
                           //console.log($(`#comment-${data.data.comment._id}`));
                            $(`#comment-${data.data.comment._id}`).remove();
                          //  $(``)
                            new Noty({
                                theme: 'relax',
                                text: "Comment Deleted",
                                type: 'success',
                                layout: 'topRight',
                                timeout: 1500
                                
                            }).show();
                        },error: function(error){
                            console.log(error.responseText);
                        }
                    });
        
                });
    }
        
    
    let convertCommentToAjax = function(){
      //  console.log('yes');
        $('.post-comment-list>ul>li').each(function(){
            let self = $(this);
            let deleteBtn = $(' .delete-comment-btn', self);
           // console.log(self);
            deleteComment(deleteBtn);
        })
    }




    createPost();
    convertPostsToAjax();
   convertCommentToAjax();
    }