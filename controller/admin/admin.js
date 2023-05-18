var productHelpers =require('../../helpers/product-helpers');
const adminHelpers = require('../../helpers/admin-helpers');
const userHelpers = require('../../helpers/user-helpers');
const { validateRequestWithBody } = require('twilio/lib/webhooks/webhooks');



const viewProduct=(req,res)=>{
  
    productHelpers.getAllProducts().then((products)=>{
     
      res.render('admin/view-product',{products,admin:req.session.admin})
    })


};

const addProduct=(req,res)=>{
    productHelpers.viewCategory().then((catgy)=>{
     res.render('admin/add-product',{catgy,admin:req.session.admin})
    })
     
   };


const  viewAddProduct=(req,res)=>{
    productHelpers.addProduct(req.body).then((response)=>{
       let image1=req.files.image1;
       let image2=req.files.image2;
       let image3=req.files.image3;
       let image4=req.files.image4;
    
      if (response.status){
       res.redirect('/admin/add-product')
      }
      else{
   
       id = response
       image1.mv('./public/product-image/' + id +'1.jpg');
        image2.mv('./public/product-image/' + id +'2.jpg')
        image3.mv('./public/product-image/' + id +'3.jpg')
        image4.mv('./public/product-image/' + id +'4.jpg')
         res.redirect('/admin/add-product')
           
      }
     })
     
   }

 const deleteAddProduct=  (req,res)=>{
    let proId = req.params.id
    
  
    productHelpers.deleteProduct(proId).then((response)=>{
      res.redirect('/admin/view-product')
    })
    };


    const editProduct= async(req,res)=>{
           
        
       
        let product = await  productHelpers.getProductDetails(req.params.id,req.body)
        
        let catResponce =await productHelpers. viewCategory()
      

        res.render('admin/edit-product',{product,admin:req.session.admin,catResponce})
      }


 const editProductPost =(req,res)=>{

 
    let id = req.params.id
    productHelpers.updateProduct(req.params.id,req.body).then(()=>{
      try{

      
      if(req.files.image){
  
        let image1 = req.files.image1;
        image1.mv('./public/product-image/' + id +'1.jpg');
      }

        if(req.files.image){
            let image2=req.files.image2;
            image2.mv('./public/product-image/' + id +'2.jpg')

        }

        if(req.files.image){
            let image3=req.files.image3;
            image3.mv('./public/product-image/' + id +'3.jpg')

        }
      
        if(req.files.image){
            let image4=req.files.image4;
        image4.mv('./public/product-image/' + id +'4.jpg')
        }
      res.redirect('/admin/view-product')
      }catch{
        res.redirect('/admin/view-product')
      }
    })
  }
//   



   const userGet=(req,res)=>{
    userHelpers.getAllusers().then((users)=>{
     
      res.render('admin/view-users',{users,admin:req.session.admin})
   
    })
   
   }

const loginGet=(req,res)=>{
  let loginErr=req.session.loginErr
  res.render('admin/admin-login',{loginErr})
  validateRequestWithBody.session.loginErr=false
  
 }


 const signUpGet= (req,res)=>{
    res.render('admin/admin-signup',{admin:true})
   }

const signUpPost=(req,res)=>{
  
    adminHelpers.doSignup(req.body).then((response)=>{
     
     res.redirect('/admin/admin-login')
    })
    
  }

  const loginPost=(req,res)=>{
    adminHelpers.doLogin(req.body).then((response)=>{
      if(response.status){
        req.session.adminloggedIn=true
        req.session.admin=response.admin
        res.redirect('/admin/order-list')
      }else{
         req.session.loginErr= 'invalid email or password'
        res.redirect('/admin/admin-login')
      }
    })
   }

   const logOut=(req,res)=>{
    req.session.destroy()
    res.redirect('/admin')
   }


 


  const deleteUserGet=(req,res)=>{
    let userId = req.params.id
  
    userHelpers.deleteuser(userId).then((response)=>{
      res.redirect('/admin/')
    })
    }

    const addCategoryGet = (req,res)=>{
        res.render('admin/add-category',{admin:req.session.admin})
      }



 const addCategoryPost=async(req,res)=>{
    let  category=await productHelpers.addCategory(req.body)
    res.render('admin/add-category',{category})
    
  }



 const editCategory=async(req,res)=>{
    let category=await productHelpers.getOnecategory(req.params.id,req.body)
    console.log(category);
    res.render('admin/edit-category',{admin:true,category,admin:req.session.admin})

                
  }


  const blockUser=(req,res)=>{
    adminHelpers.blockUser(req.params.id).then()
    res.redirect("/admin/view-users")
  }

  const unBlockUser=(req,res)=>{
    adminHelpers.unblockUser(req.params.id).then()
     res.redirect("/admin/view-users")
   }

   const viewCategoryGet=(req,res)=>{
   
    productHelpers.viewCategory().then((catgy)=>{
     
      res.render('admin/view-category',{catgy,admin:req.session.admin})
    })
     }


