let HomeTable = {
    mainList: $('#pagination-container'),
    loadMore: [],
    pages: null,
    scrollToTop: function () {
        window.scrollTo({
            top: 0,
            behavior: 'smooth' // Плавная прокрутка
        });
    },
    loadFirstButtons: function () {
        if (HomeTable.loadMore.includes(1)) {
            HomeTable.mainList.append(`
            <button class="btn btn-primary m-1 page-btn" id="btn-page" data-page="${1}">${1}</button>
            `);
        }
        else {
            HomeTable.mainList.append(`
            <button class="btn btn-secondary m-1 page-btn" id="btn-page" data-page="${1}">${1}</button>
            `);
        }

        HomeTable.mainList.append(`
            <button class="btn btn-secondary m-1 page-btn" id="btn-page" data-page="${HomeCore.pagee - 5}"> ... </button>
            `);
    },
    loadLastButtons: function () {
        HomeTable.mainList.append(`
            <button class="btn btn-secondary m-1 page-btn" id="btn-page" data-page="${HomeCore.pagee + 5}"> ... </button>
            `);
        HomeTable.mainList.append(`
            <button class="btn btn-secondary m-1 page-btn" id="btn-page" data-page="${HomeTable.pages}">${HomeTable.pages}</button>
            `);
    },
    appendButton: function (i) {
        if (i === HomeCore.pagee || HomeTable.loadMore.includes(i)) {
            HomeTable.mainList.append(`
            <button class="btn btn-primary m-1 page-btn" id="btn-page" data-page="${i}">${i}</button>
            `);
        }
        else {
            HomeTable.mainList.append(`
            <button class="btn btn-secondary m-1 page-btn" id="btn-page" data-page="${i}">${i}</button>
            `);
        }

    },
    createButtons: function () {
        HomeTable.pages = Math.ceil(HomeCore.productLength / HomeCore.elements);
        if (HomeTable.pages > 1) {
            if (HomeCore.pagee != HomeTable.pages) {
                HomeTable.mainList.append(`
            <button class="btn btn-primary m-1 page-btn" id="loadMore">
                <i class="bi bi-arrow-down-circle me-1"></i>Load More
            </button>
            `);
            } else {
                HomeTable.mainList.append(`
            <button class="btn  m-1 page-btn disabled" disabled>
                <i class="bi bi-arrow-down-circle me-1"></i>Load More
            </button>
            `);
            }
            if (HomeCore.pagee > 1) {
                HomeTable.mainList.append(`
            <button class="btn btn-secondary m-1 page-btn" id="pageLeft"><i class="bi bi-chevron-left"></i></button>
            `);
            } else {
                HomeTable.mainList.append(`
            <button class="btn btn-secondary m-1 page-btn disabled" disabled><i class="bi bi-chevron-left"></i></button>
            `);
            }

            if (HomeCore.pagee > 4 && HomeTable.pages - HomeCore.pagee > 4) {
                this.loadFirstButtons();
                for (let i = HomeCore.pagee - 2; i <= HomeCore.pagee + 2; i++) {
                    this.appendButton(i);
                }
                this.loadLastButtons();

            }
            else if (HomeCore.pagee > 5) {
                this.loadFirstButtons();
                for (let i = HomeTable.pages - 5; i <= HomeTable.pages; i++) {
                    this.appendButton(i);
                }
            }
            else if (HomeTable.pages > 5) {
                for (let i = 1; i <= 5; i++) {
                    this.appendButton(i);
                }
                this.loadLastButtons();
            }
            else {

                for (let i = 1; i <= HomeTable.pages; i++) {
                    this.appendButton(i);
                }
            }

            if (HomeCore.pagee < HomeTable.pages) {
                HomeTable.mainList.append(`
            <button class="btn btn-secondary m-1 page-btn" id="pageRight"><i class="bi bi-chevron-right"></i></button>
            `);
            } else {
                HomeTable.mainList.append(`
            <button class="btn btn-secondary m-1 page-btn disabled" disabled><i class="bi bi-chevron-right"></i></button>
            `);
            }
        }
    },
    deleteButtons: function () {
        $('#pagination-container').empty();
    },
    updateElementsBasedOnScreenSize: function () {
        // Получаем текущую ширину окна браузера
        const width = window.innerWidth;
        let small = 6;
        // Определяем количество элементов на странице в зависимости от ширины
        // Используем контрольные точки Bootstrap
        if (width < 576) {
            HomeCore.elements = small;  // xs - меньше элементов для очень маленьких экранов
        } else if (width < 768) {
            HomeCore.elements = small * 2;  // sm - мобильные устройства
        } else if (width < 992) {
            HomeCore.elements = small * 3; // md - планшеты
        } else if (width < 1200) {
            HomeCore.elements = small * 4; // lg - десктопы
        } else {
            HomeCore.elements = small * 5; // xl/xxl - большие экраны
        }

        HomeCore.loadProducts(1);

    }
}



$(document).ready(function () {
    // Initial loading of products when page loads

    HomeTable.updateElementsBasedOnScreenSize();

    // Добавляем обработчик события resize с debounce для оптимизации
    let resizeTimeout;
    $(window).on('resize', function () {
        // Сбрасываем таймер при каждом событии resize
        clearTimeout(resizeTimeout);
        // Устанавливаем новый таймер, чтобы код выполнялся только когда пользователь 
        // закончил изменять размер окна
        resizeTimeout = setTimeout(function () {
            HomeTable.updateElementsBasedOnScreenSize();
        }, 300); // ждем 300мс после последнего события resize
    });

    $(document).on('click', '#btn-page', function () {
        let page = $(this).data('page');

        HomeCore.loadProducts(page);

    });
    $(document).on('click', '#loadMore', function () {
        HomeCore.loadProducts(HomeCore.pagee + 1, true);
        /*page.attr('data-page')=*/

    });
    $(document).on('click', '#pageLeft', function () {
        let page = HomeCore.pagee - 1;

        HomeCore.loadProducts(page);

    });
    $(document).on('click', '#pageRight', function () {
        let page = HomeCore.pagee + 1;

        HomeCore.loadProducts(page);

    });
    $(document).on('click', '#pageLeftEnd', function () {
        let page = 1;

        HomeCore.loadProducts(page);

    });
    $(document).on('click', '#pageRightEnd', function () {
        let page = HomeTable.pages;

        HomeCore.loadProducts(page);

    });
    $(document).on('click', '#btn-page, #pageLeft, #pageRight, #pageLeftEnd, #pageRightEnd', function () {
        HomeTable.scrollToTop();
    });

});