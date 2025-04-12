$(document).ready(function () {
    var dataTable = $('#myTable').DataTable({
        pageLength: 10,
        lengthMenu: [[5, 10, 25, 50, -1], [5, 10, 25, 50, "all"]],
        "oLanguage": {
            "sSearch": '<i class="bi bi-search"></i> Search:',
            "sLengthMenu": ' Show _MENU_ entries'
        }
    });

    $('.modal').on('shown.bs.modal', function () {
        $(this).find('input[type="text"]').trigger('focus');
        
    });

    

    $('#createCategoryForm').on('submit', function (e) {
        e.preventDefault();
        $.ajax({
            url: $(this).attr('action'),
            type: "POST",
            data: $(this).serialize(),
            dataType: 'json',
            success: function (response) {
                $('#createCategoryModal').modal('hide');
                const categoryName = $('#categoryName').val();
                $('#categoryName').val('');
                toastr.success("Category created successfully!");

                const newRow = dataTable.row.add([
                    response.id,
                    categoryName,
                    '<div class="btn-group" role="group">' +
                    '<button type="button" class="btn btn-warning edit-category" data-id="' + response.id + '" data-name="' + categoryName + '">' +
                    '<i class="bi bi-pencil-square me-1"></i>Edit</button>' +
                    '<button type="button" class="btn btn-danger delete-category" data-id="' + response.id + '" data-name="' + categoryName + '" ' +
                    'data-bs-toggle="modal" data-bs-target="#deleteCategoryModal">' +
                    '<i class="bi bi-trash me-1"></i>Delete</button>' +
                    '</div>'
                ]).draw().node();

            },
            error: function (xhr) {
                toastr.error("Error while creating category: " + xhr.responseText);
            }
        });
    });


    $(document).on('click', '.edit-category', function () {
        const categoryId = $(this).data('id');
        const categoryName = $(this).data('name');
        $('#editCategoryId').val(categoryId);
        $('#editCategoryName').val(categoryName);
        $('#editCategoryModal').modal('show');
    });


    $('#editCategoryForm').on('submit', function (e) {
        e.preventDefault();
        $.ajax({
            url: $(this).attr('action'),
            type: "POST",
            data: $(this).serialize(),
            success: function () {
                $('#editCategoryModal').modal('hide');
                toastr.success("Category updated successfully!");

                const categoryId = $('#editCategoryId').val();
                const categoryName = $('#editCategoryName').val();

                dataTable.rows().every(function (rowIdx) {
                    const node = this.node();
                    if ($(node).find('td:first').text() == categoryId) {
                        $(node).find('td:eq(1)').text(categoryName);
                        $(node).find('.edit-category')
                            .data('name', categoryName)
                            .attr('data-name', categoryName);
                        $(node).find('.delete-category')
                            .data('name', categoryName)
                            .attr('data-name', categoryName);

                        dataTable.row(node).invalidate();

                        return false; 
                    }
                });

                dataTable.draw('page');
            },
            error: function (xhr) {
                toastr.error("Error while updating category: " + xhr.responseText);
            }
        });
    });


    $(document).on('click', '.delete-category', function () {
        $('#confirmDeleteCategory').data('id', $(this).data('id'));
        $('#deleteCategoryName').text('Category: ' + $(this).data('name'));
    });

    $('#confirmDeleteCategory').on('click', function () {
        const categoryId = $(this).data('id');
        $.ajax({
            url: '/Category/Delete/' + categoryId,
            type: "DELETE",
            success: function () {
                $('#deleteCategoryModal').modal('hide');
                dataTable.row($(`button[data-id="${categoryId}"]`).parents('tr')).remove().draw();
                toastr.success("Category deleted successfully!");
            },
            error: function (xhr) {
                toastr.error("Error while deleting category: " + xhr.responseText);
            }
        });
    });
});