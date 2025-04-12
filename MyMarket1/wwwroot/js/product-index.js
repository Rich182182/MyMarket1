$(document).ready(function () {
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
            { data: "categoryName" },
            {
                data: null,
                orderable: false,
                render: function (data) {
                    return '<div class="btn-group" role="group">' +
                        '<button type="button" class="btn btn-warning edit-product" ' +
                        'data-id="' + data.id + '" data-name="' + data.name + '" ' +
                        'data-price="' + data.price + '" data-description="' + (data.description || '') + '" ' +
                        'data-category-id="' + data.categoryId + '" data-image-url="' + (data.imageUrl || '') + '">' +
                        '<i class="bi bi-pencil-square me-1"></i>Edit</button>' +
                        '<button type="button" class="btn btn-danger delete-product" ' +
                        'data-id="' + data.id + '" data-name="' + data.name + '" ' +
                        'data-bs-toggle="modal" data-bs-target="#deleteProductModal">' +
                        '<i class="bi bi-trash me-1"></i>Delete</button>' +
                        '</div>';
                }
            }
        ]
    });

    // Load products via AJAX when page loads
    loadProducts();

    // Load categories for dropdowns
    loadCategories();

    // Modal form focus
    $('.modal').on('shown.bs.modal', function () {
        $(this).find('input[type="text"]').trigger('focus');
    });

    // Create product form submission
    $('#createProductForm').on('submit', function (e) {
        e.preventDefault();
        $.ajax({
            url: '/Product/Create',
            type: "POST",
            data: $(this).serialize(),
            dataType: 'json',
            success: function (response) {
                $('#createProductModal').modal('hide');
                resetCreateForm();
                toastr.success("Product created successfully!");
                loadProducts(); // Reload the products table
            },
            error: function (xhr) {
                toastr.error("Error while creating product: " + xhr.responseText);
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
        const imageUrl = $(this).data('image-url');

        $('#editProductId').val(productId);
        $('#editProductName').val(productName);
        $('#editProductPrice').val(productPrice);
        $('#editProductDescription').val(productDescription);
        $('#editProductCategory').val(categoryId);
        $('#editProductImageUrl').val(imageUrl);

        $('#editProductModal').modal('show');
    });

    // Edit product form submission
    $('#editProductForm').on('submit', function (e) {
        e.preventDefault();
        $.ajax({
            url: '/Product/Edit',
            type: "POST",
            data: $(this).serialize(),
            success: function () {
                $('#editProductModal').modal('hide');
                toastr.success("Product updated successfully!");
                loadProducts(); // Reload the products table
            },
            error: function (xhr) {
                toastr.error("Error while updating product: " + xhr.responseText);
            }
        });
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
                loadProducts(); // Reload the products table
            },
            error: function (xhr) {
                toastr.error("Error while deleting product: " + xhr.responseText);
            }
        });
    });

    // Function to load products
    function loadProducts() {
        $.ajax({
            url: '/Product/GetAll',
            type: 'GET',
            dataType: 'json',
            success: function (data) {
                // Clear existing data and add new data
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

    // Reset create form
    function resetCreateForm() {
        $('#productName').val('');
        $('#productDescription').val('');
        $('#productPrice').val('');
        $('#productCategory').val('');
        $('#productImageUrl').val('');
    }
});
