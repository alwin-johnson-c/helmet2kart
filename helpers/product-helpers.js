// details of product
var db=require('../config/connection')
var collection=require('../config/collections');
const collections = require('../config/collections');
const { response } = require('../app');
var objectId = require('mongodb').ObjectId

module.exports={
    addProduct:(product)=>{
        console.log(product);
        product.price = parseInt(product.price)

        return new Promise ((resolve,reject)=>{


try{

    db.get().collection(collection.PRODUCT_COLLECTIONS).findOne({name:product.name}).then((response)=>{


        if(response){
           
           
            resolve({status:true})
        }
else {
        db.get().collection('product').insertOne(product).then((data)=>{
            console.log(data)
          resolve(data.insertedId)
  
     })
    }
})
}
catch{
    resolve(0)
}
        })
    },

    deleteProduct:(proId)=>{
        return  new Promise((resolve, reject) => {

            console.log(proId)
            console.log(objectId(proId))
            db.get().collection(collection.PRODUCT_COLLECTIONS).deleteOne({_id:objectId(proId)}).then((response)=>{
                resolve(response)
            })
        })
    },
    getProductDetails:(proId)=>{
        return new Promise(async(resolve, reject) => {
           await db.get().collection(collection.PRODUCT_COLLECTIONS).findOne({_id:objectId(proId)}).then((product)=>{
                resolve(product)
            })
        })
    },
    updateProduct:(proId,proDetails)=>{
        return new Promise((resolve, reject) => {
            db.get().collection(collection.PRODUCT_COLLECTIONS).updateOne({_id:objectId(proId)},
            {$set:{
                name:proDetails.name,
                price:proDetails.price, 
                description:proDetails.description,
                category:proDetails.category

            }
        }).then((response)=>{
            resolve()

        })
        })
    },
    getAllProducts:()=>{
        return new Promise(async(resolve, reject) => {
         let products=await db.get().collection(collection.PRODUCT_COLLECTIONS).find().toArray()
         console.log(products);
            resolve(products)
        })
    },
    addCategory:(category)=>{
        console.log(category);
        return new Promise((resolve, reject) => {
           category.category=category.category.toUpperCase()
            db.get().collection(collection.CATEGORY_COLLECTION).insertOne(category).then((data)=>{
                resolve(data)
            })
        })
    },
    viewCategory:()=>{
        return new Promise(async(resolve, reject) => {
            let catgy = await db.get().collection(collection.CATEGORY_COLLECTION).find().toArray()
            console.log(catgy);
            resolve(catgy)
        })
    },

    getOneProduct:(proId)=>{
        return new Promise(async(resolve, reject) => {
            let product= await db.get().collection(collection.PRODUCT_COLLECTIONS).findOne({_id:objectId(proId)})
            console.log(product);
            resolve(product)
        })
    },

    getOnecategory:(catId)=>{
        return new Promise(async(resolve, reject) => {
            let category = await db.get().collection(collection.CATEGORY_COLLECTION).findOne({_id:objectId(catId)})

             console.log(category)
             resolve(category)

        })
    },
    updateCategory: (catData, id) => {
        return new Promise((resolve, reject) => {
            catData.category =catData.category.toUpperCase()
            try{
            db.get().collection(collection.CATEGORY_COLLECTION).findOne({ category: catData.category }).then((response) => {
                if (response) {
                    resolve({ status: false })
                } else {
                    db.get().collection(collection.CATEGORY_COLLECTION).updateOne({ _id: objectId(id) }, {
                        $set: {
                            category: catData.category
                        }
                    }).then(() => {
                        resolve({ status: true })
                    })
                }
            })
        }catch{
            resolve(0)
        }

        })
    },
    deteCategory:(catId)=>{

       return new Promise((resolve, reject) => {
        
db.get().collection(collection.CATEGORY_COLLECTION).deleteOne({_id:objectId(catId)}).then(()=>{

        resolve()

})

       })

},

//search category

searchProduct: (pname) => {
    return new Promise(async (resolve, reject) => {
      let product = await db.get().collection(collection.PRODUCT_COLLECTIONS).find({ name: { $regex: pname } }).toArray();
      console.log(product);
      resolve(product)
    })
  },
  

  startProductOffer: (date) => {
    let proStartDateIso = new Date(date);
    return new Promise(async (resolve, reject) => {
      let data = await db
        .get()
        .collection(collection.PRODUCT_OFFERS)
        .find({ startDateIso: { $lte: proStartDateIso } })
        .toArray();
      if (data) {
        await data.map(async (onedata) => {
          let product = await db
            .get()
            .collection(collection.PRODUCT_COLLECTIONS)
            .findOne({ offer: { $exists: false }, name: onedata.product });
          if (product) {
            let actualPrice = parseInt(product.price);
            let newPrice = (((actualPrice )* (onedata.proOfferPercentage)) / 100);
            newPrice = newPrice.toFixed();
            db.get()
              .collection(collection.PRODUCT_COLLECTIONS)
              .updateOne(
                { _id: objectId(product._id) },
                {
                  $set: {
                    actualPrice: actualPrice,
                    price: actualPrice - newPrice,
                    offer: true,
                    proOfferPercentage: onedata.proOfferPercentage,
                  },
                }
              );
            resolve();
            console.log("get");
          } else {
            resolve();
            console.log("rejected");
          }
        });
      }
      resolve();
});
  },


}