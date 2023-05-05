var express = require('express');
const { render, response }=require('../app');
const { ADMIN_COLLECTIONS } = require('../config/collections');
var router = express.Router();
var productHelpers =require('../helpers/product-helpers');
const userHelpers = require('../helpers/user-helpers');
const adminHelpers = require('../helpers/admin-helpers');


const { deleteProduct, addCategory, viewCategory } = require('../helpers/product-helpers');

const{viewProduct,addProduct,viewAddProduct,deleteAddProduct,editProduct, editProductPost,editProductGet, userGet,loginGet,signUpGet,signUpPost,loginPost,logOut,deleteUserGet,addCategoryGet ,addCategoryPost,editCategory,blockUser,unBlockUser,viewCategoryGet }= require('../controller/admin/admin');
const { VerificationAttemptContext } = require('twilio/lib/rest/verify/v2/verificationAttempt');




//setting layout for admin side seperate...
const setAdminLayout = (req, res, next) => {
  res.locals.layout = 'admin-layout'
  next()
}
// using admin layout...
router.use(setAdminLayout)

const verifyAdminLogin=(req,res,next)=>{
  if(req.session.adminloggedIn){
    next()
  }else{
    res.redirect('/admin')
  }
}


router.get('/', function(req, res, next) {
  res.render('admin/admin-login',{adminShow:true,admin:req.session.admin})

});

// add product get 
router.get('/view-product', viewProduct );


router.get('/add-product',verifyAdminLogin,addProduct )

router.post('/add-product',verifyAdminLogin,viewAddProduct );




router.get('/delete-product/:id',deleteAddProduct  );

router.get('/edit-product/:id',verifyAdminLogin,editProduct );



router.post('/edit-product/:id',editProductPost );






// user
router.get('/view-users',verifyAdminLogin, userGet );
router.get('/block-user/:id', blockUser)  
 router.get('/unblock-user/:id',unBlockUser )  
  



// login signup -admin
 router.get('/admin-login',verifyAdminLogin,loginGet );

 router.get('/admin-signup',signUpGet);
 router.post('/admin-signup',signUpPost );


 router.post('/admin-login',loginPost);


 router.get('/admin-logout',verifyAdminLogin,logOut);


//  router.post('/admin-signup',(req,res)=>{
//   adminHelpers.doSignup(req.body).then((response)=>{
//     console.log(response);
//     res.render('admin/admin-login')
//   })
//  });


 
 
  




  // router.post('/edit-product/:id',(req,res)=>{
  //   let id = req.params.id
  //   productHelpers.updateProduct(req.params.id,req.body).then(()=>{
  //     res.redirect('/admin')
  //     if(req.files.image){
  //       let image = req.files.image
  //       image.mv('./public/product-images/'+id+'.jpg')
  //     }
     
  //   })
  // });

// router.get('/delete-user/:id',deleteUserGet );

//   router.get('/edit-user/:id',async(req,res)=>{
//     let users= await userHelpers.getAlluserDetails(req.params.id)
//     console.log(users);
//     res.render('admin/edit-user',{users})
  
//   });
//   router.post('/edit-user/:id',(req,res)=>{
//     userHelpers.updateuser(req.params.id,req.body).then(()=>{
//       res.redirect('/admin')
//     })
//   });

  //category
  router.get('/add-category',addCategoryGet );

  router.post('/add-category', addCategoryPost  );
  //view category
   router.get('/view-category',viewCategoryGet );


//edit category
router.get('/edit-category/:id',verifyAdminLogin,editCategory )


router.post('/edit-category/:id', (req, res) => {

  // console.log('post');
  let id = req.params.id
  productHelpers.updateCategory(req.body,id).then((response) => {
    // if (response.status) {
      res.redirect('/admin/view-category')
    // } else {
      // req.session.catEditErr = "this item Already Exist"
      // res.redirect('/admin/edit-category')
  //   }
  // })
  })
})

