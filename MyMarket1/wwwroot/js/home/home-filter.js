// Product filters functionality

let ProductFilters = {
    adjustFilterHeight: function () {
        // Calculate the viewport height
        const viewportHeight = $(window).height();

        // Account for the navbar height
        const navbarHeight = 10;

        // Calculate available height for the sidebar
        const availableHeight = viewportHeight - 20;

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
            hrHeight + filterHeadingHeight - padding;

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
        // Clear the product container and show loading indicator
        $('#mainList').html(`
        <div class="text-center text-white p-5">
            <div class="spinner-border text-light" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>
            <h4 class="mt-3">Applying filters...</h4>
        </div>
    `);

        // Call the loadProducts function to load filtered products
        HomeCore.loadProducts(1);
        HomeTable.scrollToTop();
    },

    initializeFilters: function () {
        // Load categories and create filter items
        $.ajax({
            url: '/Product/GetCategories',
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
                $('.filter-category-item').on('click', function () {
                    const $this = $(this);
                    const categoryId = $this.data('category-id');

                    if (categoryId === 'all') {
                        // If "All Categories" clicked, activate it and deactivate others
                        $('.filter-category-item').removeClass('active');
                        $this.addClass('active');
                        HomeCore.activeFilters.categories = [];
                    } else {
                        // Deactivate "All Categories"
                        $('.filter-category-item[data-category-id="all"]').removeClass('active');

                        // Toggle current category
                        if ($this.hasClass('active')) {
                            $this.removeClass('active');
                            const index = HomeCore.activeFilters.categories.indexOf(categoryId);
                            if (index > -1) {
                                HomeCore.activeFilters.categories.splice(index, 1);
                            }
                        } else {
                            $this.addClass('active');
                            HomeCore.activeFilters.categories.push(categoryId);
                        }

                        // If no categories selected, activate "All Categories"
                        if (HomeCore.activeFilters.categories.length === 0) {
                            $('.filter-category-item[data-category-id="all"]').addClass('active');
                        }
                    }

                    ProductFilters.applyFilters();
                });
                // Attach click event to category items
                
            }
        });
        

        
        // Discount status filter event handlers (now using radio buttons)
        $('#filterAllProducts').on('change', function () {
            if ($(this).is(':checked')) {
                HomeCore.activeFilters.onSale = null;
                ProductFilters.applyFilters();
            }
        });

        $('#filterOnSaleProducts').on('change', function () {
            if ($(this).is(':checked')) {
                HomeCore.activeFilters.onSale = true;
                ProductFilters.applyFilters();
            }
        });

        $('#filterRegularProducts').on('change', function () {
            if ($(this).is(':checked')) {
                HomeCore.activeFilters.onSale = false;
                ProductFilters.applyFilters();
            }
        });

        // Reset filters button
        $('#resetFilters').on('click', function () {
            // Reset category filters
            $('.filter-category-item').removeClass('active');
            $('.filter-category-item[data-category-id="all"]').addClass('active');
            HomeCore.activeFilters.categories = [];

            // Reset discount status filter
            $('#filterAllProducts').prop('checked', true);
            HomeCore.activeFilters.onSale = null;
            HomeCore.activeFilters.search = null;
            $('#searchInput').val(null);

            ProductFilters.applyFilters();
        });
    }
};

$(document).ready(function () {
    // Initialize filters
    ProductFilters.initializeFilters();

    // Adjust height on page load
    ProductFilters.adjustFilterHeight();

    $('#searchInput').on('keypress', function (e) {
        if (e.which === 13) {
            e.preventDefault();
            HomeCore.activeFilters.search = $(this).val();
            ProductFilters.applyFilters();
        }

    });
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
