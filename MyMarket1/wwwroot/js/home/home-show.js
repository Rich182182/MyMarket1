let HomeShow = {
    productId: null,
    swiper: null
}
$(document).on('click', '#DataCard', function () {
    HomeShow.productId = $(this).data('id');
});
$('#ProductInfo').on('shown.bs.modal', function () {
    
    
    $.ajax({
        url: `/Home/GetProduct?productId=${HomeShow.productId}`,
        type: 'GET',
        dataType: 'json',
        success: function (product) {
            const productData = product.data[0];
            if (productData.isOnSale && productData.discountPrice != 0) {
                $('#Prices').append(`
                     <span class="price-discount">$${productData.discountPrice}</span>
                     <span class="price-original">$${productData.price}</span>
                `);
            }
            else {
                $('#Prices').append(`
                    <span class="fs-5 fw-bold">$${productData.price}</span>
                `);
            }
            if (productData.imagesUrl.length != 0) {
                
                $.each(productData.imagesUrl, function (i, image) {
                    console.log(i);
                    let div=(`<div class="swiper-slide">
                                    <img src="${image.imageUrl}" class="img-fluid" alt="Product image">
                                </div>`);
                    $('#MySwiper').append(div);
                    console.log(div);
                });
            }
            else {
                let div =(`<div class="swiper-slide">
                                    <img src="">
                                </div>`);
                $('#MySwiper').append(div);
            }
            $('#modalProductName').text(productData.name);
            $('#modalProductDescription').text(productData.description);
            $('#modalProductCategory').text(productData.categoryName);
            
                initSwiper();
        }
    });

});
function initSwiper() {
    if (HomeShow.swiper) {
        HomeShow.swiper.destroy(true, true);
        HomeShow.swiper = null;
    }
    HomeShow.swiper = new Swiper('.swiper', {
        // Горизонтальний напрямок (це значення за замовчуванням)
        direction: 'horizontal',
        loop: true,

        slidesPerView: 1, 
        

        // Додаємо пагінацію
        pagination: {
            el: '.swiper-pagination',
            clickable: true
        },

        // Стрілки навігації
        navigation: {
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev',
        }
    });
    $("body").keydown(function (e) {
        if (e.keyCode == 37) { // top
            HomeShow.swiper.slidePrev();
        }
        else if (e.keyCode == 39) { // bottom
            HomeShow.swiper.slideNext();
        }
    });
}

// Очищення при закритті модального вікна
$('#ProductInfo').on('hidden.bs.modal', function () {
    if (window.modalSwiper) {
        window.modalSwiper.destroy();
        window.modalSwiper = null;
    }
    $("body").off("keydown.swiperKeys");
    $('#modalProductName').empty();
    $('#modalProductDescription').empty();
    $('#modalProductCategory').empty();
    $('#Prices').empty();
    $('#MySwiper').empty();
    $('#ProductCount').val(1);
    HomeShow.productId = null;
    HomeShow.productId = null;
});
