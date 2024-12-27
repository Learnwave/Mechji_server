

//api for adding shop

const addShop = async (req,res) => {
    try {
        const {name,email,password,category,address,available,about} = req.body;
        const imageFile = req.file;
        console.log({name,email,password,category,address,available,about},imageFile);
        
    } catch (error) {
        
    }
}
export{addShop}