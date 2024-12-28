import validator from 'validator'
import bcrypt from "bcrypt"
import { v2 as cloudinary } from 'cloudinary';
import shopModel from '../models/shopModel.js';
//api for adding shop

const addShop = async (req,res) => {
    try {
        const {name,email,password,category,address,available,about} = req.body;
        const imageFile = req.file;

        //checking all for addshop to db

        if ( !name || !email || !password || !category || !address || !available || !about ) {
            return res.json({success:false,message:"Missing Details"})
        }


        // validating email

        if (!validator.isEmail(email)) {
            return res.json({success:false,message:"Please enter a valid email id"})
        }

        //validating password

        if (password.length < 8) {
            return res.json({success:false,message:"Please enter a strong password"})
        }

        //hashing doctor password

        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password,salt);

        //upload image to cloudinary

        const imageUpload = await cloudinary.uploader.upload(imageFile.path,{resource_type:"image"})

        const imageUrl = imageUpload.secure_url

        const shopData = {
            name,
            email,
            password:hashedPassword,
            image : imageUrl,
            category,
            available,
            about,
            address:JSON.parse(address),
            date:Date.now()
         }

         const newShop = new shopModel(shopData)

         console.log(newShop)

         return res.json({success:true,message:"Shop Created"})


    } catch (error) {
        console.error(error)
        return res.json({success:false,message:error.message})
    }
}
export{addShop}