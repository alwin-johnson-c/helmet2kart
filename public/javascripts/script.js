// function addToCart(proId) {
//     console.log('add to cart function called')
//     $.ajax({
//         url: '/add-to-cart/' + proId,
//         method: 'get',
//         success: (response) => {
//             if (response.status) {
//                 let count = $('#cart-count').html()
//                 count = parseInt(count) + 1
//                 $('#cart-count').html(count)
                
// Swal.fire({
//   position: 'center',
//   icon: 'success',
//   title: 'Your cart  has been saved',
//   showConfirmButton: false,
//   timer: 1500
// })

          
//             }
//             }
//     })
// }



// function addToCart(proId) {
//     console.log('add to cart function called')
//     $.ajax({
//         url: '/add-to-cart/' + proId,
//         method: 'get',
//         success: (response) => {
//             if (response.status) {
//                 let count = $('#cart-count').html()
//                 count = parseInt(count) + 1
//                 $('#cart-count').html(count)
//                 // swal.fire({
//                 //     icon: "success",
//                 //     title: "Item Added To Cart",
//                 //     showConfirmButton: false,
//                 //     timer: 1000
//                 // })
//             }
           
//         }
//     })
// }

// function addToCart(proId) {
//     $.ajax({
//         url: '/add-to-cart/' + proId,
//         method: 'get',
//         success: (response) => {
//             if (response.status) {
//                 let count = $('#cart-count').html()
//                 count = parseInt(count) + 1
//                 $("#cart-count").html(count)
//                 Swal.fire({
//                     position: 'center',
//                     icon: 'success',
//                     title: 'Added To Cart',
//                     showConfirmButton: false,
//                     timer: 1500

//                 })
                
//             } else {
//                 location.href = '/login'

//             }
//         }
//     })
// }