// router.put('/edit-category/:id', (req, res) => {
//   const categoryId = req.params.id;
//   const updatedCategory = req.body;

//   // Call a function to update the category in the database using categoryId and updatedCategory

//   res.redirect('/admin/view-category');
// });

router.get('/delete-category/:id',(req,res)=>{

productHelpers.deteCategory(req.params.id,req.body).then(()=>{

    res.redirect('/admin/view-category')
})

});

// orderlist
router.get('/order-list', async (req, res) => {
  // let admin = req.session.admin
  let allOrders = await adminHelpers.getAllOrders()
  res.render('admin/order-list', { allOrders, admin:req.session.admin})
})


router.get('/view-ordered-product/:id',verifyAdminLogin, async(req,res)=>{
console.log(req.params.id);
let orderId=req.params.id
let product=await adminHelpers.getOrderProducts(orderId)


  res.render('admin/view-ordered-product',{product})
})

router.post('/changeOrderStatus',async(req,res)=>{
adminHelpers.changeOrderStatus(req.body).then(() => {
res.redirect("/admin/order-list");
})
})
 
//dashboard
router.get('/dashboard',verifyAdminLogin,async(req,res)=>{
  let admin  =req.session.admin
  console.log("yyyyyyyyyyyyyyyyyyyyyyyyyyyy");
  if(admin ){
    let allCount = await adminHelpers.getDashBoardCount();
    let totalRevenue = await adminHelpers.totalRevenue();
     let dailyRevenue = await adminHelpers.dailyRevenue();
    let weeklyRevenue = await adminHelpers.weeklyRevenue();
    let monthlyRevenue = await adminHelpers.monthlyRevenue();
    let yearlyRevenue = await adminHelpers.yearlyRevenue();
    let data = await adminHelpers.monthlyRevenue();
      
      // console.log(data.cod);
      // console.log("Data is coming......................................");
      
    res.render('admin/dashboard',{
      admin:true,
      admin ,
      allCount,
      totalRevenue,
      dailyRevenue,
      weeklyRevenue,
      monthlyRevenue,
      yearlyRevenue,
      data,
    }); 
  }else{
    res.redirect('/admin/admin-login')
  }
})

//chart
router.get('/chart-data',verifyAdminLogin,async(req,res)=>{
 
    adminHelpers.getchartData().then((obj) => {
      let result = obj.result;
      let weeklyReport = obj.weeklyReport;
      res.json({ data: result, weeklyReport });
    });
  },
)

//coupon 
router.get('/coupon-management',verifyAdminLogin, async (req, res) => {
  let adminData = req.session.admin;

  let admin = req.session.admin;
  let coupons = await adminHelpers.getAllCoupons();
  res.render("admin/coupon-management", {
    coupons,
    coupExistErr: req.session.couponExist,
    admin,
    adminData,
  })
  req.session.couponExist = false;

})

router.get('/add-coupon',verifyAdminLogin,(req,res)=>{
  res.render('admin/add-coupon',{admin:req.session.admin})
})

router.post('/add-coupon',verifyAdminLogin,(req, res) => {
  adminHelpers.addCoupon(req.body).then(() => {
      res.redirect("/admin/coupon-management");
    })
    .catch(() => {
      req.session.couponExist = "Coupon Already Exist!!!";
      res.redirect("/admin/coupon-management");
    });
})

router.get('/edit-coupon/:id',verifyAdminLogin,async(req,res)=>{
  let coupon = await adminHelpers.getCoupon(req.params.id)
  res.render('admin/edit-coupon',{admin:true,coupon,admin:req.session.admin})
})

router.post('/edit-coupon',(req,res)=>{
  adminHelpers.editCoupon(req.body).then(()=>{
    res.redirect('/admin/coupon-management')
  })
});

router.get('/delete-coupon/:id',verifyAdminLogin,(req,res)=>{
  adminHelpers.deleteCoupon(req.params.id).then(()=>{
    res.redirect('/admin/coupon-management')
  })
});

