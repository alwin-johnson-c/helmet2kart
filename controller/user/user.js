const { log } = require('handlebars');
const adminHelpers = require('../../helpers/admin-helpers');
var productHelpers =require('../../helpers/product-helpers');
const userHelpers = require('../../helpers/user-helpers');


const servicesID = process.env.SERVICE_ID 
const accountSid = process.env.ACTSID_ID 
const authToken= process.env.AUTH_TOKN    
const client = require('twilio')(accountSid,authToken);

// const viewUserList = async (req, res) =>{
//     let user=req.session.user
//     console.log(user)
//     let cartCount=null
//     if(req.session.user){
//       cartCount = await userHelpers.getCartCount(req.session.user._id)
//     }
    
//     productHelpers.getAllProducts().then((products)=>{
      
//       res.render('user/user-homepage',{products,user,cartCount})
//     })
//   };
// var homePage=async(req,res)=>{
//   // let todayDate = new Date().toISOString().slice(0, 10);
//   //       let startCouponOffer = await userHelpers.startCouponOffer(todayDate)
//   let user = req.session.user
//   console.log(user);
//   let cartCount=null
//   if(req.session.user){
//     let todayDate = new Date().toISOString().slice(0, 10);
//     let startCouponOffer = await userHelpers.startCouponOffer(todayDate)
//   cartCount = await userHelpers.getCartCount(req.session.user._id)
//   }
//   productHelpers.getAllProducts().then((products)=>{
//     res.render('user/user-homePage',{products,user,cartCount})
//   })

// }

var homePage = async (req, res) => {
  let todayDate = new Date().toISOString().slice(0, 10);
  var startCouponOffer = await userHelpers.startCouponOffer(todayDate);
  let startProductOffer=await  productHelpers.startProductOffer(todayDate);
  let banner= await adminHelpers.getAllBanners()
  let catgy=await userHelpers.viewUserCat()
  console.log(catgy,"LLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLL");
  let user = req.session.user;
  console.log(user);
  let cartCount = null;
  if (req.session.user) {
    todayDate = new Date().toISOString().slice(0, 10);
    startCouponOffer = await userHelpers.startCouponOffer(todayDate);
   startProductOffer=await  productHelpers.startProductOffer(todayDate);
    cartCount = await userHelpers.getCartCount(req.session.user._id);
  }
  // let productOffer= await adminHelpers.ProductOffers()
  // console.log(productOffer.product+'productOffer {{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{');
    productHelpers.getAllProducts().then((products) => {
    console.log(banner);
    res.render('user/user-homePage', { products, user, cartCount,banner,catgy});

  });
};

  // const userSingup = (req,res)=>{
  //   res.render('user/signup')
  // };


  const userSingup= (req, res) => {
    let cartCount = 0;
    // let wishCount = 0;

    let error = req.session.error;
    let passEr = req.session.passError;
    res.render("user/signup", { error, passEr, cartCount,  });
    req.session.error = false;
    req.session.passError = false;
  };


  const userLogin = (req,res)=>{
        // session handling
        if(req.session.loggedIn){
          res.redirect('/')
        }else{
          res.render('user/login',{"loginErr":req.session.loginErr})
          req.session.loginErr=false
        }
        
      };


  // const signupPost =(req,res)=>{
  //       userHelpers.doSignup(req.body).then((response)=>{
  //         console.log(response);
  //         if (response.status) {
  //           req.session.exist=true
  //           req.session.error = "Email Alredy Submited";
  //           res.redirect("/signup");
  //         }else{
  //           res.redirect('/login')

  //         }
      
         
  //       })
  //     };
   const signupPost= (req, res) => {
    userHelpers.doSignup(req.body).then((response) => {
      if (response.status) {
        req.session.error = "Email Alredy Submited";
        res.redirect("/signup");
      } else if (response.pwNotSame) {
        req.session.passError = "Password Not Match";
        res.redirect("/signup");
      } else {
        res.redirect("/login");
      }
    });
  };


   const otpGet =(req,res)=>{
        res.render('user/otp-login')
      };


   const otpLogin =(req, res) => {
        userHelpers.checkMobile(req.body).then((response) => {
          console.log("0000000000000000000000000977yy");
          console.log(response)
          if (response.blocked) {
            req.session.blockErr = "user is temporarily blocked"
            res.redirect('/otp-login')
          } else if (response.noUser) {
            req.session.noUserErr = "no user found please signup"
            res.redirect('/otp-login')
          } else {
            let phone = response.phone
            client.verify
              .services(servicesID)
              .verifications.create({ to: `+91${req.body.phone}`, channel: "sms" })
              .then((response) => {
                res.render('user/enter-otp', { phone })
              })
          }
        })
      };

   const enterOtp=(req, res) => {
        let otpErr = req.session.invalidOtpErr
        res.render('user/enter-otp', { otpErr })
        req.session.invalidOtpErr = false
      };

   const otpVerify =(req, res) => {
    let otp = req.body.otp
    let phone = req.body.phone
    console.log(otp);
    console.log(phone);
    console.log("mmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmm");
    client.verify
      .services(servicesID)
      .verificationChecks.create({ to: `+91${phone}`, code: otp })
      .then((response) => {
        let valid = response.valid
        if (valid) {
          userHelpers.userOtp(phone).then((response) => {
            console.log("this is ............................");
            console.log(response);
              req.session.loggedIn = true
          req.session.user = response
            res.redirect('/login')
          })
        } else {
          req.session.invalidOtpErr = "invalid otp"
          res.redirect('/enter-otp')
        }
      });
  }  ;
  
  
  const loginPost= (req,res)=>{
    userHelpers.doLogin(req.body).then((response)=>{
      if(response.status){
        req.session.loggedIn=true;
        req.session.user=response.user
        res.redirect('/')
      }else{
        req.session.loginErr='invalid user or password'
        res.redirect('/login')
      }
    })
  
  }

  const logOut = (req,res)=>{
    req.session.destroy()
    res.redirect('/')
  }



   const getCart=  async(req,res)=>{

    console.log('dddddddddddd');
    let products= await userHelpers.getCartProducts(req.session.user._id)
    let totalValue=await userHelpers.getTotalAmount(req.session.user._id)
    console.log(products);
    console.log("produuuuuuuuuuuuuuuuuuuuuuuuuu");
    res.render('user/cart',{products,user:req.session.user,totalValue})
  
  }


  const addCart=(req,res)=>{
    console.log("api call");
   
     userHelpers.addToCart(req.params.id,req.session.user._id).then((response)=>{
      

        console.log(response);
        res.json({status:true})
      })
      
      // res.redirect('/')
 
      // res.json({status:true})
    
   };


  // view product
