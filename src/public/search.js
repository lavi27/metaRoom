let search = document.getElementsByClassName("search")[0];
let searchInput = search.getElementsByClassName("searchInput")[0];
let searchIcon = search.getElementsByClassName("searchIcon")[0];
let searchLoading = search.getElementsByClassName("searchLoading")[0];

searchInput.addEventListener('input', (event) => {
    searchLoading.style.display = "block";
    searchIcon.style.display = "none";
    setTimeout(() => {
        searchLoading.style.display = "none";
        searchIcon.style.display = "block";
        searchIcon.src = "/public/play.svg";
        // searchIcon.src = "/public/question-mark.svg";
    }, 1000);
});