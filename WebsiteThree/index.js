const currentPath = window.location.pathname.split("/").pop() || "index.html";
const navList = document.querySelector(".nav-links");
const menuButton = document.querySelector(".hamburger");
const navPanel = document.querySelector(".nav-panel");
const searchInput = document.querySelector(".search input");
const recipeDirectory = document.querySelector(".country-directory");
const countryGroups = document.querySelectorAll(".country-group");
const countryCards = document.querySelectorAll(".country-card");
const noResultsMessage = document.querySelector(".search-empty");

if (navList && !navList.querySelector('a[href="world-gallery.html"]')) {
    const galleryItem = document.createElement("li");
    const galleryLink = document.createElement("a");

    galleryLink.href = "world-gallery.html";
    galleryLink.textContent = "World Gallery";

    if (currentPath === "world-gallery.html") {
        galleryLink.classList.add("active");
        galleryLink.setAttribute("aria-current", "page");
    }

    galleryItem.appendChild(galleryLink);
    navList.appendChild(galleryItem);
}

const navLinks = document.querySelectorAll(".nav-links a");

if (menuButton && navPanel) {
    const syncMenuState = (isOpen) => {
        menuButton.classList.toggle("is-open", isOpen);
        navPanel.classList.toggle("is-open", isOpen);
        menuButton.setAttribute("aria-expanded", String(isOpen));

        if (window.innerWidth <= 768) {
            navPanel.setAttribute("aria-hidden", String(!isOpen));
        } else {
            navPanel.removeAttribute("aria-hidden");
        }
    };

    const closeMenu = () => {
        syncMenuState(false);
    };

    syncMenuState(false);

    menuButton.addEventListener("click", () => {
        syncMenuState(!navPanel.classList.contains("is-open"));
    });

    menuButton.addEventListener("keydown", (event) => {
        if (event.key !== "Escape") {
            return;
        }

        closeMenu();
        menuButton.focus();
    });

    navLinks.forEach((link) => {
        link.addEventListener("click", closeMenu);
    });

    document.addEventListener("click", (event) => {
        if (window.innerWidth > 768 || !navPanel.classList.contains("is-open")) {
            return;
        }

        if (navPanel.contains(event.target) || menuButton.contains(event.target)) {
            return;
        }

        closeMenu();
    });

    window.addEventListener("resize", () => {
        if (window.innerWidth > 768) {
            closeMenu();
            return;
        }

        navPanel.setAttribute("aria-hidden", String(!navPanel.classList.contains("is-open")));
    });

    document.addEventListener("keydown", (event) => {
        if (event.key !== "Escape" || !navPanel.classList.contains("is-open")) {
            return;
        }

        closeMenu();
        menuButton.focus();
    });
}

if (searchInput) {
    const recipePagePath = "recipes.html";

    const applyRecipeFilter = (value) => {
        if (!recipeDirectory || !countryCards.length) {
            return;
        }

        const query = value.trim().toLowerCase();
        let visibleCards = 0;

        countryCards.forEach((card) => {
            const searchableText = [
                card.querySelector(".country-region-tag")?.textContent ?? "",
                card.querySelector("h3")?.textContent ?? "",
                card.querySelector("p")?.textContent ?? "",
            ]
                .join(" ")
                .toLowerCase();

            const isMatch = !query || searchableText.includes(query);
            card.classList.toggle("is-hidden", !isMatch);

            if (isMatch) {
                visibleCards += 1;
            }
        });

        countryGroups.forEach((group) => {
            const hasVisibleCard = group.querySelector(".country-card:not(.is-hidden)");
            group.classList.toggle("is-hidden", !hasVisibleCard);
        });

        if (noResultsMessage) {
            const shouldShowEmpty = Boolean(query) && visibleCards === 0;
            noResultsMessage.hidden = !shouldShowEmpty;
        }
    };

    const updateRecipeQuery = (value) => {
        if (!recipeDirectory) {
            return;
        }

        const query = value.trim();
        const url = new URL(window.location.href);

        if (query) {
            url.searchParams.set("search", query);
        } else {
            url.searchParams.delete("search");
        }

        history.replaceState({}, "", `${url.pathname}${url.search}${url.hash}`);
    };

    const redirectToRecipeSearch = (value) => {
        const query = value.trim();
        const targetUrl = new URL(recipePagePath, window.location.href);

        if (query) {
            targetUrl.searchParams.set("search", query);
        }

        targetUrl.hash = "country-pages";
        window.location.href = targetUrl.toString();
    };

    if (recipeDirectory) {
        const currentQuery = new URLSearchParams(window.location.search).get("search") ?? "";
        searchInput.value = currentQuery;
        applyRecipeFilter(currentQuery);

        searchInput.addEventListener("input", (event) => {
            const nextValue = event.target.value;
            applyRecipeFilter(nextValue);
            updateRecipeQuery(nextValue);
        });
    } else {
        searchInput.addEventListener("keydown", (event) => {
            if (event.key !== "Enter") {
                return;
            }

            event.preventDefault();
            redirectToRecipeSearch(event.target.value);
        });
    }

    searchInput.addEventListener("focus", () => {
        if (window.innerWidth <= 768 && navPanel && !navPanel.classList.contains("is-open")) {
            navPanel.classList.add("is-open");
            menuButton?.classList.add("is-open");
            menuButton?.setAttribute("aria-expanded", "true");
            navPanel.setAttribute("aria-hidden", "false");
        }
    });

    if (recipeDirectory && currentPath === recipePagePath) {
        searchInput.setAttribute("placeholder", "Type to filter recipes...");
    }
}
