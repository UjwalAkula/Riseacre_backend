const mongoose=require('mongoose');

const userschema=new mongoose.Schema({

  userName:{
    type:String
  },

  userEmail:{
    type:String,
    unique:true
  },

  phoneNumber:{
    type:String,
    required:true,
    unique:true
  }
},

{ timestamps: true } // Automatically manage createdAt and updatedAt

);

const User=mongoose.model('usermodel',userschema,'myactivity');

module.exports=User;