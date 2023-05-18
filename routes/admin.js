var express = require('express');
const { render, response }=require('../app');
const { ADMIN_COLLECTIONS } = require('../config/collections');
var router = express.Router();
var productHelpers =require('../helpers/product-helpers');
const userHelpers = require('../helpers/user-helpers');
const adminHelpers = require('../helpers/admin-helpers');


const { deleteProduct, addCategory, viewCategory } = require('../helpers/product-helpers');

const{viewProduct,addProduct,viewAddProduct,deleteAddProduct,editProduct, editProductPost, userGet,loginGet,signUpGet,signUpPost,loginPost,logOut,deleteUserGet,addCategoryGet ,addCategoryPost,editCategory,blockUser,unBlockUser,viewCategoryGet,
  editCategoryPost,deleteCategoryGet,orderListGet,viewOrderedProductGet,changeOrderStatusPost,adminDashBoardGet,adminChartGet,couponMgtGet,addCouponGet,
addCouponPost,editCouponGet,editCouponPost,deleteCouponGet,salesReportGet,bannerMgtGet,addBannerGet,addBannerPost,editBannerGet,
editBannerPost,deleteBannerGet,productOfferGet,productOfferPost,editProductOfferGet,editProductOfferPost,deleteProductOffer}= require('../controller/admin/admin');


const { VerificationAttemptContext } = require('twilio/lib/rest/verify/v2/verificationAttempt');
const { log } = require('handlebars');




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

//  product  
router.get('/view-product', viewProduct );

router.get('/add-product',verifyAdminLogin,addProduct )

router.post('/add-product',verifyAdminLogin,viewAddProduct );

router.get('/delete-product/:id',deleteAddProduct  );

router.get('/edit-product/:id',verifyAdminLogin,editProduct );

router.post('/edit-product/:id',editProductPost );


// user
router.get('/view-users',verifyAdminLogin, userGet );

router.get('/block-user/:id', blockUser);

 router.get('/unblock-user/:id',unBlockUser); 
  



// login signup -admin
 router.get('/admin-login',verifyAdminLogin,loginGet );

 router.get('/admin-signup',signUpGet);

 router.post('/admin-signup',signUpPost );

 router.post('/admin-login',loginPost);

 router.get('/admin-logout',verifyAdminLogin,logOut);




  //category
  router.get('/add-category',addCategoryGet );

  router.post('/add-category', addCategoryPost  );
  //view category
   router.get('/view-category',viewCategoryGet );


//edit category
router.get('/edit-category/:id',verifyAdminLogin,editCategory )

router.post('/edit-category/:id',editCategoryPost)

 // Call a function to update the category in the database using categoryId and updatedCategory

router.get('/delete-category/:id',deleteCategoryGet);


// orderlist
router.get('/order-list', orderListGet)

router.get('/view-ordered-product/:id',verifyAdminLogin,viewOrderedProductGet)

router.post('/changeOrderStatus',changeOrderStatusPost);

 
//dashboard

router.get('/dashboard',verifyAdminLogin,adminDashBoardGet)

//chart

router.get('/chart-data',verifyAdminLogin,adminChartGet)


//coupon 

router.get('/coupon-management',verifyAdminLogin,couponMgtGet);

router.get('/add-coupon',verifyAdminLogin,addCouponGet);

router.post('/add-coupon',verifyAdminLogin,addCouponPost);

router.get('/edit-coupon/:id',verifyAdminLogin,editCouponGet);

router.post('/edit-coupon',editCouponPost);

router.get('/delete-coupon/:id',verifyAdminLogin,deleteCouponGet);



//sales report

router.get('/sales-report',verifyAdminLogin,salesReportGet);


// banner mgt

router.get('/banner-management',verifyAdminLogin,bannerMgtGet)

router.get('/add-banner',verifyAdminLogin,addBannerGet)

router.post('/add-banner', verifyAdminLogin,addBannerPost);

router.get('/edit-banner/:id',verifyAdminLogin,editBannerGet);

router.post('/edit-banner',editBannerPost);

router.get('/delete-banner/:id', verifyAdminLogin,deleteBannerGet);


//product offer

router.get('/product-offers',verifyAdminLogin,productOfferGet);

router.post('/product-offers',verifyAdminLogin,productOfferPost);

router.get('/edit-prodOffer/:_id', verifyAdminLogin,editProductOfferGet);

router.post('/edit-prodOffer/:_id',verifyAdminLogin,editProductOfferPost);

router.get('/delete-prodOffer/:id',verifyAdminLogin,deleteProductOffer)



module.exports = router;



// deleteProdOffer: (req, res) => {
//   let proOfferId = req.params._id;
//   adminHelpers.deleteProdOffer(proOfferId).then(() => {
//     res.redirect("/admin/product-offers");
//   });
// },








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