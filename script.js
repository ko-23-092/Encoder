const alphabets = {
    ru: "абвгдеёжзийклмнопрстуфхцчшщъыьэюя",
    en: "abcdefghijklmnopqrstuvwxyz"
};

// Справочник Морзе
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

function process(isEncrypt) {
    const text = document.getElementById('mainInput').value;
    const algo = document.getElementById('algo').value;
    const lang = document.getElementById('lang').value;
    const key = document.getElementById('key').value;
    const alphabet = alphabets[lang];
    let result = "";

    if (!text) {
        document.getElementById('output').innerText = "Введите текст!";
        return;
    }

    try {
        switch (algo) {
            case "caesar":
                let shift = parseInt(key) || 0;
                if (!isEncrypt) shift = alphabet.length - (shift % alphabet.length);
                result = runCaesar(text, shift, alphabet);
                break;
            case "atbash":
                result = runAtbash(text, alphabet);
                break;
            case "vigenere":
                result = runVigenere(text, key, alphabet, isEncrypt);
                break;
            case "gronsfeld":
                result = runGronsfeld(text, key, alphabet, isEncrypt);
                break;
            case "morse":
                result = isEncrypt ? toMorse(text) : fromMorse(text);
                break;
            case "polybius":
                result = runPolybius(text, lang, isEncrypt);
                break;
            case "bacon":
                result = runBacon(text, isEncrypt);
                break;
            default:
                result = "Этот шифр в процессе настройки...";
        }
    } catch (e) {
        result = "Ошибка: проверьте ключ или текст!";
    }

    document.getElementById('output').innerText = result;
}

// --- ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ШИФРОВ ---

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

function runAtbash(text, alphabet) {
    const reversed = alphabet.split('').reverse().join('');
    return text.split('').map(char => {
        const idx = alphabet.indexOf(char.toLowerCase());
        if (idx === -1) return char;
        const res = reversed[idx];
        return char === char.toUpperCase() ? res.toUpperCase() : res;
    }).join('');
}

function runVigenere(text, key, alphabet, isEncrypt) {
    if (!key) return "Нужен текстовый ключ!";
    key = key.toLowerCase();
    let keyIdx = 0;
    return text.split('').map(char => {
        const idx = alphabet.indexOf(char.toLowerCase());
        if (idx === -1) return char;
        const kIdx = alphabet.indexOf(key[keyIdx % key.length]);
        const shift = isEncrypt ? kIdx : (alphabet.length - kIdx) % alphabet.length;
        keyIdx++;
        const res = alphabet[(idx + shift) % alphabet.length];
        return char === char.toUpperCase() ? res.toUpperCase() : res;
    }).join('');
}

function runGronsfeld(text, key, alphabet, isEncrypt) {
    if (!key || isNaN(key)) return "Ключ должен быть числом!";
    let keyIdx = 0;
    return text.split('').map(char => {
        const idx = alphabet.indexOf(char.toLowerCase());
        if (idx === -1) return char;
        const shift = parseInt(key[keyIdx % key.length]);
        const finalShift = isEncrypt ? shift : (alphabet.length - shift) % alphabet.length;
        keyIdx++;
        const res = alphabet[(idx + finalShift) % alphabet.length];
        return char === char.toUpperCase() ? res.toUpperCase() : res;
    }).join('');
}

function toMorse(text) {
    return text.toLowerCase().split('').map(c => morseMap[c] || c).join(' ');
}

function fromMorse(text) {
    const rev = Object.fromEntries(Object.entries(morseMap).map(([k,v]) => [v,k]));
    return text.split(' ').map(c => rev[c] || c).join('');
}

function runBacon(text, isEncrypt) {
    const baconMap = { 'a': 'aaaaa', 'b': 'aaaab', 'c': 'aaaba', 'd': 'aaabb', 'e': 'aabaa', 'f': 'aabab', 'g': 'aabba', 'h': 'aabbb', 'i': 'abaaa', 'j': 'abaab', 'k': 'ababa', 'l': 'ababb', 'm': 'abbaa', 'n': 'abbab', 'o': 'abbba', 'p': 'abbbb', 'q': 'baaaa', 'r': 'baaab', 's': 'baaba', 't': 'baabb', 'u': 'babaa', 'v': 'babab', 'w': 'babba', 'x': 'babbb', 'y': 'bbaaa', 'z': 'bbaab' };
    if (isEncrypt) {
        return text.toLowerCase().split('').map(c => baconMap[c] || c).join(' ');
    } else {
        const revBacon = Object.fromEntries(Object.entries(baconMap).map(([k,v]) => [v,k]));
        return text.split(' ').map(c => revBacon[c] || c).join('');
    }
}

function runPolybius(text, lang, isEncrypt) {
    const grid = lang === 'en' ? "abcdefghiklmnopqrstuvwxyz" : "абвгдеёжзийклмнопрстуфхцчшщъыьэюя";
    const size = lang === 'en' ? 5 : 6;
    if (isEncrypt) {
        return text.toLowerCase().split('').map(c => {
            const idx = grid.indexOf(c === 'j' && lang === 'en' ? 'i' : c);
            if (idx === -1) return c;
            return Math.floor(idx / size + 1).toString() + (idx % size + 1).toString();
        }).join(' ');
    } else {
        const coords = text.replace(/\s/g, '');
        let res = "";
        for (let i = 0; i < coords.length; i += 2) {
            const r = parseInt(coords[i]) - 1;
            const c = parseInt(coords[i+1]) - 1;
            res += grid[r * size + c] || "?";
        }
        return res;
    }
}

// Привязка к кнопкам
document.getElementById('encryptBtn').addEventListener('click', () => process(true));
document.getElementById('decryptBtn').addEventListener('click', () => process(false));
