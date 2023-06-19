let productsGrid = document.getElementById('productsGrid');
let pagination = document.getElementById('pagination');
let result = document.getElementById('result');
let prodcount = document.getElementById('prodcount');
let sort = document.getElementById('sort');
let cartContainer = document.getElementById('cartContainer');
let wishlistContainer = document.getElementById('wishlistContainer');

let pagePrevious = document.getElementById('pagePrevious');
let pageNo1 = document.getElementById('pageNo1');
let pageNo2 = document.getElementById('pageNo2');
let pageNo3 = document.getElementById('pageNo3');
let pageNext = document.getElementById('pageNext');

let pagenoref = 1;
let limit = 16;
let cartItemsCount = 0;
let wishListItemsCount = 0;

let resp;

getAllProducts().then(res => {
    resp = res;
    // console.log(resp);
    showProducts(res, 1);
});

function getAllProducts() {

    return fetch('https://dummyjson.com/products?limit=0&select=title,price,discountPercentage,thumbnail,stock')
        .then(res => res.json())
        .then(res => {
            // console.log(res);

            for (const index in res.products) {
                // let cartObj = getProductsCart();
                res.products[index]["discountPrice"] = res.products[index].price - ((res.products[index].discountPercentage * res.products[index].price) / 100);
                // res.products[index]["discountPrice"] = Number(Number(res.products[index].price - ((res.products[index].discountPercentage * res.products[index].price) / 100)).toFixed(2));
                // res.products[index]["cartCount"] = cartObj[index] ? cartObj[index].cartCount : 0;
                res.products[index]["cartCount"] = 0;
                res.products[index]["wishlist"] = false;
            }

            let cartObj = getProductsCart();
            delete cartObj.subtotal;

            Object.keys(cartObj).forEach(key => {
                // res.products[index]["cartCount"] = cartObj[index] ? cartObj[index].cartCount : 0;
                res.products[key - 1].cartCount = cartObj[key].cartCount;
                setCartItemsCount(cartObj[key].cartCount);
            });

            let wishlistObj = getWishList();
            Object.keys(wishlistObj).forEach(key => {
                res.products[key - 1].wishlist = wishlistObj[key].wishlist;
                setWishListItemsCount(1);
            });

            return res;
        })
        .catch(err => console.error(err));
}

function sortProducts(res) {
    let obj = JSON.parse(JSON.stringify(res));
    if (sort.value == "LH") {
        obj.products.sort((a, b) => a.discountPrice - b.discountPrice);
    }
    else {
        obj.products.sort((a, b) => b.discountPrice - a.discountPrice);
    }
    showProducts(obj, 1);
}

function showProducts(res, pageno) {
    // console.log(resp);

    if (!res.limit) {
        return;
    };

    productsGrid.innerHTML = "";

    let start = (pageno - 1) * limit;
    let stop = (((pageno - 1) * limit) + limit) > res.limit ? res.limit : ((pageno - 1) * limit) + limit;
    // console.log(start + " " + stop + " " + res.limit);

    for (let index = start; index < stop; index++) {

        let html = `
                <div class="product">
                    <div class="product-img">
                        <img src="${res.products[index].thumbnail}" loading="lazy" alt="">
                        <div class="discount">
                            <span>${res.products[index].discountPercentage}%</span>
                            <span>Off</span>
                        </div>
                        <i class="fa-regular fa-heart wishlist wishlist_hover ${res.products[index].wishlist ? "fill" : ""}" style="color: #ff0000;" id="wishlist-icon-${res.products[index].id}" onclick=${res.products[index].wishlist ? `removeWishList(${res.products[index].id})` : `addWishList(${res.products[index].id})`}></i>
                    </div>
                    <div class="info">
                        <span class="title">${res.products[index].title}</span>
                        <s class="strok-red">
                            <span class="old-price">Rs. <span class="old-price" id="oldPrice">${res.products[index].price}</span><span>
                        </s>
                        <span class="new-price">Rs. <span class="new-price" id="newPrice">${Number(res.products[index].discountPrice).toFixed(2)}</span></span>
                    </div>
                    <button class="addcart" onclick="addToCart(${res.products[index].id})">Add To Cart</button>
                </div>
            `;

        productsGrid.insertAdjacentHTML("beforeend", html);
    }

    pagination.innerHTML = `
        <span class="pageno ${pageno == 1 ? "disNone" : ""}" id="pagePrevious">Previous</span>
        <span class="pageno ${pageno == 1 || pageno == 2 ? "disNone" : ""}" id="pageNo1">${pageno - 2}</span>
        <span class="pageno ${pageno == 1 ? "disNone" : ""}" id="pageNo2">${pageno - 1}</span>
        <span class="pageno selected" id="pageNo3">${pageno}</span>
        <span class="pageno ${pageno == (Math.floor(res.total / limit) + 1) ? "disNone" : ""}" id="pageNo4">${pageno + 1}</span>
        <span class="pageno ${pageno == (Math.floor(res.total / limit) + 1) || pageno == (Math.floor(res.total / limit)) ? "disNone" : ""}" id="pageNo5">${pageno + 2}</span>
        <span class="pageno ${pageno == (Math.floor(res.total / limit) + 1) ? "disNone" : ""}" id="pageNext">Next</span>
    `;

    document.getElementById("pagePrevious").addEventListener("click", () => showProducts(res, pageno - 1));
    document.getElementById("pageNo1").addEventListener("click", () => showProducts(res, pageno - 2));
    document.getElementById("pageNo2").addEventListener("click", () => showProducts(res, pageno - 1));
    document.getElementById("pageNo3").addEventListener("click", () => showProducts(res, pageno));
    document.getElementById("pageNo4").addEventListener("click", () => showProducts(res, pageno + 1));
    document.getElementById("pageNo5").addEventListener("click", () => showProducts(res, pageno + 2));
    document.getElementById("pageNext").addEventListener("click", () => showProducts(res, pageno + 1));

    result.innerHTML = `Showing ${start + 1}–${stop} of ${res.total} results`;
}

