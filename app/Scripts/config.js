// Creating the sample data

function daysAgo(n) {
    const date = new Date();

    date.setDate(date.getDate() - n);

    return date.toISOString().slice(0, 10);
}

export const T = {

    //Categories used in the app
    tags: [
        'Food',
        'Books',
        'Transport',
        'Entertainment',
        'Fees',
        'Other'
    ],

    //Currency names and exchange rates

    units: [
        { n: 'USD', r: 1 },
        { n: 'EUR', r: 0.92 },
        { n: 'RWF', r: 1400 }
    ],

    //Each row below has a title, amount, categort and date

    seed: [
        ['Lunch at cafeteria', 12.5, 'Food', 0],
        ['Chemistry textbook', 30.99, 'Books', 1],
        ['Buss pass', 45, 'Transport', 2],
        ['Coffee with friends', 8.75, 'Entertainment', 1],
        ['Tuition fees', 0, 'Fees', '2026-09-01'],
        ['Tea and snacks', 3.2, 'Food', 3],
        ['Movie night', 15, 'Entertainment', 4],
        ['Notebook set', 6.5, 'Books', 5],
        ['Taxi to home', 70.5, 'Transport', 6],
    ]
};

//Converting the sample data to records

export function mkSeed(rows) {
    const now = new Date().toISOString();
    const records = [];

    for (let i = 0; i < rows.length; i++) {
        const row = rows[i];

        let recordDate = row[3];

        if (typeof row[3] === 'number') {
            recordDate = daysAgo(row[3]);
        }

        const record = {
            id: 'rec_' + String(i + 1).padStart(4, '0'),
            title: row[0],
            value: row[1],
            tag: row[2],
            date: recordDate,
            createdAt: now,
            updatedAt: now
        };

        records.push(record);
    }

    return records;
}