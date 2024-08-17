/* require("dotenv").config();

const User = require("./models/user.model");
const Note = require("./models/note.model");

const express = require("express")

const cors = require("cors")

const config = require("./config.json")

const mongoose = require("mongoose");

const jwt = require("jsonwebtoken")

const {authenticateToken} = require("./utilites")


mongoose.connect(config.connectionString);

const app = express()


app.use(express.json())

app.use(
    cors({
        origin: "*",

    })
)

app.get("/", (req, res)=>{
    res.json({data: "hello"})
})

//Create Account
app.post("/create-account" , async (req, res)=>{
    const {fullName, email, password} = req.body;

    if(!fullName){
      return res
           .status(400)
           .json({error: true , message: "full name is required"});
    }
    if(!password){
        return res
        .status(400)
        .json({error: true , message: "password is required"});
    }
    if(!email){
        return res
        .status(400)
        .json({error: true , message: "email is requyired"})
    }

    const isUser = await User.findOne({email:email});

    if(isUser){
        return res.json({
            error: true,
            message: "User is already exist",
        })
    }

    const user = new User({
        fullName, 
        email,
        password,
       
    });
    await user.save();
    

    const accessToken = jwt.sign({user},process.env.ACCESS_TOKEN_SECRET ,{
        expiresIn: "3600m"
    });

    return res.json({
       error: false,
       user,
       accessToken,
       message: "Registration Successfully"
    })
})

//Login EndPoint
app.post("/login" , async (req, res)=>{
    const {email , password} = req.body;

    if(!email){
        return res.status(400).json({error: true , message:"email is required"});
    }
    if(!password){
        return res.status(400).json({error: true , message:"password is required"})
    }

    const userInfo = await User.findOne({email:email});

    if(!userInfo){
        return res.status(400).json({error: true , message: "user not found "});
    }
    if(userInfo.email == email && userInfo.password == password){
        const user = {user: userInfo};
        const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET,{
            expiresIn: "36000m"
        });
        return res.json({
            error: false, 
            message: "Login Successfully",
            email,
            accessToken
        })
    }else{
        return  res.status(400).json({
            error: true,
            message: "Invalid credentials"
        })
    }
})

//Add Note
app.post("/add-note", authenticateToken , async (req , res)=>{
  const {title , content , tags } = req.body;
  const {user}= req.user;

  if(!title){
    return res.status(400).json({error: true , message: "title is required"})
  }
  if(!content){
    return res.status(400).json({error: true , message:"content is required"})
  }
   try {
    const note = new Note({
        title,
        content,
        tags: tags || [],
        userId: user._id,
    });

    await note.save();

    return res.json({
        error: false,
        note,
        message: "Note added successfully"
    })
   } catch (error) {
     return res.status(500).json({
        error: true, 
        message: "Invalid server error"
     });

   }
})

//Update Note
app.put("/update-note/:noteId", authenticateToken, async (req, res) => {
    const noteId = req.params.noteId;
    const { title, content, tags, isPinned } = req.body;
    const { user } = req.user;

    if (!title && !content && !tags) {
        return res.status(400).json({ error: true, message: "No changes provided" });
    }

    try {
        const note = await Note.findOne({ _id: noteId, userId: user._id });
        if (!note) {
            return res.status(404).json({ error: true, message: "Note not found" });
        }

        if (title) note.title = title;
        if (content) note.content = content;
        if (tags) note.tags = tags;
        if (typeof isPinned !== 'undefined') note.isPinned = isPinned;

        await note.save();

        return res.json({
            error: false,
            note,
            message: "Note updated successfully"
        });
    } catch (error) {
        return res.status(500).json({
            error: true,
            message: "Internal server error"
        });
    }
});

//getALL note without the user 
app.get("/getAllNote" , authenticateToken , async (req, res)=>{
    try {
        const notes = await Note.find({});
        res.status(200).json(notes);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
})

//get all note with theier user 
app.get("/get-all-note/" , authenticateToken , async (req, res)=>{
  const {user} = req.user;
  try {
    const notes = await Note.find({ userId: user._id}).sort({isPinned: -1});

    return res.json({
        error: false,
        notes,
        message: "All notes retrieved successfully"
    })
  } catch (error) {
    return res.status(500).json({
        error: true , 
        message: "Internal server Error",
    })
  }
})

//delete note 
app.delete("/delete-note/:noteId" , authenticateToken, async (req, res)=>{
  const noteId = req.params.noteId;
  const {user} = req.user;

   try {
    const note = await Note.findOne({_id: noteId , userId: user._id});
    if(!note){
        return res.status(404).json({error: true , message: "Note not found "});
    }
    await Note.deleteOne({_id: noteId , userId: user._id});

    return res.json({
        error: false , 
        message: "Note deleted successfully"
    });
   } catch (error) {
    return res.status(500).json({
        error: true , 
        message: "Internal server Error",
    })
   }
})

//isPinned update 
app.put("/isPinned-update-note/:noteId", authenticateToken, async (req, res) => {
    const noteId = req.params.noteId;
    const { isPinned } = req.body;
    const { user } = req.user;

    // Check if the isPinned field is provided in the request body
    if (typeof isPinned === 'undefined') {
        return res.status(400).json({ error: true, message: "No isPinned status provided" });
    }

    try {
        const note = await Note.findOne({ _id: noteId, userId: user._id });
        if (!note) {
            return res.status(404).json({ error: true, message: "Note not found" });
        }

        // Update the isPinned field
        note.isPinned = isPinned;

        await note.save();

        return res.json({
            error: false,
            note,
            message: "Note updated successfully"
        });
    } catch (error) {
        return res.status(500).json({
            error: true,
            message: "Internal server error"
        });
    }
});

//getuSER 
app.get("/get-user" , authenticateToken , async (req, res)=>{
    const {user} = req.user;
    const isUser = await User.findOne({_id:user._id});

    if (!isUser) {
      return res.sendStatus(401)
    }

    return res.json({
        user: {fullName: isUser.fullName , email: isUser.email, "_id": isUser._id, createdOn: isUser.createdOn},
        message: ""
    })
})

app.listen(8000);

module.exports = app; */

const app = require("./app");

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
