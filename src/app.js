const resetButton = document.getElementById("resetButton");
const resetModal = document.getElementById("resetModal");
const confirmResetButton = document.getElementById("confirmResetButton");
const cancelResetButton = document.getElementById("cancelResetButton");

const loadButton = document.getElementById("loadButton");
const fileInput = document.getElementById("fileInput");

const viewStyleDropdown = document.getElementById("viewStyleDropdown");
const viewStyleDropdownToggle = document.getElementById("viewStyleDropdownToggle");
const viewStyleDropdownToggleLabel = document.getElementById("viewStyleDropdownToggleLabel");
const viewStyleDropdownMenu = document.getElementById("viewStyleDropdownMenu");

const showItemsDropdown = document.getElementById("showItemsDropdown");
const showItemsDropdownToggle = document.getElementById("showItemsDropdownToggle");
const showItemsDropdownMenu = document.getElementById("showItemsDropdownMenu");
const fullyResearchedCheckbox = document.getElementById("fullyResearchedCheckbox");
const partiallyResearchedCheckbox = document.getElementById("partiallyResearchedCheckbox");
const notResearchedCheckbox = document.getElementById("notResearchedCheckbox");
const unobtainableCheckbox = document.getElementById("unobtainableCheckbox");

const pageSizeDropdown = document.getElementById("pageSizeDropdown");
const pageSizeDropdownToggle = document.getElementById("pageSizeDropdownToggle");
const pageSizeDropdownToggleLabel = document.getElementById("pageSizeDropdownToggleLabel");
const pageSizeDropdownMenu = document.getElementById("pageSizeDropdownMenu");

const searchInput = document.getElementById("searchInput");
const searchResetButton = document.getElementById("searchResetButton");

const sortByDropdown = document.getElementById("sortByDropdown");
const sortByDropdownToggle = document.getElementById("sortByDropdownToggle");
const sortByDropdownToggleLabel = document.getElementById("sortByDropdownToggleLabel");
const sortByDropdownMenu = document.getElementById("sortByDropdownMenu");

const openTagsButton = document.getElementById("openTagsButton");
const tagModal = document.getElementById("tagModal");
const tagContainer = document.getElementById("tagContainer");
const resetTagsButton = document.getElementById("resetTagsButton");
const closeTagsButton = document.getElementById("closeTagsButton");

const playerNameLabel = document.getElementById("playerNameLabel");

const summary = document.getElementById("summary");
const totalItemsLabel = document.getElementById("totalItemsLabel");
const researchedItemsLabel = document.getElementById("researchedItemsLabel");
const missingItemsLabel = document.getElementById("missingItemsLabel");
const unobtainableItemsSummarySection = document.getElementById("unobtainableItemsSummarySection");
const unobtainableItemsLabel = document.getElementById("unobtainableItemsLabel");
const progressBar = document.getElementById("progressBar");
const progressPercentLabel = document.getElementById("progressPercentLabel");

const itemSection = document.getElementById("itemSection");
const itemSectionWrapper = document.getElementById("itemSectionWrapper");
const categoryView = document.getElementById("categoryView");

const paginationSection = document.getElementById("paginationSection");
const paginationPreviousPageButton = document.getElementById("paginationPreviousPageButton");
const paginationPageNumberLabel = document.getElementById("paginationPageNumberLabel");
const paginationNextPageButton = document.getElementById("paginationNextPageButton");

const groupByCategoriesButton = document.getElementById("groupByCategoriesButton");
const scrollToTopButton = document.getElementById("scrollToTopButton");

const autoRefreshRow = document.querySelector(".auto-refresh-row");
const autoRefreshCheckbox = document.getElementById("autoRefreshCheckbox");
const autoRefreshTooltipText = document.getElementById("autoRefreshTooltipText");
const autoRefreshTooltipWrapper = document.querySelector(".auto-refresh-tooltip-wrapper");
const refreshButton = document.getElementById("refreshButton");
const reloadFileHint = document.getElementById("reloadFileHint");

const supportsFilePicker = typeof window.showOpenFilePicker !== "undefined";

const FILE_PICKER_OPTIONS = {
    types: [
        {
            description: "Player File",
            accept: {
                "application/octet-stream": [".plr", ".plr.bak"],
            },
        },
    ],
    excludeAcceptAllOption: true,
    multiple: false,
};

let autoRefreshIntervalId = null;
let autoRefreshFileHandle = null;
let autoRefreshLastModified = null;

////////////////////////////////////////////////////////////////////////////////////////////////////

const itemStorageManager = new LocalStorageManager("terraria-research", structuredClone(allItems));
const settingsStorageManager = new LocalStorageManager("terraria-settings", {
    playerName: "no name",
    viewStyle: "grid",
    groupByCategories: false,
    pageSize: 50,
    pageSizeLabel: "50",
    sortBy: "ID",
    dataLoadedFromPlayerFile: false,
});

const viewSettings = settingsStorageManager.load();
if (viewSettings.viewStyle === "categories") {
    viewSettings.viewStyle = "list";
    viewSettings.groupByCategories = true;
}
if (viewSettings.groupByCategories === undefined) {
    viewSettings.groupByCategories = false;
}
if (viewSettings.dataLoadedFromPlayerFile === undefined) {
    viewSettings.dataLoadedFromPlayerFile = false;
}

let currentPage = 1;

let searchQuery = "";

let showFullyResearched = false;
let showPartiallyResearched = true;
let showNotResearched = true;
let showUnobtainable = false;

let items = itemStorageManager.load();

// If new items added, but the browser cache doesn't have them yet.
allItems.forEach(itemFromAllItems => {
    const foundItem = items.find(item => item.internalName === itemFromAllItems.internalName);
    if (!foundItem) {
        items.push(structuredClone(itemFromAllItems));
    } else {
        if (foundItem.tags !== itemFromAllItems.tags) {
            foundItem.tags = itemFromAllItems.tags;
        }
    }
});

const scrollToTopThreshold = 250;

let selectedTagFilters = {};

/** When in categories view: { categoryOrder, subcategoryOrderByCategory, groups: { [category]: { [subcategory]: item[] } } }. Used for lazy render. */
let categoryViewData = null;

const itemUrlBase = "https://terraria.wiki.gg/wiki/";
const imageUrlBase = "https://terraria.wiki.gg/images/";

playerNameLabel.textContent = viewSettings.playerName;


itemSection.classList.toggle("grid", viewSettings.viewStyle === "grid");
itemSection.classList.toggle("list", viewSettings.viewStyle === "list");
itemSection.classList.toggle("hidden", viewSettings.groupByCategories);
categoryView.classList.toggle("hidden", !viewSettings.groupByCategories);
groupByCategoriesButton.classList.toggle("active", viewSettings.groupByCategories);
updateScrollToTopVisibility();

viewStyleDropdownToggleLabel.innerText = viewSettings.viewStyle.charAt(0).toUpperCase() + viewSettings.viewStyle.slice(1);
pageSizeDropdownToggleLabel.innerText = viewSettings.pageSizeLabel;
sortByDropdownToggleLabel.innerText = viewSettings.sortBy;

