var productHelpers =require('../../helpers/product-helpers');
const adminHelpers = require('../../helpers/admin-helpers');
const userHelpers = require('../../helpers/user-helpers');
const { validateRequestWithBody } = require('twilio/lib/webhooks/webhooks');



const viewProduct=(req,res)=>{
  
    productHelpers.getAllProducts().then((products)=>{
      console.log(products);
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
    
    console.log(proId)
    productHelpers.deleteProduct(proId).then((response)=>{
      res.redirect('/admin/view-product')
    })
    };


    const editProduct= async(req,res)=>{
            console.log('sdsdsds');
        
       
        let product = await  productHelpers.getProductDetails(req.params.id,req.body)
        console.log(product)
        res.render('admin/edit-product',{product,admin:req.session.admin})
      }


 const editProductPost =(req,res)=>{

 console.log('editttttt');
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
     console.log(users);
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
    console.log(req.body);
    adminHelpers.doSignup(req.body).then((response)=>{
      console.log(response)
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
    console.log(userId)
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
    console.log(category);
  }



 const editCategory=async(req,res)=>{

    console.log('sdsdsd');

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
      console.log(catgy);
      console.log("ggggggggggggggggggggggggg");
      res.render('admin/view-category',{catgy,admin:req.session.admin})
    })
     }

module.exports={viewProduct,addProduct, viewAddProduct,deleteAddProduct,editProduct,editProductPost,userGet,loginGet,signUpGet,signUpPost,loginPost,logOut,deleteUserGet,addCategoryGet ,addCategoryPost,editCategory,blockUser,unBlockUser,viewCategoryGet }