const productView=async(req,res)=>{
  let id =req.params.id
 
  let prod = await productHelpers.getOneProduct(id)
  res.render('user/shop',{prod,user:req.session.user})
   }


// cart get r-users.js-line-58

const cartGet= async(req,res)=>{
  let products = await userHelpers.getCartProducts(req.session.user._id)
 let totalValue= await userHelpers.getTotalAmount(req.session.user._id) 
 
  res.render('user/cart',{products,user:req.session.user,totalValue})
}

//delete cart get r-users.js-line-64

const cartDelete=(req,res)=>{
  proId= req.params.proId
  cartId = req.params.cartId
  userHelpers.deleteCartItem(proId,cartId).then((response)=>{
  res.json({status:true})  
  })
}

//place-order get r-users.js-line-85

const getPlaceOrder=async(req,res)=>{
  let user = req.session.user
  let products = await userHelpers.getCartProducts(req.session.user._id)
  let total = await userHelpers.getTotalAmount(req.session.user._id)
  res.render('user/place-order',{products,total,user})
}


const postPlaceOrder = async(req,res)=>{
 
  let totalPrice=await userHelpers.getTotalAmount(req.body.userId)

  let products=await userHelpers.getCartProductList(req.body.userId)
  if (req.session.couponTotal) {
    totalPrice = req.session.couponTotal
    req.session.couponTotal = null
} else {
  // let totalPrice=await userHelpers.getTotalAmount(req.body.userId)
    // totalPrice = await cartHelpers.getTotalAmount(req.body.userId)
}

  userHelpers.placeOrder(req.body,products,totalPrice).then((response)=>{
   
    let orderId = response
     if (req.body['payment-method'] === 'paypal') {
      console.log("============================");
      userHelpers.generatePaypal(orderId, totalPrice).then((link) => {
        console.log("inside generate paypal");
        res.json({ link, paypal: true })
      })
    } else if(req.body['payment-method'] === 'wallet') {
      userHelpers.reduceWallet(req.body.userId, totalPrice).then(() => {
        res.json({ wallet: true });
      });
    
    }else {
      res.json({codStatus:true})
  }
})
} 

const postChangeProductQty=async (req, res) => {
  
  console.log(req.body);
  let userId = req.body.user;
  count = req.body.count
    userHelpers.changeProductQuantity(req.body).then(async (response) => {
    response.total = await userHelpers.getTotalAmount(userId)
    console.log(response);
    res.json(response) 
  })
}

const getOrderSucess=(req,res)=>{
  res.render('user/order-success',{user:req.session.user})
}


const getViewOrder= async(req,res)=>{
  let order= await userHelpers.getUserOrder(req.session.user._id)
  
 
  res.render("user/view-order",{user:req.session.user,order})
}

const getOrderProducts= async(req,res)=>{
  let products= await userHelpers.getOrderProducts(req.params.id)
 
  res.render('user/view-order-products',{user:req.session.user,products})
}

//profile edit 

const editProfilePost= (req,res)=>{
  userHelpers.editProfile(req.session.user._id,req.body).then(()=>{
    res.redirect('/profile')
  })
}

const editProfileGet=async(req,res)=>{
  let user = req.session.user;
  user= await userHelpers.getOneUser(req.session.user._id)
  res.render('user/edit-profile',{user})
}


