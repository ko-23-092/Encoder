const ALPHABETS = {
    ru: "абвгдеёжзийклмнопрстуфхцчшщъыьэюя",
    en: "abcdefghijklmnopqrstuvwxyz"
};

const MORSE = {
    'а': '.-', 'б': '-...', 'в': '.--', 'г': '--.', 'д': '-..', 'е': '.', 'ё': '.', 'ж': '...-', 'з': '--..',
    'и': '..', 'й': '.---', 'к': '-.-', 'л': '.-..', 'м': '--', 'н': '-.', 'о': '---', 'п': '.--.',
    'р': '.-.', 'с': '...', 'т': '-', 'у': '..-', 'ф': '..-.', 'х': '....', 'ц': '-.-.', 'ч': '---.',
    'ш': '----', 'щ': '--.-', 'ъ': '--.--', 'ы': '-.--', 'ь': '-..-', 'э': '..-..', 'ю': '..--', 'я': '.-.-',
    'a': '.-', 'b': '-...', 'c': '-.-.', 'd': '-..', 'e': '.', 'f': '..-.', 'g': '--.', 'h': '....',
    'i': '..', 'j': '.---', 'k': '-.-', 'l': '.-..', 'm': '--', 'n': '-.', 'o': '---', 'p': '.--.',
    'q': '--.-', 'r': '.-.', 's': '...', 't': '-', 'u': '..-', 'v': '...-', 'w': '.--', 'x': '-..-',
    'y': '-.--', 'z': '--..', '0': '-----', '1': '.----', '2': '..---', '3': '...--', '4': '....-', '5': '.....',
    '6': '-....', '7': '--...', '8': '---..', '9': '----.', ' ': '/'
};

const MORSE_REV = Object.fromEntries(Object.entries(MORSE).map(([k,v]) => [v,k]));

// --- ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ---
function mod(n, m) { return ((n % m) + m) % m; }

function updateKeyField() {
    const algo = document.getElementById('algo').value;
    const keyInput = document.getElementById('key');
    const noKeyAlgos = ['atbash', 'morse', 'bacon', 'polybius'];

    if (noKeyAlgos.includes(algo)) {
        keyInput.value = "(не требуется)";
        keyInput.disabled = true;
    } else {
        if (keyInput.value === "(не требуется)") keyInput.value = "";
        keyInput.disabled = false;
    }
}

// --- АЛГОРИТМЫ ---

function caesar(text, shift, abc) {
    return text.split('').map(char => {
        const idx = abc.indexOf(char.toLowerCase());
        if (idx === -1) return char;
        const res = abc[mod(idx + shift, abc.length)];
        return char === char.toUpperCase() ? res.toUpperCase() : res;
    }).join('');
}

function atbash(text, abc) {
    return text.split('').map(char => {
        const idx = abc.indexOf(char.toLowerCase());
        if (idx === -1) return char;
        const res = abc[abc.length - 1 - idx];
        return char === char.toUpperCase() ? res.toUpperCase() : res;
    }).join('');
}

function vigenere(text, key, abc, isEncrypt, isGronsfeld) {
    if (!key) return "Введите ключ!";
    let keyIdx = 0;
    return text.split('').map(char => {
        const idx = abc.indexOf(char.toLowerCase());
        if (idx === -1) return char;
        
        let shift;
        if (isGronsfeld) {
            shift = parseInt(key[keyIdx % key.length]) || 0;
        } else {
            const kChar = key[keyIdx % key.length].toLowerCase();
            shift = abc.indexOf(kChar);
            if (shift === -1) shift = 0;
        }
        
        keyIdx++;
        const finalShift = isEncrypt ? shift : -shift;
        const res = abc[mod(idx + finalShift, abc.length)];
        return char === char.toUpperCase() ? res.toUpperCase() : res;
    }).join('');
}

function polybius(text, lang, isEncrypt) {
    if (!text) return "";

    let grid, cols;
    let isEnglish = String(lang).toLowerCase().includes('en');

    if (isEnglish) {
        grid = "ABCDEFGHIKLMNOPQRSTUVWXYZ"; 
        cols = 5;
        if (isEncrypt) {
            text = text.toUpperCase().replace(/J/g, "I").replace(/[^A-Z]/g, "");
        }
    } else {
        grid = "АБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ.,?"; 
        cols = 6;
        if (isEncrypt) {
            text = text.toUpperCase().replace(/[^А-ЯЁ.,?]/g, "");
        }
    }

    if (!text) return "Ошибка: текст не совпадает с выбранным языком";

    if (isEncrypt) {
        return text.split('').map(c => {
            let i = grid.indexOf(c);
            if (i === -1) return "";
            let row = Math.floor(i / cols) + 1;
            let col = (i % cols) + 1;
            return row.toString() + col.toString();
        }).join(' ');
    } else {
        let parts = text.trim().split(/\s+/);
        return parts.map(p => {
            if (p.length !== 2) return ""; 
            let r = parseInt(p[0]) - 1;
            let c = parseInt(p[1]) - 1;
            if (r < 0 || r >= cols || c < 0 || c >= cols) return "?";
            return grid[r * cols + c] || "?";
        }).join('');
    }
}

