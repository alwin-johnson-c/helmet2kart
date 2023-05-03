var db = require('../config/connection')
var collection = require('../config/collections')
const bcrypt =require('bcrypt')
const moment=require('moment')
const { ObjectId, ReturnDocument } = require('mongodb')
const { response } = require('../app')
const { NewSigningKeyPage } = require('twilio/lib/rest/api/v2010/account/newSigningKey')
const collections = require('../config/collections')


 module.exports={
    doSignup:(adminData)=>{
        return new Promise(async(resolve, reject) => {
            adminData.password=await bcrypt.hash(adminData.password,10)
            db.get().collection(collection.ADMIN_COLLECTION).insertOne(adminData).then((data)=>{
                resolve(data.insertedId)
            })
        })
    },
    doLogin:(adminData)=>{
        return new Promise(async(resolve, reject) => {
            let loginStatus=false
            let response={}
            let admin=await db.get().collection(collection.ADMIN_COLLECTION).findOne({email:adminData.email})
            if(admin){
                bcrypt.compare(adminData.password,admin.password).then((status)=>{
                    if(status){
                        console.log("login success");
                        response.admin=admin
                        response.status=true
                        resolve(response)
                    }else{
                        console.log("login failed");
                        resolve({status:false})
                    }
                })
            }else{
                console.log("login failed");
                resolve({status:false});
            }
        })
    },

    blockUser :(userId)=>{
        return new Promise((resolve, reject) => {
            db.get().collection(collection.USER_COLLECTIONS).updateOne({_id:ObjectId(userId)},{
                $set:{
                    isblocked:true
                }
            })
        }).then((response)=>{
            resolve(response)

        })
        
    },

    unblockUser :(userId)=>{
        return new Promise((resolve, reject) => {
            db.get().collection(collection.USER_COLLECTIONS).updateOne({_id:ObjectId(userId)},{
                $set:{
                    isblocked:false
                }
            })
        }).then((response)=>{
            resolve(response)
        })
    },

    getAllOrders: () => {
        return new Promise(async (resolve, reject) => {
            let allOrders = await db.get().collection(collection.ORDER_COLLECTION).find().sort({
                date: -1
            }).toArray()
            for (i = 0; i < allOrders.length; i++) {
                allOrders[i].date = moment(allOrders[i].date).format('lll');
            }
            resolve(allOrders)
        })
    },

     // ordered product details
  getOrderProducts: (orderId) => {
    return new Promise(async (resolve, reject) => {
      let orderItems = await db
        .get()
        .collection(collection.ORDER_COLLECTION)
        .aggregate([
          {
            $match: { _id: ObjectId(orderId) },
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
        console.log(orderItems);
      resolve(orderItems);
    });
  },

  changeOrderStatus: (data) => {
    return new Promise((resolve, reject) => {
      try {
        if (data.status == "Shipped") {
          db.get()
            .collection(collection.ORDER_COLLECTION)
            .updateOne(
              { _id: ObjectId(data.OrderId) },
              {
                $set: {
                  status: data.status,
                  is_shipped: true,
                },
              }
            )
            .then((response) => {
              resolve();
            });
        } else if (data.status == "Delivered") {
          db.get()
            .collection(collection.ORDER_COLLECTION)
            .updateOne(
              { _id: ObjectId(data.OrderId) },
              {
                $set: {
                  status: data.status,
                  is_delivered: true,
                  deliverdDate: new Date(),
                },
              }
            )
            .then((response) => {
              resolve();
            });
        } else if (data.status == "Cancelled") {
          db.get()
            .collection(collection.ORDER_COLLECTION)
            .updateOne(
              { _id: ObjectId(data.OrderId) },
              {
                $set: {
                  status: data.status,
                  is_Cancelled: true,
                },
              }
            )
            .then((response) => {
              resolve();
            });
        } else {
          db.get()
            .collection(collection.ORDER_COLLECTION)
            .updateOne(
              { _id: ObjectId(data.OrderId) },
              {
                $set: {
                  status: data.status,
                },
              }
            )
            .then((response) => {
              resolve();
            });
        }
      } catch {
        resolve(0);
      }
    });
  },

  //dashboard
  getDashBoardCount:()=>{
    try{
      return new Promise(async(resolve, reject) => {
        let orderCount= await db.get().collection(collection.ORDER_COLLECTION).find().count();
        let userCount = await db.get().collection(collection.USER_COLLECTIONS).find().count();
        let productCount = await db.get().collection(collection.PRODUCT_COLLECTIONS).find().count();

        let obj ={
          userCount :userCount,
          orderCount : orderCount,
          productCount : productCount,
        };
        resolve(obj);
      });
    }catch{
      resolve(0)
    }
  },

  totalRevenue: () => {
    return new Promise(async (resolve, reject) => {
      let totalRevenue = await db.get()
        .collection(collection.ORDER_COLLECTION)
        .aggregate([
          {
            $match: { status: "Delivered" },
          },
          {
            $project: { totalAmount: "$totalAmount" },
          },
          {
            $group: {
              _id: null,
              totalAmount: { $sum: "$totalAmount" },
            },
          },
        ])
        .toArray();
      console.log(totalRevenue[0].totalAmount);
      resolve(totalRevenue[0].totalAmount);
    });
  },
  dailyRevenue: () => {
    return new Promise(async (resolve, reject) => {
      try {
        let dailyRevenue = await db
          .get()
          .collection(collection.ORDER_COLLECTION)
          .aggregate([
            {
              $match: {
                date: {
                  $lt: new Date(),
                  $gte: new Date(new Date() - 1000 * 60 * 60 * 24),
                },
              },
            },
            {
              $match: {
                status: "Delivered",
              },
            },
            {
              $group: {
                _id: null,
                totalAmount: { $sum: "$totalAmount" },
              },
            },
          ])
          .toArray();
        resolve(dailyRevenue[0].totalAmount);
      } catch {
        resolve(0);
      }
    });
  },

  weeklyRevenue: () => {
    return new Promise(async (resolve, reject) => {
      try {
        let weeklyRevenue = await db
          .get()
          .collection(collection.ORDER_COLLECTION)
          .aggregate([
            {
              $match: {
                date: {
                  $gte: new Date(new Date() - 1000 * 60 * 60 * 24 * 7),
                },
              },
            },
            {
              $match: {
                status: "Delivered",
              },
            },
            {
              $group: {
                _id: null,
                totalAmount: { $sum: "$totalAmount" },
              },
            },
          ])
          .toArray();
        resolve(weeklyRevenue[0].totalAmount);
      } catch {
        resolve(0);
      }
    });
  },
  monthlyRevenue: () => {
    return new Promise(async (resolve, reject) => {
      try {
        let monthlyRevenue = await db
          .get()
          .collection(collection.ORDER_COLLECTION)
          .aggregate([
            {
              $match: {
                date: {
                  $gte: new Date(new Date() - 1000 * 60 * 60 * 24 * 7 * 4),
                },
              },
            },
            {
              $match: {
                status: "Delivered",
              },
            },
            {
              $group: {
                _id: null,
                totalAmount: { $sum: "$totalAmount" },
              },
            },
          ])
          .toArray();
        resolve(monthlyRevenue[0].totalAmount);
      } catch {
        resolve(0);
      }
    });
  },

  yearlyRevenue: () => {
    return new Promise(async (resolve, reject) => {
      try {
        let yearlyRevenue = await db
          .get()
          .collection(collection.ORDER_COLLECTION)
          .aggregate([
            {
              $match: {
                date: {
                  $gte: new Date(new Date() - 1000 * 60 * 60 * 24 * 7 * 4 * 12),
                },
              },
            },
            {
              $match: {
                status: "Delivered",
              },
            },
            {
              $group: {
                _id: null,
                totalAmount: { $sum: "$totalAmount" },
              },
            },
          ])
          .toArray();

        resolve(yearlyRevenue[0].totalAmount);
      } catch {
        resolve(0);
      }
    });
  },
  getchartData: (req, res) => {
  
      return new Promise((resolve, reject) => {
        db.get()
          .collection(collection.ORDER_COLLECTION)
          .aggregate([
            { $match: { status: "Delivered" } },
            {
              $project: {
                date: { $convert: { input: "$_id", to: "date" } },
                total: "$totalAmount",
              },
            },
            {
              $match: {
                date: {
                  $lt: new Date(),
                  $gt: new Date(
                    new Date().getTime() - 24 * 60 * 60 * 1000 * 365
                  ),
                },
              },
            },
            {
              $group: {
                _id: { $month: "$date" },
                total: { $sum: "$total" },
              },
            },
            {
              $project: {
                month: "$_id",
                total: "$total",
                _id: 0,
              },
            },
          ])
          .toArray()
          .then((result) => {
            db.get()
              .collection(collection.ORDER_COLLECTION)
              .aggregate([
                { $match: { status: "Delivered" } },
                {
                  $project: {
                    date: { $convert: { input: "$_id", to: "date" } },
                    total: "$totalAmount",
                  },
                },
                {
                  $match: {
                    date: {
                      $lt: new Date(),
                      $gt: new Date(
                        new Date().getTime() - 24 * 60 * 60 * 1000 * 7
                      ),
                    },
                  },
                },
                {
                  $group: {
                    _id: { $dayOfWeek: "$date" },
                    total: { $sum: "$total" },
                  },
                },
                {
                  $project: {
                    date: "$_id",
                    total: "$total",
                    _id: 0,
                  },
                },
                {
                  $sort: { date: 1 },
                },
              ])
              .toArray()
              .then((weeklyReport) => {
                let obj = {
                  result,
                  weeklyReport,
                };
                resolve(obj);
              });
          });
      });
    
  },


  getAllCoupons:() => {
    return new Promise(async (resolve, reject) => {
      let coupon = db
        .get()
        .collection(collection.COUPON_COLLECTION)
        .find()
        .toArray();
      resolve(coupon);
    });
  },


  addCoupon: (data) => {
    return new Promise(async (resolve, reject) => {
      try {
        let coupon = await db
          .get()
          .collection(collection.COUPON_COLLECTION)
          .findOne({ coupon: data.coupon });
        if (coupon) {
          reject();
        } else {
          let startDateIso = new Date(data.starting);
          let endDateIso = new Date(data.expiry);
          let expiry = moment(data.expiry).format("YYYY-MM-DD");
          let starting = moment(data.starting).format("YYYY-MM-DD");
          let couponObj = {
            coupon: data.coupon,
            offer: parseInt(data.offer),
            starting: starting,
            expiry: expiry,
            startDateIso: startDateIso,
            endDateIso: endDateIso,
            users: [],
          };
          db.get()
            .collection(collection.COUPON_COLLECTION)
            .insertOne(couponObj)
            .then(() => {
              resolve();
            });
        }
      } catch {
        resolve(0);
      }
    });
  },

  getOrder: () => {
    return new Promise(async (resolve, reject) => {
      let Orders = await db
        .get()
        .collection(collection.ORDER_COLLECTION)
        .find({})
        .sort({ date: -1 })
        .toArray();
      if (Orders) {
        for (i = 0; i < Orders.length; i++) {
          Orders[i].date = moment(Orders[i].date).format("lll");
        }

        resolve(Orders);
      } else {
        resolve(0);
      }
    });
  },

  getCoupon:(coupId)=>{
    return new Promise((resolve, reject) => {
      try{
        db.get().collection(collection.COUPON_COLLECTION).findOne({_id:ObjectId(coupId)}).then((response)=>{
          resolve(response)
        })
      }catch{
        resolve(0);
      }
    })
  },
  editCoupon:(data)=>{
    console.log(data);
    return new Promise((resolve, reject) => {
      try{

        let startDateIso = new Date(data.starting);
        let endDateIso = new Date(data.expiry);
        db.get().collection(collection.COUPON_COLLECTION).updateOne({_id:ObjectId(data.id)},
        {$set:{
          coupon:data.coupon,
          offer:data.offer,
          starting:data.starting,
          expiry:data.expiry,
          startDateIso:startDateIso,
          endDateIso:endDateIso,
        }}).then(()=>{
          resolve()
        })
      }catch{
        resolve(0)
      }
    })
  },
  deleteCoupon:(coupId)=>{
    return new Promise((resolve, reject) => {
      try{
        db.get().collection(collection.COUPON_COLLECTION).deleteOne({_id:ObjectId(coupId)}).then(()=>{
          resolve()
        })
      }catch{
        resolve(0)
      }
    })
  },
    
getAllBanners:()=>{
  return new Promise((resolve, reject) => {
    try{
      db.get().collection(collection.BANNER_COLLECTION).find().toArray().then((response)=>{
        resolve(response)
      })

    }catch{
      resolve(0)
    }
  })
},
addBanner:(data)=>{
  return new Promise(async(resolve, reject) => {
    try{
      let banner = await db.get().collection(collection.BANNER_COLLECTION).findOne({ name: data.name })
      if (banner) {
          reject()
        }else{
          db.get().collection(collection.BANNER_COLLECTION).insertOne(data).then((response)=>{
            resolve(response)
          })
        }
      }catch{
        resolve(0)
      }
    })
    },

    getAllBannerDetails:(id)=>{
      console.log(id);
      return new Promise((resolve, reject) => {
        db.get().collection(collection.BANNER_COLLECTION).findOne({_id:ObjectId(id)}).then((response)=>{
          console.log(response);
          resolve(response)
        })
      })
    },
    editBanner:(bannId)=>{
      return new Promise((resolve, reject) => {
        try{
          db.get().collection(collection.BANNER_COLLECTION).updateOne({_id:ObjectId(bannId._id)},{
            $set:{
              name:bannId.name,
              subname:bannId.subname,
              offer:bannId.offer,
            }
          }).then((response)=>{
            console.log(response+"ffffffffffffffffffffffffffffffffff");
            resolve(response)
          })

        }catch{
          resolve(0)
        }
      })
    },
    deleteBanner: (id) => {
      return new Promise((resolve, reject) => {
          db.get().collection(collection.BANNER_COLLECTION).deleteOne({ _id: ObjectId(id)}).then((response) => {
              resolve()
          })
      })
  },

  getAllProductOffers: () => {
    return new Promise(async (resolve, reject) => {
      let allProdOffers = await db
        .get()
        .collection(collection.PRODUCT_OFFERS)
        .find()
        .toArray();
      resolve(allProdOffers);
    });
  },
  addProductOffer: (data) => {
    return new Promise(async (resolve, reject) => {
      let exist = await db
        .get()
        .collection(collection.PRODUCT_OFFERS)
        .findOne({ product: data.product });
      if (exist) {
        reject();
      } else {
        data.startDateIso = new Date(data.starting);
        data.endDateIso = new Date(data.expiry);
        data.proOfferPercentage = parseInt(data.proOfferPercentage);
        let exist = await db
          .get()
          .collection(collection.PRODUCT_COLLECTIONS)
          .findOne({ name: data.name, offer: { $exists: true } });
        if (exist) {
          reject();
        } else {
          db.get()
            .collection(collection.PRODUCT_OFFERS)
            .insertOne(data)
            .then(() => {
              resolve();
            });
        }
      }
    });
  },

  getProdOfferDetails: (proOfferId) => {
    return new Promise(async (resolve, reject) => {
      let proOfferDetails = await db
        .get()
        .collection(collection.PRODUCT_OFFERS)
        .findOne({ _id: ObjectId(proOfferId) });
      resolve(proOfferDetails);
    });
  },


  editProdOffer: (proOfferId, data) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.PRODUCT_OFFERS)
        .updateOne(
          { _id: ObjectId(proOfferId) },
          {
            $set: {
              product: data.product,
              starting: data.starting,
              expiry: data.expiry,
              proOfferPercentage: parseInt(data.proOfferPercentage),
              startDateIso: new Date(data.starting),
              endDateIso: new Date(data.expiry),
            },
          }
        )
        .then(async () => {
          let products = await db
            .get()
            .collection(collection.PRODUCT_COLLECTIONS)
            .find({ name: data.product, offer: { $exists: true } })
            .toArray();
          if (products) {
            await products.map(async (product) => {
              await db
                .get()
                .collection(collection.PRODUCT_COLLECTIONS)
                .updateOne(
                  { _id: objectId(product._id) },
                  {
                    $set: {
                      Amount: product.actualPrice,
                    },
                    $unset: {
                      offer: "",
                      proOfferPercentage: "",
                      actualPrice: "",
                    },
                  }
                )
                .then(() => {
                  resolve();
                });
            });
          } else {
            resolve();
          }
          resolve();
        });
    });
  },


  }
 
   
 

