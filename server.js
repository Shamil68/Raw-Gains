const express = require('express');
const app = express();
const dotenv = require('dotenv');
dotenv.config();
const userRoutes = require('./routes/userRoutes');
const connectDB = require('./config/db');
const path = require('path')
const adminRoutes = require('./routes/adminRoutes')
const session = require('express-session')
// const passport = require('./config/passport')
const passport = require('passport');
require('./config/passport');  
const MongoStore = require('connect-mongo');
const { checkBlockUser } = require('./middlewares/userValidation');
const { appendFile } = require('fs/promises');

connectDB();

app.set('view engine', 'ejs');
app.set('views',[path.join(__dirname,'views/user'),path.join(__dirname,'views/admin')])

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads',express.static(path.join(__dirname, 'public/uploads')));


app.use(session({
  secret:process.env.SESSION_SECRET,
  resave:false,
  // secure:false,
  saveUninitialized:false,
  store:MongoStore.create({mongoUrl:process.env.MONGO_URI}),
  cookie: { secure: false, httpOnly: true, maxAge: 72 * 60 * 60 * 1000 },

}))

app.use(passport.initialize())
app.use(passport.session())


app.use(checkBlockUser)

app.use((req,res,next)=>{
  res.locals.user = req.session.user || null
  res.locals.admin = req.session.admin || null;

  next()
})


app.use((req, res, next) => {
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  next();
});


app.use('/', userRoutes);
app.use('/admin', adminRoutes)

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});


module.exports = app