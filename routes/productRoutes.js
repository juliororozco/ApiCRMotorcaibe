const router = require('express').Router();
const Product = require('../models/Product');
const User = require('../models/User');

router.get('/', async (req, res) => {
  try {
    const products = await Product.find();
    // Devolver los productos encontrados como respuesta con un código de estado 200
    res.status(200).json(products);
  } catch (e) {
    // Si ocurre un error durante la búsqueda, devolver un mensaje de error con un código de estado 400
    res.status(400).send(e.message);
  }
});


// Crear productos
router.post('/', async (req, res) => {
  try {
    // Extraer los datos del cuerpo de la solicitud (name, description, price, category, images)
    const { name, description, price, category, images: pictures } = req.body;

    // Crear un nuevo producto en la base de datos utilizando los datos proporcionados
    const product = await Product.create({ name, description, category, price, pictures });

    // Buscar todos los productos en la base de datos después de crear el nuevo producto
    const products = await Product.find();

    // Devolver los productos actualizados como respuesta con un código de estado 201 (creado)
    res.status(201).json(products);
  } catch (e) {
    // Si ocurre un error durante la creación del producto, devolver un mensaje de error con un código de estado 400
    res.status(400).send(e.message);
  }
});

// Actualizar productos
router.patch('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    // Extraer los datos del cuerpo de la solicitud (name, description, price, category, images)
    const { name, description, price, category, images: pictures } = req.body;
    // Actualizar el producto correspondiente al ID proporcionado con los nuevos datos
    const product = await Product.findByIdAndUpdate(id, { name, description, price, category, pictures });

    // Buscar todos los productos en la base de datos después de la actualización
    const products = await Product.find();

    // Devolver los productos actualizados como respuesta con un código de estado 200
    res.status(200).json(products);
  } catch (e) {
    // Si ocurre un error durante la actualización del producto, devolver un mensaje de error con un código de estado 400
    res.status(400).send(e.message);
  }
});

// Eliminar productos
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  const { user_id } = req.body;
  try {
    // Buscar el usuario por su ID
    const user = await User.findById(user_id);
    // Verificar si el usuario no es un administrador
    if (!user.isAdmin) {
      // Si no es un administrador, devolver un mensaje de error con un código de estado 401 (no autorizado)
      return res.status(401).json('No está autorizado para eliminar productos');
    }
    // Eliminar el producto correspondiente al ID proporcionado
    await Product.findByIdAndDelete(id);
    // Buscar todos los productos en la base de datos después de la eliminación
    const products = await Product.find();
    // Devolver los productos actualizados como respuesta con un código de estado 200
    res.status(200).json(products);
  } catch (e) {
    // Si ocurre un error durante la eliminación del producto, devolver un mensaje de error con un código de estado 400
    res.status(400).send(e.message);
  }
});
// Obtener producto por ID y productos similares
router.get('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    // Buscar el producto por su ID
    const product = await Product.findById(id);

    // Buscar productos similares en la misma categoría del producto
    const similar = await Product.find({ category: product.category }).limit(5);

    // Devolver el producto y los productos similares como respuesta con un código de estado 200
    res.status(200).json({ product, similar });
  } catch (e) {
    // Si ocurre un error durante la búsqueda del producto, devolver un mensaje de error con un código de estado 400
    res.status(400).send(e.message);
  }
});

router.get('/category/:category', async (req, res) => {
  const { category } = req.params;

  try {
    let products;
    if (category === 'all') {
      // Si la categoría es "all", buscar todos los productos y ordenarlos por fecha descendente
      products = await Product.find().sort([['date', -1]]);
    } else {
      // Si la categoría no es "all", buscar productos que pertenecen a la categoría especificada
      products = await Product.find({ category });
    }
    // Devolver los productos encontrados como respuesta con un código de estado 200
    res.status(200).json(products);
  } catch (e) {
    // Si ocurre un error durante la   búsqueda, devolver un mensaje de error con un código de estado 400
    res.status(400).send(e.message);
  }
});

router.post('/add-to-cart', async(req, res)=> {
  const {userId, productId, price} = req.body;

  try {
    const user = await User.findById(userId);
    const userCart = user.cart;
    if(user.cart[productId]){
      userCart[productId] += 1;
    } else {
      userCart[productId] = 1;
    }
    userCart.count += 1;
    userCart.total = Number(userCart.total) + Number(price);
    user.cart = userCart;
    user.markModified('cart');
    await user.save();
    res.status(200).json(user);
  } catch (e) {
    res.status(400).send(e.message);
  }
})


//aumentar cantidad de productos en carrito de compras
router.post('/increase-cart', async(req, res)=> {
  const {userId, productId, price} = req.body;
  try {
    const user = await User.findById(userId);
    const userCart = user.cart;
    userCart.total += Number(price);
    userCart.count += 1;
    userCart[productId] += 1;
    user.cart = userCart;
    user.markModified('cart');
    await user.save();
    res.status(200).json(user);
  } catch (e) {
    res.status(400).send(e.message);
  }
});



//disminuir catudad de productos en el carrito de compras
router.post('/decrease-cart', async(req, res)=> {
  const {userId, productId, price} = req.body;
  try {
    const user = await User.findById(userId);
    const userCart = user.cart;
    userCart.total -= Number(price);
    userCart.count -= 1;
    userCart[productId] -= 1;
    user.cart = userCart;
    user.markModified('cart');
    await user.save();
    res.status(200).json(user);
  } catch (e) {
    res.status(400).send(e.message);
  }
})

router.post('/remove-from-cart', async(req, res)=> {
  const {userId, productId, price} = req.body;
  try {
    const user = await User.findById(userId);
    const userCart = user.cart;
    userCart.total -= Number(userCart[productId]) * Number(price);
    userCart.count -= userCart[productId];
    delete userCart[productId];
    user.cart = userCart;
    user.markModified('cart');
    await user.save();
    res.status(200).json(user);
  } catch (e) {
    res.status(400).send(e.message);
  }
})

module.exports = router;
