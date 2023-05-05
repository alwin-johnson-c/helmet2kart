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
  let user = req.session.user;
  console.log(user);
  let cartCount = null;
  if (req.session.user) {
    todayDate = new Date().toISOString().slice(0, 10);
    startCouponOffer = await userHelpers.startCouponOffer(todayDate);
    startProductOffer=await  productHelpers.startProductOffer(todayDate);
    cartCount = await userHelpers.getCartCount(req.session.user._id);
  }
  productHelpers.getAllProducts().then((products) => {
    res.render('user/user-homePage', { products, user, cartCount,banner });
  });
};

  const userSingup = (req,res)=>{
    res.render('user/signup')
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


  const signupPost =(req,res)=>{
        userHelpers.doSignup(req.body).then(()=>{
      
         res.redirect('/login')
        })
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
  console.log(id)
  let prod = await productHelpers.getOneProduct(id)
  res.render('user/shop',{prod,user:req.session.user})
   }


// cart get r-users.js-line-58

const cartGet= async(req,res)=>{
  let products = await userHelpers.getCartProducts(req.session.user._id)
 let totalValue= await userHelpers.getTotalAmount(req.session.user._id) 
  console.log("/////////",products);
  console.log("/////////",req.session.user);
  console.log("/////////",totalValue);
  console.log('kkkk');
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
  console.log("inside place order-------");
  console.log(req.body);
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
    console.log(req.body);
    console.log("O0pppppppppppppppppppppppppppppppppp");
    console.log("place order response");
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
  console.log('huhiuhhjh');
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
  console.log(order);
  console.log("hhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhh");
  res.render("user/view-order",{user:req.session.user,order})
}

const getOrderProducts= async(req,res)=>{
  let products= await userHelpers.getOrderProducts(req.params.id)
  console.log(products);
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
  console.log(product);
  res.render('user/invoice',{user,invoice,product})
}


//return order

const returnOrderGet=  async(req,res)=>{
  
  userHelpers.returnOrder(req.params._id).then(()=>{
    res.redirect('/view-order')
  })
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
   returnOrderGet
  
  
  }