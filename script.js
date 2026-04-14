// Алфавиты и справочники
const alphabets = {
    ru: "абвгдеёжзийклмнопрстуфхцчшщъыьэюя",
    en: "abcdefghijklmnopqrstuvwxyz"
};

const morseMap = {
    'а': '.-', 'б': '-...', 'в': '.--', 'г': '--.', 'д': '-..', 'е': '.', 'ё': '.', 'ж': '...-', 'з': '--..',
    'и': '..', 'й': '.---', 'к': '-.-', 'л': '.-..', 'м': '--', 'н': '-.', 'о': '---', 'п': '.--.',
    'р': '.-.', 'с': '...', 'т': '-', 'у': '..-', 'ф': '..-.', 'х': '....', 'ц': '-.-.', 'ч': '---.',
    'ш': '----', 'щ': '--.-', 'ъ': '----', 'ы': '-.--', 'ь': '-..-', 'э': '..-..', 'ю': '..--', 'я': '.-.-',
    'a': '.-', 'b': '-...', 'c': '-.-.', 'd': '-..', 'e': '.', 'f': '..-.', 'g': '--.', 'h': '....',
    'i': '..', 'j': '.---', 'k': '-.-', 'l': '.-..', 'm': '--', 'n': '-.', 'o': '---', 'p': '.--.',
    'q': '--.-', 'r': '.-.', 's': '...', 't': '-', 'u': '..-', 'v': '...-', 'w': '.--', 'x': '-..-',
    'y': '-.--', 'z': '--..', ' ': '/'
};

// Функция обработки
function process(isEncrypt) {
    const text = document.getElementById('mainInput').value;
    const algo = document.getElementById('algo').value;
    const lang = document.getElementById('lang').value;
    const key = document.getElementById('key').value;
    let result = "";

    if (!text) {
        document.getElementById('output').innerText = "Введите текст!";
        return;
    }

    if (algo === "caesar") {
        let shift = parseInt(key) || 0;
        if (!isEncrypt) shift = alphabets[lang].length - (shift % alphabets[lang].length);
        result = runCaesar(text, shift, alphabets[lang]);
    } else if (algo === "atbash") {
        result = runAtbash(text, alphabets[lang]);
    } else if (algo === "morse") {
        result = isEncrypt ? toMorse(text) : fromMorse(text);
    } else {
        result = "Этот шифр еще в разработке...";
    }

    document.getElementById('output').innerText = result;
}

// Алгоритм Цезаря
function runCaesar(text, shift, alphabet) {
    return text.split('').map(char => {
        const lower = char.toLowerCase();
        const idx = alphabet.indexOf(lower);
        if (idx === -1) return char;
        const newIdx = (idx + shift) % alphabet.length;
        const res = alphabet[newIdx];
        return char === char.toUpperCase() ? res.toUpperCase() : res;
    }).join('');
}

// Алгоритм Атбаш
function runAtbash(text, alphabet) {
    const reversed = alphabet.split('').reverse().join('');
    return text.split('').map(char => {
        const idx = alphabet.indexOf(char.toLowerCase());
        if (idx === -1) return char;
        const res = reversed[idx];
        return char === char.toUpperCase() ? res.toUpperCase() : res;
    }).join('');
}

// Морзе
function toMorse(text) {
    return text.toLowerCase().split('').map(c => morseMap[c] || c).join(' ');
}
function fromMorse(text) {
    const rev = Object.fromEntries(Object.entries(morseMap).map(([k,v]) => [v,k]));
    return text.split(' ').map(c => rev[c] || c).join('');
}

// Привязываем кнопки
document.getElementById('encryptBtn').addEventListener('click', () => process(true));
document.getElementById('decryptBtn').addEventListener('click', () => process(false));