fullyResearchedCheckbox.checked = showFullyResearched;
partiallyResearchedCheckbox.checked = showPartiallyResearched;
notResearchedCheckbox.checked = showNotResearched;
unobtainableCheckbox.checked = showUnobtainable;

renderTags();
renderSummary();
render();

updateReloadFileHintVisibility();

autoRefreshTooltipText.textContent = supportsFilePicker
    ? "Auto refresh will reset your manual changes"
    : "Not supported in this browser";
if (!supportsFilePicker) {
    autoRefreshCheckbox.disabled = true;
    refreshButton.disabled = true;
    refreshButton.classList.add("auto-refresh-unsupported");
    autoRefreshTooltipText.classList.add("hidden");
    autoRefreshRow.classList.add("tag-tooltip");
    const rowTooltip = document.createElement("div");
    rowTooltip.className = "tag-tooltip-text auto-refresh-row-tooltip";
    rowTooltip.textContent = "Not supported in this browser";
    autoRefreshRow.appendChild(rowTooltip);
    autoRefreshRow.addEventListener("mouseenter", () => {
        rowTooltip.classList.remove("flip-right");
        const rect = rowTooltip.getBoundingClientRect();
        if (rect.left < 0) {
            rowTooltip.classList.add("flip-right");
        }
    });
} else {
    refreshButton.disabled = true;
}
autoRefreshTooltipWrapper.addEventListener("mouseenter", () => {
    autoRefreshTooltipText.classList.remove("flip-right");
    const rect = autoRefreshTooltipText.getBoundingClientRect();
    if (rect.left < 0) {
        autoRefreshTooltipText.classList.add("flip-right");
    }
});

////////////////////////////////////////////////////////////////////////////////////////////////////

function applyLoadedPlayer(player) {
    viewSettings.playerName = player.name;
    viewSettings.dataLoadedFromPlayerFile = true;
    playerNameLabel.textContent = viewSettings.playerName;
    itemStorageManager.save(player.researchProgress.items);
    settingsStorageManager.save(viewSettings);
    items = player.researchProgress.items;
    selectedTagFilters = {};
    openTagsButton.classList.toggle("active", false);
    currentPage = 1;
    renderTags();
    renderSummary();
    render();
}

function updateReloadFileHintVisibility() {
    const show =
        supportsFilePicker &&
        viewSettings.dataLoadedFromPlayerFile === true &&
        !autoRefreshFileHandle;
    reloadFileHint.classList.toggle("hidden", !show);
}

async function loadFromFileHandle(handle) {
    const file = await handle.getFile();
    const playerDeserializer = new PlayerDeserializer();
    const player = await playerDeserializer.deserializePlayer(await file.arrayBuffer());
    applyLoadedPlayer(player);
    autoRefreshFileHandle = handle;
    autoRefreshLastModified = file.lastModified;
    refreshButton.disabled = false;
    updateReloadFileHintVisibility();
}

////////////////////////////////////////////////////////////////////////////////////////////////////

resetButton.addEventListener("click", () => {
    resetModal.classList.toggle("hidden", false);
});

cancelResetButton.addEventListener("click", () => {
    resetModal.classList.toggle("hidden", true);
});

resetModal.addEventListener("click", (e) => {
    if (e.target === resetModal) {
        resetModal.classList.toggle("hidden", true);
    }
});

confirmResetButton.addEventListener("click", () => {
    resetModal.classList.toggle("hidden", true);

    items = itemStorageManager.reset();
    Object.assign(viewSettings, settingsStorageManager.reset());
    selectedTagFilters = {};
    openTagsButton.classList.toggle("active", false);
    playerNameLabel.textContent = "no name";
    searchQuery = "";
    searchInput.value = "";
    currentPage = 1;
    updateSearchResetVisibility();

    showFullyResearched = false;
    fullyResearchedCheckbox.checked = false;
    showPartiallyResearched = true;
    partiallyResearchedCheckbox.checked = true;
    showNotResearched = true;
    notResearchedCheckbox.checked = true;
    showUnobtainable = false;
    unobtainableCheckbox.checked = false;

    itemSection.classList.toggle("grid", viewSettings.viewStyle === "grid");
    itemSection.classList.toggle("list", viewSettings.viewStyle === "list");
    itemSection.classList.toggle("hidden", viewSettings.groupByCategories);
    categoryView.classList.toggle("hidden", !viewSettings.groupByCategories);
    groupByCategoriesButton.classList.toggle("active", viewSettings.groupByCategories);
    updateScrollToTopVisibility();
    viewStyleDropdownToggleLabel.innerText = viewSettings.viewStyle.charAt(0).toUpperCase() + viewSettings.viewStyle.slice(1);

    renderTags();
    renderSummary();
    render();
    updateReloadFileHintVisibility();
});

fileInput.addEventListener("change", async () => {
    const file = fileInput.files[0];
    if (!file) return;

    const playerDeserializer = new PlayerDeserializer();
    let player;
    try {
        player = await playerDeserializer.deserializePlayer(await file.arrayBuffer());
    } catch (error) {
        fileInput.value = "";
        return;
    }
    applyLoadedPlayer(player);
    fileInput.value = "";
    updateReloadFileHintVisibility();
});

viewStyleDropdownToggle.addEventListener("click", () => {
    viewStyleDropdown.classList.toggle("open", !viewStyleDropdown.classList.contains("open"));
});

viewStyleDropdownMenu.querySelectorAll(".dropdown-select").forEach(viewSelect => {
    viewSelect.addEventListener("click", (e) => {
        viewStyleDropdown.classList.toggle("open", !viewStyleDropdown.classList.contains("open"));
        const newViewStyle = e.target.dataset.value;
        if (newViewStyle != viewSettings.viewStyle) {
            viewSettings.viewStyle = newViewStyle;
            itemSection.classList.toggle("grid", viewSettings.viewStyle === "grid");
            itemSection.classList.toggle("list", viewSettings.viewStyle === "list");
            itemSection.classList.toggle("hidden", viewSettings.groupByCategories);
            categoryView.classList.toggle("hidden", !viewSettings.groupByCategories);
            updateScrollToTopVisibility();
            viewStyleDropdownToggleLabel.innerText = newViewStyle.charAt(0).toUpperCase() + newViewStyle.slice(1);
            settingsStorageManager.save(viewSettings);
            render();
        }
    })
});

groupByCategoriesButton.addEventListener("click", () => {
    viewSettings.groupByCategories = !viewSettings.groupByCategories;
    settingsStorageManager.save(viewSettings);
    itemSection.classList.toggle("hidden", viewSettings.groupByCategories);
    categoryView.classList.toggle("hidden", !viewSettings.groupByCategories);
    groupByCategoriesButton.classList.toggle("active", viewSettings.groupByCategories);
    updateScrollToTopVisibility();
    render();
});

