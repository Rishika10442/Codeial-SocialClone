const nodeMailer = require('../config/nodemailer');


//another way of exporting the function newComment
exports.newComment=(comment)=>{
//console.log('inside new comment mailer');
let htmlString = nodeMailer.renderTemplate({comment:comment},'/comments/new_comment.ejs')

nodeMailer.transporter.sendMail({
    from:"codeail@gmail.com",
    to:comment.user.email,
    subject:"New Comment Published",
    html:htmlString
},(err,info)=>{
    if(err){console.log('error in sending mail',err);return;}
  //  console.log('mail delivered',info);
    return;
});
}
