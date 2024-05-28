const router = require ('express').Router();
const User = require('../models/User');
const Order = require('../models/Order')

//registro
router.post('/signup', async(req,res)=>{
  const{name, email, password}= req.body;
    try {
      const user = await User.create({name, email, password});
      res.json(user);
    } catch (e) {
      if(e.code===11000) return res.status(400).send('el correo elctronico ya existe');
      res.status(400).send(e.message)
    }
})

//logueraser
router.post('/login', async(req, res)=>{
const {email,password}= req.body;
try {
  const user =await User.findByCredentials(email,password);
  res.json(user);

} catch (e) {
  res.status(400).send(e.message)
  }
})

//obtener usuarios
router.get('/', async(req, res)=>{
  try {
    const users = await User.find({isAdmin: false}).populate('orders');
    res.json(users);
  } catch (e) {
    res.status(400).send(e.message);
  }
})
// ordenes por usuarios

router.get('/:id/orders', async (req, res)=> {
  const {id} = req.params;
  try {
    const user = await User.findById(id).populate('orders');
    res.json(user.orders);
  } catch (e) {
    res.status(400).send(e.message);
  }
})

//actualizar notificaciones
router.post('/:id/updateNotifications', async(req, res)=> {
  const {id} = req.params;
  try {
    const user = await User.findById(id);
    user.notifications.forEach((notification) => {
      notif.status = "read"
    });
    user.markModified('notifications');
    await user.save();
    res.status(200).send();
  } catch (e) {
    res.status(400).send(e.message)
  }
})


module.exports= router;