showItemsDropdownToggle.addEventListener("click", () => {
    showItemsDropdown.classList.toggle("open", !showItemsDropdown.classList.contains("open"));
});

pageSizeDropdownToggle.addEventListener("click", () => {
    pageSizeDropdown.classList.toggle("open", !pageSizeDropdown.classList.contains("open"));
});

pageSizeDropdownMenu.querySelectorAll(".dropdown-select").forEach(sizeSelect => {
    sizeSelect.addEventListener("click", (e) => {
        pageSizeDropdown.classList.toggle("open", !pageSizeDropdown.classList.contains("open"));
        const newPageSize = Number(e.target.dataset.value);
        if (newPageSize != viewSettings.pageSize) {
            viewSettings.pageSize = newPageSize;
            viewSettings.pageSizeLabel = e.target.innerText;
            pageSizeDropdownToggleLabel.innerText = e.target.innerText;
            currentPage = 1;
            settingsStorageManager.save(viewSettings);
            render();
        }
    })
});

sortByDropdownToggle.addEventListener("click", () => {
    sortByDropdown.classList.toggle("open", !sortByDropdown.classList.contains("open"));
});

sortByDropdownMenu.querySelectorAll(".dropdown-select").forEach(sortSelect => {
    sortSelect.addEventListener("click", (e) => {
        sortByDropdown.classList.toggle("open", !sortByDropdown.classList.contains("open"));
        const newSortBy = e.target.dataset.value;
        if (newSortBy != viewSettings.sortBy) {
            viewSettings.sortBy = newSortBy;
            sortByDropdownToggleLabel.innerText = newSortBy;
            currentPage = 1;
            settingsStorageManager.save(viewSettings);
            render();
        }
    })
})

document.addEventListener("click", (e) => {
    if (!showItemsDropdown.contains(e.target)) {
        showItemsDropdown.classList.toggle("open", false);
    }
    if (!pageSizeDropdown.contains(e.target)) {
        pageSizeDropdown.classList.toggle("open", false);
    }
    if (!viewStyleDropdown.contains(e.target)) {
        viewStyleDropdown.classList.toggle("open", false);
    }
    if (!sortByDropdown.contains(e.target)) {
        sortByDropdown.classList.toggle("open", false);
    }
});

fullyResearchedCheckbox.addEventListener("change", (e) => {
    showFullyResearched = e.target.checked;
    currentPage = 1;
    render();
});

partiallyResearchedCheckbox.addEventListener("change", (e) => {
    showPartiallyResearched = e.target.checked;
    currentPage = 1;
    render();
});

notResearchedCheckbox.addEventListener("change", (e) => {
    showNotResearched = e.target.checked;
    currentPage = 1;
    render();
});

unobtainableCheckbox.addEventListener("change", (e) => {
    showUnobtainable = e.target.checked;
    currentPage = 1;
    updateTagFiltersFromUI();
});

loadButton.addEventListener("click", async () => {
    if (supportsFilePicker) {
        try {
            const [handle] = await window.showOpenFilePicker(FILE_PICKER_OPTIONS);
            await loadFromFileHandle(handle);
        } catch (err) {
            if (err.name !== "AbortError") {
                console.error("Load player file:", err);
            }
        }
    } else {
        fileInput.click();
    }
});

refreshButton.addEventListener("click", async () => {
    if (!autoRefreshFileHandle) return;
    try {
        const file = await autoRefreshFileHandle.getFile();
        if (file.lastModified === autoRefreshLastModified) return;
        const playerDeserializer = new PlayerDeserializer();
        const player = await playerDeserializer.deserializePlayer(await file.arrayBuffer());
        applyLoadedPlayer(player);
        autoRefreshLastModified = file.lastModified;
    } catch (err) {
        console.error("Refresh from file:", err);
    }
});

autoRefreshCheckbox.addEventListener("change", () => {
    if (autoRefreshCheckbox.checked) {
        if (autoRefreshFileHandle) {
            autoRefreshIntervalId = setInterval(async () => {
                if (!autoRefreshFileHandle) return;
                try {
                    const file = await autoRefreshFileHandle.getFile();
                    if (file.lastModified === autoRefreshLastModified) return;
                    const playerDeserializer = new PlayerDeserializer();
                    const player = await playerDeserializer.deserializePlayer(await file.arrayBuffer());
                    applyLoadedPlayer(player);
                    autoRefreshLastModified = file.lastModified;
                } catch (err) {
                    console.error("Auto refresh:", err);
                }
            }, 10000);
        }
    } else {
        if (autoRefreshIntervalId !== null) {
            clearInterval(autoRefreshIntervalId);
            autoRefreshIntervalId = null;
        }
    }
});

function updateSearchResetVisibility() {
    searchResetButton.classList.toggle("hidden", searchInput.value.length === 0);
}

searchInput.addEventListener("input", () => {
    searchQuery = searchInput.value.toLowerCase();
    updateSearchResetVisibility();
    currentPage = 1;
    render();
});

searchResetButton.addEventListener("click", () => {
    searchInput.value = "";
    searchQuery = "";
    currentPage = 1;
    updateSearchResetVisibility();
    render();
});

paginationPreviousPageButton.addEventListener("click", () => {
    if (currentPage > 1) {
        currentPage--;
        render();
        searchInput.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });
    }
});

paginationNextPageButton.addEventListener("click", () => {
    if (currentPage < Math.ceil(items.length / viewSettings.pageSize)) {
        currentPage++;
        render();
        searchInput.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });
    }
});

function updateScrollToTopVisibility() {
    const show = window.scrollY > scrollToTopThreshold;
    scrollToTopButton.classList.toggle("hidden", !show);
}

scrollToTopButton.addEventListener("click", () => {
    searchInput.scrollIntoView({ block: "start", behavior: "smooth" });
});

window.addEventListener("scroll", () => {
    updateScrollToTopVisibility();
}, { passive: true });

openTagsButton.addEventListener("click", () => {
    tagModal.classList.toggle("hidden", false);
});

closeTagsButton.addEventListener("click", () => {
    tagModal.classList.toggle("hidden", true);
});

resetTagsButton.addEventListener("click", () => {
    tagContainer.querySelectorAll("input[type='checkbox']").forEach(cb => {
        cb.checked = false;
        cb.indeterminate = false;
    });
    updateTagFiltersFromUI();
});

tagModal.addEventListener("click", (e) => {
    if (e.target === tagModal) {
        tagModal.classList.toggle("hidden", true);
    }
})

