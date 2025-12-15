$(() => {
    const baseURL = "https://jsonfakery.com/movies/infinite-scroll";
    let page = 1;
    let loading = false;
    let showingFavorites = false;
    const $movieList = $(".movie-list");

    $('main').append('<div id="loading-indicator" style="text-align: center; padding: 20px; display: none; color: white">Loading...</div>');
    const $loadingIndicator = $("#loading-indicator");

    const getFavorites = () => JSON.parse(localStorage.getItem("favorites")) || [];
    const saveFavorites = (favs) => localStorage.setItem("favorites", JSON.stringify(favs));
    const isFavorite = (title) => getFavorites().includes(title);

    const loadMovies = () => {
        if (loading || showingFavorites) return;
        
        loading = true;
        $loadingIndicator.show(); 

        $.ajax({
            url: `${baseURL}?page=${page}`,
            method: "GET",
            success: (response) => {
                response.data.forEach(movie => {
                    const isFav = isFavorite(movie.original_title);
                    const favClass = isFav ? "fa-solid" : "fa-regular";

                    const li = $(`
                        <li class="movie-item" data-id="${movie.id}" data-title="${movie.original_title}" data-rating="${movie.vote_average}">
                            <div class="item-content">
                                <img src="${movie.poster_path}" alt="${movie.original_title}" />
                                <div class="movie-info">
                                    <h2 class="movie-title">${movie.original_title}</h2>
                                    <div>
                                        <p data-name="date">${movie.release_date}</p>
                                        <p>IMDb: <span data-name="rating-value">${movie.vote_average}</span></p>
                                    </div>
                                </div>
                                <button class="fav-btn" data-title="${movie.original_title}">
                                    <i class="${favClass} fa-heart"></i>
                                </button>
                                <button class="detail-btn"
                                    data-title="${movie.original_title}"
                                    data-date="${movie.release_date}"
                                    data-overview="${movie.overview}"
                                    data-rating="${movie.vote_average}"
                                    data-img="${movie.poster_path}">
                                    View Details
                                </button>
                            </div>
                        </li>
                    `);
                    $movieList.append(li);
                });
                page++;
                loading = false;
                $loadingIndicator.hide(); 
            },
            error: (err) => {
                console.error(err);
                loading = false;
                $loadingIndicator.hide(); 
            }
        });
    };

    $(window).on("scroll", () => {
        if (!showingFavorites && !loading && $(window).scrollTop() + $(window).height() >= $(document).height() - 100) {
            loadMovies();
        }
    });

    $(document).on("click", ".fav-btn", function () {
        const title = $(this).data("title");
        let favs = getFavorites();
        const $icon = $(this).find("i");

        if (isFavorite(title)) {
            favs = favs.filter(f => f !== title);
            $icon.toggleClass("fa-solid fa-regular");
        } else {
            favs.push(title);
            $icon.toggleClass("fa-regular fa-solid");
        }
        
        saveFavorites(favs);

        if (showingFavorites) {
            $(this).closest(".movie-item").hide();
        }
    });

    $(document).on("click", ".detail-btn", function () {
        const $btn = $(this);
        const title = $btn.data("title");
        const date = $btn.data("date");
        const rating = $btn.data("rating");
        const img = $btn.data("img");
        const overview = $btn.data("overview");

        $("#movieModal .modal-title").text(title);
        
        $("#movieModal .modal-body").html(`
            <img src="${img}" class="img-fluid mb-3" style="border-radius:8px;">
            <div>
                <div>
                    <p><strong>Release Date:</strong> ${date}</p>
                    <p><strong>IMDb Rating:</strong> ${rating}</p>
                </div>
                <p>${overview}</p>
            </div>
        `);

        $("#movieModal").modal("show");
    });

    $("#searchInput").on("keyup", function () {
        const query = $(this).val().toLowerCase();
        $(".movie-item").each(function () {
            const title = $(this).data("title").toLowerCase();
            $(this).toggle(title.includes(query));
        });
    });

    $("#showFavorites").on("click", function () {
        const $btn = $(this);
        showingFavorites = !showingFavorites;

        if (showingFavorites) {
            const favs = getFavorites();
            $(".movie-item").each(function () {
                const title = $(this).data("title");
                $(this).toggle(favs.includes(title));
            });
            $btn.toggleClass("btn-outline-danger btn-danger").text("Show All");
        } else {
            $(".movie-item").show();
            $btn.toggleClass("btn-danger btn-outline-danger").html('<i class="fa-solid fa-heart"></i> Favorites');
        }
    });

    $("#ratingSort").on("change", function () {
        const order = $(this).val();
        const movies = $(".movie-item").get();

        movies.sort((a, b) => {
            const ratingA = parseFloat($(a).data("rating"));
            const ratingB = parseFloat($(b).data("rating"));

            if (order === "asc") {
                return ratingA - ratingB;
            } else if (order === "desc") {
                return ratingB - ratingA;
            } else {
                return 0; 
            }
        });

        const $movieList = $(".movie-list").empty();
        $.each(movies, (i, movie) => $movieList.append(movie));
    });

    loadMovies();
});