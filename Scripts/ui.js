//Using HTML Selectors to find any element

export function $(selector) {
    return document.querySelector(selector);
}

export function esc(text) {
    text = String(text);

    return text.replace(/[&<>"']/g, function (character) {
        const characters = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#39',
        };
    
        return characters[character];
    });
}

// Display a message inside an HTML element
export function say(element, message) {
    element.textContent = message;
}