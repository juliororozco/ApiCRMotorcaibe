require ("dotenv").config();
const mongoose = require ('mongoose');

const connectionStr= `mongodb+srv://${process.env.MONGO_USERNAME}:${process.env.MONGO_PW}@cluster0.moefrhk.mongodb.net/motorcaribe?retryWrites=true&w=majority` ;

mongoose.connect(connectionStr, {useNewUrlparser: true})
.then(()=> console.log('conectado a mongodb'))
.catch(err => console.log (err))
