import bcrypt from "bcryptjs";
import jwt from 'jsonwebtoken';
import userModel from "../models/userModel.js";
import transporter from "../config/nodeMailer.js";
import { EMAIL_VERIFY_TEMPLATE,PASSWORD_RESET_TEMPLATE } from "../config/emailTemplates.js";

export const register = async (req,res) => {
            const{name,email,password} = req.body;
            if (!name || !email || !password) {
                return res.json({success:false,message:'missing details'})
            }
            try {
                const existingUser = await userModel.findOne({email});
                if (existingUser) {
                    return res.json({success:false,message:"user already registered"})
                }

                const hashedPassword = await bcrypt.hash(password,10);

                const user = new userModel({name,email,password:hashedPassword});

                await user.save();

                const token = jwt.sign({id:user._id},process.env.JWT_SECRET,{expiresIn:"7d"});

                res.cookie('token',token,{
                    httpOnly : true,
                    secure: process.env.Node_env === 'production',
                    sameSite : process.env.Node_env === 'production' ? "none" : "strict",
                    maxAge : 7 * 24 * 60 * 1000

                });


                // send welcome email 
                const mailOptions = {
                    from : process.env.SENDEREMAILID,
                    to : email,
                    subject : "Welcome To Mechji",
                    text : `Welcome to mechji ! Your Account Has Been Created With Email Id ${email} `
                }

                await transporter.sendMail(mailOptions);

                return res.json({success:true})


            } catch (error) {
                res.json({success:false,message:error.message})
            }
}

export const Login = async (req,res) =>{
            const{email,password} = req.body;
            if (!email || !password) {
              return  res.json({success:false,message:"email and password required"})
            }
            try {
                const user = await userModel.findOne({email});
                if (!user) {
                   return res.json({success:false,message:"invalid email"})
                }
                const isMatch = await bcrypt.compare(password,user.password)
                if (!isMatch) {
                  return  res.json({success:"false",message:"invalid password"});
                }


                const token = jwt.sign({id:user._id},process.env.JWT_SECRET,{expiresIn:"7d"});

                res.cookie('token',token,{
                    httpOnly : true,
                    secure: process.env.Node_env === 'production',
                    sameSite : process.env.Node_env === 'production' ? "none" : "strict",
                    maxAge : 7 * 24 * 60 * 1000

                });

                return res.json({success:true})
                
            } catch (error) {
                return res.json({success:false,message: error.message});
            }
}

export const logout = async (req,res)=> {
            const {token} = req.body;
            try {
                res.clearCookie(token,{
                    httpOnly : true,
                    secure: process.env.Node_env === 'production',
                    sameSite : process.env.Node_env === 'production' ? "none" : "strict",
                   

                })
                return res.json({success:true,message:"Logged Out"});
            } catch (error) {
                return res.json({success:false,message: error.message});
            }
}

            // sent verify otp function

export const sentVerifyOtp = async (req,res)=> {
                try {
                    const {userId} = req.body;
                    
                    const user = await userModel.findById(userId);

                    if (user.isAccountVerified) {
                        return res.json({success:false,message:"Acoount Already Verified"})
                    }
                   const OTP = String(Math.floor(100000 + Math.random()* 900000));
                    user.verifyOtp = OTP;
                    user.verifyOtpExpireAt =Date.now() + 24 * 60 * 60 * 1000

                    await user.save();

                    const mailOptions = {   
                        from : process.env.SENDEREMAILID,
                        to : user.email,
                        subject : "Account Verification OTP",
                        // text : `Your OTP is ${OTP} . Verify your account using this OTP `,
                        html: EMAIL_VERIFY_TEMPLATE.replace("{{otp}}",OTP).replace("{{email}}",user.email)
                    }
                    await transporter.sendMail(mailOptions);
                    res.json({success:true, message : "Verification OTP sent on Email"})

                } catch (error) {
                    
                    return res.json({success:false,message: error.message});
                }
    }
                //verify otp function

    export const verifyEmail = async (req,res) => {
                 const {userId,OTP} = req.body;
                    
                 if (!userId || !OTP) {
                    return res.json({success:false,message:'Missing Details'});
                 }
                 try {
                    
                    const user = await userModel.findById(userId);
                    if (!user) {
                        return res.json({success:false,message:"User Not Found"})
                    }
                    if (user.verifyOtp = '' || user.verifyOtp !== OTP) {
                        return res.json({success:false,message:"Invalid OTP"})
                    }
                    if(user.verifyOtpExpireAt < Date.now()){
                        return res.json({success:false,message:"OTP Expired"})
                    }
                    user.isAccountVerified = true;
                    user.verifyOtp = '';
                    user.verifyOtpExpireAt = 0;
                    await user.save();
                    return res.json({success:true,message:"Email verified successfully"})
                 } catch (error) {
                    return res.json({success:false,message: error.message});
                 }
    }

    // check if user authenticated

    export const isAuthenticated = async (req,res) => {
        try {
            return res.json({success:true});
        } catch (error) {
            return res.json({success:false,message: error.message});
        }
    }

    // sent password reset otp

export const sentResetOtp = async (req,res) => {
        const {email} = req.body;
        if(!email){
            return res.json({success:false,message:"Email is required "});
        }
        try {
            const user = await userModel.findOne({email});
            if(!user){
                return res.json({success:false,message:"User Not Found"});
            }
            
            const OTP = String(Math.floor(100000 + Math.random()* 900000));
            user.resetOtp = OTP;
            user.resetOtpExpireAt =Date.now() + 15 * 60 * 1000

            await user.save();

            const mailOptions = {   
                from : process.env.SENDEREMAILID,
                to : user.email,
                subject : "password reset otp",
                // text : `Your OTP for reseting your password is ${OTP} . use this otp to proceed with reseting your password `
                html: PASSWORD_RESET_TEMPLATE.replace("{{otp}}",OTP).replace("{{email}}",user.email)
            }
            await transporter.sendMail(mailOptions);
            res.json({success:true, message : "OTP sent on Email"})

        } catch (error) {
            return res.json({success:false,message: error.message});
        }
}

// verify otp

export const verifyOtp = async (req,res) => {
            const {email,OTP} = req.body;
            const user = await userModel.findOne({email});
            
            try {
                
                if(OTP === user.resetOtp){
                    return res.json({success:true,message: 'OTP Is correct'});
                }else{
                    return res.json({success:false,message: 'OTP Is Not correct'});
                }
            } catch (error) {
                return res.json({success:false,message: error.message});

            }
}


//verify otp reset and password

export const resetPassword = async (req,res) => {
  
        const {email,OTP,newPassword} = req.body;
        
        if (!email || !OTP || !newPassword) {
            return res.json({success:false,message:"email otp and new password is required"});
        }
        try {
            const user = await userModel.findOne({email});
            
            if (!user) {
                return res.json({success:false,message:"user is not found"});
            }
            if (user.resetOtp === "" || user.resetOtp !== OTP ) {
                return res.json({success:false,message:"invalid Otp"});
            }
            if (user.resetOtpExpireAt < Date.now) {
                return res.json({success:false,message: "Otp expire"});
            }

            const hashedPassword = await bcrypt.hash(newPassword,10);

            user.password = hashedPassword;

            user.resetOtp = "";

            user.resetOtpExpireAt = 0;

            await user.save();

            return res.json({success:true,message: 'password reset succesfully'});

        } catch (error) {
            return res.json({success:false,message: error.message});
            
        }
}