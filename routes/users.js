var express = require('express');
const { response, render } = require('../app');
const { USER_COLLECTIONS } = require('../config/collections');
var router = express.Router();
var productHelpers =require('../helpers/product-helpers')
const userHelpers = require('../helpers/user-helpers');




const {homePage, userSingup, userLogin ,signupPost, otpGet,otpLogin , enterOtp, otpVerify,loginPost ,logOut,addCart ,productView, cartGet,cartDelete,
  getPlaceOrder,postPlaceOrder, postChangeProductQty, getOrderSucess,getViewOrder,getOrderProducts,
editProfilePost,editProfileGet,getInvoice,returnOrderGet } = require('../controller/user/user');
const { cancelOrder } = require('../helpers/user-helpers');


const verifyLogin=(req,res,next)=>{
  if(req.session.loggedIn){
    next()
  }else{
    res.redirect('/login')
  }
}


/* GET users listing. */
router.get('/',homePage);





router.get('/signup', userSingup);

router.get('/login',userLogin);

router.post('/signup', signupPost);

router.get('/otp-login', otpGet);

// otp login post
router.post('/otp-login',otpLogin )

// otp code getting
router.get('/enter-otp',enterOtp )

// otp verifying post
router.post('/enter-otp',otpVerify )

router.post('/login', loginPost);


router.get('/logout',logOut)



router.get('/about',function(req,res){
  res.render('user/about')
}); 

// cart
router.get('/cart',verifyLogin,cartGet)

 router.get('/add-to-cart/:id',addCart);


 router.get('/delete-cart-item/:proId/:cartId',cartDelete);




//search category error '''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''

// router.get('/search',verifyLogin,async(req,res)=>{
//   let user =req.session.user
//   if(req.session.user){
//     let product=await productHelpers.getSearchProduct().

//     const catId = req.params.catId;
//   const searchWord = req.query.search;

//   try {
//     const category = await db.get().collection(collection.CART_COLLECTION ).findOne({ _id: ObjectId(catId), name: { $regex: searchWord, $options: 'i' } });
//     res.render('category', { category });
//   } catch (err) {
//     console.log(err);
//     res.render('error', { message: 'Error fetching category' });
//   }

//   }
//   res.render('user/search',{user})
// })
router.get('/search',verifyLogin,async (req, res) => {
  let cartCount = 0;
  // let wishCount = 0;
  let user = req.session.user;
  // if (req.session.user) {
  //   cartCount = await userHelpers.getCartCount(req.session.user._id);
  //   // wishCount = await userHelpers.getWishlistCount(req.session.user._id);
  
  // }
  res.render('user/search', { notShowB: true, cartCount, user });
  
},)


router.post('/search',verifyLogin, async (req, res) => {
  let cartCount = 0;
  console.log(req.body.search);
  // let wishCount = 0;
  let user = req.session.user;
  if (req.session.user) {
    cartCount = await userHelpers.getCartCount(req.session.user._id);
    // wishCount = await userHelpers.getWishlistCount(req.session.user._id);
  }

  productHelpers.searchProduct(req.body.search).then((products) => {
    res.render("user/SearchedProduct", {
      products,
      // wishCount,
      cartCount,
      user,
    });
  });
},)



//single product page
router.get('/view-product/:id',verifyLogin,productView );


//change product qty
// router.post('/change-product-quantity',(req,res,next)=>{
//   console.log('huhiuhhjh');
// userHelpers.changeProductQuantity(req.body).then(async(response)=>{
//   response.total = await userHelpers.getTotalAmount(req.body.user)
// res.json(response)
// })
// });



//place-order page
router.get('/place-order',  verifyLogin,getPlaceOrder );


router.post('/place-order',postPlaceOrder );

router.post('/change-product-quantity', verifyLogin,  postChangeProductQty )


//order success

router.get('/order-success',getOrderSucess )

router.get('/view-order',verifyLogin,getViewOrder )


router.get('/view-order-products/:id',verifyLogin,getOrderProducts )

//placehrder

// user profile
router.get('/profile',verifyLogin,async (req, res) => {
  let cartCount = 0;
  let wishCount = 0;
  let user = req.session.user;
  if (req.session.user) {
    cartCount = await userHelpers.getCartCount(req.session.user._id);
    // wishCount = await userHelpersersHelpers.getWishlistCount(req.session.user._id);
  }
  oneUser = await userHelpers.getOneUser(req.session.user._id);
  walletHistory = await userHelpers.getWalletHistory(req.session.user._id);
  res.render('user/profile', {
    oneUser,
    cartCount,
    // wishCount,
    user,
    walletHistory,
  });
})

//edit profile get
router.get('/edit-profile',verifyLogin,editProfileGet )



//edit profile post
router.post('/edit-profile',verifyLogin,editProfilePost)

router.get('/product/:id',(req,res)=>{
  console.log(id);
})


// invoice
router.get('/invoice/:id',getInvoice )



//return order

router.get('/return-order/:id',verifyLogin,returnOrderGet)



//cancel order
router.get('/cancel-order/:id', (req,res)=>{
console.log(req.params.id);
  userHelpers.cancelOrder(req.params.id)
  res.redirect('/view-order')
})


//wishlist
router.get('/wishlist',verifyLogin,async(req,res)=>{
  
  if(req.session.user){
  let products= await userHelpers.getWishlistProduct(req.session.user._id)
  console.log("LLLLLLLLLLLLLLL"+products);
  console.log("LLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLL");
  res.render('user/wishlist',{user:req.session.user,products})
} 
})

router.get('/add-to-wishlist/:id',verifyLogin,(req, res) => {
 userHelpers .addToWish(req.params.id, req.session.user._id)
    .then(() => {
      res.json({ add: true });
    })
    .catch(() => {
      res.json({ remove: true });
    });
}),

router.get('/delete-wishlist-item/:proId/:wishId',verifyLogin,(req, res) => {
  let proId = req.params.proId;
  let wishId = req.params.wishId;
  console.log(proId+"PPPpppppppppppppppppppppp");
  console.log(wishId+"WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW");
  userHelpers.deleteWishlist(proId, wishId).then(() => {
    res.json({ status: true });
  });
})


//coupon
router.post('/coupon-apply',verifyLogin,async(req,res)=>{
  let id = req.session.user._id
  let coupon = req.body.coupon
  let totalAmount = await userHelpers.getTotalAmount(req.session.user._id);
  userHelpers.validateCoupon(req.body,id,totalAmount).then((response)=>{
    console.log(response);
    console.log("/////////////////////////////////////////////////////////////////////");
    req.session.couponTotal = response.total;
    if(response.success){
      console.log("sucess");
      res.json({
        couponSuccess: true,
        total: response.total,
        discountValue: response.discountValue,
        coupon,
      })
    }else if(response.couponUsed){
      res.json({couponUsed: true})
    }else if(response.couponExpired){
      console.log("expired");
    }else{
      res.json({invalidCoupon:true})
    }

  })
})








module.exports = router;
