const Product = require('../models/product');
const Order = require('../models/order');
const ITEMS_PER_PAGE = 3;
 
exports.getProducts = (req, res, next) => {
  const page = +req.query.page || 1;
  let totalItems;

  Product.find()
    .countDocuments()
    .then(numProducts => {
      totalItems = numProducts;
      return Product.find()
        .skip((page - 1) * ITEMS_PER_PAGE)
        .limit(ITEMS_PER_PAGE);
    })
    .then(products => {
      res.render('shop/product-list', {
        prods: products,
        pageTitle: 'Products',
        path: '/products',
        currentPage: page,
        hasNextPage: ITEMS_PER_PAGE * page < totalItems,
        hasPreviousPage: page > 1,
        nextPage: page + 1,
        previousPage: page - 1,
        lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE)
      });
    })
    .catch(err => {
      console.log(err);
    });
};

exports.getProduct = (req, res, next) => {
  const prodId = req.params.productId; 
  Product.findById(prodId) //mongoose function
    .then(product => {
      res.render('shop/product-detail', {
        product: product,
        pageTitle: product.title,
        path: '/products' 
      });
    })
    .catch(err => console.log(err));
};

exports.getIndex = (req, res, next) => {
  const page = +req.query.page || 1;
  let totalItems;

  Product.find()
  .countDocuments()
    .then(numProducts => {
      totalItems = numProducts;
      return Product.find()
        .skip((page - 1) * ITEMS_PER_PAGE)
        .limit(ITEMS_PER_PAGE);
    })
    .then(products => {
      res.render('shop/index', {
        prods: products,
        pageTitle: 'Shop',
        path: '/',
        currentPage: page,
        hasNextPage: ITEMS_PER_PAGE * page < totalItems,
        hasPreviousPage: page > 1,
        nextPage: page + 1,
        previousPage: page - 1,
        lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE)
      });
    })
    .catch(err => {
      console.log(err);
    });
};

exports.getCart = (req, res, next) => {
  req.user
    .populate('cart.items.productId')
    .execPopulate()   //to return promis
    .then(user => {
      const products=user.cart.items;
      res.render('shop/cart', {
        path: '/cart',
        pageTitle: 'Your Cart',
        products: products 
      });
    })
    .catch(err => console.log(err));
};

exports.postCart = (req, res, next) => {
  const prodId = req.body.productId;
  const Extras=req.body.Extras;
  console.log(Extras);
  Product.findById(prodId)
    .then(product => {
      return req.user.addToCart(product,Extras);
    })
    .then(result => {
      console.log(result);
      res.redirect('/cart');
    });
};

exports.postCartDeleteProduct = (req, res, next) => {
  const prodId = req.body.productId;
  const Extras=req.body.Extras;

  req.user
    .removeFromCart(prodId,Extras)
    .then(result => {
      res.redirect('/cart');
    })
    .catch(err => console.log(err));
};

exports.postOrder = (req, res, next) => {
  // var dateobj = new Date(); 
  // var orderDate = dateobj.toISOString(); 
  req.user
    .populate('cart.items.productId')
    .execPopulate()   //to return promis
    .then(user => {
      const products=user.cart.items.map(i=>{
        return {quantity: i.quantity,product: {...i.productId._doc},note:i.note}
      });
      const order=new Order({
        user:{
          email:req.user.email,
          userId:req.user
        },
        products:products,
        createdAt:Date.now()
      })
      return order.save();
    }).then(result => {
      return req.user.clearCart();
    }).then(()=>{
      res.redirect('/orders');

    })
    .catch(err => console.log(err));
};

exports.getOrders = (req, res, next) => {
  Order.find({"user.userId":req.user._id}) 
    .then(orders => {
      res.render('shop/orders', {
        path: '/orders',
        pageTitle: 'Your Orders',
        orders: orders 
      });
    })
    .catch(err => console.log(err));
};