//invoice
const getInvoice=async(req,res)=>{
  let user = req.session.user;
  let invoice = await userHelpers.getUserInvoice(req.params.id);
  console.log(invoice);
  let product = await userHelpers.getOrderProducts(req.params.id);
  
  res.render('user/invoice',{user,invoice,product})
}


//return order

const returnOrderGet=  async(req,res)=>{
  
  userHelpers.returnOrder(req.params._id).then(()=>{
    res.redirect('/view-order')
  })
}

//wishlist get
const wishListGet=async(req,res)=>{
  if(req.session.user){
  let products= await userHelpers.getWishlistProduct(req.session.user._id)
  console.log("LLLLLLLLLLLLLLL"+products);
  console.log("LLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLL");
  res.render('user/wishlist',{user:req.session.user,products})
} 
}

//addtowishlist get
const addToWishListGet =(req, res) => {
  userHelpers .addToWish(req.params.id, req.session.user._id)
     .then(() => {
       res.json({ add: true });
     })
     .catch(() => {
       res.json({ remove: true });
     });
 }

const deleteWishList=(req, res) => {
  let proId = req.params.proId;
  let wishId = req.params.wishId;
  console.log(proId+"PPPpppppppppppppppppppppp");
  console.log(wishId+"WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW");
  userHelpers.deleteWishlist(proId, wishId).then(() => {
    res.json({ status: true });
  });
}


const couponApplyPost=async(req,res)=>{
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
}

const offerOne=async(req,res)=>{
  const id=req.params.id
  console.log(id,'iddddddd');
  let offer=await adminHelpers.offerUrl()
  console.log(offer,'offer');
  res.render('user/offer1',{user:req.session.user,id,offer})
}

const offerTwo=async(req,res)=>{
  const id=req.params.id
  console.log(id,'iddddddd');
  let offer=await adminHelpers.offerUrl()
  res.render('user/offer2',{user:req.session.user,offer})
}

const sortCategory=async(req,res)=>{
  let catgy=await userHelpers.viewUserCat()
  let sorting =await productHelpers.SortedProduct(req.query.category)
  res.render('user/smk',{user:req.session.user,sorting,catgy})
}

const forgotPasswordGet=(req, res) => {
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
}

const forgotPasswordPost=async (req, res) => {
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
}

const enterPasswordGet=(req, res) => {
  res.render("user/repassword");
}

const enterPasswordPost=(req, res) => {
  console.log(req.body);

  userHelpers.changePassword(req.body).then((response) => {
    if (response.status) {
      res.redirect("/login");
    } else {
      req.session.pasErr = "Password Not Matched";
      res.redirect("/forgot-password");
    }
  });
}

const cancelOrderGet=(req,res)=>{
  console.log(req.params.id);
    userHelpers.cancelOrder(req.params.id)
    res.redirect('/view-order')
  }

  const profileGet=async (req, res) => {
    let cartCount = 0;
    
    let user = req.session.user;
    if (req.session.user) {
      cartCount = await userHelpers.getCartCount(req.session.user._id);
     
    }
    oneUser = await userHelpers.getOneUser(req.session.user._id);
    walletHistory = await userHelpers.getWalletHistory(req.session.user._id);
    res.render('user/profile', {
      oneUser,
      cartCount,
      
      user,
      walletHistory,
    });
  }

  const searchGet=async (req, res) => {
    let cartCount = 0;
    // let wishCount = 0;
    let user = req.session.user;
    if (req.session.user) {
      cartCount = await userHelpers.getCartCount(req.session.user._id);
      // wishCount = await userHelpers.getWishlistCount(req.session.user._id);
    
    }
    res.render('user/search', { notShowB: true, cartCount, user });
    
  }



  const searchPost=async (req, res) => {
    let cartCount = 0;
    console.log(req.body.search);
    // let wishCount = 0;
    
    if (req.session.user) {
      cartCount = await userHelpers.getCartCount(req.session.user._id);
      // wishCount = await userHelpers.getWishlistCount(req.session.user._id);
    }
  
    productHelpers.searchProduct(req.body.search).then((products) => {
      res.render('user/searchedProduct', {
        products,
        // wishCount,
        cartCount,
        user:req.session.user
      });
    });
  }

  module.exports =
   {
    homePage,
    userSingup,
    userLogin ,
    signupPost ,
    otpGet,
     otpLogin ,
     enterOtp,
      otpVerify,
     loginPost,
     logOut,
     addCart,
     getCart,
   productView,
   cartGet,
   cartDelete,
   getPlaceOrder,
   postPlaceOrder,
   postChangeProductQty,
   getOrderSucess,
   getViewOrder,
   getOrderProducts,
   editProfilePost,
   editProfileGet,
   getInvoice,
   returnOrderGet,
   wishListGet,
   addToWishListGet,
   deleteWishList,
   couponApplyPost,
   offerOne,
   offerTwo,
   sortCategory,
   forgotPasswordGet,
   forgotPasswordPost,
   enterPasswordGet,
   enterPasswordPost,
   cancelOrderGet,
   profileGet,
   searchGet,
   searchPost
  
  
  }