function renderTags() {
    tagContainer.innerHTML = "";

    Object.entries(allTags).forEach(([tag, subtags]) => {
        const tagGroup = document.createElement("div");
        tagGroup.className = "tag-group";

        const tagCheckboxContainer = createTagCheckbox(tag, null);
        tagGroup.append(tagCheckboxContainer);

        const subtagsContainer = document.createElement("div");
        subtagsContainer.className = "subtags";

        subtags.forEach(subtag => {
            const subtagCheckboxContainer = createTagCheckbox(tag, subtag);
            subtagsContainer.append(subtagCheckboxContainer);
            const subtagCheckbox = subtagCheckboxContainer.querySelector('input[type="checkbox"]');

            subtagCheckbox.addEventListener("change", () => {
                updateTagParentState(tag);
                updateTagFiltersFromUI();
            });
        })

        const tagCheckbox = tagCheckboxContainer.querySelector('input[type="checkbox"]')
        tagCheckbox.addEventListener("change", () => {
            const checked = tagCheckbox.checked;

            subtagsContainer.querySelectorAll('input[type="checkbox"]').forEach(subtagCheckbox => {
                subtagCheckbox.checked = checked;
            })

            tagCheckbox.indeterminate = false;
            updateTagFiltersFromUI();
        });

        tagGroup.append(subtagsContainer);
        tagContainer.append(tagGroup);
    })
}

function updateTagParentState(tag) {
    const tagGroup = [...tagContainer.querySelectorAll(".tag-group")].find(g => g.querySelector(`input[data-tag="${tag}"]`));
    const parentTag = tagGroup.querySelector(`input[data-tag="${tag}"]:not([data-subtag])`);
    const subtags = Array.from(tagGroup.querySelectorAll(`input[data-subtag]`));

    if (!subtags.length) {
        return;
    }

    const checkedCount = subtags.filter(c => c.checked).length;

    if (checkedCount === 0) {
        parentTag.checked = false;
        parentTag.indeterminate = false;
    } else if (checkedCount === subtags.length) {
        parentTag.checked = true;
        parentTag.indeterminate = false;
    } else {
        parentTag.checked = false;
        parentTag.indeterminate = true;
    }
}


function updateTagFiltersFromUI() {
    const filters = {};

    document.querySelectorAll("#tagContainer input[data-subtag]:checked")
        .forEach(cb => {
            const { tag, subtag } = cb.dataset
            if (!filters[tag]) filters[tag] = []
            filters[tag].push(subtag)
        });

    document.querySelectorAll("#tagContainer input[data-tag]:not([data-subtag]")
        .forEach(parent => {
            const tag = parent.dataset.tag;

            const hasChildren = document.querySelector(
                `#tagContainer input[data-tag="${tag}"][data-subtag]`
            );

            if (!hasChildren && parent.checked) {
                filters[tag] = null
            };
        });

    selectedTagFilters = filters;

    const hasSelection = Object.keys(filters).length > 0;
    openTagsButton.classList.toggle("active", hasSelection);

    currentPage = 1;
    render();
}

/** Returns category order (same as in allTags) plus "Unobtainable" and/or "Other" if needed. */
function getCategoryOrder(visibleItems) {
    const order = Object.keys(allTags);
    const hasUnobtainable = visibleItems.some(item => item.isUnobtainable);
    const hasOther = visibleItems.some(item => !item.isUnobtainable && (!item.tags || Object.keys(item.tags).length === 0 || !Object.keys(item.tags).some(t => allTags[t])));
    const extra = [];
    if (hasUnobtainable) extra.push("Unobtainable");
    if (hasOther) extra.push("Other");
    return extra.length ? [...order, ...extra] : order;
}

/**
 * Groups visible items by category then subcategory. Each item is added to every
 * category/subcategory it belongs to. Order follows allTags.
 * Returns { categoryOrder, groups: { [category]: { subcategoryOrder: string[], itemsBySub: { [subcategory]: item[] } } } }.
 */
function groupVisibleItemsByCategoryAndSubcategory(visibleItems) {
    const categoryOrder = getCategoryOrder(visibleItems);
    const groups = {};

    function ensureGroup(category) {
        if (!groups[category]) {
            groups[category] = { subcategoryOrder: [...(allTags[category] || [])], itemsBySub: {} };
        }
        return groups[category];
    }

    function addItem(category, subcategory, item) {
        const g = ensureGroup(category);
        if (!g.itemsBySub[subcategory]) {
            g.itemsBySub[subcategory] = [];
        }
        g.itemsBySub[subcategory].push(item);
    }

    for (const item of visibleItems) {
        if (item.isUnobtainable) {
            addItem("Unobtainable", "", item);
            continue;
        }

        if (!item.tags || Object.keys(item.tags).length === 0) {
            addItem("Other", "", item);
            continue;
        }

        let addedToKnown = false;
        for (const cat of categoryOrder) {
            if (cat === "Other" || cat === "Unobtainable") continue;
            if (!item.tags[cat]) continue;
            addedToKnown = true;
            const itemSubs = item.tags[cat];
            if (itemSubs.length === 0) {
                addItem(cat, "", item);
            } else {
                for (const sub of itemSubs) {
                    addItem(cat, sub, item);
                }
            }
        }

        if (!addedToKnown) {
            addItem("Other", "", item);
        }
    }

    return { categoryOrder, groups };
}

/** Removes the item from categoryViewData so it won't be rendered when other categories are opened later. */
function removeItemFromCategoryViewData(item) {
    if (!categoryViewData || !categoryViewData.groups) return;
    const { groups } = categoryViewData;
    for (const category of Object.keys(groups)) {
        const itemsBySub = groups[category].itemsBySub;
        for (const sub of Object.keys(itemsBySub)) {
            const arr = itemsBySub[sub];
            const idx = arr.findIndex(i => i.internalName === item.internalName);
            if (idx !== -1) arr.splice(idx, 1);
        }
    }
}

/** Returns the number of unique items (by internalName) in a category across all its subcategories. */
function getCategoryUniqueItemCount(groups, categoryName) {
    const group = groups[categoryName];
    if (!group) return 0;
    const seen = new Set();
    for (const arr of Object.values(group.itemsBySub)) {
        for (const item of arr) {
            seen.add(item.internalName);
        }
    }
    return seen.size;
}

/** Updates the (N) count in every category and subcategory summary to match current item counts. */
function updateCategoryViewCounts() {
    if (!categoryView || !categoryViewData || !categoryViewData.groups) return;
    const groups = categoryViewData.groups;

    function getSummaryName(summaryEl) {
        const text = summaryEl.textContent || "";
        const match = text.match(/^(.+?)\s*\(\d+\)\s*$/);
        return match ? match[1].trim() : text;
    }

    categoryView.querySelectorAll(".category-group").forEach(details => {
        const summary = details.querySelector("summary.category-group-summary");
        if (!summary) return;

        const name = getSummaryName(summary);
        let count = 0;

        if (details.classList.contains("subcategory-group")) {
            const content = details.querySelector(".category-group-content");
            const ul = content && content.querySelector("ul.category-group-items");
            if (ul) {
                count = ul.children.length;
            } else {
                const cat = details.dataset.category;
                const sub = details.dataset.subcategory || "";
                const arr = groups[cat] && groups[cat].itemsBySub[sub];
                count = arr ? arr.length : 0;
            }
        } else {
            const content = details.querySelector(".category-group-content");
            const subDetailsList = content && content.querySelectorAll(":scope > .subcategory-group");
            if (subDetailsList && subDetailsList.length > 0) {
                count = getCategoryUniqueItemCount(groups, details.dataset.category);
            } else {
                const ul = content && content.querySelector("ul.category-group-items");
                if (ul) count = ul.children.length;
                else {
                    const cat = details.dataset.category;
                    count = getCategoryUniqueItemCount(groups, cat);
                }
            }
        }

        summary.textContent = `${name} (${count})`;
    });
}

