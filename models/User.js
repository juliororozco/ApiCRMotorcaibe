const mongoose =require('mongoose');
const bcrypt = require ('bcrypt');

const UserSchema = mongoose.Schema({

  name: {
  type: String,
  required: [true,'is require']
    },

  email: {
    type : String,
    required : [true ,'is required'],
    unique : true,
    index: true,
    validate: {
      validator: function (str){
        return /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/g.test(str);
      },
      message: props =>   `${props.value}, el email no es valido`
      }
    },



  password: {
    type: String,
    required: [true, 'is required']
  },

  isAdmin: {
    type :Boolean,
    default : false
  },
  cart:{
    type: Object,
    default :{
      total: 0,
      count :0
    }

  },
  notifications:{
    type: Array,
    default:[]
  },
  orders:[{type: mongoose.Schema.Types.ObjectId, ref: 'Order'}]

}, {minimize:false});

UserSchema.statics.findByCredentials = async function(email, password) {
  // Buscar un usuario en la base de datos por su correo electrónico
  const user = await User.findOne({ email });

  // Si no se encuentra ningún usuario, lanzar un error con el mensaje "inválido"
  if (!user) throw new Error('inválido');

  // Comparar la contraseña proporcionada con la contraseña almacenada en el usuario
  const isSamePassword = bcrypt.compareSync(password, user.password);

  // Si las contraseñas coinciden, devolver el usuario
  if (isSamePassword) return user;

  // Si las contraseñas no coinciden, lanzar un error con el mensaje "inválido"
  throw new Error('inválido');
}

UserSchema.methods.toJSON = function() {
  // Obtener el objeto del usuario
  const user = this;
  const userObject = user.toObject();

  // Eliminar la propiedad 'password' del objeto del usuario
  delete userObject.password;

  // Devolver el objeto del usuario sin la propiedad 'password'
  return userObject;
}

//antes de guardar u
UserSchema.pre('save', function(next) {
  const user = this;

  // Si la contraseña no ha sido modificada, continuar con el siguiente middleware
  if (!user.isModified('password')) return next();

  // Generar una sal para el hash de la contraseña
  bcrypt.genSalt(10, function(err, salt) {
    if (err) return next(err);

    // Hashear la contraseña utilizando la sal generada
    bcrypt.hash(user.password, salt, function(err, hash) {
      if (err) return next(err);

      // Asignar la contraseña hasheada al usuario
      user.password = hash;
      next();
    });
  });
});

UserSchema.pre('remove', function(next){
  this.model('Order').remove({owner:this._id}, next)
})
const User= mongoose.model('User', UserSchema);
module.exports= User;
