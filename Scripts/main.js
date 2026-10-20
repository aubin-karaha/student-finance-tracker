import { T, mkSeed } from './config.js';
import { load, save } from './storage.js';
import { validate, rules } from './validators.js';
import { compileRegex, highlight } from './search.js';
import { $, esc, say } from './ui.js'; 
import './theme.js';

//Load the saved data
const KEY = 'app:finance';

let recs = load(KEY, null);
if (recs == null) {
    recs = mkSeed(T.seed);
}

// Load the saved settings
let cfg = load(KEY + ':cfg' , {
    cap: 0,
    unit: T.units[0].n,
    rates: Object.fromEntries(T.units.map(function (u) { 
        return [u.n, u.r];
     }))
});

//Add the default categories if none are saved
if (!cfg.tags) {
    cfg.tags = [...T.tags];
}

//Save records and settings
function persist() {
    save(KEY, recs);
    save(KEY + ':cfg', cfg);
}

//Convert an amount entered into the selected currency
function convert(amount) {
    let result = amount * cfg.rates[cfg.unit];
    return Number(result.toFixed(2));
}

//Save the data and update 
function refresh() {
    persist();
    renderRows();
    renderStats();
}

// Show the section selected in the URL
function show() {
    let page = location.hash.slice(1);

    if (page == '') {
        page = 'dashboard';
    }

    const sections = document.querySelectorAll('main > section');

    sections.forEach(function (section) {
        if (section.id == page) {
            section.hidden = false;
        }
        else {
            section.hidden = true;
        }
    });

const links = document.querySelectorAll('nav a');

links.forEach(function (link) {
    if (link.hash == '#' + page) {
        link.setAttribute('aria-current', 'page');
    } else {
        link.removeAttribute('aria-current');
    }
});
}

addEventListener('hashchange', show);

//...Codes for Records table...

//Different ways to sort the records
const sorts = {
    'date-d': function (a, b) {
        return b.date.localeCompare(a.date);
    },

    'date-a': function (a, b) {
        return a.date.localeCompare(b.date);
    },

    'title-a': function (a, b) {
        return a.title.localeCompare(b.title);
    },

    'title-z': function (a, b) {
        return b.title.localeCompare(a.title);
    },

    'val-a': function (a, b) {
        return a.value - b.value;
    },

    'val-d': function (a, b) {
        return b.value - a.value;
    }
};

// Displays records in the table
function renderRows() {
    const searchText = $('#search').value;
    const ignoreCase = $('#ci').checked ? 'i' : '';

    const regex = compileRegex(searchText, ignoreCase);

    //Filter records using the search text
    let list = recs.filter(function (record) {
        if (!regex) {
            return true;
        }

        const recordText =
        record.title + ' ' +
        record.tag + ' ' +
        record.value + ' ' +
        record.date;

        return regex.test(recordText);
    });

    //Sort all the filtered records
    list.sort(sorts[$('#sort').value]);

    let html = '';

    for (let i = 0; i < list.length; i++) {
        const record = list[i];

        html += `
            <tr>
                <td data-label="Date">${esc(record.date)}</td>

                <td data-label="Description">
                    ${highlight(record.title, regex)}
                </td>

                <td data-label="Amount">
                    ${convert(record.value)} ${esc(cfg.unit)}
                </td>

                <td data-label="Category">
                    ${highlight(record.tag, regex)}
                </td>

                <td>
                    <button
                        data-act="edit"
                        data-id="${record.id}"
                        aria-label="Edit ${esc(record.title)}">
                        Edit 
                    </button>

                    <button
                        data-act="del"
                        data-id="${record.id}"
                        aria-label="Delete ${esc(record.title)}">
                        Delete
                    </button>
                </td>
            </tr>
        `;
    }

    if (list.length === 0) {
        $('#rows').innerHTML = '<tr><td>No records found.</td></tr>';
    } 
        
    $('#rows').innerHTML = html;
    

    //Show the search result message
    if (searchText && !regex) {
        say($('#searchStatus'), 'That pattern is not valid yet.');
    } else if (regex){
            say($('#searchStatus'), list.length + ' match(es).'); 
        } else {
            say($('#searchStatus'), '');
            }

}

//Displaying results whenever someone enters text in the Search box

$('#search').addEventListener('input', renderRows);
$('#ci').addEventListener('input', renderRows);
$('#sort').addEventListener('input', renderRows);

// Dashboard statistics

