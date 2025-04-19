// Product editing functionality

let ProductEdit = {
    imagesToDelete: [], // Images to delete for edit form

    resetEditForm: function () {
        $('#editProductId').val('');
        $('#editProductName').val('');
        $('#editProductPrice').val('');
        $('#editProductDescription').val('');
        $('#editProductCategory').val('');
        $('#editProductIsOnSale').prop('checked', false);
        $('#editProductDiscountPrice').val('');
        $('.discount-price-container').hide();
        $('#editProductImageUpload').val('');
        $('#editProductImagePreview').empty();
        ProductEdit.imagesToDelete = [];
    },

    loadProductImages: function (productId) {
        $.ajax({
            url: `/Product/GetProductImages?productId=${productId}`,
            type: 'GET',
            success: function (images) {
                $('#editProductImagePreview').empty();

                if (images && images.length > 0) {
                    images.forEach(function (image) {
                        $('#editProductImagePreview').append(`
                            <div class="col-4 col-md-3">
                                <div class="product-image-container">
                                    <img src="${image.imageUrl}" class="product-image border" alt="Product Image">
                                    <div class="delete-image-btn" data-image-id="${image.id}">
                                        <i class="bi bi-x"></i>
                                    </div>
                                </div>
                            </div>
                        `);
                    });
                }
            },
            error: function (xhr) {
                toastr.error("Error loading product images: " + xhr.responseText);
            }
        });
    }
};

$(document).ready(function () {
    // Edit product button click
    $(document).on('click', '.edit-product', function () {

        $('#editProductModal').modal('show');

        const productId = $(this).data('id');
        const productName = $(this).data('name');
        const productPrice = $(this).data('price');
        const productDescription = $(this).data('description');
        const categoryId = $(this).data('category-id');
        const isOnSale = $(this).data('is-on-sale');
        const discountPrice = $(this).data('discount-price');

        ProductEdit.resetEditForm();

        $('#editProductId').val(productId);
        $('#editProductName').val(productName);
        $('#editProductPrice').val(productPrice);
        $('#editProductDescription').val(productDescription);
        $('#editProductCategory').val(categoryId);
        $('#editProductIsOnSale').prop('checked', isOnSale);

        // Show/hide discount price field based on sale status
        $('#editProductForm .discount-price-container').toggle(isOnSale);
        if (isOnSale && discountPrice) {
            $('#editProductDiscountPrice').val(discountPrice);
        }

        // Load product images
        ProductEdit.loadProductImages(productId);

        
    });

    // Handle file selection for edit form
    $('#editProductImageUpload').on('change', function () {
        const fileInput = this;
        if (fileInput.files.length === 0) return;

        // Get current product ID
        const productId = $('#editProductId').val();
        if (!productId) {
            toastr.error("Product ID not available.");
            return;
        }

        // Check image count
        const currentImageCount = $('#editProductImagePreview .col-4').length;
        const deletedCount = ProductEdit.imagesToDelete.length;
        const newCount = fileInput.files.length;
        const totalCount = currentImageCount - deletedCount + newCount;

        if (totalCount > 8) {
            toastr.warning(`You can only add ${8 - currentImageCount + deletedCount} more images (maximum 8 total).`);
            fileInput.value = '';
            return;
        }

        // Upload images immediately for edit form
        const formData = new FormData();
        for (let i = 0; i < fileInput.files.length; i++) {
            formData.append('files', fileInput.files[i]);
        }

        // Show loading message
        toastr.info(`Uploading ${newCount} image(s)`);

        // Upload images
        $.ajax({
            url: `/Product/UploadImages?productId=${productId}`,
            type: 'POST',
            data: formData,
            processData: false,
            contentType: false,
            success: function (response) {
                if (response.success) {
                    // Add all uploaded images to preview
                    if (response.images) {
                        response.images.forEach(function (image) {
                            $('#editProductImagePreview').append(`
                                <div class="col-4 col-md-3">
                                    <div class="product-image-container">
                                        <img src="${image.imageUrl}" class="product-image border" alt="Product Image">
                                        <div class="delete-image-btn" data-image-id="${image.id}">
                                            <i class="bi bi-x"></i>
                                        </div>
                                    </div>
                                </div>
                            `);
                        });
                        toastr.success(`Successfully uploaded ${response.uploadCount} image(s).`);
                    }
                } else {
                    toastr.error("Failed to upload images.");
                }

                fileInput.value = '';
            },
            error: function (xhr) {
                toastr.error("Error uploading images: " + xhr.responseText);
                fileInput.value = '';
            }
        });
    });

    // Edit product form submission
    $('#editProductForm').on('submit', function (e) {
        e.preventDefault();

        // Prepare form data
        const formData = new FormData(this);

        // Explicitly handle checkbox value (which may not be included if unchecked)
        const isOnSale = $('#editProductIsOnSale').is(':checked');
        formData.set('IsOnSale', isOnSale);

        // If not on sale, set DiscountPrice to null
        if (!isOnSale) {
            formData.set('DiscountPrice', '');
        }

        // Add image IDs to delete
        ProductEdit.imagesToDelete.forEach(function (id) {
            formData.append('imagesToDelete', id);
        });

        $.ajax({
            url: '/Product/Edit',
            type: "POST",
            data: formData,
            processData: false,
            contentType: false,
            success: function () {
                $('#editProductModal').modal('hide');
                ProductEdit.imagesToDelete = [];
                toastr.success("Product updated successfully!");
                ProductCore.loadProducts();
            },
            error: function (xhr) {
                toastr.error("Error updating product: " + xhr.responseText);
            }
        });
    });

    // Delete image in edit form (mark for deletion)
    $(document).on('click', '#editProductImagePreview .delete-image-btn', function () {
        const imageId = $(this).data('image-id');
        const imageContainer = $(this).closest('.col-4');

        // Add to images to delete array
        ProductEdit.imagesToDelete.push(imageId);

        // Update UI
        imageContainer.addClass('marked-for-deletion');
        $(this).removeClass('delete-image-btn').addClass('restore-image-btn')
            .html('<i class="bi bi-arrow-counterclockwise"></i>')
            .data('image-id', imageId);
        imageContainer.find('img').css('opacity', '0.5');
    });

    // Restore image in edit form
    $(document).on('click', '#editProductImagePreview .restore-image-btn', function () {
        const imageId = $(this).data('image-id');
        const imageContainer = $(this).closest('.col-4');

        // Remove from images to delete array
        const index = ProductEdit.imagesToDelete.indexOf(imageId);
        if (index > -1) {
            ProductEdit.imagesToDelete.splice(index, 1);
        }

        // Update UI
        imageContainer.removeClass('marked-for-deletion');
        $(this).removeClass('restore-image-btn').addClass('delete-image-btn')
            .html('<i class="bi bi-x"></i>')
            .data('image-id', imageId);
        imageContainer.find('img').css('opacity', '1');
    });
});
