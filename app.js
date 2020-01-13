const path = require('path'); 
const express = require('express');
const bodyParser = require('body-parser');
const mongoose=require('mongoose');
const session=require('express-session')
const MongoDbSession=require('connect-mongodb-session')(session);
const csrf=require('csurf');
const flash=require('connect-flash');
const errorController = require('./controllers/error');
const User = require('./models/user'); 
const MONGODB_URI='mongodb+srv://amira:ALKFE147789@cluster0-d0iae.mongodb.net/test?retryWrites=true&w=majority' 
const app = express();
const store=new MongoDbSession({
  uri:MONGODB_URI,
  collection:'sessions'
})
 
const csrfProtiction=csrf();

app.set('view engine', 'ejs');
app.set('views', 'views');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const authRoutes = require('./routes/auth');


app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(
  session({
    secret:'my secret',
    resave:false, 
    saveUninitialized:false,
    store:store
  })
  )
app.use(csrfProtiction);
app.use(flash());

app.use((req, res, next)=> {
  if(!req.session.user){
    return next();
  }
  User.findById(req.session.user._id)
  .then(user => {
     req.user=user;
    next();
  })
  .catch(err => console.log(err));
}) 

app.use((req, res, next)=>{
  res.locals.isAuthenticated=req.session.isLoggedIn;
  res.locals.csrfToken=req.csrfToken();
  next();
})
app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(authRoutes); 
app.use(errorController.get404);

 mongoose.connect(
  MONGODB_URI,
   {
    useUnifiedTopology: true,
    useNewUrlParser: true,
    }
   )
 .then(result =>{ 
   app.listen(3004,()=>{
     console.log("server connected");
   })
 } )
 .catch(err =>{
   console.log(err);
 });
