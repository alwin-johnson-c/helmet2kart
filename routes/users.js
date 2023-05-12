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




//search category error '''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''


router.get('/search',verifyLogin,async (req, res) => {
  let cartCount = 0;
  // let wishCount = 0;
  let user = req.session.user;
  if (req.session.user) {
    cartCount = await userHelpers.getCartCount(req.session.user._id);
    // wishCount = await userHelpers.getWishlistCount(req.session.user._id);
  
  }
  res.render('user/search', { notShowB: true, cartCount, user });
  
})


router.post('/search',verifyLogin, async (req, res) => {
  let cartCount = 0;
  console.log(req.body.search);
  // let wishCount = 0;
  
  if (req.session.user) {
    cartCount = await userHelpers.getCartCount(req.session.user._id);
    // wishCount = await userHelpers.getWishlistCount(req.session.user._id);
  }

  productHelpers.searchProduct(req.body.search).then((products) => {
    res.render('user/SearchedProduct', {
      products,
      // wishCount,
      cartCount,
      user:req.session.user
    });
  });
})



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

// router.get('/offerZone',(req,res)=>{
  
//   res.render('user/offer1')
// })


router.get('/offer1',verifyLogin,async(req,res)=>{
  const id=req.params.id
  console.log(id,'iddddddd');
  let offer=await adminHelpers.offerUrl()
  console.log(offer,'offer');
  res.render('user/offer1',{user:req.session.user,id,offer})
})



router.get('/offer2',verifyLogin,async(req,res)=>{
  const id=req.params.id
  console.log(id,'iddddddd');
  let offer=await adminHelpers.offerUrl()
  res.render('user/offer2',{user:req.session.user,offer})
})

router.get('/sort',verifyLogin,async(req,res)=>{
  let catgy=await userHelpers.viewUserCat()
  let sorting =await productHelpers.SortedProduct(req.query.category)
  res.render('user/smk',{user:req.session.user,sorting,catgy})
});


router.get('/forgot-password', (req, res) => {
  let cartCount = 0;
  // let wishCount = 0;
  res.render("user/forgot-password", {
    FPBerr: req.session.FPblockErr,
    FPUerr: req.session.FPnoUserErr,
    passErr: req.session.pasErr,
    cartCount,
    // wishCount,
  });
  req.session.FPblockErr = false;
  req.session.FPnoUserErr = false;
  req.session.pasErr = false;
});

router.post('/forgot-password',async (req, res) => {
  let cartCount = 0;
  // let wishCount = 0;
  await userHelpers.forgotPassword(req.body).then((response) => {
    let email = response.email;
    if (response.blocked) {
      req.session.FPblockErr = "You Are Blocked";
      res.redirect("/forgot-password");
    } else if (response.noUser) {
      req.session.FPnoUserErr = "Email Is Not Exist ";
      res.redirect("/forgot-password");
    } else {
      res.render("user/repassword", { email, cartCount, });
    }
  });
},)
router.get('/enter-password', (req, res) => {
  res.render("user/repassword");
});


router.post('/enter-password', (req, res) => {
  console.log(req.body);

  userHelpers.changePassword(req.body).then((response) => {
    if (response.status) {
      res.redirect("/login");
    } else {
      req.session.pasErr = "Password Not Matched";
      res.redirect("/forgot-password");
    }
  });
},)


forgottPasswordPost: 

newPasswordGet:

newPasswordPost:


module.exports = router;
