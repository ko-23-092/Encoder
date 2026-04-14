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

function polybius(text, abc, isEncrypt) {
    const size = Math.ceil(Math.sqrt(abc.length));
    if (isEncrypt) {
        return text.toLowerCase().split('').map(c => {
            const i = abc.indexOf(c);
            return i === -1 ? c : `${Math.floor(i/size)+1}${i%size+1} `;
        }).join('').trim();
    } else {
        const coords = text.match(/\d{2}/g);
        if (!coords) return "Ошибка (нужны пары цифр)";
        return coords.map(c => abc[(parseInt(c[0])-1)*size + (parseInt(c[1])-1)] || '?').join('');
    }
}

function bacon(text, isEncrypt) {
    const dict = { 'a': 'aaaaa', 'b': 'aaaab', 'c': 'aaaba', 'd': 'aaabb', 'e': 'aabaa', 'f': 'aabab', 'g': 'aabba', 'h': 'aabbb', 'i': 'abaaa', 'j': 'abaab', 'k': 'ababa', 'l': 'ababb', 'm': 'abbaa', 'n': 'abbab', 'o': 'abbba', 'p': 'abbbb', 'q': 'baaaa', 'r': 'baaab', 's': 'baaba', 't': 'baabb', 'u': 'babaa', 'v': 'babab', 'w': 'babba', 'x': 'babbb', 'y': 'bbaaa', 'z': 'bbaab' };
    const rev = Object.fromEntries(Object.entries(dict).map(([k,v]) => [v,k]));
    if (isEncrypt) return text.toLowerCase().split('').map(c => dict[c] ? dict[c] + ' ' : c).join('').trim();
    return text.split(' ').map(c => rev[c] || '?').join('');
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
            res = polybius(text, abc, isEncrypt); 
            break;
        case 'bacon': 
            res = bacon(text, isEncrypt); 
            break;
        case 'playfair':
            res = "Шифр Плейфера: используется в спец. версии. Попробуйте Виженер.";
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
