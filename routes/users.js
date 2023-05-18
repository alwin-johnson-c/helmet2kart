var express = require('express');
const { response, render } = require('../app');
const { USER_COLLECTIONS } = require('../config/collections');
var router = express.Router();
var productHelpers =require('../helpers/product-helpers')
const userHelpers = require('../helpers/user-helpers');




const {homePage, userSingup, userLogin ,signupPost, otpGet,otpLogin , enterOtp, otpVerify,loginPost ,logOut,addCart ,productView, cartGet,cartDelete,
  getPlaceOrder,postPlaceOrder, postChangeProductQty, getOrderSucess,getViewOrder,getOrderProducts,
editProfilePost,editProfileGet,getInvoice,returnOrderGet,wishListGet,addToWishListGet,deleteWishList,couponApplyPost,offerOne,offerTwo,
sortCategory,forgotPasswordGet,forgotPasswordPost,enterPasswordGet,enterPasswordPost,cancelOrderGet,profileGet,searchGet,searchPost } = require('../controller/user/user');
const { cancelOrder } = require('../helpers/user-helpers');
const adminHelpers = require('../helpers/admin-helpers');


// const verifyLogin=(req,res,next)=>{
//   if(req.session.loggedIn){
//     next()
//   }else{
//     res.redirect('/login')
//   }
// }
const verifyLogin = (req, res, next) => {
  try {
    if (req.session.loggedIn) {
      userHelpers.isblocked(req.session.user._id).then((response) => {
        if (response.isblocked) {
          req.session.loggedIn = null
          req.session.blockErr = 'You Are Blocked'
          res.redirect('/login')
        } else {
          next()
        }
      })
    } else {
      res.redirect('/login')
    }
  } catch (err) {
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

 router.get('/add-to-cart/:id',verifyLogin,addCart);

 router.get('/delete-cart-item/:proId/:cartId',cartDelete);


//search category

router.get('/search',verifyLogin,searchGet);

router.post('/search',verifyLogin,searchPost);

//single product page

router.get('/view-product/:id',verifyLogin,productView );

//place-order page
router.get('/place-order',  verifyLogin,getPlaceOrder );

router.post('/place-order',postPlaceOrder );

router.post('/change-product-quantity', verifyLogin,  postChangeProductQty )


//order success

router.get('/order-success',getOrderSucess )

router.get('/view-order',verifyLogin,getViewOrder )

router.get('/view-order-products/:id',verifyLogin,getOrderProducts )



// user profile
router.get('/profile',verifyLogin,profileGet)

//edit profile get
router.get('/edit-profile',verifyLogin,editProfileGet )



//edit profile post
router.post('/edit-profile',verifyLogin,editProfilePost)

router.get('/product/:id',(req,res)=>{
   console.log(id);
})


// invoice
router.get('/invoice/:id',getInvoice );

//return order

router.get('/return-order/:id',verifyLogin,returnOrderGet);

//cancel order
router.get('/cancel-order/:id',cancelOrderGet);



//wishlist
router.get('/wishlist',verifyLogin,wishListGet);

router.get('/add-to-wishlist/:id',verifyLogin,addToWishListGet,);

router.get('/delete-wishlist-item/:proId/:wishId',verifyLogin,deleteWishList);


//coupon apply 

router.post('/coupon-apply',verifyLogin,couponApplyPost);


//banner getting

router.get('/offer1',verifyLogin,offerOne);

router.get('/offer2',verifyLogin,offerTwo);


//sort category

router.get('/sort',verifyLogin,sortCategory);

//forgot password
router.get('/forgot-password',forgotPasswordGet);

router.post('/forgot-password',forgotPasswordPost);

router.get('/enter-password', enterPasswordGet);

router.post('/enter-password', enterPasswordPost)





module.exports = router;
