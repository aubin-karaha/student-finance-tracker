export function load(key, fback) {
    try{
        const text = localStorage.getItem(key);
        return text ? JSON.parse(text) : fback;
    } catch {
        return fback;
    }
}

export function save(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
}