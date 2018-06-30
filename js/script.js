$(document).ready(function () {
    var endPoint = 'https://api.punkapi.com/v2/';
    var query = 'beers?page=1&per_page=12';
    // var query = 'beers?page=1&per_page=80';
    // var query = 'beers';
    var url = new URL(endPoint + query);

    var beers = [];
    var $beerContainer = $("#beers-container");
    var $loadingMessage = "<p class='loading-message'>We are getting your beers...</p>";
    var $noResultMessage = "<p class='no-result-message'>We are getting your beers...</p>"

    var loadBeersFromJSON = function (url) {
        $beerContainer.html($loadingMessage);
        $.getJSON(url, function (data) {
            beers.push(data);
            console.log('success');
            if (data.length > 0) {
                readBeers(beers);
                $(".loading-message").remove();
            } else {
                $beerContainer.html($noResultMessage);
            }
        }, "jsonp")
    };

    loadBeersFromJSON(url);

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
                toggleFavourite($beerid);
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
                populateModal($beerid);
                openModal($beerid);
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

    //
    // Modal Handler
    //

    var $modal = $(".modal-background");
    var $content = $(".modal-content");

    var getBeer = function (beerid) {
        for (var i = 0; i < beers[0].length; i++) {
            var beer = beers[0][i];
            // console.log(beerid);
            // console.log(beer);
            if (beer.id == beerid) {
                return beer;
            }
        }
    }

    var populateModal = function (beerid) {
        $modal.attr("id", beerid);
        var beerItem = getBeer(beerid);
        // console.log(beerItem);
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
        // console.log(beerid);
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

    $modal.on("click", closeHandler);
    $(document).on("keyup", closeHandler);

    //
    // Favourites handler
    //

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
        console.log(element);
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

    //
    // Search handler
    //

    var searchByName = function (element) {

        var $name = element.val();
        var nameQuery = "beers?page=1&per_page=80&beer_name=" + $name;
        var searchURL = endPoint + nameQuery;

        $beerContainer.empty();
        if ($name === '') {
            loadBeersFromJSON(url);
        } else {
            loadBeersFromJSON(searchURL);
        }
        // if(response.length === []){
        //     $beerContainer.html("<p>Sorry :(</p><p> No beers with this name have been found</p>");
        // }
        console.log(beers);


    };

    var $searchInput = $("#search-input");
    var $search = $("#search");

    $search.on("click", function (event) {
        event.preventDefault();
        searchByName($searchInput);
    });
});