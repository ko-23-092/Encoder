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
    'y': '-.--', 'z': '--..', '0': '-----', '1': '.----', '2': '..---', '3': '...--', '4': '....-', '5': '.....',
    '6': '-....', '7': '--...', '8': '---..', '9': '----.', ' ': '/'
};

const baconMap = {
    'a': 'aaaaa', 'b': 'aaaab', 'c': 'aaaba', 'd': 'aaabb', 'e': 'aabaa', 'f': 'aabab', 'g': 'aabba', 'h': 'aabbb', 'i': 'abaaa', 'j': 'abaab', 'k': 'ababa', 'l': 'ababb', 'm': 'abbaa', 'n': 'abbab', 'o': 'abbba', 'p': 'abbbb', 'q': 'baaaa', 'r': 'baaab', 's': 'baaba', 't': 'baabb', 'u': 'babaa', 'v': 'babab', 'w': 'babba', 'x': 'babbb', 'y': 'bbaaa', 'z': 'bbaab'
};

// Функция переключения состояния поля "Ключ"
function updateKeyField() {
    const algo = document.getElementById('algo').value;
    const keyInput = document.getElementById('key');
    const noKeyAlgos = ['atbash', 'morse', 'bacon'];

    if (noKeyAlgos.includes(algo)) {
        keyInput.value = "(не требуется)";
        keyInput.disabled = true;
        keyInput.style.opacity = "0.5";
    } else {
        if (keyInput.value === "(не требуется)") keyInput.value = "";
        keyInput.disabled = false;
        keyInput.style.opacity = "1";
    }
}

function process(isEncrypt) {
    const text = document.getElementById('mainInput').value.trim();
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
            case "bacon":
                result = runBacon(text, isEncrypt);
                break;
            case "polybius":
                result = runPolybius(text, lang, isEncrypt);
                break;
            default:
                result = "Шифр в разработке";
        }
    } catch (e) {
        result = "Ошибка обработки данных!";
    }

    document.getElementById('output').innerText = result;
}

// --- ЛОГИКА ШИФРОВ ---

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

function runBacon(text, isEncrypt) {
    if (isEncrypt) {
        return text.toLowerCase().split('').map(char => {
            if (char === ' ') return '/ ';
            return baconMap[char] ? baconMap[char] + ' ' : char + ' ';
        }).join('').trim();
    } else {
        const revBacon = Object.fromEntries(Object.entries(baconMap).map(([k,v]) => [v,k]));
        return text.toLowerCase().split(' ').map(code => {
            if (code === '/') return ' ';
            return revBacon[code] || code;
        }).join('');
    }
}

function toMorse(text) {
    return text.toLowerCase().split('').map(c => morseMap[c] ? morseMap[c] + ' ' : c + ' ').join('').trim();
}

function fromMorse(text) {
    const rev = Object.fromEntries(Object.entries(morseMap).map(([k,v]) => [v,k]));
    return text.split(' ').map(c => rev[c] || c).join('');
}

function runVigenere(text, key, alphabet, isEncrypt) {
    if (!key || key === "(не требуется)") return "Нужен текстовый ключ!";
    key = key.toLowerCase().replace(/[^a-zа-я]/g, '');
    let keyIdx = 0;
    return text.split('').map(char => {
        const idx = alphabet.indexOf(char.toLowerCase());
        if (idx === -1) return char;
        const kChar = key[keyIdx % key.length];
        const kIdx = alphabet.indexOf(kChar);
        const shift = isEncrypt ? kIdx : (alphabet.length - kIdx) % alphabet.length;
        keyIdx++;
        const res = alphabet[(idx + shift) % alphabet.length];
        return char === char.toUpperCase() ? res.toUpperCase() : res;
    }).join('');
}

function runPolybius(text, lang, isEncrypt) {
    const grid = lang === 'en' ? "abcdefghiklmnopqrstuvwxyz" : "абвгдеёжзийклмнопрстуфхцчшщъыьэюя";
    const size = lang === 'en' ? 5 : 6;
    if (isEncrypt) {
        return text.toLowerCase().split('').map(c => {
            if (c === ' ') return '/ ';
            const idx = grid.indexOf(c === 'j' && lang === 'en' ? 'i' : c);
            if (idx === -1) return c + ' ';
            return (Math.floor(idx / size) + 1).toString() + (idx % size + 1).toString() + ' ';
        }).join('').trim();
    } else {
        const words = text.split(' ');
        return words.map(word => {
            if (word === '/') return ' ';
            let res = "";
            for (let i = 0; i < word.length; i += 2) {
                const r = parseInt(word[i]) - 1;
                const c = parseInt(word[i+1]) - 1;
                res += grid[r * size + c] || "?";
            }
            return res;
        }).join('');
    }
}

function runGronsfeld(text, key, alphabet, isEncrypt) {
    if (!key || isNaN(key.replace(/\D/g, ''))) return "Ключ должен быть числом!";
    let digits = key.replace(/\D/g, '');
    let keyIdx = 0;
    return text.split('').map(char => {
        const idx = alphabet.indexOf(char.toLowerCase());
        if (idx === -1) return char;
        const shift = parseInt(digits[keyIdx % digits.length]);
        const finalShift = isEncrypt ? shift : (alphabet.length - shift) % alphabet.length;
        keyIdx++;
        const res = alphabet[(idx + finalShift) % alphabet.length];
        return char === char.toUpperCase() ? res.toUpperCase() : res;
    }).join('');
}

// Привязка событий
document.getElementById('encryptBtn').addEventListener('click', () => process(true));
document.getElementById('decryptBtn').addEventListener('click', () => process(false));
document.getElementById('algo').addEventListener('change', updateKeyField);

// Вызов при загрузке, чтобы проверить начальный выбор
updateKeyField();
