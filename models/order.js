const mongoose=require('mongoose');
const Schema=mongoose.Schema;
const orderSchema=new Schema({
    products:[
        {
        product:{type:Object, required:true},
        quantity:{type:Number, required:true},
        note:{type:String}

       }
   ],
    user:{
       email:{
           type:String,
           required:true
       },
       userId:{
           type:Schema.Types.ObjectId,
           required:true,
           ref:'User'
       }

    },
    createdAt: {type: Date, default: Date.now}
})
module.exports=mongoose.model('Order',orderSchema);