export const rules = {
    title: /^\S(?:.*\S)?$/,         //checks for leading/trailing spaces 
    value: /^(0|[1-9]\d*)(\.\d{1,2})?$/,     //checks for positive number, max two decimal places
    date: /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/,   //YYYY-MM-DD format
    tag: /^[A-Za-z]+(?:[ -][A-Za-z]+)*$/,
    dup: /\b(\w+)\s+\1\b/i
};

export function validate(f) {
    const e = {};
    if (!rules.title.test(f.title)) e.title = "No spaces at the start or end, and not empty.";
    else if (rules.dup.test(f.title)) e.title = "A word is repeated (for example: the the).";
    if (!rules.value.test(f.value)) e.value = "Use a positive number and with not more than 2 decimal places"
    if (!rules.date.test(f.date)) e.date = "Use YYYY-MM-DD format"
    if (!rules.tag.test(f.tag)) e.tag = "Letters, spaces and hyphens are allowed only"
    return e;
}