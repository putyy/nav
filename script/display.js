const fs = require('fs');

const arr = fs.readFileSync(__dirname + '/../src/public/main.json', 'utf-8');
const { engine, data, ...rest } = JSON.parse(arr);

function strReplace(searchArray, replaceArray, subject) {
    if (searchArray.length !== replaceArray.length) {
        throw new Error('The lengths of searchArray and replaceArray should be equal.');
    }

    for (let i = 0; i < searchArray.length; i++) {
        let search = searchArray[i];
        let replace = replaceArray[i];
        let regex = new RegExp(search, 'g');
        subject = subject.replace(regex, replace);
    }

    return subject;
}

let engineHtml = '';
let enginePlaceholder = '';
engine.forEach((value, index) => {
    if (index === 0) {
        enginePlaceholder = value.placeholder;
    }
    engineHtml += `<li class="item ${index === 0 ? 'active' : ''}" data-url="${value.url}" data-placeholder="${value.placeholder}" data-index="${index}">${value.title}</li>`;
});

let oneMenuHtml = '';
let twoMenuHtml = '';
let navsHtml = '';
data.forEach((dataItem, k1) => {
    oneMenuHtml += `<li class="item ${k1 === 0 ? 'active' : ''}" data-index="${k1}">${dataItem.title}</li>`;
    if (k1 === 0) {
        if (dataItem.menus) {
            dataItem.menus.forEach((menu) => {
                navsHtml += `<li class="item"><a class="link" href="${menu.url}" target="_blank">
                          <img alt="${menu.title}" class="icon" src="./icon/${menu.icon}"/>
                          <span class="name">${menu.title}</span>
                      </a></li>`;
            });
        }
        if (!dataItem.child){
            return;
        }
        dataItem.child.forEach((childItem, k2) => {
            if (k2 === 0) {
                twoMenuHtml += `<li class="item active" data-index="${k1}_-1">全部</li>`;
            }
            twoMenuHtml += `<li class="item" data-index="${k1}_${k2}">${childItem.title}</li>`;
            childItem.menus.forEach((menu) => {
                navsHtml += `<li class="item"><a class="link" href="${menu.url}" target="_blank">
                          <img alt="${menu.title}" class="icon" src="./icon/${menu.icon}"/>
                          <span class="name">${menu.title}</span>
                      </a></li>`;
            });
        });
    }
});

let script = ''
if (fs.existsSync(__dirname + '/script.js')) {
    script = fs.readFileSync(__dirname + '/script.js', 'utf-8');
}

let indexHtml = fs.readFileSync(__dirname + '/../src/index-cp.html', 'utf-8');
indexHtml = strReplace(
    [
        '__meta_title__',
        '__meta_keywords__',
        '__meta_description__',
        '__meta_og_url__',
        '__canonical__',
        '__title__',
        '__engine__',
        '__engine_placeholder__',
        '__one_menu__',
        '__two_menu__',
        '__navs__',
        '__script__',
    ],
    [
        rest.meta_title,
        rest.meta_keywords,
        rest.meta_description,
        rest.meta_og_url,
        rest.canonical,
        rest.title,
        engineHtml,
        enginePlaceholder,
        oneMenuHtml,
        twoMenuHtml,
        navsHtml,
        script,
    ],
    indexHtml
);

fs.writeFileSync(__dirname + '/../src/index.html', indexHtml);

console.log("大功告成！")