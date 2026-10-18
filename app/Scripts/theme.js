const KEY = 'app:theme';

//Find the theme button in HTML

const btn = document.querySelector('#theme-switch');

function apply(theme) {
    document.documentElement.dataset.theme = theme;

    if (theme === 'dark') {
        btn.setAttribute('aria-pressed', 'true');
    } else {
        btn.setAttribute('aria-pressed', 'false');
    }

    try {
        localStorage.setItem(KEY, theme);
    } catch (error) {
        //Change nothing if local storage is not available
    }

}

let saved = 'null';

try {
    saved = localStorage.getItem(KEY);
} catch (error) {
}

if (saved) {
    apply(saved);
} else {
    const darkMode = matchMedia('(prefers-color-scheme: dark)').matches;

    if (darkMode) {
        apply('dark');
    } else {
        apply('light');
    }
}

btn.addEventListener('click', function () {
    const currentTheme = document.documentElement.dataset.theme;

    if (currentTheme === 'dark') {
        apply('light');
    } else {
        apply('dark');
    }
});
