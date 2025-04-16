// DataTable initialization and configuration

$(document).ready(function () {
    // Initialize DataTable
    ProductCore.dataTable = $('#productsTable').DataTable({
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

    // Load products via AJAX when page loads
    ProductCore.loadProducts();

    // Event handlers for DataTable events
    ProductCore.dataTable.on('draw.dt', function () {
        setTimeout(ProductFilters.adjustFilterHeight, 100);
    });

    $('#productsTable').on('length.dt', function () {
        setTimeout(ProductFilters.adjustFilterHeight, 100);
    });

    $('#productsTable').on('page.dt', function () {
        setTimeout(ProductFilters.adjustFilterHeight, 100);
    });

    $('#productsTable').on('draw.dt', function () {
        setTimeout(ProductFilters.adjustFilterHeight, 100);
    });

    // Remove all discounts functionality
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
                ProductCore.loadProducts(); // Reload the products table
            },
            error: function (xhr) {
                toastr.error("Error removing discounts: " + xhr.responseText);
            }
        });
    });
});