function addWishList(id) {
    let wishlistObj = getWishList();
    resp.products[id - 1].wishlist = true;
    wishlistObj[resp.products[id - 1].id] = resp.products[id - 1];
    document.getElementById("wishlist-icon-" + id).onclick = () => {
        removeWishList(id)
    }
    document.getElementById("wishlist-icon-" + id).classList.remove("nofill");
    document.getElementById("wishlist-icon-" + id).classList.add("fill");
    setWishListItemsCount(1);
    setWishList(wishlistObj);
}

function removeWishList(id) {
    let wishlistObj = getWishList();
    resp.products[id - 1].wishlist = false;
    wishlistObj[id] = undefined;
    if (document.getElementById("wishlist-icon-" + id)) {
        document.getElementById("wishlist-icon-" + id).onclick = () => {
            addWishList(id)
        }
        document.getElementById("wishlist-icon-" + id).classList.remove("fill");
        document.getElementById("wishlist-icon-" + id).classList.add("nofill");
    }
    setWishListItemsCount(-1);
    setWishList(wishlistObj);
    showWishlist();
}

function addToCart(id) {
    let cartObj = getProductsCart();
    resp.products[id - 1].cartCount++;
    if (cartObj[resp.products[id - 1].id]) {
        cartObj[resp.products[id - 1].id].cartCount++;
    }
    else {
        cartObj[resp.products[id - 1].id] = resp.products[id - 1];
    }
    // cartObj.subtotal = Number(Number(cartObj.subtotal + resp.products[id - 1].discountPrice).toFixed(2));
    cartObj.subtotal += resp.products[id - 1].discountPrice;
    setCartItemsCount(1);
    setProductsCart(cartObj);
}

function removeFromCart(id) {
    let cartObj = getProductsCart();
    cartObj.subtotal -= cartObj[id].discountPrice * cartObj[id].cartCount;
    // cartObj.subtotal = Number(Number(cartObj.subtotal - (cartObj[id].discountPrice * cartObj[id].cartCount)).toFixed(2));
    setCartItemsCount(-cartObj[id].cartCount);
    resp.products[id - 1].cartCount = 0;
    cartObj[id] = undefined;
    // console.log(Object.keys(cartObj).length, Object.keys(cartObj));
    if (Object.keys(cartObj).length <= 2) {
        cartObj.subtotal = 0;
    }
    setProductsCart(cartObj);
    showcart();
}

function cartIncrease(id) {
    let cartObj = getProductsCart();
    if (cartObj[id].cartCount < resp.products[id - 1].stock) {
        cartObj[id].cartCount++;
        resp.products[id - 1].cartCount++;
        // cartObj.subtotal = Number(Number(cartObj.subtotal+ cartObj[id].discountPrice).toFixed(2));
        cartObj.subtotal += cartObj[id].discountPrice;
        setCartItemsCount(1);
        setProductsCart(cartObj);
        showcart();
    }
}