function renderStats() {
    let sum = 0;
    let topTag = '';
    let topCount = 0;

    const counts = {};

    //Calculating the total and count each Category
    for (let i = 0; i < recs.length; i++) {
        const record = recs[i];

        sum = sum + record.value;

        if (counts[record.tag] === undefined) {
            counts[record.tag] = 0;
        }

        counts[record.tag] = counts[record.tag] + 1;

        if (counts[record.tag] > topCount) {
            topTag = record.tag;
            topCount = counts[record.tag];
        }
    }    

    $('#sTotal').textContent = recs.length;
    $('#sSum').textContent = convert(sum) + ' ' + cfg.unit;

    if (topTag != '') {
        $('#sTop').textContent = topTag + ' (' + topCount + ')';
    } else {
        $('#sTop').textContent = '—';
    }

    // Get the totals for the last 7 days ago
    const week = [];

    for (let i = 6; i >= 0; i--){
        const date = new Date();
        date.setDate(date.getDate() - i);

        const day = date.toISOString().slice(0, 10);
        let total = 0;

        for (let j = 0; j < recs.length; j++) {
            if (recs[j].date === day) {
                total = total + recs[j].value;
            }    
        }

        week.push({
            day: day,
            total: total
        });     
    }

    //Find the largest daily total for the chart
    let max = 1;

    for (let i = 0; i < week.length; i++) {
        if (week[i].total > max) {
            max = week[i].total;
        }
    }

    // Drawing the charts
    let chartHTML = '';

    for(let i = 0; i < week.length; i++) {
        const day = week[i];
        const height = (day.total / max) * 100;

        chartHTML += `
            <div class="bar" style="height: ${height}%">
                <span>${day.day.slice(5)}</span>
            </div>
        `;

    }

    $('#chart').innerHTML = chartHTML;

    //Check whether the spending limit has reached
    const remaining = cfg.cap - sum;

    if (cfg.cap > 0 && remaining >= 0){
        $('#capPolite').textContent =
            'Under cap: ' + convert(remaining) +
            ' ' + cfg.unit + ' remaining.';
    } else {
        $('#capPolite').textContent = '';
    }

    if (cfg.cap > 0 && remaining < 0) {
        $('#capAssertive').textContent =
            'Over cap by ' + convert(-remaining) +
            ' ' + cfg.unit + '!';
    } else {
        $('#capAssertive').textContent = '';
    }

}

// ...Add and edit records...

const F = {
    title: $('#fTitle'),   
    value: $('#fVal'),
    tag: $('#fTag'),
    date: $('#fDate'),
    id: $('#fId')
};

// Error messages for each input
const errBox = {
    title: $('#eTitle'),
    value: $('#eVal'),
    tag: $('#eTag'),
    date: $('#eDate')
};

function showErrors(errors) {
    for (let field in errBox) {
        say(errBox[field], errors[field] || '');
    }
}

//Clear the form
function resetForm() {
    $('#recForm').reset();

    F.id.value = '';
    $('#formTitle').textContent = 'Add record'

    showErrors({});
}

$('#recForm').addEventListener('submit', function (e) {
    e.preventDefault();

    const formData = {
        title: F.title.value.replace(/\s{2,}/g, ' '),
        value: F.value.value,
        tag: F.tag.value,
        date: F.date.value
    };

    const errors = validate(formData);

    showErrors(errors);

    if (Object.keys(errors).length > 0) {
        say($('#formStatus'), 'Please fix he errors above.');
        return;
    }

    const now = new Date().toISOString();

    formData.value = Number(formData.value);

    if (F.id.value != '') {
        const record = recs.find(function (r) {
            return r.id === F.id.value;
        });

        if (record) {
            Object.assign(record, data);
            record.updatedAt = now;
        }
    } else{
        let largestId = 0;

        for (let i = 0; i < recs.length; i++) {
            const number = Number(recs[i].id.slice(4));

            if (number > largestId) {
                largestId = number;
            }
        }

        const newId = 'rec_' +
            String(largestId + 1).padStart(4, '0');

        recs.push({
            id: newId,
            ...data,
            createdAt: now,
            updatedAt: now
        });
    }

    say($('#formStatus'), 'Saved!');

    resetForm();
    refresh();

    location.hash = '#records';
});

$('#cancel').addEventListener('click', function () {
    resetForm();
    location.hash = '#records';
});

//Edit and Delete Buttons

$('#rows').addEventListener('click', function (e) {
    const button = e.target.closest('button');
    
    if (!button) {
        return;
    }
    const id = button.dataset.id;

    const record = recs.find(function (r) {
        return r.id === id;
    })

    if (!record) {
        return;   
    }

    // Delete a record

    if (button.dataset.act === 'del') {
        if (confirm ('Delete "' + record.title + '"?')) {
            recs = recs.filter(function (r) {
                return r.id !== record.id;
            });

            refresh();
        }
    }

    // Load a record into the form for editing

    if (button.dataset.act === 'edit') {
        F.id.value = record.id;
        F.title.value = record.title;
        F.value.value = record.value;
        F.tag.value = record.tag;
        F.date.value = record.date;

        $('#formTitle').textContent = 'Edit record';

        location.hash = '#form';
        F.title.focus();
    }
});

