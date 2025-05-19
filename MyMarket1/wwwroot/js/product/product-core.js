// Global variables and shared utilities

// Declare shared variables to be used across all modules
let ProductCore = {
    dataTable: null,
    activeFilters: {
        categories: [], // All categories selected by default (empty means all)
        onSale: null    // null = both, true = on sale only, false = regular price only
    },

    // Common functions used across modules
    loadProducts: function () {
        $.ajax({
            url: '/Admin/Product/GetAll',
            type: 'GET',
            dataType: 'json',
            success: function (data) {
                if (ProductCore.dataTable) {
                    ProductCore.dataTable.clear().rows.add(data).draw();
                }
            },
            error: function (xhr) {
                toastr.error("Error loading products: " + xhr.responseText);
            }
        });
    },

    loadCategories: function () {
        $.ajax({
            url: '/Admin/Product/GetCategories',
            type: 'GET',
            dataType: 'json',
            success: function (data) {
                const createDropdown = $('#productCategory');
                const editDropdown = $('#editProductCategory');

                // Clear existing options (except the placeholder)
                createDropdown.find('option:not(:first)').remove();
                editDropdown.find('option:not(:first)').remove();

                // Add new options - fixed the loop to use proper variable names
                if (Array.isArray(data)) {
                    data.forEach(function (category) {
                        createDropdown.append($('<option>', {
                            value: category.id,
                            text: category.name
                        }));

                        editDropdown.append($('<option>', {
                            value: category.id,
                            text: category.name
                        }));
                    });
                }
            },
            error: function (xhr) {
                toastr.error("Error loading categories: " + xhr.responseText);
            }
        });
    }

    /* init: function () {
         // Initialize DataTable and other components will be called from here
         $(document).ready(function () {
             // This function will be called when document is ready
             // Each module will register its initialization function
         });
     }*/
};

// Fix for deprecated jQuery ready syntax
$(function () {
    // Initialize core functionality
    ProductCore.loadCategories();
});