function cartDecrease(id) {
    let cartObj = getProductsCart();
    if (cartObj[id].cartCount > 1) {
        cartObj[id].cartCount--;
        resp.products[id - 1].cartCount--;
        cartObj.subtotal -= cartObj[id].discountPrice;
        // cartObj.subtotal = Number(Number(cartObj.subtotal - cartObj[id].discountPrice).toFixed(2));
        setCartItemsCount(-1);
        setProductsCart(cartObj);
        showcart();
    }
}

function showcart() {
    cartContainer.innerHTML = "";
    let cartObj = getProductsCart();
    // console.log(cartObj);
    document.getElementById("subtotal").innerHTML = cartObj.subtotal > 0 ? "Rs. " + Number(cartObj.subtotal).toFixed(2) : "0";

    delete cartObj.subtotal;
    Object.keys(cartObj).forEach(key => {
        // console.log(key, cartObj[key]);
        cartContainer.insertAdjacentHTML("beforeend", `
            <div class="cart-item">
                <div class="prod-img">
                    <img src="${cartObj[key].thumbnail}" alt="">
                </div>
                <div class="prod-details">
                    <span class="title">${cartObj[key].title}</span>
                    <div class="price-div">
                        <i class="fa-solid fa-minus" style="color: #000000;" onclick="cartDecrease(${key})"></i>
                        <span id="count">${cartObj[key].cartCount}</span>
                        <i class="fa-solid fa-plus" style="color: #000000;" onclick="cartIncrease(${key})"></i>
                        <span id="price">Rs. ${Number(cartObj[key].discountPrice).toFixed(2)}</span>
                    </div>
                </div>
                <div class="cart-remove" onclick="removeFromCart(${key})">
                    <img src="./images/cart_remove.svg" alt="">
                </div>
            </div>
        `);
    });
}

function showWishlist() {
    wishlistContainer.innerHTML = "";
    let wishlistObj = getWishList();

    Object.keys(wishlistObj).forEach(key => {
        wishlistContainer.insertAdjacentHTML("beforeend", `
            <div class="wishlist-item">
                <div class="prod-img">
                    <img src="${wishlistObj[key].thumbnail}" alt="">
                    <div class="frame"></div>
                    <i class="fa-solid fa-heart" style="color: #ff0000;" onclick="removeWishList(${key})"></i>
                </div>
                <div class="prod-details">
                    <span class="title">${wishlistObj[key].title}</span>
                    <span id="price">Rs. ${Number(wishlistObj[key].discountPrice).toFixed(2)}</span>
                </div>
                <button class="addcart" onclick="addToCart(${wishlistObj[key].id})">Add To Cart</button>
            </div>
        `);
    });
}

function setWishListItemsCount(num) {
    wishListItemsCount += num;
    document.getElementById("wishListItemsCount").innerHTML = wishListItemsCount;
}

function setCartItemsCount(num) {
    cartItemsCount += num;
    document.getElementById("cartItemsCount").innerHTML = cartItemsCount;
}

function getProductsCart() {
    if (localStorage.getItem("ProductsCart") == null) {
        return { subtotal: 0 };
    }
    else {
        return JSON.parse(localStorage.getItem("ProductsCart"));
    }
}

function setProductsCart(list) {
    localStorage.setItem("ProductsCart", JSON.stringify(list));
}

function getWishList() {
    if (localStorage.getItem("WishList") == null) {
        return {};
    }
    else {
        return JSON.parse(localStorage.getItem("WishList"));
    }
}

function setWishList(list) {
    localStorage.setItem("WishList", JSON.stringify(list));
}

prodcount.addEventListener("change", () => {
    limit = parseInt(prodcount.value);
    if (sort.value == "Popular") {
        showProducts(resp, 1);
    }
    else {
        sortProducts(resp);
    }
});

sort.addEventListener("change", () => {
    if (sort.value == "Popular") {
        showProducts(resp, 1);
    }
    else {
        sortProducts(resp);
    }
});



// loadProducts(pagenoref);

// function loadProducts(pageno) {

//     fetch(`https://dummyjson.com/products?limit=${limit}&skip=${(pageno - 1) * limit}&select=title,price,discountPercentage,thumbnail`)
//         .then(res => res.json())
//         .then(res => {

//             // console.log(res);

//             if (!res.limit) {
//                 // loadProducts(1);
//                 return;
//             };

//             productsGrid.innerHTML = "";