/** Removes details (subcategory or category) whose item list is empty; if a category loses all subcategories, removes the category too. */
function removeEmptyCategorySections(ulsToCheck) {
    const categoryDetailsToCheck = new Set();
    ulsToCheck.forEach(ul => {
        if (ul.children.length !== 0) return;
        const content = ul.parentElement;
        if (!content || !content.classList.contains("category-group-content")) return;
        const details = content.parentElement;
        if (!details) return;
        const isSubcategory = details.classList.contains("subcategory-group");
        const categoryContent = isSubcategory ? details.parentElement : null;
        details.remove();
        if (isSubcategory && categoryContent && categoryContent.children.length === 0) {
            const categoryDetails = categoryContent.parentElement;
            if (categoryDetails) categoryDetailsToCheck.add(categoryDetails);
        }
    });
    categoryDetailsToCheck.forEach(categoryDetails => {
        categoryDetails.remove();
    });
}

/** Removes category/subcategory sections that are empty in categoryViewData (e.g. lazy sections that were never opened). */
function removeEmptyCategorySectionsFromData() {
    if (!categoryViewData || !categoryViewData.groups) return;
    const groups = categoryViewData.groups;

    categoryView.querySelectorAll(".category-group.subcategory-group").forEach(details => {
        const cat = details.dataset.category;
        const sub = details.dataset.subcategory ?? "";
        const arr = groups[cat] && groups[cat].itemsBySub[sub];
        if (!arr || arr.length === 0) {
            const categoryContent = details.parentElement;
            details.remove();
            if (categoryContent && categoryContent.children.length === 0) {
                const categoryDetails = categoryContent.parentElement;
                if (categoryDetails) categoryDetails.remove();
            }
        }
    });

    categoryView.querySelectorAll(".category-group:not(.subcategory-group)").forEach(details => {
        const content = details.querySelector(".category-group-content");
        const hasSubcategories = content && content.querySelectorAll(":scope > .subcategory-group").length > 0;
        if (hasSubcategories) return;
        const cat = details.dataset.category;
        const total = getCategoryUniqueItemCount(groups, cat);
        if (total === 0) details.remove();
    });
}

function appendCategoryCollapse(detailsElement) {
    const collapse = document.createElement("button");
    collapse.type = "button";
    collapse.className = "category-group-collapse";
    collapse.textContent = "▲ Collapse";
    collapse.addEventListener("click", (e) => {
        e.preventDefault();
        detailsElement.open = false;
    });
    detailsElement.appendChild(collapse);
}

function renderCategoryItems(container, itemsInCategory) {
    const ul = document.createElement("ul");
    ul.className = `item-list ${viewSettings.viewStyle} category-group-items`;
    for (const item of itemsInCategory) {
        const itemElement = createItemElement(item);
        ul.appendChild(itemElement);
    }
    container.appendChild(ul);
}

function render() {
    let visibleItems = filterVisibleItems();

    if (viewSettings.groupByCategories) {
        categoryView.innerHTML = "";
        paginationSection.classList.add("hidden");

        const { categoryOrder, groups } = groupVisibleItemsByCategoryAndSubcategory(visibleItems);
        categoryViewData = { categoryOrder, groups };

        const categoriesToShow = Object.keys(selectedTagFilters).length === 0
            ? categoryOrder
            : categoryOrder.filter(cat => Object.prototype.hasOwnProperty.call(selectedTagFilters, cat));

        for (const categoryName of categoriesToShow) {
            const group = groups[categoryName];
            if (!group) continue;

            const totalInCategory = getCategoryUniqueItemCount(groups, categoryName);
            const subcategoryOrder = group.subcategoryOrder;
            const subKeysWithItems = Object.keys(group.itemsBySub).filter(k => group.itemsBySub[k].length > 0);
            const orderedSubKeys = [
                ...subcategoryOrder.filter(s => group.itemsBySub[s]?.length > 0),
                ...subKeysWithItems.filter(s => !subcategoryOrder.includes(s))
            ];
            const subcategoriesToShow = Object.keys(selectedTagFilters).length === 0
                ? orderedSubKeys
                : (selectedTagFilters[categoryName] === null || selectedTagFilters[categoryName] === undefined)
                    ? orderedSubKeys
                    : orderedSubKeys.filter(sub => selectedTagFilters[categoryName].includes(sub));
            const hasSubcategories = subcategoriesToShow.length > 1 || (subcategoriesToShow.length === 1 && subcategoriesToShow[0] !== "");

            const details = document.createElement("details");
            details.className = "category-group";
            details.dataset.category = categoryName;

            const summary = document.createElement("summary");
            summary.className = "category-group-summary";
            summary.textContent = `${categoryName} (${totalInCategory})`;
            details.appendChild(summary);

            const content = document.createElement("div");
            content.className = "category-group-content";

            if (hasSubcategories) {
                for (const subName of subcategoriesToShow) {
                    const itemsInSub = group.itemsBySub[subName];
                    if (!itemsInSub || itemsInSub.length === 0) continue;

                    const subDetails = document.createElement("details");
                    subDetails.className = "category-group subcategory-group";
                    subDetails.dataset.category = categoryName;
                    subDetails.dataset.subcategory = subName;

                    const subSummary = document.createElement("summary");
                    subSummary.className = "category-group-summary";
                    subSummary.textContent = subName === "" ? `Other (${itemsInSub.length})` : `${subName} (${itemsInSub.length})`;
                    subDetails.appendChild(subSummary);

                    const subContent = document.createElement("div");
                    subContent.className = "category-group-content";
                    subDetails.appendChild(subContent);
                    content.appendChild(subDetails);

                    subDetails.addEventListener("toggle", () => {
                        if (subDetails.open && subContent.children.length === 0) {
                            renderCategoryItems(subContent, itemsInSub);
                        }
                    });
                    appendCategoryCollapse(subDetails);
                }
            } else {
                const itemsFlat = subcategoriesToShow.length > 0 ? group.itemsBySub[subcategoriesToShow[0]] : [];
                details.addEventListener("toggle", () => {
                    if (details.open && content.children.length === 0) {
                        renderCategoryItems(content, itemsFlat);
                    }
                });
            }

            details.appendChild(content);
            appendCategoryCollapse(details);
            categoryView.appendChild(details);
        }
        return;
    }

    categoryViewData = null;
    paginationSection.classList.remove("hidden");
    itemSection.innerHTML = "";

    let start = (currentPage - 1) * viewSettings.pageSize;
    let pageItems = visibleItems.slice(start, start + viewSettings.pageSize);

    if (pageItems.length == 0 && currentPage > 1) {
        currentPage--;
        start = (currentPage - 1) * viewSettings.pageSize;
        pageItems = visibleItems.slice(start, start + viewSettings.pageSize);
    }

    for (const item of pageItems) {
        const itemElement = createItemElement(item);
        itemSection.appendChild(itemElement);
    }

    const totalPages = Math.max(1, Math.ceil(visibleItems.length / viewSettings.pageSize));
    paginationPageNumberLabel.textContent = `Page ${currentPage} / ${totalPages}`;

    paginationPreviousPageButton.disabled = currentPage === 1;
    paginationNextPageButton.disabled = currentPage === totalPages;
}

