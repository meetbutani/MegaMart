let productsGrid = document.getElementById('productsGrid');
let pagination = document.getElementById('pagination');
let result = document.getElementById('result');
let prodcount = document.getElementById('prodcount');
let sort = document.getElementById('sort');

let pagePrevious = document.getElementById('pagePrevious');
let pageNo1 = document.getElementById('pageNo1');
let pageNo2 = document.getElementById('pageNo2');
let pageNo3 = document.getElementById('pageNo3');
let pageNext = document.getElementById('pageNext');

let pagenoref = 1;
let limit = 16;

// let temppageno = new URLSearchParams(window.location.search).get("page");
// if (temppageno && temppageno > 0) {
//     pageno = parseInt(new URLSearchParams(window.location.search).get("page"));
// }
// loadProducts(pageno);

prodcount.addEventListener("change", () => {
    limit = parseInt(prodcount.value);
    if (sort.value == "Popular") {
        loadProducts(1);
    }
    else {
        getAllProducts();
    }
});

sort.addEventListener("change", () => {
    if (sort.value == "Popular") {
        loadProducts(1);
    }
    else {
        getAllProducts();
    }
});

// loadProducts(pagenoref);

function loadProducts(pageno) {

    fetch(`https://dummyjson.com/products?limit=${limit}&skip=${(pageno - 1) * limit}&select=title,price,discountPercentage,thumbnail`)
        .then(res => res.json())
        .then(res => {

            // console.log(res);

            if (!res.limit) {
                // loadProducts(1);
                return;
            };

            productsGrid.innerHTML = "";

            for (const index in res.products) {
                let discountPercentage = res.products[index].discountPercentage;
                let price = res.products[index].price;

                let html = `
                <div class="product">
                    <div class="product-img">
                        <img src="${res.products[index].thumbnail}" loading="lazy" alt="">
                        <div class="discount">
                            <span>${discountPercentage}%</span>
                            <span>Off</span>
                        </div>
                    </div>
                    <div class="info">
                        <span class="title">${res.products[index].title}</span>
                        <s class="strok-red">
                            <span class="old-price">Rs. <span class="old-price" id="oldPrice">${price}</span><span>
                        </s>
                        <span class="new-price">Rs. <span class="new-price" id="newPrice">${parseFloat(price - ((discountPercentage * price) / 100)).toFixed(2)}</span></span>
                    </div>
                    <button class="addcart">Add To Cart</button>
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

            document.getElementById("pagePrevious").addEventListener("click", () => {
                pagenoref = pageno - 1;
                loadProducts(pagenoref);
            })
            document.getElementById("pageNo1").addEventListener("click", () => {
                pagenoref = pageno - 2;
                loadProducts(pagenoref);
            })
            document.getElementById("pageNo2").addEventListener("click", () => {
                pagenoref = pageno - 1;
                loadProducts(pagenoref);
            })
            document.getElementById("pageNo3").addEventListener("click", () => {
                loadProducts(pagenoref);
            })
            document.getElementById("pageNo4").addEventListener("click", () => {
                pagenoref = pageno + 1;
                loadProducts(pagenoref);
            })
            document.getElementById("pageNo5").addEventListener("click", () => {
                pagenoref = pageno + 2;
                loadProducts(pagenoref);
            })
            document.getElementById("pageNext").addEventListener("click", () => {
                pagenoref = pageno + 1;
                loadProducts(pagenoref);
            })

            // pagination.innerHTML = `
            //     <a href="?page=${pageno - 1}" class="pageno ${pageno == 1 ? "disNone" : ""}">Previous</a>
            //     <a href="?page=${pageno - 2}" class="pageno ${pageno == 1 || pageno == 2 ? "disNone" : ""}">${pageno - 2}</a>
            //     <a href="?page=${pageno - 1}" class="pageno ${pageno == 1 ? "disNone" : ""}">${pageno - 1}</a>
            //     <a href="?page=${pageno}" class="pageno selected">${pageno}</a>
            //     <a href="?page=${pageno + 1}" class="pageno ${pageno == (Math.floor(res.total / limit) + 1) ? "disNone" : ""}">${pageno + 1}</a>
            //     <a href="?page=${pageno + 2}" class="pageno ${pageno == (Math.floor(res.total / limit) + 1) || pageno == (Math.floor(res.total / limit)) ? "disNone" : ""}">${pageno + 2}</a>
            //     <a href="?page=${pageno + 1}" class="pageno ${pageno == (Math.floor(res.total / limit) + 1) ? "disNone" : ""}">Next</a>
            // `;

            result.innerHTML = `Showing ${res.skip + 1}–${res.skip + limit} of ${res.total} results`;

        })
        .catch(err => console.log(err));
}

function getAllProducts() {

    fetch('https://dummyjson.com/products?limit=0&select=title,price,discountPercentage,thumbnail')
        .then(res => res.json())
        .then(res => {
            // console.log(res);

            for (const index in res.products) {
                res.products[index]["discountPrice"] = Number(Number(res.products[index].price - ((res.products[index].discountPercentage * res.products[index].price) / 100)).toFixed(2));
            }

            if (sort.value == "LH") {
                res.products.sort((a, b) => a.discountPrice - b.discountPrice);
            }
            else {
                res.products.sort((a, b) => b.discountPrice - a.discountPrice);
            }

            sortProducts(res, 1);
        })
        .catch(err => console.log(err));
}

function sortProducts(res, pageno) {
    // console.log(res);

    if (!res.limit) {
        // loadProducts(1);
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
                    </div>
                    <div class="info">
                        <span class="title">${res.products[index].title}</span>
                        <s class="strok-red">
                            <span class="old-price">Rs. <span class="old-price" id="oldPrice">${res.products[index].price}</span><span>
                        </s>
                        <span class="new-price">Rs. <span class="new-price" id="newPrice">${res.products[index].discountPrice}</span></span>
                    </div>
                    <button class="addcart">Add To Cart</button>
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

    document.getElementById("pagePrevious").addEventListener("click", () => {
        pagenoref = pageno - 1;
        sortProducts(res, pagenoref);
    })
    document.getElementById("pageNo1").addEventListener("click", () => {
        pagenoref = pageno - 2;
        sortProducts(res, pagenoref);
    })
    document.getElementById("pageNo2").addEventListener("click", () => {
        pagenoref = pageno - 1;
        sortProducts(res, pagenoref);
    })
    document.getElementById("pageNo3").addEventListener("click", () => {
        sortProducts(res, pagenoref);
    })
    document.getElementById("pageNo4").addEventListener("click", () => {
        pagenoref = pageno + 1;
        sortProducts(res, pagenoref);
    })
    document.getElementById("pageNo5").addEventListener("click", () => {
        pagenoref = pageno + 2;
        sortProducts(res, pagenoref);
    })
    document.getElementById("pageNext").addEventListener("click", () => {
        pagenoref = pageno + 1;
        sortProducts(res, pagenoref);
    })

    result.innerHTML = `Showing ${start + 1}–${stop} of ${res.total} results`;
}