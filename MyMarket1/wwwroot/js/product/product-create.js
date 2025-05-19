// Product creation functionality

let ProductCreate = {
    pendingImages: [], // Pending images for new product
    
    resetCreateForm: function() {
        $('#productName').val('');
        $('#productDescription').val('');
        $('#productPrice').val('');
        $('#productCategory').val('');
        $('#productIsOnSale').prop('checked', false);
        $('#productDiscountPrice').val('');
        $('.discount-price-container').hide();
        $('#createProductImageUpload').val('');
        $('#createProductImagePreview').empty();
        ProductCreate.pendingImages = [];
    },
    
    uploadPendingImages: function(productId) {
        const formData = new FormData();

        // Add all pending images to FormData
        for (let i = 0; i < ProductCreate.pendingImages.length; i++) {
            formData.append('files', ProductCreate.pendingImages[i]);
        }

        $.ajax({
            url: `/Admin/Product/UploadImages?productId=${productId}`,
            type: 'POST',
            data: formData,
            processData: false,
            contentType: false,
            
            error: function(xhr) {
                toastr.error("Error uploading images: " + xhr.responseText);
            }
        });
    },
    
    finishCreateProduct: function() {
        $('#createProductModal').modal('hide');
        ProductCreate.resetCreateForm();
        toastr.success("Product created successfully!");
        ProductCore.loadProducts();
    }
};

$(document).ready(function() {
    // Create product form submission
    $('#createProductForm').on('submit', function(e) {
        e.preventDefault();

        // Create a FormData object instead of using serialize()
        const formData = new FormData(this);

        // Explicitly handle checkbox value
        const isOnSale = $('#productIsOnSale').is(':checked');
        formData.set('IsOnSale', isOnSale);

        // If not on sale, set DiscountPrice to null
        if (!isOnSale) {
            formData.set('DiscountPrice', '');
        }

        $.ajax({
            url: '/Admin/Product/Create',
            type: "POST",
            data: formData,
            processData: false,
            contentType: false,
            success: function(response) {
                const productId = response.id;
                // If there are images, upload them
                if (ProductCreate.pendingImages.length > 0) {
                    ProductCreate.uploadPendingImages(productId);
                } 
                ProductCreate.finishCreateProduct();

            },
            error: function(xhr) {
                toastr.error("Error creating product: " + xhr.responseText);
            }
        });
    });
    
    // Handle file selection for create form
    $('#createProductImageUpload').on('change', function() {
        const fileInput = this;
        if (fileInput.files.length === 0) return;

        // Check if adding these files would exceed the 8 image limit
        const currentPreviewCount = $('#createProductImagePreview .col-4').length;
        if (currentPreviewCount + fileInput.files.length > 8) {
            toastr.warning(`You can only add up to 8 images (${8 - currentPreviewCount} more).`);
            fileInput.value = '';
            return;
        }

        // Process each selected file
        for (let i = 0; i < fileInput.files.length; i++) {
            const file = fileInput.files[i];
            const tempId = `temp-${Date.now()}-${i}`;

            // Add to pending images
            ProductCreate.pendingImages.push(file);

            // Create preview
            const reader = new FileReader();
            reader.onload = function(e) {
                $('#createProductImagePreview').append(`
                    <div class="col-4 col-md-3" data-temp-id="${tempId}">
                        <div class="product-image-container">
                            <img src="${e.target.result}" class="product-image border" alt="Product Image">
                            <div class="delete-image-btn" data-temp-id="${tempId}">
                                <i class="bi bi-x"></i>
                            </div>
                        </div>
                    </div>
                `);
            };
            reader.readAsDataURL(file);
        }

        // Reset file input
        fileInput.value = '';
    });
    
    // Delete pending image (create form)
    $(document).on('click', '#createProductImagePreview .delete-image-btn', function() {
        const index = $(this).closest('.col-4').index();
        ProductCreate.pendingImages.splice(index, 1);
        $(this).closest('.col-4').remove();
    });
});
