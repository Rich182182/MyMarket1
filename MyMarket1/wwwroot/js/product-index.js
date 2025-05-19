$(document).ready(function () {

    let activeFilters = {
        categories: [], // All categories selected by default (empty means all)
        onSale: null    // null = both, true = on sale only, false = regular price only
    };
    // Initialize DataTable
    var dataTable = $('#productsTable').DataTable({
        pageLength: 10,
        lengthMenu: [[5, 10, 25, 50, -1], [5, 10, 25, 50, "all"]],
        "oLanguage": {
            "sSearch": '<i class="bi bi-search"></i> Search:',
            "sLengthMenu": ' Show _MENU_ entries'
        },
        columns: [
            { data: "id" },
            { data: "name" },
            {
                data: "price",
                render: function (data) {
                    return '$' + data;
                }
            },
            {
                data: "isOnSale",
                render: function (data) {
                    return data ? '<span class="badge bg-success">Yes</span>' : '<span class="badge bg-secondary">No</span>';
                }
            },
            {
                data: null,
                render: function (data) {
                    if (data.isOnSale && data.discountPrice !== null) {
                        return '<span class="text-success fw-bold">$' + data.discountPrice + '</span>';
                    } else {
                        return '<span class="text-muted">-</span>';
                    }
                }
            },
            { data: "categoryName" },
            {
                data: null,
                width: '20%',
                orderable: false,
                render: function (data) {
                    let buttons = '<div class="btn-group" role="group">';

                    buttons += '<button type="button" class="btn btn-warning edit-product" ' +
                        'data-id="' + data.id + '" data-name="' + data.name + '" ' +
                        'data-price="' + data.price + '" data-description="' + (data.description || '') + '" ' +
                        'data-category-id="' + data.categoryId + '" ' +
                        'data-is-on-sale="' + data.isOnSale + '" ' +
                        'data-discount-price="' + (data.discountPrice || '') + '">' +
                        '<i class="bi bi-pencil-square me-1"></i>Edit</button>';

                    buttons += '<button type="button" class="btn btn-danger delete-product" ' +
                        'data-id="' + data.id + '" data-name="' + data.name + '" ' +
                        'data-bs-toggle="modal" data-bs-target="#deleteProductModal">' +
                        '<i class="bi bi-trash me-1"></i>Delete</button>';

                    return buttons;
                }
            }
        ]
    });

    // Pending images for new product
    let pendingImages = [];

    // Images to delete for edit form
    let imagesToDelete = [];

    // Load products via AJAX when page loads
    loadProducts();

    // Load categories for dropdowns
    loadCategories();

    function applyFilters() {
        const dataTable = $('#productsTable').DataTable();

        // Custom filter function
        $.fn.dataTable.ext.search.push(function (settings, data, dataIndex) {
            const rowData = dataTable.row(dataIndex).data();

            // Category filter
            if (activeFilters.categories.length > 0 && !activeFilters.categories.includes(rowData.categoryId)) {
                return false;
            }

            // Sale status filter
            if (activeFilters.onSale === true && !rowData.isOnSale) {
                return false;
            }
            if (activeFilters.onSale === false && rowData.isOnSale) {
                return false;
            }

            return true;
        });

        // Redraw the table with filters applied
        dataTable.draw();

        // Remove the custom filter function after drawing
        $.fn.dataTable.ext.search.pop();
    }
    function adjustFilterHeight() {
        // Calculate the viewport height
        const viewportHeight = $(window).height();

        // Account for the navbar height
        const navbarHeight = $('header').outerHeight();

        // Calculate available height for the sidebar
        const availableHeight = viewportHeight - navbarHeight - 20; // 20px buffer

        // Make the sidebar fixed
        $('.sidebar-filter').css({
            'position': 'sticky',
            'top': navbarHeight + 'px',
            'max-height': availableHeight + 'px',
            'height': availableHeight + 'px',
            'overflow': 'hidden',
            'display': 'flex',
            'flex-direction': 'column'
        });

        // Make filter card body a flex container
        $('.filter-card-body').css({
            'display': 'flex',
            'flex-direction': 'column',
            'overflow-y': 'hidden',
            'height': 'calc(100% - ' + $('.sidebar-filter .card-header').outerHeight() + 'px)'
        });

        // Get the heights of all fixed elements in the filter
        const discountSectionHeight = $('.filter-section:not(.flex-grow-1)').outerHeight();
        const resetButtonHeight = $('#resetFilters').outerHeight();
        const hrHeight = $('.filter-card-body hr').outerHeight() * 2;
        const filterHeadingHeight = $('.filter-heading').first().outerHeight();
        const padding = 20; // Some padding

        // Ensure the category filter section takes the remaining space
        $('.filter-section.flex-grow-1').css({
            'display': 'flex',
            'flex-direction': 'column',
            'flex': '1',
            'overflow': 'hidden',
            'min-height': '0' // This is important for flex to work properly
        });

        // Calculate available height for category list
        const fixedElementsHeight = discountSectionHeight + resetButtonHeight +
            hrHeight + filterHeadingHeight + padding;

        const categoryListHeight = $('.filter-card-body').height() - fixedElementsHeight;

        // Make only the category list scrollable
        $('.category-list').css({
            'height': categoryListHeight + 'px',
            'max-height': categoryListHeight + 'px',
            'overflow-y': 'auto',
            'flex-shrink': '1'
        });

        // Ensure the reset button is always visible
        $('#resetFilters').css({
            'margin-top': 'auto',
            'flex-shrink': '0'
        });
    }





    // Adjust height on page load
    $(document).ready(function () {
        // Initial adjustment after a short delay to ensure all elements are rendered
        setTimeout(adjustFilterHeight, 300);

        // Adjust when DataTable page length changes
        $('#productsTable').on('length.dt', function () {
            setTimeout(adjustFilterHeight, 100);
        });

        // Adjust when DataTable page changes
        $('#productsTable').on('page.dt', function () {
            setTimeout(adjustFilterHeight, 100);
        });

        // Adjust when window resizes
        $(window).resize(function () {
            setTimeout(adjustFilterHeight, 100);
        });

        // Listen for DataTable draw event
        $('#productsTable').on('draw.dt', function () {
            setTimeout(adjustFilterHeight, 100);
        });
    });
    dataTable.on('draw.dt', function () {
        setTimeout(adjustFilterHeight, 100);
    });

    // Initial call to set the correct height
    $(document).ready(function () {
        // Call after a short delay to ensure everything is rendered
        setTimeout(adjustFilterHeight, 300);

        // Also call when the window is resized
        $(window).resize(function () {
            setTimeout(adjustFilterHeight, 100);
        });
    });
    // Function to initialize filter UI
    function initializeFilters() {
        // Load categories and create filter items
        $.ajax({
            url: '/Admin/Product/GetCategories',
            type: 'GET',
            dataType: 'json',
            success: function (data) {
                const $container = $('#categoryFilterContainer');
                $container.empty();

                // Add "All Categories" item
                $container.append(`
                <div class="filter-category-item active" data-category-id="all">
                    <i class="bi bi-grid-3x3-gap me-2"></i>All Categories
                </div>
            `);

                // Add individual category items
                data.forEach(function (category) {
                    $container.append(`
                    <div class="filter-category-item" data-category-id="${category.id}">
                        <i class="bi bi-folder me-2"></i>${category.name}
                    </div>
                `);
                });

                // Attach click event to category items
                $('.filter-category-item').on('click', function () {
                    const $this = $(this);
                    const categoryId = $this.data('category-id');

                    if (categoryId === 'all') {
                        // If "All Categories" clicked, activate it and deactivate others
                        $('.filter-category-item').removeClass('active');
                        $this.addClass('active');
                        activeFilters.categories = [];
                    } else {
                        // Deactivate "All Categories"
                        $('.filter-category-item[data-category-id="all"]').removeClass('active');

                        // Toggle current category
                        if ($this.hasClass('active')) {
                            $this.removeClass('active');
                            const index = activeFilters.categories.indexOf(categoryId);
                            if (index > -1) {
                                activeFilters.categories.splice(index, 1);
                            }
                        } else {
                            $this.addClass('active');
                            activeFilters.categories.push(categoryId);
                        }

                        // If no categories selected, activate "All Categories"
                        if (activeFilters.categories.length === 0) {
                            $('.filter-category-item[data-category-id="all"]').addClass('active');
                        }
                    }

                    applyFilters();
                });
            }
        });

        // Discount status filter event handlers (now using radio buttons)
        $('#filterAllProducts').on('change', function () {
            if ($(this).is(':checked')) {
                activeFilters.onSale = null;
                applyFilters();
            }
        });

        $('#filterOnSaleProducts').on('change', function () {
            if ($(this).is(':checked')) {
                activeFilters.onSale = true;
                applyFilters();
            }
        });

        $('#filterRegularProducts').on('change', function () {
            if ($(this).is(':checked')) {
                activeFilters.onSale = false;
                applyFilters();
            }
        });

        // Reset filters button
        $('#resetFilters').on('click', function () {
            // Reset category filters
            $('.filter-category-item').removeClass('active');
            $('.filter-category-item[data-category-id="all"]').addClass('active');
            activeFilters.categories = [];

            // Reset discount status filter
            $('#filterAllProducts').prop('checked', true);
            activeFilters.onSale = null;

            applyFilters();
        });
    }

    // Add a call to initialize filters after the DataTable initialization:
    // Initialize filters
    initializeFilters();

    $('#removeAllDiscountsBtn').on('click', function () {
        // Show the confirmation modal instead of executing action immediately
        $('#removeAllDiscountsModal').modal('show');
    });

    // Confirm remove all discounts
    $('#confirmRemoveAllDiscounts').on('click', function () {
        $.ajax({
            url: '/Product/RemoveAllDiscounts',
            type: 'POST',
            success: function () {
                $('#removeAllDiscountsModal').modal('hide');
                toastr.success("All discounts have been removed successfully!");
                loadProducts(); // Reload the products table
            },
            error: function (xhr) {
                toastr.error("Error removing discounts: " + xhr.responseText);
            }
        });
    });

    // PRODUCT CREATION
    // ----------------

    // Create product form submission
    $('#createProductForm').on('submit', function (e) {
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
            url: '/Product/Create',
            type: "POST",
            data: formData,
            processData: false,
            contentType: false,
            success: function (response) {
                const productId = response.id;
                // If there are images, upload them
                if (pendingImages.length > 0) {
                    uploadPendingImages(productId);
                } else {
                    finishCreateProduct();
                }
            },
            error: function (xhr) {
                toastr.error("Error creating product: " + xhr.responseText);
            }
        });
    });

    // Function to upload images after creating a product
    function uploadPendingImages(productId) {
        const formData = new FormData();

        // Add all pending images to FormData
        for (let i = 0; i < pendingImages.length; i++) {
            formData.append('files', pendingImages[i]);
        }

        $.ajax({
            url: `/Product/UploadImages?productId=${productId}`,
            type: 'POST',
            data: formData,
            processData: false,
            contentType: false,
            success: function () {
                finishCreateProduct();
            },
            error: function (xhr) {
                toastr.error("Error uploading images: " + xhr.responseText);
            }
        });
    }

    function finishCreateProduct() {
        $('#createProductModal').modal('hide');
        resetCreateForm();
        toastr.success("Product created successfully!");
        loadProducts();
    }

    // Handle file selection for create form
    $('#createProductImageUpload').on('change', function () {
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
            pendingImages.push(file);

            // Create preview
            const reader = new FileReader();
            reader.onload = function (e) {
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
    $(document).on('click', '#createProductImagePreview .delete-image-btn', function () {
        const index = $(this).closest('.col-4').index();
        pendingImages.splice(index, 1);
        $(this).closest('.col-4').remove();
    });

    // PRODUCT EDITING
    // --------------
    // Toggle discount price field visibility based on sale checkbox
    $(document).on('change', '#productIsOnSale, #editProductIsOnSale', function () {
        const isChecked = $(this).prop('checked');
        $(this).closest('form').find('.discount-price-container').toggle(isChecked);
    });

    // Remove discount button click
    $(document).on('click', '.remove-discount', function () {
        const productId = $(this).data('id');

        $.ajax({
            url: `/Product/RemoveDiscount?id=${productId}`,
            type: 'POST',
            success: function () {
                toastr.success("Discount removed successfully!");
                loadProducts(); // Reload the products table
            },
            error: function (xhr) {
                toastr.error("Error removing discount: " + xhr.responseText);
            }
        });
    });
    // Edit product button click
    $(document).on('click', '.edit-product', function () {
        const productId = $(this).data('id');
        const productName = $(this).data('name');
        const productPrice = $(this).data('price');
        const productDescription = $(this).data('description');
        const categoryId = $(this).data('category-id');
        const isOnSale = $(this).data('is-on-sale');
        const discountPrice = $(this).data('discount-price');

        resetEditForm();

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
        loadProductImages(productId);

        $('#editProductModal').modal('show');
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
        const deletedCount = imagesToDelete.length;
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
        toastr.info(`Uploading ${newCount} image(s), please wait...`);

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
        imagesToDelete.forEach(function (id) {
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
                imagesToDelete = [];
                toastr.success("Product updated successfully!");
                loadProducts();
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
        imagesToDelete.push(imageId);

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
        const index = imagesToDelete.indexOf(imageId);
        if (index > -1) {
            imagesToDelete.splice(index, 1);
        }

        // Update UI
        imageContainer.removeClass('marked-for-deletion');
        $(this).removeClass('restore-image-btn').addClass('delete-image-btn')
            .html('<i class="bi bi-x"></i>')
            .data('image-id', imageId);
        imageContainer.find('img').css('opacity', '1');
    });

    // Delete product button click
    $(document).on('click', '.delete-product', function () {
        $('#confirmDeleteProduct').data('id', $(this).data('id'));
        $('#deleteProductName').text('Product: ' + $(this).data('name'));
    });

    // Confirm delete product
    $('#confirmDeleteProduct').on('click', function () {
        const productId = $(this).data('id');
        $.ajax({
            url: '/Product/Delete/' + productId,
            type: "DELETE",
            success: function () {
                $('#deleteProductModal').modal('hide');
                toastr.success("Product deleted successfully!");
                loadProducts();
            },
            error: function (xhr) {
                toastr.error("Error while deleting product: " + xhr.responseText);
            }
        });
    });

    // Load product images
    function loadProductImages(productId) {
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

    // Function to load products
    function loadProducts() {
        $.ajax({
            url: '/Product/GetAll',
            type: 'GET',
            dataType: 'json',
            success: function (data) {
                dataTable.clear().rows.add(data).draw();
            },
            error: function (xhr) {
                toastr.error("Error loading products: " + xhr.responseText);
            }
        });
    }

    // Function to load categories for dropdowns
    function loadCategories() {
        $.ajax({
            url: '/Product/GetCategories',
            type: 'GET',
            dataType: 'json',
            success: function (data) {
                const createDropdown = $('#productCategory');
                const editDropdown = $('#editProductCategory');

                // Clear existing options (except the placeholder)
                createDropdown.find('option:not(:first)').remove();
                editDropdown.find('option:not(:first)').remove();

                // Add new options
                $.each(data, function (i, category) {
                    createDropdown.append($('<option>', {
                        value: category.id,
                        text: category.name
                    }));

                    editDropdown.append($('<option>', {
                        value: category.id,
                        text: category.name
                    }));
                });
            },
            error: function (xhr) {
                toastr.error("Error loading categories: " + xhr.responseText);
            }
        });
    }
    // Remove all discounts button click
    


    // Reset create form
    function resetCreateForm() {
        $('#productName').val('');
        $('#productDescription').val('');
        $('#productPrice').val('');
        $('#productCategory').val('');
        $('#productIsOnSale').prop('checked', false);
        $('#productDiscountPrice').val('');
        $('.discount-price-container').hide();
        $('#createProductImageUpload').val('');
        $('#createProductImagePreview').empty();
        pendingImages = [];
    }

    // Reset edit form
    function resetEditForm() {
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
        imagesToDelete = [];
    }
});
