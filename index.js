const express = require('express')
const Handlebars = require('handlebars')
const exphbs = require('express-handlebars')
const { allowInsecurePrototypeAccess } = require('@handlebars/allow-prototype-access')
const homeRoutes = require('./routes/home')
const addRoutes = require('./routes/add')
const tokensRoutes = require('./routes/tokens')
const cartRoutes = require('./routes/cart')
const ordersRoutes = require('./routes/orders')
const authRoutes = require('./routes/auth')
const profileRoutes = require('./routes/profile')
const session = require('express-session')
const MongoStore = require('connect-mongodb-session')(session)
const mongoose = require('mongoose')
const path = require('path')
const helmet = require('helmet')
const compression = require('compression')
const varMiddleware = require('./middleware/variables')
const userMiddleware = require('./middleware/userMiddleware')
const errorHandler = require('./middleware/error')
const fileMiddleware = require('./middleware/file')
const csrf = require('csurf')
const flash = require('connect-flash')
require('dotenv').config()

const app = express()

const hbs = exphbs.create({
  defaultLayout: 'main',
  extname: 'hbs',
  handlebars: allowInsecurePrototypeAccess(Handlebars),
  helpers: require('./utils/helpers/hbs')
})

const store = new MongoStore({
  collection: 'sessions',
  uri: process.env.DB_URL
})

app.engine('hbs', hbs.engine)
app.set('view engine', 'hbs')
app.set('views', 'views')

app.use(express.static(path.join(__dirname, 'public')))
app.use('/images', express.static(path.join(__dirname, 'images')))
app.use(express.urlencoded({ extended: true })) // for getting { body } field on POST/PUT requests
app.use(session({
  secret: 'some secret value',
  resave: false, // if true will be resaved on each request no matters if smth changed or not
  saveUninitialized: false, // could be saved without initializing
  store
}))
app.use(fileMiddleware.single('avatar'))
app.use(csrf())
app.use(flash())
app.use(helmet({ contentSecurityPolicy: false }))
app.use(compression())
app.use(varMiddleware)
app.use(userMiddleware)

app.use('/', homeRoutes)
app.use('/add', addRoutes)
app.use('/tokens', tokensRoutes)
app.use('/cart', cartRoutes)
app.use('/orders', ordersRoutes)
app.use('/auth', authRoutes)
app.use('/profile', profileRoutes)

app.use(errorHandler)

const DB_URL = process.env.DB_URL
const PORT = process.env.PORT || 3000

async function start() {
  try {
    await mongoose.connect(DB_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: true
    })

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`)
    })
  } catch (err) {
    console.log(err)
  }
}

start()