//             for (const index in res.products) {
//                 let discountPercentage = res.products[index].discountPercentage;
//                 let price = res.products[index].price;

//                 let html = `
//                 <div class="product">
//                     <div class="product-img">
//                         <img src="${res.products[index].thumbnail}" loading="lazy" alt="">
//                         <div class="discount">
//                             <span>${discountPercentage}%</span>
//                             <span>Off</span>
//                         </div>
//                     </div>
//                     <div class="info">
//                         <span class="title">${res.products[index].title}</span>
//                         <s class="strok-red">
//                             <span class="old-price">Rs. <span class="old-price" id="oldPrice">${price}</span><span>
//                         </s>
//                         <span class="new-price">Rs. <span class="new-price" id="newPrice">${parseFloat(price - ((discountPercentage * price) / 100)).toFixed(2)}</span></span>
//                     </div>
//                     <button class="addcart" >Add To Cart</button>
//                 </div>
//             `;

//                 productsGrid.insertAdjacentHTML("beforeend", html);
//             }

//             pagination.innerHTML = `
//                 <span class="pageno ${pageno == 1 ? "disNone" : ""}" id="pagePrevious">Previous</span>
//                 <span class="pageno ${pageno == 1 || pageno == 2 ? "disNone" : ""}" id="pageNo1">${pageno - 2}</span>
//                 <span class="pageno ${pageno == 1 ? "disNone" : ""}" id="pageNo2">${pageno - 1}</span>
//                 <span class="pageno selected" id="pageNo3">${pageno}</span>
//                 <span class="pageno ${pageno == (Math.floor(res.total / limit) + 1) ? "disNone" : ""}" id="pageNo4">${pageno + 1}</span>
//                 <span class="pageno ${pageno == (Math.floor(res.total / limit) + 1) || pageno == (Math.floor(res.total / limit)) ? "disNone" : ""}" id="pageNo5">${pageno + 2}</span>
//                 <span class="pageno ${pageno == (Math.floor(res.total / limit) + 1) ? "disNone" : ""}" id="pageNext">Next</span>
//             `;

//             document.getElementById("pagePrevious").addEventListener("click", () => {
//                 pagenoref = pageno - 1;
//                 loadProducts(pagenoref);
//             })
//             document.getElementById("pageNo1").addEventListener("click", () => {
//                 pagenoref = pageno - 2;
//                 loadProducts(pagenoref);
//             })
//             document.getElementById("pageNo2").addEventListener("click", () => {
//                 pagenoref = pageno - 1;
//                 loadProducts(pagenoref);
//             })
//             document.getElementById("pageNo3").addEventListener("click", () => {
//                 loadProducts(pagenoref);
//             })
//             document.getElementById("pageNo4").addEventListener("click", () => {
//                 pagenoref = pageno + 1;
//                 loadProducts(pagenoref);
//             })
//             document.getElementById("pageNo5").addEventListener("click", () => {
//                 pagenoref = pageno + 2;
//                 loadProducts(pagenoref);
//             })
//             document.getElementById("pageNext").addEventListener("click", () => {
//                 pagenoref = pageno + 1;
//                 loadProducts(pagenoref);
//             })

//             // pagination.innerHTML = `
//             //     <a href="?page=${pageno - 1}" class="pageno ${pageno == 1 ? "disNone" : ""}">Previous</a>
//             //     <a href="?page=${pageno - 2}" class="pageno ${pageno == 1 || pageno == 2 ? "disNone" : ""}">${pageno - 2}</a>
//             //     <a href="?page=${pageno - 1}" class="pageno ${pageno == 1 ? "disNone" : ""}">${pageno - 1}</a>
//             //     <a href="?page=${pageno}" class="pageno selected">${pageno}</a>
//             //     <a href="?page=${pageno + 1}" class="pageno ${pageno == (Math.floor(res.total / limit) + 1) ? "disNone" : ""}">${pageno + 1}</a>
//             //     <a href="?page=${pageno + 2}" class="pageno ${pageno == (Math.floor(res.total / limit) + 1) || pageno == (Math.floor(res.total / limit)) ? "disNone" : ""}">${pageno + 2}</a>
//             //     <a href="?page=${pageno + 1}" class="pageno ${pageno == (Math.floor(res.total / limit) + 1) ? "disNone" : ""}">Next</a>
//             // `;

//             result.innerHTML = `Showing ${res.skip + 1}–${res.skip + limit} of ${res.total} results`;

//         })
//         .catch(err => console.error(err));
// }