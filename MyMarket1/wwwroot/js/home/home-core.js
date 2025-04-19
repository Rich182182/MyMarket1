let HomeCore = {
    elements = 20,
    activeFilters: {
        categories: [],
        onSale: null
    },
    loadProducts: function () {
        $.ajax({
            url: '/Home/GetAllProducts',
            type: 'GET',
            dataType: 'json',
            data: {
                categories: this.activeFilters.categories.join(','),
                onSale: this.activeFilters.onSale
            },
            success: function (response) {
                if (!response.data || response.data.length === 0) {
                    $('#mainList').html('<div class="text-center text-white p-5"><h3>No products match your filters</h3></div>');
                    return;
                }
                let filterProucts = response.data.filter(product => {
                    // Проверяем фильтр по категориям
                    const matchesCategory = HomeCore.activeFilters.categories.length === 0 ||
                        HomeCore.activeFilters.categories.includes(product.categoryId);

                    // Проверяем фильтр по скидке
                    const matchesOnSale = HomeCore.activeFilters.onSale === null ||
                        product.isOnSale === HomeCore.activeFilters.onSale;

                    // Продукт подходит, если он соответствует обоим фильтрам
                    return matchesCategory && matchesOnSale;
                });
                // Create a container for the product cards
                let productsHTML = '<div class="container py-4 " >';
                productsHTML += '<div class="row  row-cols-2 row-cols-md-3 row-cols-lg-4 row-cols-xxxl-5 g-4">';

                // Loop through each product
                $.each(filterProucts, function (i, product) {
                    let imageUrl = product.firstImape || '/images/no-image.png';
                    let priceDisplay = '';

                    // Handle pricing display
                    if (product.isOnSale && product.discountPrice != null) {
                        priceDisplay = `
                            <div class="d-flex align-items-center gap-2">
                                <span class="price-discount">$${product.discountPrice}</span>
                                <span class="price-original">$${product.price}</span>
                            </div>`;
                    } else {
                        priceDisplay = `<span class="fs-5 fw-bold">$${product.price}</span>`;
                    }

                    // Create product card
                    productsHTML += `
                    <div class="col">
                        <div class="card h-100 shadow position-relative bg-dark text-white" id="DataCard" data-bs-toggle="modal" data-bs-target="#ProductInfo" data-id="${product.id}">
                            ${product.isOnSale ? '<div class="discount-badge">SALE</div>' : ''}
                            <div style="height: 200px; overflow: hidden;">
                                <img src="${imageUrl}" class="card-img-top" alt="${product.name}" 
                                    style="height: 100%; object-fit: cover;">
                            </div>
                            <div >
                            <div class="card-body">
                                <h5 class="card-title text-truncate">${product.name}</h5>
                                <p class="card-text small text-light-emphasis" style="height: 60px; overflow: hidden;">
                                    ${product.description || 'No description available'}
                                </p>
                                <div class="d-flex justify-content-between align-items-center">
                                    ${priceDisplay}
                                    <span class="badge bg-secondary">${product.categoryName}</span>
                                </div>
                            </div>
                            <div class="card-footer bg-transparent border-top-0">
                                <a href="#" class="btn btn-primary btn-sm w-100">
                                    <i class="bi bi-cart-plus me-1"></i>Add to Cart
                                </a>
                            </div>
                            </div>
                        </div>
                    </div>`;
                });

                productsHTML += '</div></div>';

                // Replace the content of mainList with the new product cards
                $('#mainList').html(productsHTML);
            },
            error: function (error) {
                console.error("Error loading products:", error);
                $('#mainList').html('<div class="text-center text-white p-5"><h3>Error loading products</h3></div>');
            }
        });
    }
};

$(document).ready(function () {
    // Initial loading of products when page loads
    HomeCore.loadProducts();
});