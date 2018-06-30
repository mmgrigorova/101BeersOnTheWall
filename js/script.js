    $(document).ready(function () {
        var urlBuilder = (() => {
            var defaultPerPage = 6;
            var endPoint = 'https://api.punkapi.com/v2/';
            var pageNum = '';
            var currentPage = 0;
            var perPageCount = '';
            var beerName = '';

            var buildURL = function (pageNumParam, perPageCountParam, beerNameParam) {
                beerName = '';
                if (pageNumParam > 1) {
                    pageNum = 'page=' + pageNumParam;
                    setCurrentPage(pageNumParam);
                } else {
                    pageNum = 'page=' + 1;
                    setCurrentPage(1);
                }

                if (perPageCountParam) {
                    perPageCount = '&per_page=' + perPageCountParam;
                } else {
                    perPageCount = '&per_page=' + defaultPerPage;
                }

                if (beerNameParam === undefined) {
                    beerName = '&beer_name=' + beerNameParam;
                } else {
                    beerName = '';
                }

                var query = 'beers?' + pageNum + perPageCount + beerName;
                var newURL = new URL(endPoint + query);
                return newURL;
            }

            var getCurrentPage = function () {
                return parseInt(currentPage);
            }

            var setCurrentPage = function (currentPageNum) {
                currentPage = currentPageNum;
            }

            var getDefaultPerPage = function () {
                return defaultPerPage;
            }

            var getBeerName = function () {
                return beerName;
            }

            return {
                setCurrentPage,
                getCurrentPage,
                getDefaultPerPage,
                getBeerName,
                buildURL
            }
        })();

        var beers = [];
        var $beerContainer = $("#beers-container");
        var favoriteHandler = (() => {
            var toggleFavourite = function (beerid) {
                var $beer = $("#" + beerid);
                var $favIcon = $("#" + beerid + " .favourite-holder");
                if ($beer.hasClass("favourite")) {
                    $beer.removeClass("favourite");
                    $favIcon.animate({
                        "background-position": "0px"
                    }, 300, function () {});
                } else {
                    $beer.addClass("favourite");
                    $favIcon.animate({
                        "background-position": "-43px"
                    }, 300, function () {});
                }
            }

            var displayFavouritesOnly = false;
            $("a#favourites-call").on("click", function (element) {
                element.preventDefault();
                var $beerBox = $(".beer-box");

                if (!displayFavouritesOnly) {
                    $beerBox.each(function () {
                        if (!$(this).hasClass("favourite")) {
                            $(this).hide();
                        }
                    });
                    displayFavouritesOnly = true;
                } else {
                    $beerBox.show();
                    displayFavouritesOnly = false;
                }
            });

            return {
                toggleFavourite
            }
        })();

        var $previous = $(".previous");
        var $next = $(".next");
        var loader = (() => {
            var $loadingMessage = "<p class='loading-message'><i class='fas fa-spinner'></i> We are getting your beers...</p>";
            var $noResultMessage = "<div class='no-result-message'><p><i class='far fa-frown'></i> Sorry</p><p>No beers have been found.</p></div>"
            var beersCount;
            var loadBeersFromJSON = function (url) {
                $beerContainer.html($loadingMessage);
                $.getJSON(url, function (data) {
                    beers = [];
                    beers.push(data);
                    beersCount = beers[0].length;
                    if (beersCount > 1) {
                        readBeers(beers);
                        $(".loading-message").remove();
                    } else {
                        console.log("No beers :(");
                        beersCount = 0;
                        $beerContainer.html($noResultMessage);
                    }
                    paging.initializePaging();
                }, "jsonp");

            };

            var populateBeerContainer = function (beer) {
                $beerContainer.append(
                    $("<article></article>")
                    .addClass("beer-box")
                    .attr("id", beer.id)
                );

                var $article = $(".beer-box#" + beer.id);

                $article.append(
                    $("<div></div>")
                    .addClass("favourite-holder")
                    .on("click", function () {
                        var $beerid = $(this).parent().attr("id");
                        favoriteHandler.toggleFavourite($beerid);
                    })
                );


                $article.append($("<img />")
                    .attr("src", beer.image_url)
                    .attr("alt", beer.name)
                );

                $article.append(
                    $("<h1></h1>")
                    .addClass("beer-name")
                    .html(beer.name)
                );

                $article.append($("<h2></h2>")
                    .addClass("center")
                    .html(beer.tagline)
                );

                $article.append(
                    $("<div></div>")
                    .addClass("beer-abv")
                    .html("ABV: " + beer.abv)
                );

                $article.append(
                    $("<a></a>")
                    .addClass("more-info")
                    .attr("href", "")
                    .html("more info")
                    .on("click", function (e) {
                        console.log($beerid);
                        var $beerid = $(this).parent().attr("id");
                        e.preventDefault();
                        modal.populateModal($beerid);
                        modal.openModal($beerid);
                    })

                );
            }

            function readBeers(beers) {
                if (beers) {
                    for (var i = 0; i < beers[0].length; i++) {
                        var beer = beers[beers.length - 1][i];
                        populateBeerContainer(beer);
                    }
                }
            };

            return {
                beersCount,
                loadBeersFromJSON
            }
        })();

        var $modal = $(".modal-background");
        var $content = $(".modal-content");
        var modal = (() => {
            var getBeer = function (beerid) {
                for (var i = 0; i < beers[0].length; i++) {
                    var beer = beers[0][i];
                    if (beer.id == beerid) {
                        return beer;
                    }
                }
            }

            var populateModal = function (beerid) {
                $modal.attr("id", beerid);
                var beerItem = getBeer(beerid);
                $(".modal-content .beer-name").html(beerItem.name);
                $(".modal-content .modal-img")
                    .attr("src", beerItem.image_url);
                $(".modal-content h2").html(beerItem.tagline);
                $(".modal-content .beer-abv").html("ABV: " + beerItem.abv);
                $(".modal-content .beer-description").html(beerItem.description);
                $(".modal-content .beer-tips").html(beerItem.brewers_tips);
                $(".modal-content .food-pair+ul")
                    .html(function () {
                        beerItem.food_pairing.forEach(element => {
                            $("<li></li>")
                                .html(element)
                                .appendTo(".food-pair+ul")
                        });
                    })
            }

            var openModal = function (beerid) {
                $modal.fadeIn(300);
                $content.fadeIn(300);
            }

            var closeHandler = function (event) {
                var target = $(event.target);
                if (target.is($modal) || event.which == 27) {
                    $content.fadeOut(300);
                    $modal.fadeOut(300);
                };
            };

            return {
                $modal,
                populateModal,
                openModal,
                closeHandler
            }
        })();

        var paging = (() => {
            var disablePaging = function ($element) {
                $element.addClass("disabled");
                $element.on("click", function (event) {
                    event.preventDefault();
                });
            }

            var initializePaging = function () {
                if (urlBuilder.getCurrentPage() === 1) {
                    disablePaging($previous);
                }

                if (urlBuilder.getCurrentPage() > 1) {
                    $previous.removeClass("disabled");
                }

                if (loader.beersCount < urlBuilder.getDefaultPerPage) {
                    disablePaging($next);
                }
            }

            var getPage = function (direction) {
                var newPage = parseInt(urlBuilder.getCurrentPage()) + parseInt(direction);
                urlBuilder.setCurrentPage(newPage);

                url = urlBuilder.buildURL(newPage, urlBuilder.getDefaultPerPage(), urlBuilder.getBeerName());
                $beerContainer.empty;
                loader.loadBeersFromJSON(url);
                initializePaging();
            }

            return {
                getPage,
                initializePaging,
            }
        })();

        var url = urlBuilder.buildURL(urlBuilder.getCurrentPage(), urlBuilder.getDefaultPerPage(), '');
        loader.loadBeersFromJSON(url);

        $previous.on("click", function (event) {
            event.preventDefault();
            paging.getPage(-1);
        });
        $next.on("click", function (event) {
            event.preventDefault();
            paging.getPage(1);
        });

        $modal.on("click", modal.closeHandler);
        $(document).on("keyup", modal.closeHandler);

        var searchByName = function (element) {
            var $name = element.val();

            $beerContainer.empty();
            if ($name === '') {
                url = urlBuilder.buildURL(1, urlBuilder.getDefaultPerPage(), '');
            } else {
                url = urlBuilder.buildURL(1, urlBuilder.getDefaultPerPage(), $name);
            }
            loader.loadBeersFromJSON(url);
        };

        var $searchInput = $("#search-input");
        var $search = $("#search");

        $search.on("click", function (event) {
            event.preventDefault();
            searchByName($searchInput);
        });
    });