function renderSummary() {
    const totalCount = items.filter(item => !item.isUnobtainable).length;
    const researchedFilter = (item) => !item.isUnobtainable && (item.fullyResearched || item.fullyResearchedTemp) && !item.notResearchedTemp;
    const researchedCount = items.filter(item => researchedFilter(item)).length;
    const missingCount = totalCount - researchedCount;
    const percent = totalCount === 0 ? 0 : ((1.0 * researchedCount / totalCount) * 100).toFixed(2);

    const unobtainableFilter = (item) => item.isUnobtainable && (item.researched > 0 || item.fullyResearchedTemp) && !item.notResearchedTemp;
    const unobtainableItemsObtained = items.filter(item => unobtainableFilter(item)).length;
    if (unobtainableItemsObtained > 0) {
        unobtainableItemsSummarySection.classList.toggle("hidden", false);
        unobtainableItemsLabel.textContent = unobtainableItemsObtained;
    } else {
        unobtainableItemsSummarySection.classList.toggle("hidden", true);
        unobtainableItemsLabel.textContent = 0;
    }


    const progressColor = getPercentColor(percent);

    totalItemsLabel.textContent = totalCount;
    researchedItemsLabel.textContent = researchedCount;
    missingItemsLabel.textContent = missingCount;
    progressBar.style.width = percent + "%";
    progressBar.style.backgroundColor = progressColor;
    progressPercentLabel.textContent = percent + "%";
    progressPercentLabel.style.color = progressColor;
}

function filterVisibleItems() {
    let newVisibleItems = [...items];

    if (Object.keys(selectedTagFilters).length > 0) {
        newVisibleItems = newVisibleItems.filter(item => {
            return Object.entries(selectedTagFilters).some(([tag, subtags]) => {
                if (!item.tags || !item.tags[tag]) {
                    return false;
                }

                if (subtags === null) {
                    return true;
                }

                return subtags.some(subtag => item.tags[tag].includes(subtag));
            });
        });
    }

    const fullyResearchedFilter = (item) => showFullyResearched && !item.isUnobtainable && (item.fullyResearchedTemp || (item.fullyResearched && !item.notResearchedTemp));
    const partiallyResearchedFilter = (item) => showPartiallyResearched && !item.isUnobtainable && (item.researched > 0 && !(item.fullyResearched || item.fullyResearchedTemp));
    const notResearchedFilter = (item) => showNotResearched && !item.isUnobtainable && (item.notResearchedTemp || (item.researched == 0 && !item.fullyResearchedTemp));
    const unobtainableFilter = (item) => showUnobtainable && item.isUnobtainable;

    newVisibleItems = newVisibleItems.filter(item =>
        fullyResearchedFilter(item)
        || partiallyResearchedFilter(item)
        || notResearchedFilter(item)
        || unobtainableFilter(item));


    if (searchQuery) {
        newVisibleItems = newVisibleItems.filter(i =>
            i.name.toLowerCase().includes(searchQuery) ||
            String(i.id).includes(searchQuery)
        );
    }

    newVisibleItems = [...newVisibleItems].sort((a, b) => {
        if (viewSettings.sortBy === "ID") {
            return a.id - b.id;
        }
        return a.name.localeCompare(b.name);
    });

    return newVisibleItems;
}

/** Returns true if the item is visible given the current tag, "show items", and search filters (same logic as filterVisibleItems). */
function itemMatchesVisibilityFilters(item) {
    if (Object.keys(selectedTagFilters).length > 0) {
        const passesTagFilter = Object.entries(selectedTagFilters).some(([tag, subtags]) => {
            if (!item.tags || !item.tags[tag]) return false;
            if (subtags === null) return true;
            return subtags.some(subtag => item.tags[tag].includes(subtag));
        });
        if (!passesTagFilter) return false;
    }

    const fullyResearchedFilter = (item) => showFullyResearched && !item.isUnobtainable && (item.fullyResearchedTemp || (item.fullyResearched && !item.notResearchedTemp));
    const partiallyResearchedFilter = (item) => showPartiallyResearched && !item.isUnobtainable && (item.researched > 0 && !(item.fullyResearched || item.fullyResearchedTemp));
    const notResearchedFilter = (item) => showNotResearched && !item.isUnobtainable && (item.notResearchedTemp || (item.researched == 0 && !item.fullyResearchedTemp));
    const unobtainableFilter = (item) => showUnobtainable && item.isUnobtainable;

    const passesResearchFilters =
        fullyResearchedFilter(item) ||
        partiallyResearchedFilter(item) ||
        notResearchedFilter(item) ||
        unobtainableFilter(item);

    if (!passesResearchFilters) return false;

    if (searchQuery) {
        return (
            item.name.toLowerCase().includes(searchQuery) ||
            item.internalName.toLowerCase().includes(searchQuery) ||
            String(item.id).includes(searchQuery)
        );
    }
    return true;
}

function createItemElement(item) {
    const li = document.createElement("li");
    li.dataset.itemInternalName = item.internalName;

    if (item.fullyResearchedTemp && !item.fullyResearched) {
        li.classList.add("item-fully-researched-temp");
    } else if (item.notResearchedTemp) {
        li.classList.add("item-not-researched-temp");
    } else if (item.fullyResearched) {
        li.classList.add("item-fully-researched");
    } else if (item.researched > 0) {
        li.classList.add("item-partially-researched");
    } else {
        li.classList.add("item-not-researched");
    }

    if (item.isUnobtainable) {
        li.classList.add("color-grey");
    }

    const effectiveStyle = viewSettings.viewStyle;
    if (effectiveStyle === "list") {
        li.append(createListItemElement(item));
    } else {
        li.append(createGridItemElement(item));
    }

    return li;
}

