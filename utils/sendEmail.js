
import nodeMailer from 'nodemailer';
import  multer  from 'multer';
const upload = multer({ dest: 'uploads/' })


export const sendEmail = async(toEmail, email_service, serviceData, campaignData)=>{
  if(email_service === 'zoho'){
    const zohoTransporter = nodeMailer.createTransport({
      host: serviceData.host,
      port: serviceData.port,
      secure: true, 
      auth: {
          user: serviceData.username, 
          pass: serviceData.password     
      }
    });

    const mailOptions = {
      from: serviceData.from_email,       
      to: toEmail,        
      subject: campaignData.subject,                   
      html: campaignData.email_template 
    };
    try {
      const result = await zohoTransporter.sendMail(mailOptions);
      console.log(`Email sent successfully via Zoho: ${result.response}`);
      return result; 
    } catch (error) {
        console.error(`Failed to send email via Zoho: ${error.message}`);
    }
  }

  else if(email_service === 'office365'){
    const office365Transporter = nodeMailer.createTransport({
      service: 'Office365', 
      auth: {
          user: serviceData.username, 
          pass: serviceData.password              
      }
    });
  
  
    const mailOptions = {
      from: serviceData.from_email,      
      to: toEmail,        
      subject: campaignData.subject,                   
      html: campaignData.email_template  
    };
  
  
    try {
      const result = await office365Transporter.sendMail(mailOptions);
      console.log(`Email sent successfully via : office365`);
      return result; 
    } catch (error) {
        console.error(`Failed to send email via office365: ${error.message}`);
    }
  }

  else if(email_service === 'infinity'){
    const infinityTransporter = nodeMailer.createTransport({
      host: serviceData.host,  
      port: serviceData.port,
      secure: false, 
      auth: {
          user: serviceData.username, 
          pass: serviceData.password             
      }
  });
  
  
    const mailOptions = {
      from: serviceData.from_email,       
      to: toEmail,        
      subject: campaignData.subject,            
      html: campaignData.email_template
    };
  
  
    try {
      const result = await infinityTransporter.sendMail(mailOptions);
      console.log(`Email sent successfully via Infinity: ${result.response}`);
      return result; 
    } catch (error) {
        console.error(`Failed to send email via Infinity: ${error.message}`);
    }
  }

  else{

    //////// Yanha se Uncomment Krna hai isko baad me
    // const transporter = nodeMailer.createTransport({
    //   host: serviceData.host,
    //   port: serviceData.port,
    //   auth: {
    //     user: serviceData.username,
    //     pass: serviceData.password
    //   }
    // });

    // const options = {
    //   from: `"Revolt Motor " ${serviceData.from_email}`,
    //   to: toEmail,
    //   cc:'ankit.jain@revoltmotors.com',
    //   subject: campaignData.subject,
    //   html: campaignData.email_template
    // };


    ////////yanhaa tk

    const transporter = nodeMailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD
      }
    });
  
    const options = {
      from: process.env.SMTP_MAIL,
      to: toEmail,
      cc:'ankit.jain@revoltmotors.com',
      subject: campaignData.subject,
      html: campaignData.email_template
    };
  
    const result = await transporter.sendMail(options);
    return result;
  }
}