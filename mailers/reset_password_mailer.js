const nodeMailer = require('../config/nodemailer');


exports.reset=(data)=>{
   
    let htmlString = nodeMailer.renderTemplate({data},'/resetPassword/reset_password.ejs')
    
    nodeMailer.transporter.sendMail({
        from:"codeail@gmail.com",
        to:data.user.email,
        subject:"Link for changing Password",
        html:htmlString
    },(err,info)=>{
        if(err){console.log('error in sending mail',err);return;}
      //  console.log('mail delivered',info);
        return;
    });
    }
    