function updateItemElementState(li, item) {
    li.classList.remove("item-fully-researched-temp", "item-not-researched-temp", "item-fully-researched", "item-partially-researched", "item-not-researched");
    if (item.fullyResearchedTemp && !item.fullyResearched) {
        li.classList.add("item-fully-researched-temp");
    } else if (item.notResearchedTemp) {
        li.classList.add("item-not-researched-temp");
    } else if (item.fullyResearched) {
        li.classList.add("item-fully-researched");
    } else if (item.researched > 0) {
        li.classList.add("item-partially-researched");
    } else {
        li.classList.add("item-not-researched");
    }

    const checkbox = li.querySelector(".research-checkbox");
    if (checkbox) {
        if (item.fullyResearchedTemp || (item.fullyResearched && !item.notResearchedTemp)) {
            checkbox.checked = true;
            checkbox.indeterminate = false;
        } else if (item.notResearchedTemp) {
            checkbox.checked = false;
            checkbox.indeterminate = false;
        } else if (item.researched > 0 && item.researched < item.neededForResearch) {
            checkbox.checked = false;
            checkbox.indeterminate = true;
        } else {
            checkbox.checked = false;
            checkbox.indeterminate = false;
        }
    }

    let researchedNum = item.researched;
    if (item.fullyResearchedTemp && !item.fullyResearched) {
        researchedNum = item.neededForResearch + "*";
    } else if (item.notResearchedTemp) {
        researchedNum = "0*";
    }
    const researchedEl = li.querySelector("[data-meta=\"researched\"]");
    if (researchedEl) {
        researchedEl.innerText = `Researched:\u00A0${researchedNum}`;
    }
}

function createItemImageElement(item) {
    const itemUrl = itemUrlBase + item.itemUrl;
    const imageUrl = imageUrlBase + item.imageUrl;
    const itemLink = document.createElement("a");
    itemLink.classList.add("item-link", "item-image-wrapper");
    itemLink.href = itemUrl;
    itemLink.target = "_blank";
    itemLink.rel = "nooperen noreferrer";

    const itemImage = document.createElement("img");
    itemImage.classList.add("item-image");
    itemImage.src = imageUrl;
    itemImage.alt = item.name;

    itemLink.appendChild(itemImage);
    return itemLink;
}

function createListItemElement(item) {
    const div = () => document.createElement("div");

    const listItemContainer = div();
    listItemContainer.classList.add("list-item-container");

    const listItemImageSection = div();
    listItemImageSection.classList.add("list-item-image-section");

    const itemImageElement = createItemImageElement(item);
    listItemImageSection.append(itemImageElement);

    listItemContainer.append(listItemImageSection);

    const listItemContent = div();
    listItemContent.classList.add("list-item-content");

    const itemHeader = div();
    itemHeader.classList.add("item-header");

    const itemNameElement = document.createElement("span");
    itemNameElement.classList.add("item-name");
    itemNameElement.innerText = item.name;
    itemHeader.append(itemNameElement);

    const itemIdElement = document.createElement("span");
    itemIdElement.classList.add("item-id");
    itemIdElement.innerText = `ID:\u00A0${item.id}`;
    itemHeader.append(itemIdElement);
    listItemContent.append(itemHeader);

    const itemDescription = div();
    itemDescription.classList.add("item-description");

    const itemDescriptionWrapper = div();

    const itemResearched = div();
    itemResearched.classList.add("item-meta");
    itemResearched.dataset.meta = "researched";

    let researchedNum = item.researched;
    if (item.fullyResearchedTemp && !item.fullyResearched) {
        researchedNum = item.neededForResearch + "*";
    } else if (item.notResearchedTemp) {
        researchedNum = "0*";
    }

    itemResearched.innerText = `Researched:\u00A0${researchedNum}`;
    itemDescriptionWrapper.append(itemResearched);

    const itemNeededForResearch = div();
    itemNeededForResearch.classList.add("item-meta");
    itemNeededForResearch.innerText = `Needed:\u00A0${item.neededForResearch}`;
    itemDescriptionWrapper.append(itemNeededForResearch);
    itemDescription.append(itemDescriptionWrapper);

    const itemToolSection = div();
    itemToolSection.classList.add("item-tool-section");

    const researchBlock = div();
    researchBlock.classList.add("research-block");

    const researchCheckbox = createResearchCheckbox(item);
    researchBlock.append(researchCheckbox);
    itemToolSection.append(researchBlock);

    const tagTooltip = createItemTagTooltip(item);
    itemToolSection.append(tagTooltip);

    itemDescription.append(itemToolSection);
    listItemContent.append(itemDescription);
    listItemContainer.append(listItemContent);

    return listItemContainer;
}

function createGridItemElement(item) {
    const div = () => document.createElement("div");

    const gridItemContainer = div();
    gridItemContainer.classList.add("grid-item-container");

    gridItemContainer.classList.add()

    const gridItemImageSection = div();
    gridItemImageSection.classList.add("grid-item-image-section");

    const itemImageElement = createItemImageElement(item);
    gridItemImageSection.append(itemImageElement);
    gridItemContainer.append(gridItemImageSection);

    const itemSlotName = div();
    itemSlotName.classList.add("item-slot-name");
    itemSlotName.innerText = item.name;
    gridItemContainer.append(itemSlotName);

    const gridItemContent = div();
    gridItemContent.classList.add("grid-item-content");

    const itemSlotMeta = div();
    itemSlotMeta.classList.add("item-slot-meta");

    const idElement = itemSlotMeta.cloneNode();
    idElement.innerText = `ID:\u00A0${item.id}`;
    gridItemContent.append(idElement);

    const researchedElement = itemSlotMeta.cloneNode();
    researchedElement.dataset.meta = "researched";

    let researchedNum = item.researched;
    if (item.fullyResearchedTemp && !item.fullyResearched) {
        researchedNum = item.neededForResearch + "*";
    } else if (item.notResearchedTemp) {
        researchedNum = "0*";
    }

    researchedElement.innerText = `Researched:\u00A0${researchedNum}`;
    gridItemContent.append(researchedElement);

    const neededElement = itemSlotMeta.cloneNode();
    neededElement.innerText = `Needed:\u00A0${item.neededForResearch}`;
    gridItemContent.append(neededElement);

    gridItemContainer.append(gridItemContent);

    const itemToolSection = div();
    itemToolSection.classList.add("item-tool-section");

    const researchBlock = div();
    researchBlock.classList.add("research-block");

    const researchCheckbox = createResearchCheckbox(item);
    researchBlock.append(researchCheckbox);
    itemToolSection.append(researchBlock);

    const tagTooltip = createItemTagTooltip(item);

    itemToolSection.append(tagTooltip);
    gridItemContainer.append(itemToolSection);

    return gridItemContainer;
}

