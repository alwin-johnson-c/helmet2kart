var db = require("../config/connection");
var collection = require("../config/collections");
const bcrypt = require("bcrypt");
const { response } = require("../app");
const { ObjectID } = require("bson");
const { PRODUCT_COLLECTIONS } = require("../config/collections");
var objectId = require("mongodb").ObjectId;
const moment = require("moment");
// const collections = require('../config/collections');


const paypal = require('paypal-rest-sdk');
paypal.configure({
  mode: 'sandbox', //sandbox or live
  client_id: process.env.CLIENT_ID ,
  client_secret: process.env. CLIENT_SECRET,
});


module.exports = {
  // doSignup: (userData) => {
  //   return new Promise(async (resolve, reject) => {
  //     userData.password = await bcrypt.hash(userData.password, 10);
  //     db.get()
  //       .collection(collection.USER_COLLECTIONS)
  //       .insertOne(userData)
  //       .then((data) => {
  //         resolve(data.insertedId);
  //       });
  //   });
  // },
  doSignup: (userData) => {
    return new Promise(async (resolve, reject) => {

      let user = await db
          .get()
          .collection(collection.USER_COLLECTIONS)
          .findOne({ email: userData.email });
        if (user) {
          resolve({ status: true });
        } else {
          userData.password = await bcrypt.hash(userData.password, 10);
          db.get()
            .collection(collection.USER_COLLECTIONS)
            .insertOne(userData)
            .then((response) => {
              resolve({ status: false });
            });
        }
    
    });
  },



  doLogin: (userData) => {
    return new Promise(async (resolve, reject) => {
      let loginStatus = false;
      let response = {};

      let user = await db
        .get()
        .collection(collection.USER_COLLECTIONS)
        .findOne({ email: userData.email });
        //new one fror user block working
        if(user){
        if(user.isblocked){
          response.blocked=true
          
          resolve(response)
        }else{
          bcrypt.compare(userData.password,user.password).then((status)=>{
           
            if(status){
              console.log("login success");
              response.user=user
              response.status=true
              resolve(response)
            }else{
             
              resolve({status:false})
            }
          })
        }
      }else{
       
        resolve({status:false})
      }



     
    });
  },



  isblocked: (id) => {
    return new Promise(async (resolve, reject) => {
      let user = await db
        .get()
        .collection(collection.USER_COLLECTIONS)
        .findOne({ _id: objectId(id) });
      resolve(user);
    });
  },


  

  getAllusers: () => {
    return new Promise(async (resolve, reject) => {
      let users = await db
        .get()
        .collection(collection.USER_COLLECTIONS)
        .find()
        .toArray();
     
      resolve(users);
    });
  },


  deleteuser: (userId) => {
    return new Promise((resolve, reject) => {
     
      db.get()
        .collection(collection.USER_COLLECTIONS)
        .removeOne({ _id: objectId(userId) })
        .then((response) => {
          resolve(response);
        });
    });
  },

  getAlluserDetails: (userId) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.USER_COLLECTIONS)
        .findOne({ _id: objectId(userId) })
        .then((users) => {
          resolve(users);
        });
    });
  },

  updateuser: (userId, userDetails) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.USER_COLLECTIONS)
        .updateOne(
          { _id: objectId(userId) },
          {
            $set: {
              name: userDetails.name,
              email: userDetails.email,
              phone: userDetails.phone,
            },
          }
        )
        .then((response) => {
          resolve();
        });
    });
  },

  // getCartCount:(userId)=>{
  // return new Promise(async(resolve, reject) => {
  //     let count = 0
  //     let cart= await db.get().collection(collection.CART_COLLECTION).findOne({_id:objectId(userId)})
  //     if(cart){
  //         count=cart.products.length
  //     }
  //     resolve(count)
  // })
  // },

  getCartCount: (userId) => {
    let count = 0;
    return new Promise(async (resolve, reject) => {
      try {
        let cart = await db
          .get()
          .collection(collection.CART_COLLECTION)
          .findOne({ user: objectId(userId) });
        if (cart) {
          count = cart.products.length;
          resolve(count);
        } else {
          resolve(count);
        }
      } catch {
        resolve(0);
      }
    });
  },

  addToCart: (proId, userId) => {
    let proObj = {
      item: objectId(proId),
      quantity: 1,
    };
    return new Promise(async (resolve, reject) => {
      try {
        let userCart = await db
          .get()
          .collection(collection.CART_COLLECTION)
          .findOne({ user: objectId(userId) });
        if (userCart) {
          let productExist = userCart.products.findIndex(
            (product) => product.item == proId
          );
          if (productExist != -1) {
            db.get()
              .collection(collection.CART_COLLECTION)
              .updateOne(
                { user: objectId(userId), "products.item": objectId(proId) },
                {
                  $inc: { "products.$.quantity": 1 },
                }
              )
              .then(() => {
                resolve();
              });
          } else {
            db.get()
              .collection(collection.CART_COLLECTION)
              .updateOne(
                { user: objectId(userId) },
                {
                  $push: { products: proObj },
                }
              )
              .then(() => {
                resolve();
              });
          }
        } else {
          let cartobj = {
            user: objectId(userId),
            products: [proObj],
          };
          db.get()
            .collection(collection.CART_COLLECTION)
            .insertOne(cartobj)
            .then((response) => {
              resolve(response);
            });
        }
      } catch {
        resolve(0);
      }
    });
  },

  getCartProducts: (userId) => {
    return new Promise(async (resolve, reject) => {
      try {
        let cartItems = await db
          .get()
          .collection(collection.CART_COLLECTION)
          .aggregate([
            {
              $match: { user: objectId(userId) },
            },
            {
              $unwind: "$products",
            },
            {
              $project: {
                item: "$products.item",
                quantity: "$products.quantity",
              },
            },
            {
              $lookup: {
                from: collection.PRODUCT_COLLECTIONS,
                localField: "item",
                foreignField: "_id",
                as: "product",
              },
            },
            {
              $project: {
                item: 1,
                quantity: 1,
                product: { $arrayElemAt: ["$product", 0] },
              },
            },
          ])
          .toArray();
        
        resolve(cartItems);
      } catch {
        resolve(0);
      }
    });
  },

  

  changeProductQuantity: (details) => {
   
    details.count = parseInt(details.count);
    details.quantity = parseInt(details.quantity);
   
    return new Promise(async (resolve, reject) => {
      if (details.count == -1 && details.quantity == 1) {
      
        db.get()
          .collection(collection.CART_COLLECTION)
          .updateOne(
            { _id: objectId(details.cartId) },
            {
              $pull: { products: { item: objectId(details.product) } },
            }
          )
          .then((response) => {
            resolve({ itemRemoved: true });
          });
      } else {
       
        db.get()
          .collection(collection.CART_COLLECTION)
          .updateOne(
            {
              _id: objectId(details.cartId),
              "products.item": objectId(details.product),
            },
            {
              $inc: { "products.$.quantity": details.count },
            }
          )
          .then((response) => {
           
            resolve({ status: true });
          });
      }
    });
  },

 
  getTotalAmount: (userId) => {
    return new Promise(async (resolve, reject) => {
      let total = await db
        .get()
        .collection(collection.CART_COLLECTION)
        .aggregate([
          {
            $match: { user: objectId(userId) },
          },
          {
            $unwind: "$products",
          },
          {
            $project: {
              item: "$products.item",
              quantity: "$products.quantity",
            },
          },
          {
            $lookup: {
              from: collection.PRODUCT_COLLECTIONS,
              localField: "item",
              foreignField: "_id",
              as: "product",
            },
          },
          {
            $project: {
              item: 1,
              quantity: 1,
              product: { $arrayElemAt: ["$product", 0] },
            },
          },
          {
            $addFields: {
              numericField: { $toInt: "$product.price" } // Convert "stringField" to an integer
            }
          },
          {
            $group: {
              _id: null,
              total: { $sum: { $multiply: ["$quantity", "$numericField"] } },
            },
          },
        ])
        .toArray();
      if (total.length > 0) {
        resolve(total[0]?.total);
      } else {
       
        resolve(0);
      }
    });
  },

  placeOrder: (order, products, total) => {
    return new Promise((resolve, reject) => {
      try {
        let status =
        order["payment-method"] === "cod" ||
        order["payment-method"] === "paypal" ||
        order["payment-method"] === "wallet"
          ? "placed"
          : {pending:true};
      let orderObj = {
        deliveryDetails: {
          fisrtName: order.fname,
          lastName: order.lname,
          place: order.city,
          address: order.address,
          district: order.district,
          pincode: order.pincode,
          number: order.number,
        },
        userId: objectId(order.userId),
        paymentMethod: order["payment-method"],
        products: products,
        totalAmount: total,
        date: new Date(),
        status: status,
      };
      db.get()
        .collection(collection.ORDER_COLLECTION)
        .insertOne(orderObj)
        .then((response) => {
          db.get()
            .collection(collection.CART_COLLECTION)
            .deleteOne({ user: objectId(order.userId) });
          resolve(response.insertedId);
        });
    
        // let status =
        // order["payment-method"] === "COD" || order["payment-method"] === "paypal"
        //     ? "Placed"
        //     : {Pending:true}

        // let orderObj = {
        //   deliveryDetails: {
        //     name: order.fname,
        //     mobile: order.mobile,
        //     address: order.address,
        //     pincode: order.pincode,
        //   },
        //   userId: objectId(order.userId),
        //   paymentMethod: order["payment-method"],
        //   products: products,
        //   totalAmount: total,
        //   status: status,
        //   date: new Date(),
        // };

        // db.get().collection(collection.ORDER_COLLECTION).insertOne(orderObj).then((response) => {
        //     products.forEach(async (element) => {
        //         let product = await db.get().collection(collection.PRODUCT_COLLECTIONS).findOne({ _id: element.item });
        //         let pquantity = Number(product.stock);
        //         pquantity = pquantity - element.quantity;
        //         await db.get().collection(collection.PRODUCT_COLLECTIONS).updateOne(
        //             { _id: element.item },
        //             {
        //                 $set: {
        //                     stock: pquantity,
        //                 },
        //             }
        //         );
        //     });

        //     db.get().collection(collection.CART_COLLECTION).deleteOne({ user: objectId(order.userId) })
        //     resolve(response.insertedId)
        // })
    } catch {
        resolve(0)
    }
})
},

  
  getCartProductList: (userId) => {
    return new Promise(async (resolve, reject) => {
     
      let cart = await db
        .get()
        .collection(collection.CART_COLLECTION)
        .findOne({ user: objectId(userId) });
      
      resolve(cart.products);
    });
  },
  // removeCart:(proId,cartId)=>{
  //     return new Promise((resolve, reject) => {
  //         db.get().collection(collection.CART_COLLECTION).deleteOne({_id:objectId(proId)})
  //         resolve()
  //     })
  // },
  getUserOrder: (userId) => {
    return new Promise(async (resolve, reject) => {
      let orders = await db
        .get()
        .collection(collection.ORDER_COLLECTION)
        .find({ userId: objectId(userId) })
        .sort({ date: -1 })
        .toArray();
      if (orders) {
        for (i = 0; i < orders.length; i++) {
          orders[i].date = moment(orders[i].date).format("lll");
        }

        resolve(orders);
      } else {
        resolve(0);
      }
    });
  },
  // ordered product details
  getOrderProducts: (orderId) => {
   
    return new Promise(async (resolve, reject) => {
      let orderItems = await db
        .get()
        .collection(collection.ORDER_COLLECTION)
        .aggregate([
          {
            $match: { _id: objectId(orderId) },
          },
          {
            $unwind: "$products",
          },
          {
            $project: {
              item: "$products.item",
              quantity: "$products.quantity",
            },
          },
          {
            $lookup: {
              from: collection.PRODUCT_COLLECTIONS,
              localField: "item",
              foreignField: "_id",
              as: "product",
            },
          },
          {
            $project: {
              item: 1,
              quantity: 1,
              product: { $arrayElemAt: ["$product", 0] },
            },
          },
        ])
        .toArray();
      resolve(orderItems);
    });
  },

  checkMobile: (mobile) => {
    return new Promise(async (resolve, reject) => {
      await db
        .get()
        .collection(collection.USER_COLLECTIONS)
        .findOne({ phone: mobile.phone })
        .then((response) => {
          if (response) {
            if (response.isblocked) {
              resolve({ blocked: true });
            } else {
              resolve(response);
            }
          } else {
            resolve({ noUser: true });
          }
        });
    });
  },

  // getting user data using phone number
  userOtp: (phone) => {
    return new Promise(async (resolve, reject) => {
      await db
        .get()
        .collection(collection.USER_COLLECTIONS)
        .findOne({ phone: phone })
        .then((response) => {
          resolve(response);
        });
    });
  },

  //delete cart items

  deleteCartItem: (proId, cartId) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.CART_COLLECTION)
        .updateOne(
          { _id: objectId(cartId), "products.item": objectId(proId) },
          {
            $pull: { products: { item: objectId(proId) } },
          }
        )
        .then((response) => {
          resolve(response);
        });
    });
  },


    
    generatePaypal: (orderId, total) => {
        return new Promise((resolve, reject) => {
            var create_payment_json = {
                "intent": "sale",
                "payer": {
                    "payment_method": "paypal"
                },
                "redirect_urls": {
                    "return_url": "https://helmet2kart.online/order-success",
                    "cancel_url": "https://helmet2kart.online/place-order"
                },
                "transactions": [{
                    "item_list": {
                        "items": [{
                            "name": "item",
                            "sku": "item",
                            "price": total,
                            "currency": "USD",
                            "quantity": 1
                        }]
                    },
                    "amount": {
                        "currency": "USD",
                        "total": total
                    },
                    "description": "This is the payment description."
                }]
            };
            paypal.payment.create(create_payment_json, function (error, payment) {
                if (error) {
                    throw error;
                } else {
                   
                    resolve(payment.links[1].href)
                }
            });
        })
    },
    


    // profile
    getOneUser: (userId) => {
        return new Promise(async (resolve, reject) => {
          let user = await db
            .get()
            .collection(collection.USER_COLLECTIONS)
            .findOne({ _id: objectId(userId) });
          resolve(user);
        });
      },
      editProfile: (userId, userData) => {
      return new Promise((resolve, reject) => {
        db.get()
          .collection(collection.USER_COLLECTIONS)
          .updateOne(
            { _id: objectId(userId) },
            {
              $set: {
                name: userData.name,
                email: userData.email,
                phone: userData.phone,
              },
            }
          )
          .then((response) => {
            resolve();
          });
      });
    },
    // wallet
    getWalletHistory:(id)=>{
      return new Promise(async(resolve, reject) => {
        let wallet = await db.get().collection(collection.USER_COLLECTIONS).findOne({_id:objectId(id)})
        resolve(wallet.wallet)
      })
    }, 

    //wallet payment
    reduceWallet: (userId, totalAmount) => {
      return new Promise(async (resolve, reject) => {
        let user = await db
          .get()
          .collection(collection.USER_COLLECTIONS)
          .findOne({ _id: objectId(userId) });
        let newWallet = parseInt(user.wallet - totalAmount);
        db.get()
          .collection(collection.USER_COLLECTIONS)
          .updateOne(
            { _id: objectId(userId) },
            {
              $set: {
                wallet: newWallet,
              },
            }
          );
        resolve();
      });
    },



    //invoice 
    getUserInvoice:(orderId)=>{
        return new Promise(async(resolve, reject) => {
           
            let orders= await db.get().collection(collection.ORDER_COLLECTION)
            .find({_id:objectId(orderId)},{sort:{date:-1}}).toArray();
            var i;
            for(i=0;i<orders.length;i++){
                orders[i].date = moment(orders[i].date).format('111')
            }
            var k;
            for(k=0;k<orders.length;k++){
                orders[k].delivertDate = moment(orders[k].deliveryDate).format("111")
            }
            resolve(orders)
        })
    },

    returnOrder: (id) => {
      return new Promise(async (resolve, reject) => {
        let order = await db.get().collection(collection.ORDER_COLLECTION).findOne({ _id: objectId(id) });
        if (order) {
          db.get().collection(collection.USER_COLLECTIONS).updateOne({ _id: objectId(order.userId) }, {
            $inc: {
              wallet: order.totalAmount,
            },
          }).then(() => {
            db.get().collection(collection.ORDER_COLLECTION).updateOne({
              _id: objectId(id)
            }, {
              $set: {
                is_returned: true,
                status: "returned",
                returnDate: new Date(),
              },
            }).then(() => {
              resolve();
            });
          }).catch((error) => {
            reject(error);
          });
        } else {
          reject(new Error('Order not found'));
        }
        
        })},
    


    // cancel order
    cancelOrder:(id)=>{
      return new Promise(async(resolve, reject) => {
        let order =await db.get().collection(collection.ORDER_COLLECTION).findOne({_id:objectId(id)});
        if(
          order.paymentMethod === "wallet" ||
          order.paymentMethod ==="paypal"
        ){
          db.get().collection(collection.USER_COLLECTIONS)
          .updateOne({_id:objectId(order.userId)},
          {
            $inc:{
              wallet:order.totalAmount,
            },

          })
        }
        db.get().collection(collection.ORDER_COLLECTION).updateOne({_id:objectId(id)},
        {
          $set:{
            is_cancelled: true,
            status:"cancelled",

          },
        }).then(()=>{
          resolve()
        })
      })
    },




  