//Settings

// Add the available currency units to the dropdown

$('#unit').innerHTML = T.units.map(function (unit) {
    return '<option>' + unit.n + '</option>';
}).join('');

$('#rates').innerHTML = T.units.map(function (unit) {
    return `
        <label>
            ${unit.n}
            <input
                type="number"
                step="any"
                data-u="${unit.n}"
                value="${cfg.rates[unit.n]}">
        </label>
    `;
}).join('');

$('#cap').value = cfg.cap;  
$('#unit').value = cfg.unit;  

$('#cap').addEventListener('input', function (e) {
    cfg.cap = Math.max(0, Number(e.target.value) || 0);
    refresh();
});

$('#unit').addEventListener('change', function (e){
    cfg.unit = e.target.value;
    refresh();
});

$('#rates').addEventListener('input', function (e) {
    const value = Number(e.target.value);
    const unit = e.target.dataset.u;

    if (value > 0) {
        cfg.rates[unit] = value;
        refresh();
    }
});


// Export and import records

// Download as a JSON file

$('#export').addEventListener('click', function () {
    const json = JSON.stringify(recs, null, 2);

    const file = new Blob([json], {
        type: 'application/json'
    });

    const url = URL.createObjectURL(file);

    const link = document.createElement('a');
    link.href = url
    link.download = 'records.json';

    link.click();

    URL.revokeObjectURL(url);
    say($('#setStatus'), 'Exported.');

});

//Import from a JSON file

$('#import').addEventListener ('change', async function (e) {
    try {
        const file = e.target.files[0];

        if (!file) {
            return;
        }

        const text = await file.text();
        const data = JSON.parse(text);

        if (!Array.isArray(data)) {
            throw new Error('File must be a list.');
        }

        for (let i = 0; i < data.length; i++){
            const record = data[i];

            const errors = validate ({
                title: String (record.title ?? ''),
                value: String(record.value ?? ''),
                tag: String(record.tag ?? ''),
                date: String(record.date ?? '')
            });

            if (!record.id || Object.keys(errors).length > 0){
                throw new Error('Record ' + (i + 1) + '  is invalid.');                
            }            
        }

        recs = data;
        refresh();

        say($('#setStatus'), 'Imported ' + data.length + ' records.');
    } catch (error) {
        say($('#setStatus'), 'Import Failed: ' + error.message);
    }
});


//Display all categories in the dropdown list 

function renderTags() {
    $('#tags').innerHTML = cfg.tags.map(function (tag) {
        return '<option value="' +esc(tag) + '">';
    }).join('');

    $('#catList').innerHTML = cfg.tags.map(function (tag) {
        return `
            <li>
                ${esc(tag)}
                <button
                    type="button"
                    data-cat="${esc(tag)}"
                    aria-label="Remove ${esc(tag)}">
                    Remove
                </button>
            </li>
        `;
    }).join('');
}

$('#addCat').addEventListener('click', function () {
    const value = $('#newCat').value
        .replace(/\s{2,}/g, ' ')
        .trim();
    
    let error = "";

    if (!rules.tag.test(value)) {
        error = 'Letters, spaces and hyphens only.';
    } else {
        //Stop duplicate categories
        for (let i = 0; i < cfg.tags.length; i++) {
            if (cfg.tags[i].toLowerCase() === value.toLowerCase()) {
                error = 'That Category already exists.';
                break;
            }
        }
    }

    say($('#eCat'), error);

    if (error != '') {
        return;
    }

    cfg.tags.push(value);
    $('#newCat').value = '';

    renderTags();
    persist();

    say($('#setStatus'), 'Added "' + value + '".');
});

//Allow the user to press Enter key and add a category
$('#newCat').addEventListener('keydown', function (e) {
    if (e.key === 'Enter'){
        $('#addCat').click();
    }
});

//Remove a cat
$('#catList').addEventListener('click', function (e) {
    const button = e.target.closest('button');

    if (!button) {
        return;
    }

    const category = button.dataset.cat;

    cfg.tags = cfg.tags.filter(function (tag) {
        return tag !== category;
    });

    renderTags();
    persist();

    say($('#setStatus'), 'Removed "' + category + '".');

    $('#newCat').focus();
});


//...Run the app ///

renderTags();
show();
refresh();