class LocalStorageManager {

    constructor(storageKey, defaultItems = []) {
        this.storageKey = storageKey;
        this.defaultItems = defaultItems;
    }

    save(items) {
        localStorage.setItem(this.storageKey, JSON.stringify(items));
    }

    load() {
        const data = localStorage.getItem(this.storageKey);
        if (data) {
            try {
                return JSON.parse(data);
            } catch (e) {
                console.warn("Failed to parse localStorage data:", e);
                return this.defaultItems;
            }
        }
        return this.defaultItems;
    }

    reset() {
        localStorage.removeItem(this.storageKey);
        return this.defaultItems;
    }
}