function bacon(text, isEncrypt) {
    const dict = { 'a': 'aaaaa', 'b': 'aaaab', 'c': 'aaaba', 'd': 'aaabb', 'e': 'aabaa', 'f': 'aabab', 'g': 'aabba', 'h': 'aabbb', 'i': 'abaaa', 'j': 'abaab', 'k': 'ababa', 'l': 'ababb', 'm': 'abbaa', 'n': 'abbab', 'o': 'abbba', 'p': 'abbbb', 'q': 'baaaa', 'r': 'baaab', 's': 'baaba', 't': 'baabb', 'u': 'babaa', 'v': 'babab', 'w': 'babba', 'x': 'babbb', 'y': 'bbaaa', 'z': 'bbaab' };
    const rev = Object.fromEntries(Object.entries(dict).map(([k,v]) => [v,k]));
    if (isEncrypt) return text.toLowerCase().split('').map(c => dict[c] ? dict[c] + ' ' : c).join('').trim();
    return text.split(' ').map(c => rev[c] || '?').join('');
}

function playfair(text, key, lang, isEncrypt) {
    if (!key) return "Ошибка: Введите ключ для шифра Плейфера!";
    if (!text) return "";

    let alphabet, cols, filler;
    let isEnglish = String(lang).toLowerCase().includes('en');

    if (isEnglish) {
        alphabet = "ABCDEFGHIKLMNOPQRSTUVWXYZ";
        cols = 5;
        filler = 'X';
        key = key.toUpperCase().replace(/J/g, "I").replace(/[^A-Z]/g, "");
        text = text.toUpperCase().replace(/J/g, "I").replace(/[^A-Z]/g, "");
    } else {
        alphabet = "АБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ.,?"; 
        cols = 6;
        filler = 'Х';
        key = key.toUpperCase().replace(/[^А-ЯЁ.,?]/g, "");
        text = text.toUpperCase().replace(/[^А-ЯЁ.,?]/g, "");
    }

    if (!text) return "Ошибка: текст не совпадает с выбранным языком";

    let uniqueKey = "";
    for (let char of key) {
        if (!uniqueKey.includes(char)) uniqueKey += char;
    }
    for (let char of alphabet) {
        if (!uniqueKey.includes(char)) uniqueKey += char;
    }

    let matrix = [];
    for (let i = 0; i < uniqueKey.length; i += cols) {
        matrix.push(uniqueKey.substring(i, i + cols).split(''));
    }

    let pairs = [];
    if (isEncrypt) {
        let i = 0;
        while (i < text.length) {
            let a = text[i];
            let b = text[i + 1];
            if (!b) {
                pairs.push([a, filler]);
                i += 1;
            } else if (a === b) {
                pairs.push([a, filler]);
                i += 1;
            } else {
                pairs.push([a, b]);
                i += 2;
            }
        }
    } else {
        for (let i = 0; i < text.length; i += 2) {
            pairs.push([text[i], text[i + 1] || filler]);
        }
    }

    let result = "";
    let rows = matrix.length;
    let shift = isEncrypt ? 1 : -1;

    for (let [a, b] of pairs) {
        let r1, c1, r2, c2;

        for (let r = 0; r < rows; r++) {
            let idxA = matrix[r].indexOf(a);
            if (idxA !== -1) { r1 = r; c1 = idxA; }
            let idxB = matrix[r].indexOf(b);
            if (idxB !== -1) { r2 = r; c2 = idxB; }
        }

        if (r1 === r2) {
            result += matrix[r1][mod(c1 + shift, cols)] + matrix[r2][mod(c2 + shift, cols)];
        } 
        else if (c1 === c2) {
            result += matrix[mod(r1 + shift, rows)][c1] + matrix[mod(r2 + shift, rows)][c2];
        } 
        else {
            result += matrix[r1][c2] + matrix[r2][c1];
        }
    }

    return result.match(/.{1,2}/g).join(' ');
}

// --- ГЛАВНАЯ ФУНКЦИЯ ОБРАБОТКИ ---

function runProcess(isEncrypt) {
    const text = document.getElementById('mainInput').value;
    const algo = document.getElementById('algo').value;
    const lang = document.getElementById('lang').value;
    const key = document.getElementById('key').value;
    const abc = ALPHABETS[lang];
    let res = "";

    if (!text) {
        document.getElementById('output').innerText = "Введите текст!";
        return;
    }

    switch (algo) {
        case 'caesar': 
            const s = parseInt(key) || 0;
            res = caesar(text, isEncrypt ? s : -s, abc); 
            break;
        case 'atbash': 
            res = atbash(text, abc); 
            break;
        case 'vigenere': 
            res = vigenere(text, key, abc, isEncrypt, false); 
            break;
        case 'gronsfeld': 
            res = vigenere(text, key, abc, isEncrypt, true); 
            break;
        case 'morse': 
            res = isEncrypt ? text.toLowerCase().split('').map(c => MORSE[c] || c).join(' ') 
                            : text.split(' ').map(c => MORSE_REV[c] || c).join('');
            break;
        case 'polybius': 
            res = polybius(text, lang, isEncrypt); 
            break;
        case 'bacon': 
            res = bacon(text, isEncrypt); 
            break;
        case 'playfair':
            res = playfair(text, key, lang, isEncrypt);
            break;
        default:
            res = "Шифр в разработке...";
    }
    
    document.getElementById('output').innerText = res;
}

// ПРИВЯЗКА СОБЫТИЙ
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('encryptBtn').addEventListener('click', () => runProcess(true));
    document.getElementById('decryptBtn').addEventListener('click', () => runProcess(false));
    document.getElementById('algo').addEventListener('change', updateKeyField);
    
    // Инициализация при загрузке
    updateKeyField();
});