const editCategoryPost=(req, res) => {

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
}
const deleteCategoryGet=(req,res)=>{

  productHelpers.deteCategory(req.params.id,req.body).then(()=>{
  
      res.redirect('/admin/view-category')
  })
  
  }

  const orderListGet=async (req, res) => {
    // let admin = req.session.admin
    let allOrders = await adminHelpers.getAllOrders()
    res.render('admin/order-list', { allOrders, admin:req.session.admin})
  }

  const viewOrderedProductGet= async(req,res)=>{
    console.log(req.params.id);
    let orderId=req.params.id
    let product=await adminHelpers.getOrderProducts(orderId)
    // let allOrders = await adminHelpers.getAll()
     let oneOrder = await adminHelpers.getOneOrder(orderId)
    //  console.log(oneOrder.deliveryDetails+"LLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLL");
    
    
      res.render('admin/view-ordered-product',{product,admin:true,admin:req.session.admin,oneOrder})
    }

const changeOrderStatusPost=async(req,res)=>{
  adminHelpers.changeOrderStatus(req.body).then(() => {
  res.redirect("/admin/order-list");
  })
  }

const adminDashBoardGet=async(req,res)=>{
  let admin =req.session.admin
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
      allCount,
      totalRevenue,
      dailyRevenue,
      weeklyRevenue,
      monthlyRevenue,
      yearlyRevenue,
      data,
      admin,
    })
  }else{
    res.redirect('/admin/admin-login')
  }
}


const adminChartGet=async(req,res)=>{
 
  adminHelpers.getchartData().then((obj) => {
    let result = obj.result;
    let weeklyReport = obj.weeklyReport;
    res.json({ data: result, weeklyReport });
  });
}

const couponMgtGet=async (req, res) => {
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

}

const addCouponGet=(req,res)=>{
  res.render('admin/add-coupon',{admin:req.session.admin,admin:true})
}

const addCouponPost=(req, res) => {
  adminHelpers.addCoupon(req.body).then(() => {
      res.redirect("/admin/coupon-management");
    })
    .catch(() => {
      req.session.couponExist = "Coupon Already Exist!!!";
      res.redirect("/admin/coupon-management");
    });
}

const editCouponGet=async(req,res)=>{
  let coupon = await adminHelpers.getCoupon(req.params.id)
  res.render('admin/edit-coupon',{admin:true,coupon,admin:req.session.admin})
}


const editCouponPost=(req,res)=>{
  adminHelpers.editCoupon(req.body).then(()=>{
    res.redirect('/admin/coupon-management')
  })
}


const deleteCouponGet=(req,res)=>{
  adminHelpers.deleteCoupon(req.params.id).then(()=>{
    res.redirect('/admin/coupon-management')
  })
}

const salesReportGet=async (req, res) => {
  let admin = req.session.admin;
 let allOrders = await adminHelpers.getOrder();
 res.render("admin/sales-report", { allOrders, admin: true, admin });

}

const bannerMgtGet=async(req,res,next)=>{
  let banner=await adminHelpers.getAllBanners()
  res.render('admin/banner-management',{admin:true,banner,admin: req.session.admin})
 }

const addBannerGet=(req,res)=>{
  res.render('admin/add-banner',{admin:true,admin:req.session.admin})
}

const addBannerPost= (req, res) => {
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
}

const editBannerGet=async(req,res)=>{
  let id= req.params.id
  let banner=await adminHelpers.getAllBannerDetails(id)
  res.render('admin/edit-banner',{banner,admin:true,admin:req.session.admin})
  }

const editBannerPost=(req, res) => {
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
 }

const deleteBannerGet=(req, res) => {
  let id = req.params.id
  adminHelpers.deleteBanner(id).then(() => {
      res.redirect('/admin/banner-management')
     
  })
}


const productOfferGet=async (req, res) => {
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
}


const productOfferPost=async (req, res) => {
  adminHelpers.addProductOffer(req.body).then(() => {
      res.redirect("/admin/product-offers");
    })
    .catch(() => {
      req.session.prodOfferErr = "This Offer Already Exists!";
      res.redirect("/admin/product-offers");
    })
}

const editProductOfferGet=async (req, res) => {
  let proOfferId = req.params._id;
  let proOffer = await adminHelpers.getProdOfferDetails(proOfferId);
  res.render("admin/edit-prodOffer", { admin: true, proOffer,admin:req.session.admin });
}

const editProductOfferPost=(req, res) => {
  let proOfferId = req.params._id;
  adminHelpers.editProdOffer(proOfferId, req.body).then(() => {
    res.redirect("/admin/product-offers");
  })
}

const deleteProductOffer=(req,res)=>{
  let id=req.params.id
  adminHelpers.deleteOffer(id).then(()=>{
    res.redirect('/admin/product-offers')
  })
}














module.exports={viewProduct,
  addProduct,
   viewAddProduct,
   deleteAddProduct,
   editProduct,
   editProductPost,userGet,loginGet,signUpGet,signUpPost,loginPost,logOut,deleteUserGet,addCategoryGet ,addCategoryPost,editCategory,blockUser,unBlockUser,
   viewCategoryGet,
  editCategoryPost,
  deleteCategoryGet,
  orderListGet,
  viewOrderedProductGet,
  changeOrderStatusPost,
  adminDashBoardGet,
  adminChartGet,
  couponMgtGet,
  addCouponGet,
  addCouponPost,
  editCouponGet,
  editCouponPost,
  deleteCouponGet,
  salesReportGet,
  bannerMgtGet,
  addBannerGet,
  addBannerPost,
  editBannerGet,
  editBannerPost,
  deleteBannerGet,
  productOfferGet,
  productOfferPost,
  editProductOfferGet,
  editProductOfferPost,
  deleteProductOffer
  }