//...........
    addToWish: (proId, userId) => {
      let proObj = {
        item: objectId(proId),
      };
      return new Promise(async (resolve, reject) => {
        let userWish = await db
          .get()
          .collection(collection.WISHLIST_COLLECTION)
          .findOne({ user: objectId(userId) });
        if (userWish) {
          let productExist = userWish.products.findIndex(
            (product) => product.item == proId
          );
         
          if (productExist != -1) {
            db.get()
              .collection(collection.WISHLIST_COLLECTION)
              .updateOne(
                { user: objectId(userId), "products.item": objectId(proId) },
                {
                  $pull: { products: { item: objectId(proId) } },
                }
              )
              .then(() => {
                db.get().collection(collection.PRODUCT_COLLECTIONS).updateOne({_id:objectId(proId)},
                {
                  $pull:{ wishlist: {user: objectId(userId)}}
                })
                .then((res)=>{
                 
                  reject();
                })
              });
          } else {
            db.get()
              .collection(collection.WISHLIST_COLLECTION)
              .updateOne(
                { user: objectId(userId) },
                {
                  $push: { products: proObj },
                }
              )
              .then(async() => {
               const product =await db.get().collection(collection.PRODUCT_COLLECTIONS).findOne({_id:objectId(proId)})
               let userObj = {
                user:objectId(userId)
               }
                db.get()
                .collection(collection.PRODUCT_COLLECTIONS)
                .updateOne(
                  {_id:objectId(proId)},{$push: {wishlist: userObj}}
                ).then(()=>{
                  resolve();
                })
                
              });
          }
        } else {
          let wishObj = {
            user: objectId(userId),
            products: [proObj],
          };
          db.get()
            .collection(collection.WISHLIST_COLLECTION)
            .insertOne(wishObj)
            .then(() => {
              db.get()
                .collection(collection.PRODUCT_COLLECTIONS)
                .updateOne(
                  {_id:objectId(proId)},
                  {$push: {wishlist:userObj}}
                ).then(()=>{
                  resolve();
                })
            });
          
        }
      });
    },




    getWishlistProduct: (userId) => {
      return new Promise(async (resolve, reject) => {
        try {
          let wishlistItems = await db
            .get()
            .collection(collection.WISHLIST_COLLECTION)
            .aggregate([
              {
                $match: { user: objectId(userId) },
              },
              {
                $unwind: "$products",
              },
              {
                $project: {
                  item: "$products.item",
                  quantity: "$products.quantity",
                },
              },
              {
                $lookup: {
                  from: collection.PRODUCT_COLLECTIONS,
                  localField: "item",
                  foreignField: "_id",
                  as: "product",
                },
              },
              {
                $project: {
                  item: 1,
                  quantity: 1,
                  product: { $arrayElemAt: ["$product", 0] },
                },
              },
            ])
            .toArray();
          
          resolve(wishlistItems);
        } catch {
          resolve(0);
        }
      });
    },

    deleteWishlist:(proId, wishId) => {
      return new Promise((resolve, reject) => {
        db.get()
          .collection(collection.WISHLIST_COLLECTION)
          .updateOne(
            { _id: objectId(wishId), "products.item": objectId(proId) },
            {
              $pull: { products: { item: objectId(proId) } },
            }
          )
          .then(() => {
            resolve();
          });
      });
    },
   
   
    validateCoupon: (data, userId,totalAmount) => {
      return new Promise(async (resolve, reject) => {
          try{

          obj = {}
          let date = new Date()
          let coupon = await db.get().collection(collection.COUPON_COLLECTION).findOne({ coupon: data.coupon, Available: true })
          if (coupon) {
              
             
              let users = coupon.users
              let userCheck = users.includes(userId)
              if (userCheck) {
                 
                  obj.couponUsed = true
                  obj.offer = coupon.offer
                  resolve(obj) 
              } else {
                
                  console.log("coupon valid ",coupon);

                  obj.offer = coupon.offer
                  obj.coupon = coupon.coupon
                  obj.couponId = coupon._id

                 
                  console.log(coupon.endDateIso);
                  if (date <= coupon.endDateIso) {
                      let total = parseInt(totalAmount)
                      let percentage = parseInt(coupon.offer)

                      let discountValue = Math.floor((total * percentage) / 100);
                      obj.total = total - discountValue
                      obj.success = true
                      obj.discountValue = discountValue
                      resolve(obj)
                  } else {
                      console.log("coupon expired");
                      obj.couponExpired = true
                      resolve(obj)
                  }
              }
          } else {
              console.log("coupon invalid");  
              obj.invalidCoupon = true
              resolve(obj)
          }
      }catch{
          resolve(0)
      }
      })
  },

    startCouponOffer: (date) => {
      let couponStartDate = new Date(date);
      console.log(couponStartDate);
      return new Promise(async (resolve, reject) => {
          try{
          let data = await db.get().collection(collection.COUPON_COLLECTION).find({startDateIso: { $lte: couponStartDate }}).toArray();
          console.log(data);
          if (data) {
              await data.map(async (oneData) => {
                  db.get().collection(collection.COUPON_COLLECTION).updateOne({ _id: objectId(oneData._id) },
                      {
                          $set: {
                              Available: true
                          }
                      }).then(() => {
                          resolve();
                      })
              })
          } else {
              resolve()
          }
      }catch{
         
          resolve(0)
      }
      })
  },

  //forgotpassword
  
  forgotPassword: (userEmail) => {
    return new Promise(async (resolve, reject) => {
      let user = await db
        .get()
        .collection(collection.USER_COLLECTIONS)
        .findOne({ email: userEmail.email });

      if (user) {
        if (user.isblocked) {
          resolve({ blocked: true });
        } else {
          resolve(user);
        }
      } else {
        resolve({ noUser: true });
      }
    });
  },

  changePassword: (userData) => {
    return new Promise(async (resolve, reject) => {
      if (userData.password === userData.cpassword) {
        db.get()
          .collection(collection.USER_COLLECTIONS)
          .findOne({ email: userData.email });

        userData.password = await bcrypt.hash(userData.cpassword, 10);
        userData.cpassword = await bcrypt.hash(userData.cpassword, 10);
        // console.log("o7898765");
        // console.log(userData);
        db.get()
          .collection(collection.USER_COLLECTIONS)
          .updateOne(
            { email: userData.email },
            {
              $set: {
                password: userData.password,
                cpassword: userData.cpassword,
              },
            }
          )
          .then((responce) => {
            resolve({ status: true });
          });
      } else {
        resolve({ status: false });
      }
    });
  },


  viewUserCat:()=>{
    return new Promise(async(resolve, reject) => {
        let catgy = await db.get().collection(collection.CATEGORY_COLLECTION).find().toArray()
        console.log(catgy,"ccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc");
        resolve(catgy)
    })
},





}
        // paypal.payment.create(create_payment_json, function (error, payment) {
        //     if (error) {
        //         throw error;
        //     } else {
        //         for(let i = 0;i < payment.links.length;i++){
        //           if(payment.links[i].rel === 'approval_url'){
        //             res.redirect(payment.links[i].href);
        //           }
        //         }
        //     }
        //   });


         // getTotalAmount:(userId)=>{
  //     return new Promise(async (resolve, reject) => {
  //         try{
  //         let total = await db.get().collection(collection.CART_COLLECTION).aggregate([
  //             {
  //                 $match: { user: objectId(userId) }
  //             },
  //             {
  //                 $unwind: '$products'
  //             },
  //             {
  //                 $project: {
  //                     item: '$products.item',
  //                     quantity: '$products.quantity',
  //                 }
  //             },
  //             {
  //                 $lookup: {
  //                     from: collection.PRODUCT_COLLECTIONS,
  //                     localField: 'item',
  //                     foreignField: '_id',
  //                     as: 'product'
  //                 }
  //             },
  //             {
  //                 $project: {
  //                     item: 1, quantity: 1, product: { $arrayElemAt: ['$product', 0] }
  //                 }
  //             },
  //             {
  //                 $group:{
  //                     _id:null,
  //                     total:{$sum:{$multiply:['$quantity','$product.price']}}
  //                 }
  //             }
  //         ]).toArray()
  //         console.log(total);
  //         resolve(total[0].total)
  //     }catch{
  //         resolve(0)
  //     }
  //     })
  // },

 // validateCoupon: (data, userId, totalAmount) => {
    //   return new Promise(async (resolve, reject) => {
    //     try {
    //      let obj = {};
    //       let date = new Date();
    //       let coupon = await db
    //         .get()
    //         .collection(collection.COUPON_COLLECTION)
    //         .findOne({ coupon: data.coupon, Available: true });
    //       if (coupon) {
    //         // console.log('coupon available');
    //         let users = coupon.users;
    //         let userCheck = users.includes(userId);
    //         if (userCheck) {
    //           console.log("coupon used");
    //           obj.couponUsed = true;
    //           resolve(obj);
    //         } else {
    //           // console.log("coupon valid");
    //           // console.log(date);
    //           // console.log(coupon.endDateIso);
    //           if (date <= coupon.endDateIso) {
    //             let total = parseInt(totalAmount);
    //             let percentage = parseInt(coupon.offer);
  
    //             let discountValue = Math.floor((total * percentage) / 100);
    //             obj.total = total - discountValue;
    //             obj.success = true;
    //             obj.discountValue = discountValue;
    //             resolve(obj);
    //           } else {
    //             // console.log("coupon expired");
    //             obj.couponExpired = true;
    //             resolve(obj);
    //           }
    //         }
    //       } else {
    //         // console.log("coupon invalid");
    //         obj.invalidCoupon = true;
    //         resolve(obj);
    //       }
    //     } catch (error) {
    //       console.log(error.message);
    //       reject(error);
    //     }
    //   });
    // },




    //  changeProductQuantity:(details)=>{
  //     console.log('hhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhh');
  //     details.count=parseInt(details.count)
  //     details.quantity=parseInt(details.quantity)

  //     return new Promise((resolve, reject) => {
  //         if(details.count==-1 && details.quantity==1){
  //             db.get().collection(collection.CART_COLLECTION)
  //             .updateOne({_id:objectId(details.cart)},
  //             {
  //                 $pull:{products:{item:objectId(details.product)}}
  //             }).then((response)=>{
  //                 resolve({removeProduct:true})
  //             })
  //         }else{
  //             db.get().collection(collection.CART_COLLECTION)
  //             .updateOne({ _id: objectId(details.cart), 'products.item': objectId(details.product) },
  //                         {
  //                             $inc: { 'products.$.quantity': details.count }
  //                        }).then((response) => {
  //             resolve({status:true})
  //          })
  //     }
  // })
  //  },