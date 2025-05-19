// Product deletion functionality

$(document).ready(function () {
    // Delete product button click
    $(document).on('click', '.delete-product', function () {
        $('#confirmDeleteProduct').data('id', $(this).data('id'));
        $('#deleteProductName').text('Product: ' + $(this).data('name'));
    });

    // Confirm delete product
    $('#confirmDeleteProduct').on('click', function () {
        const productId = $(this).data('id');
        $.ajax({
            url: '/Admin/Product/Delete/' + productId,
            type: "DELETE",
            success: function () {
                $('#deleteProductModal').modal('hide');
                toastr.success("Product deleted successfully!");
                ProductCore.loadProducts();
            },
            error: function (xhr) {
                toastr.error("Error while deleting product: " + xhr.responseText);
            }
        });
    });
});