router.get('/sales-report',verifyAdminLogin,async (req, res) => {
   let admin = req.session.admin;
  let allOrders = await adminHelpers.getOrder();
  res.render("admin/sales-report", { allOrders, admin: true, admin });

})


router.get('/banner-management',verifyAdminLogin,async(req,res,next)=>{
  
 let banner=await adminHelpers.getAllBanners()
 res.render('admin/banner-management',{admin:true,banner,admin: req.session.admin})
})

router.get('/add-banner',verifyAdminLogin,(req,res)=>{
  res.render('admin/add-banner',{admin:true,admin:req.session.admin})
})


// router.post('/add-banner', (req, res) => {
//   console.log(req.body);
//   adminHelpers.addBanner(req.body).then((response) => {
//       let id = response.insertedId
//       let image = req.files.image
//       image.mv('./public/banner-images/' + id +'.jpg')
//       res.redirect('/admin/banner-management')
//   }).catch(() => {
//       req.session.bannerRepeatError = "Banner already added!!"  
//       res.redirect('/admin/add-banner')
//   })
// })

router.post('/add-banner', verifyAdminLogin, (req, res) => {
  console.log(req.body);
  adminHelpers.addBanner(req.body).then((response) => {
      let id = response.insertedId
      let image = req.files.image
      image.mv('./public/banner-images/' + id +'.jpg')
      res.redirect('/admin/banner-management')
  }).catch(() => {
      req.session.bannerRepeatError = "Banner already added!!"  
      res.redirect('/admin/add-banner')
  })
});

router.get('/edit-banner/:id',verifyAdminLogin,async(req,res)=>{
let id= req.params.id
let banner=await adminHelpers.getAllBannerDetails(id)

res.render('admin/edit-banner',{banner,admin:true,admin:req.session.admin})
})


router.post('/edit-banner', (req, res) => {
 console.log(req.body);
 let id = req.body._id
 console.log("///////////////////////////////////////////");
  adminHelpers.editBanner(req.body).then(() => {
      if (req.files.banner) {
          let image = req.files.banner
          image.mv('./public/banner-images/' + id +'.jpg')
      }
      res.redirect('/admin/banner-management')
  })
})


router.get('/delete-banner/:id', verifyAdminLogin, (req, res) => {
  let id = req.params.id
  adminHelpers.deleteBanner(id).then(() => {
      res.redirect('/admin/banner-management')
     
  })
});


router.get('/product-offers',verifyAdminLogin, async (req, res) => {
  let allProducts = await productHelpers.getAllProducts();
  let prodOffers = await adminHelpers.getAllProductOffers();
  res.render("admin/product-offers", {
    admin: true,
    allProducts,
    prodOffers,
    prodOfferErr: req.session.prodOfferErr,
    admin:req.session.admin
  });
  req.session.prodOfferErr = false;
})

router.post('/product-offers',verifyAdminLogin,async (req, res) => {
  adminHelpers.addProductOffer(req.body).then(() => {
      res.redirect("/admin/product-offers");
    })
    .catch(() => {
      req.session.prodOfferErr = "This Offer Already Exists!";
      res.redirect("/admin/product-offers");
    })
})

router.get('/edit-prodOffer/:_id', verifyAdminLogin,async (req, res) => {
  let proOfferId = req.params._id;
  let proOffer = await adminHelpers.getProdOfferDetails(proOfferId);
  res.render("admin/edit-prodOffer", { admin: true, proOffer });
});

router.post('/edit-prodOffer/:_id',verifyAdminLogin,(req, res) => {
  let proOfferId = req.params._id;
  adminHelpers.editProdOffer(proOfferId, req.body).then(() => {
    res.redirect("/admin/product-offers");
  })
});


editProductOfferGet: 

editProductOfferPost: 

// deleteProdOffer: (req, res) => {
//   let proOfferId = req.params._id;
//   adminHelpers.deleteProdOffer(proOfferId).then(() => {
//     res.redirect("/admin/product-offers");
//   });
// },








module.exports = router;
