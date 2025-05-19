// Product filters functionality

let ProductFilters = {
    adjustFilterHeight: function () {
        // Calculate the viewport height
        const viewportHeight = $(window).height();

        // Account for the navbar height
        const navbarHeight = 10;

        // Calculate available height for the sidebar
        const availableHeight = viewportHeight  - 20;

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
        const padding = 10; // Some padding

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
            hrHeight + filterHeadingHeight - padding ;

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
    },

    applyFilters: function () {
        // Custom filter function
        $.fn.dataTable.ext.search.push(function (settings, data, dataIndex) {
            const rowData = ProductCore.dataTable.row(dataIndex).data();

            // Category filter
            if (ProductCore.activeFilters.categories.length > 0 &&
                !ProductCore.activeFilters.categories.includes(rowData.categoryId)) {
                return false;
            }

            // Sale status filter
            if (ProductCore.activeFilters.onSale === true && !rowData.isOnSale) {
                return false;
            }
            if (ProductCore.activeFilters.onSale === false && rowData.isOnSale) {
                return false;
            }

            return true;
        });

        // Redraw the table with filters applied
        ProductCore.dataTable.draw();

        // Remove the custom filter function after drawing
        $.fn.dataTable.ext.search.pop();
    },

    initializeFilters: function () {
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
                        ProductCore.activeFilters.categories = [];
                    } else {
                        // Deactivate "All Categories"
                        $('.filter-category-item[data-category-id="all"]').removeClass('active');

                        // Toggle current category
                        if ($this.hasClass('active')) {
                            $this.removeClass('active');
                            const index = ProductCore.activeFilters.categories.indexOf(categoryId);
                            if (index > -1) {
                                ProductCore.activeFilters.categories.splice(index, 1);
                            }
                        } else {
                            $this.addClass('active');
                            ProductCore.activeFilters.categories.push(categoryId);
                        }

                        // If no categories selected, activate "All Categories"
                        if (ProductCore.activeFilters.categories.length === 0) {
                            $('.filter-category-item[data-category-id="all"]').addClass('active');
                        }
                    }

                    ProductFilters.applyFilters();
                });
            }
        });

        // Discount status filter event handlers (now using radio buttons)
        $('#filterAllProducts').on('change', function () {
            if ($(this).is(':checked')) {
                ProductCore.activeFilters.onSale = null;
                ProductFilters.applyFilters();
            }
        });

        $('#filterOnSaleProducts').on('change', function () {
            if ($(this).is(':checked')) {
                ProductCore.activeFilters.onSale = true;
                ProductFilters.applyFilters();
            }
        });

        $('#filterRegularProducts').on('change', function () {
            if ($(this).is(':checked')) {
                ProductCore.activeFilters.onSale = false;
                ProductFilters.applyFilters();
            }
        });

        // Reset filters button
        $('#resetFilters').on('click', function () {
            // Reset category filters
            $('.filter-category-item').removeClass('active');
            $('.filter-category-item[data-category-id="all"]').addClass('active');
            ProductCore.activeFilters.categories = [];

            // Reset discount status filter
            $('#filterAllProducts').prop('checked', true);
            ProductCore.activeFilters.onSale = null;

            ProductFilters.applyFilters();
        });
    }
};

$(document).ready(function () {
    // Initialize filters
    ProductFilters.initializeFilters();

    // Adjust height on page load
    ProductFilters.adjustFilterHeight();

    // Also call when the window is resized
    $(window).resize(function () {
        ProductFilters.adjustFilterHeight();
    });

    // Toggle discount price field visibility based on sale checkbox
    $(document).on('change', '#productIsOnSale, #editProductIsOnSale', function () {
        const isChecked = $(this).prop('checked');
        $(this).closest('form').find('.discount-price-container').toggle(isChecked);
    });
});
