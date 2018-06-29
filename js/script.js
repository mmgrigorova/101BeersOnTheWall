$(document).ready(function () {
    var endPoint = 'https://api.punkapi.com/v2/';
    // var endPoint = 'file:///test.json';
    var query = 'beers?page=1&per_page=5';
    // var query = 'beers?page=1&per_page=80';
    // var query = 'beers';
    var url = new URL(endPoint + query);
    // var url = new URL(endPoint);

    var beers = [];
    var foodPair = 'This beer will go perfectly with:';

    $.getJSON(url, function (data) {
        beers.push(data);
        console.log('success');
        readBeers(beers);
    }, "jsonp");

    var populateBeerContainer = function (beer) {
        $("#beers-container").append(
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
            // console.log(beers);
            for (var i = 0; i < beers[0].length; i++) {
                var beer = beers[0][i];
                // console.log(beer.name);
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

    $modal.on("click", function (event) {
        var target = $(event.target);
        if (target.is($modal)) {
            $content.fadeOut(300);
            $modal.fadeOut(300);
        }
    });

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

});