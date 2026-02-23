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

const sortByDropdown = document.getElementById("sortByDropdown");
const sortByDropdownToggle = document.getElementById("sortByDropdownToggle");
const sortByDropdownToggleLabel = document.getElementById("sortByDropdownToggleLabel");
const sortByDropdownMenu = document.getElementById("sortByDropdownMenu");

const openTagsButton = document.getElementById("openTagsButton");
const tagModal = document.getElementById("tagModal");
const tagContainer = document.getElementById("tagContainer");
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

const paginationSection = document.getElementById("paginationSection");
const paginationPreviousPageButton = document.getElementById("paginationPreviousPageButton");
const paginationPageNumberLabel = document.getElementById("paginationPageNumberLabel");
const paginationNextPageButton = document.getElementById("paginationNextPageButton");

////////////////////////////////////////////////////////////////////////////////////////////////////

const itemStorageManager = new LocalStorageManager("terraria-research", structuredClone(allItems));
const settingsStorageManager = new LocalStorageManager("terraria-settings", {
    playerName: "no name",
    viewStyle: "grid",
    pageSize: 50,
    pageSizeLabel: "50",
    sortBy: "ID",
});

const viewSettings = settingsStorageManager.load();

let currentPage = 1;

let searchQuery = "";

let showFullyResearched = false;
let showPartiallyResearched = true;
let showNotResearched = true;
let showUnobtainable = false;

let items = itemStorageManager.load();

let selectedTagFilters = {};

const itemUrlBase = "https://terraria.wiki.gg/wiki/";
const imageUrlBase = "https://terraria.wiki.gg/images/";

playerNameLabel.textContent = viewSettings.playerName;


itemSection.classList.toggle("grid", viewSettings.viewStyle === "grid");
itemSection.classList.toggle("list", viewSettings.viewStyle === "list");

viewStyleDropdownToggleLabel.innerText = viewSettings.viewStyle;
pageSizeDropdownToggleLabel.innerText = viewSettings.pageSizeLabel;
sortByDropdownToggleLabel.innerText = viewSettings.sortBy;

fullyResearchedCheckbox.checked = showFullyResearched;
partiallyResearchedCheckbox.checked = showPartiallyResearched;
notResearchedCheckbox.checked = showNotResearched;
unobtainableCheckbox.checked = showUnobtainable;

renderTags();
renderSummary();
render();

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
    viewStyle = settingsStorageManager.reset();
    selectedTagFilters = {};
    playerNameLabel.textContent = "no name";
    searchQuery = "";
    searchInput.value = "";
    currentPage = 1;

    showFullyResearched = false;
    fullyResearchedCheckbox.checked = false;
    showPartiallyResearched = true;
    partiallyResearchedCheckbox.checked = true;
    showNotResearched = true;
    notResearchedCheckbox.checked = true;
    showUnobtainable = false;
    unobtainableCheckbox.checked = false;

    renderTags();
    renderSummary();
    render();
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

    viewSettings.playerName = player.name;
    playerNameLabel.textContent = viewSettings.playerName;

    itemStorageManager.save(player.researchProgress.items);
    settingsStorageManager.save(viewSettings);
    items = player.researchProgress.items;

    selectedTagFilters = {};
    currentPage = 1;
    renderTags();
    renderSummary();
    render();

    fileInput.value = "";
})

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
            viewStyleDropdownToggleLabel.innerText = newViewStyle;
            settingsStorageManager.save(viewSettings);
            render();
        }
    })
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

loadButton.addEventListener("click", () => {
    fileInput.click();
});

searchInput.addEventListener("input", () => {
    searchQuery = searchInput.value.toLowerCase();
    currentPage = 1;
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

openTagsButton.addEventListener("click", () => {
    tagModal.classList.toggle("hidden", false);
});

closeTagsButton.addEventListener("click", () => {
    tagModal.classList.toggle("hidden", true);
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

function render() {
    let visibleItems = filterVisibleItems();

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
            i.internalName.toLowerCase().includes(searchQuery) ||
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

function createItemElement(item) {
    const li = document.createElement("li");

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

    if (viewSettings.viewStyle === "list") {
        li.append(createListItemElement(item));
    } else {
        li.append(createGridItemElement(item));
    }

    return li;
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

    const researchCheckbox = document.createElement("input");
    researchCheckbox.type = "checkbox";
    researchCheckbox.classList.add("research-checkbox");

    if (item.fullyResearchedTemp || (item.fullyResearched && !item.notResearchedTemp)) {
        researchCheckbox.checked = true;
    } else if (item.researched > 0 && item.researched < item.neededForResearch) {
        researchCheckbox.indeterminate = true;
    }

    const researchImage = document.createElement("img");
    researchImage.alt = "Research";
    researchImage.src = imageUrlBase + "Power_Menu_Toggle.png";

    researchCheckboxLabel.append(researchCheckbox, researchImage);

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
        render();
        updateTagPercents();
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