function createResearchCheckbox(item) {
    const researchCheckboxLabel = document.createElement("label");
    researchCheckboxLabel.classList.add("research-checkbox-label");
    researchCheckboxLabel.style.cursor = "pointer";

    const researchCheckbox = document.createElement("input");
    researchCheckbox.type = "checkbox";
    researchCheckbox.classList.add("research-checkbox");

    if (item.fullyResearchedTemp || (item.fullyResearched && !item.notResearchedTemp)) {
        researchCheckbox.checked = true;
    } else if (item.researched > 0 && item.researched < item.neededForResearch) {
        researchCheckbox.indeterminate = true;
    }

    const researchCheckboxIcon = document.createElement("img");
    researchCheckboxIcon.alt = "Research";
    researchCheckboxIcon.src = imageUrlBase + "Power_Menu_Toggle.png";
    researchCheckboxIcon.classList.add("research-checkbox-icon");

    researchCheckboxLabel.append(researchCheckbox, researchCheckboxIcon);

    researchCheckbox.addEventListener("change", (e) => {
        if (e.target.checked) {
            item.notResearchedTemp = false;
            if (!item.fullyResearched || !item.fullyResearchedTemp) {
                item.fullyResearchedTemp = true;
            }
            itemStorageManager.save(items);
        } else {
            item.fullyResearchedTemp = false;
            e.target.indeterminate = false;
            if (item.fullyResearched) {
                item.notResearchedTemp = true;
            } else if (item.researched > 0 && item.researched < item.neededForResearch) {
                e.target.indeterminate = true;
            }
            itemStorageManager.save(items);
        }
        renderSummary();
        if (viewSettings.groupByCategories) {
            const itemElements = categoryView.querySelectorAll(`[data-item-internal-name="${item.internalName}"]`);
            if (itemMatchesVisibilityFilters(item)) {
                itemElements.forEach(li => updateItemElementState(li, item));
            } else {
                removeItemFromCategoryViewData(item);
                const ulsToCheck = new Set();
                itemElements.forEach(li => {
                    const ul = li.closest("ul.category-group-items");
                    if (ul) ulsToCheck.add(ul);
                    li.remove();
                });
                removeEmptyCategorySections(ulsToCheck);
                removeEmptyCategorySectionsFromData();
                updateCategoryViewCounts();
            }
            updateTagPercents();
        } else {
            render();
            updateTagPercents();
        }
    });

    return researchCheckboxLabel;
}

function createItemTagTooltip(item) {
    const tagTooltip = document.createElement("div");
    tagTooltip.classList.add("tag-tooltip");

    const tagIcon = document.createElement("img");
    tagIcon.classList.add("tag-icon");
    tagIcon.alt = "Tags";
    tagIcon.src = imageUrlBase + "Bestiary_Sort_by_ID.png";
    tagTooltip.append(tagIcon);

    const tagTooltipText = document.createElement("div");
    tagTooltipText.classList.add("tag-tooltip-text");
    createItemTagElements(item).forEach(itemTagElement => tagTooltipText.append(itemTagElement));
    tagTooltip.append(tagTooltipText);

    tagTooltip.addEventListener("mouseenter", () => {
        tagTooltipText.classList.remove("flip-right");

        const rect = tagTooltipText.getBoundingClientRect();

        if (rect.left < 0) {
            tagTooltipText.classList.add("flip-right");
        }
    });

    return tagTooltip;
}

function createItemTagElements(item) {
    const sortedItemTags = getSortedItemTags(item);

    return sortedItemTags.flatMap(([tag, subtags]) => {
        const tagElement = document.createElement("div");
        tagElement.classList.add("item-meta");
        tagElement.innerText = tag + (subtags.length > 0 ? ":" : "");

        const subtagElements = subtags.map((subtag, idx) => {
            const subtagElement = document.createElement("div");
            subtagElement.classList.add("item-meta");

            const borderPrefix = idx == subtags.length - 1 ? "┗━" : "┣━";

            subtagElement.innerText = borderPrefix + "\u00A0" + subtag.replaceAll(" ", "\u00A0");
            return subtagElement;
        });

        return [tagElement, ...subtagElements];
    });
}

function createTagCheckbox(tag, subtag = null) {
    const showTag = subtag ? subtag : tag;
    const dataSubtag = subtag ? `data-subtag="${subtag}"` : "";
    const tagPercent = calculatePercent(tag, subtag);
    const tagColor = `color: ${getPercentColor(tagPercent)};`;
    const tagLineThrough = tagPercent == 100 ? "text-decoration: line-through;" : "";

    const wrapper = document.createElement("div");
    wrapper.innerHTML = `
        <label class="tag-checkbox-label" style="cursor: pointer;">
            <input type="checkbox" data-tag="${tag}" ${dataSubtag}>
            <span class="tag-text" style="${tagLineThrough}">${showTag}</span><span class="percent" style="${tagColor}">(${tagPercent}%)</span>
        </label>
        `;

    return wrapper;
}

function updateTagPercents() {
    const tagCheckboxLabels = tagContainer.querySelectorAll(".tag-checkbox-label");
    tagCheckboxLabels.forEach(tagCheckboxLabel => {
        const tagCheckbox = tagCheckboxLabel.querySelector(`input[type="checkbox"]`);
        const percentLabel = tagCheckboxLabel.querySelector(".percent");
        const tagText = tagCheckboxLabel.querySelector(".tag-text");

        const tagPercent = calculatePercent(tagCheckbox.dataset.tag, tagCheckbox.dataset.subtag);
        const tagColor = `color: ${getPercentColor(tagPercent)};`;
        const tagLineThrough = tagPercent == 100 ? "text-decoration: line-through;" : "";
        tagText.style = tagLineThrough;
        percentLabel.style = tagColor;
        percentLabel.innerHTML = `(${tagPercent}%)`;
    })
}

function calculatePercent(tag, subtag = null) {
    const filtered = items.filter(item => {
        if (!item.tags[tag]) {
            return false;
        }
        if (!subtag) {
            return true;
        }
        return item.tags[tag].includes(subtag);
    });

    if (!filtered.length) {
        return 0;
    }

    const researched = filtered.filter(i => i.fullyResearched || i.fullyResearchedTemp).length;

    return ((1.0 * researched / filtered.length) * 100).toFixed(2);
}

function getPercentColor(percent) {
    const fixedPercent = Math.max(0, Math.min(100, percent));
    const hue = (fixedPercent / 100) * 120;
    return `hsl(${hue}, 105%, 65%)`;
}

function getSortedItemTags(item) {
    if (!item.tags) {
        return [];
    }

    const globalTagOrder = Object.keys(allTags);
    const sorted = [];

    for (const tag of globalTagOrder) {
        if (!item.tags[tag]) {
            continue;
        }

        const globalSubOrder = allTags[tag] || [];
        const itemSubtags = item.tags[tag];

        const sortedSubtags = [...itemSubtags].sort((a, b) => {
            const aIndex = globalSubOrder.indexOf(a);
            const bIndex = globalSubOrder.indexOf(b);

            if (aIndex !== -1 && bIndex !== -1) {
                return aIndex - bIndex;
            }

            if (aIndex !== -1) {
                return -1;
            }
            if (bIndex !== -1) {
                return 1;
            }

            return 0;
        });


        sorted.push([tag, sortedSubtags]);
    }

    for (const tag of Object.keys(item.tags)) {
        if (!globalTagOrder.includes(tag)) {
            sorted.push([tag, [...item.tags[tag]]]);
        }
    }

    return sorted;
}
