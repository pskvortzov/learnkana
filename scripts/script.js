"use strict";

const glyph = document.querySelector('#glyph');
const click = document.querySelector('#click');
const reading = document.querySelector('#reading');
const buttons = document.querySelector('#buttons');
const checkbox = document.querySelector('#checkbox');

let learningMode, kana, allKeys, previousRound, keys, randomIndex, previousGlyph, currentGlyph, currentSyllable, variants, speechStartGlyph, speechEndGlyph;

let lastPressedKeys = [];

window.SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

const recognition = new SpeechRecognition();
recognition.interimResults = true;
recognition.maxAlternatives = 10;
recognition.lang = 'zh-CN';

document.addEventListener('keydown', pressKey);
document.querySelectorAll('#buttons button')
	.forEach(element => element.addEventListener('click', pressButton));

recognition.addEventListener('result', parseResults);
recognition.addEventListener('audiostart', () => speechStartGlyph = currentGlyph);
recognition.addEventListener('audioend', wrongAnswer)
recognition.addEventListener('end', recognition.start);

setupStyles();

function getRandomGlyph() {
	if (keys.length == 0) {
		if (learningMode && allKeys.length > 0) {
			const rand = Math.floor(Math.random() * allKeys.length);
			keys = previousRound.concat(allKeys[rand]);
			previousRound = [...keys];
			allKeys.splice(allKeys.indexOf(allKeys[rand]), 1);
		} else {
			keys = Object.keys(kana);
		}
	}

	randomIndex = Math.floor(Math.random() * keys.length);
	currentGlyph = keys[randomIndex];

	if (currentGlyph === previousGlyph) {
		getRandomGlyph();
	}

	currentSyllable = kana[currentGlyph];
	variants = getPronunciationVariants(currentSyllable);
	speechEndGlyph = currentGlyph;

	glyph.innerHTML = `<span id='kana'>${currentGlyph}</span><span id='reading'>${currentSyllable}</span>`;
}

function correctAnswer() {
	previousGlyph = currentGlyph;

	lastPressedKeys = [];
	recognition.abort();
	click.play();

	keys.splice(randomIndex, 1);

	getRandomGlyph();
}

function wrongAnswer() {
	if (speechStartGlyph === speechEndGlyph) {
		glyph.classList.add('wrong');
		setTimeout(() => glyph.classList.remove('wrong'), 300);
	}
}

function pressButton(event) {
	learningMode = checkbox.querySelector('input').checked;

	kana = getKana(event.target.dataset.option);
	keys = Object.keys(kana);

	if (learningMode) {
		const rand = Math.floor(Math.random() * keys.length);
		allKeys = [...keys];
		keys = [keys[rand]];
		previousRound = [...keys];

		allKeys.splice(allKeys.indexOf(keys[0]), 1);
	}

	recognition.start();

	getRandomGlyph();

	buttons.classList.remove('visible');
	checkbox.classList.remove('visible');
	buttons.classList.add('hidden');
	checkbox.classList.add('hidden');

	buttons.addEventListener('transitionend', () => {
		buttons.style.display = 'none';
		checkbox.style.display = 'none';
		glyph.style.transition = 'all .4s';
		glyph.style.opacity = 1;
	});
}

function pressKey(event) {
	lastPressedKeys.push(event.key);

	if (lastPressedKeys.length > 3) {
		lastPressedKeys.shift();
	}

	if (currentSyllable && lastPressedKeys.slice(-currentSyllable.length).join('').toLowerCase() == currentSyllable) {
		correctAnswer();
	}
};

function parseResults(event) {
	let parsedResults;

	[...event.results].forEach(result => {
		[...result].forEach(alternative => {
			parsedResults = alternative.transcript;
		});
	});

	const hanzi = parsedResults.replace(/[ a-z0-9'?!,-]/gi, '').split('');
	const latin = parsedResults.replace(/[^ a-z0-9'?!,-]/gi, '').split(' ');

	[...new Set(hanzi.concat(latin))]
		.filter(item => item)
		.forEach(word => {
			if (variants.includes(word.toLowerCase())) {
				correctAnswer();
			}
		});
}

function getKana(source) {
	const sources = {
		'hiragana': {
			'あ': 'a',
			'か': 'ka',
			'さ': 'sa',
			'た': 'ta',
			'な': 'na',
			'は': 'ha',
			'ま': 'ma',
			'や': 'ya',
			'ら': 'ra',
			'わ': 'wa',
			'い': 'i',
			'き': 'ki',
			'し': 'shi',
			'ち': 'chi',
			'に': 'ni',
			'ひ': 'hi',
			'み': 'mi',
			'り': 'ri',
			'ゐ': 'wi',
			'う': 'u',
			'く': 'ku',
			'す': 'su',
			'つ': 'tsu',
			'ぬ': 'nu',
			'ふ': 'fu',
			'む': 'mu',
			'ゆ': 'yu',
			'る': 'ru',
			'え': 'e',
			'け': 'ke',
			'せ': 'se',
			'て': 'te',
			'ね': 'ne',
			'へ': 'he',
			'め': 'me',
			'れ': 're',
			'ゑ': 'we',
			'お': 'o',
			'こ': 'ko',
			'そ': 'so',
			'と': 'to',
			'の': 'no',
			'ほ': 'ho',
			'も': 'mo',
			'よ': 'yo',
			'ろ': 'ro',
			'を': 'wo',
			'ん': 'n'
		},
		'katakana': {
			'ア': 'a',
			'カ': 'ka',
			'サ': 'sa',
			'タ': 'ta',
			'ナ': 'na',
			'ハ': 'ha',
			'マ': 'ma',
			'ヤ': 'ya',
			'ラ': 'ra',
			'ワ': 'wa',
			'イ': 'i',
			'キ': 'ki',
			'シ': 'shi',
			'チ': 'chi',
			'ニ': 'ni',
			'ヒ': 'hi',
			'ミ': 'mi',
			'リ': 'ri',
			'ヰ': 'wi',
			'ウ': 'u',
			'ク': 'ku',
			'ス': 'su',
			'ツ': 'tsu',
			'ヌ': 'nu',
			'フ': 'fu',
			'ム': 'mu',
			'ユ': 'yu',
			'ル': 'ru',
			'エ': 'e',
			'ケ': 'ke',
			'セ': 'se',
			'テ': 'te',
			'ネ': 'ne',
			'ヘ': 'he',
			'メ': 'me',
			'レ': 're',
			'ヱ': 'we',
			'オ': 'o',
			'コ': 'ko',
			'ソ': 'so',
			'ト': 'to',
			'ノ': 'no',
			'ホ': 'ho',
			'モ': 'mo',
			'ヨ': 'yo',
			'ロ': 'ro',
			'ヲ': 'wo',
			'ン': 'n'
		},
		'hentaigana': {
			'𛀂': 'a',
			'𛀃': 'a',
			'𛀄': 'a',
			'𛀅': 'a',
			'𛀆': 'i',
			'𛀇': 'i',
			'𛀈': 'i',
			'𛀉': 'i',
			'𛀊': 'u',
			'𛀋': 'u',
			'𛀌': 'u',
			'𛀍': 'u',
			'𛀎': 'u',
			'𛀏': 'e',
			'𛀐': 'e',
			'𛀑': 'e',
			'𛀒': 'e',
			'𛀓': 'e',
			'𛀁': 'e',
			'𛀔': 'o',
			'𛀕': 'o',
			'𛀖': 'o',
			'𛀘': 'ka',
			'𛀙': 'ka',
			'𛀚': 'ka',
			'𛀛': 'ka',
			'𛀜': 'ka',
			'𛀝': 'ka',
			'𛀞': 'ka',
			'𛀟': 'ka',
			'𛀠': 'ka',
			'𛀡': 'ka',
			'𛀢': 'ka',
			'𛀣': 'ki',
			'𛀤': 'ki',
			'𛀥': 'ki',
			'𛀦': 'ki',
			'𛀧': 'ki',
			'𛀨': 'ki',
			'𛀩': 'ki',
			'𛀪': 'ki',
			'𛀻': 'ki',
			'𛀫': 'ku',
			'𛀬': 'ku',
			'𛀭': 'ku',
			'𛀮': 'ku',
			'𛀯': 'ku',
			'𛀰': 'ku',
			'𛀱': 'ku',
			'𛀲': 'ke',
			'𛀳': 'ke',
			'𛀴': 'ke',
			'𛀵': 'ke',
			'𛀶': 'ke',
			'𛀷': 'ke',
			'𛀢': 'ke',
			'𛀸': 'ko',
			'𛀹': 'ko',
			'𛀺': 'ko',
			'𛀻': 'ko',
			'𛂘': 'ko',
			'𛀼': 'sa',
			'𛀽': 'sa',
			'𛀾': 'sa',
			'𛀿': 'sa',
			'𛁀': 'sa',
			'𛁁': 'sa',
			'𛁂': 'sa',
			'𛁃': 'sa',
			'𛁄': 'shi',
			'𛁅': 'shi',
			'𛁆': 'shi',
			'𛁇': 'shi',
			'𛁈': 'shi',
			'𛁉': 'shi',
			'𛁊': 'su',
			'𛁋': 'su',
			'𛁌': 'su',
			'𛁍': 'su',
			'𛁎': 'su',
			'𛁏': 'su',
			'𛁐': 'su',
			'𛁑': 'su',
			'𛁒': 'se',
			'𛁓': 'se',
			'𛁔': 'se',
			'𛁕': 'se',
			'𛁖': 'se',
			'𛁗': 'so',
			'𛁘': 'so',
			'𛁙': 'so',
			'𛁚': 'so',
			'𛁛': 'so',
			'𛁜': 'so',
			'𛁝': 'so',
			'𛁞': 'ta',
			'𛁟': 'ta',
			'𛁠': 'ta',
			'𛁡': 'ta',
			'𛁢': 'chi',
			'𛁣': 'chi',
			'𛁤': 'chi',
			'𛁥': 'chi',
			'𛁦': 'chi',
			'𛁧': 'chi',
			'𛁨': 'chi',
			'𛁩': 'tsu',
			'𛁪': 'tsu',
			'𛁫': 'tsu',
			'𛁬': 'tsu',
			'𛁭': 'tsu',
			'𛁮': 'te',
			'𛁯': 'te',
			'𛁰': 'te',
			'𛁱': 'te',
			'𛁲': 'te',
			'𛁳': 'te',
			'𛁴': 'te',
			'𛁵': 'te',
			'𛁶': 'te',
			'𛁷': 'to',
			'𛁸': 'to',
			'𛁹': 'to',
			'𛁺': 'to',
			'𛁻': 'to',
			'𛁼': 'to',
			'𛁽': 'to',
			'𛁭': 'to',
			'𛁾': 'na',
			'𛁿': 'na',
			'𛂀': 'na',
			'𛂁': 'na',
			'𛂂': 'na',
			'𛂃': 'na',
			'𛂄': 'na',
			'𛂅': 'na',
			'𛂆': 'na',
			'𛂇': 'ni',
			'𛂈': 'ni',
			'𛂉': 'ni',
			'𛂊': 'ni',
			'𛂋': 'ni',
			'𛂌': 'ni',
			'𛂍': 'ni',
			'𛂎': 'ni',
			'𛂏': 'nu',
			'𛂐': 'nu',
			'𛂑': 'nu',
			'𛂒': 'ne',
			'𛂓': 'ne',
			'𛂔': 'ne',
			'𛂕': 'ne',
			'𛂖': 'ne',
			'𛂗': 'ne',
			'𛂘': 'ne',
			'𛂙': 'no',
			'𛂚': 'no',
			'𛂛': 'no',
			'𛂜': 'no',
			'𛂝': 'no',
			'𛂞': 'ha',
			'𛂟': 'ha',
			'𛂠': 'ha',
			'𛂡': 'ha',
			'𛂢': 'ha',
			'𛂣': 'ha',
			'𛂤': 'ha',
			'𛂥': 'ha',
			'𛂦': 'ha',
			'𛂧': 'ha',
			'𛂨': 'ha',
			'𛂩': 'hi',
			'𛂪': 'hi',
			'𛂫': 'hi',
			'𛂬': 'hi',
			'𛂭': 'hi',
			'𛂮': 'hi',
			'𛂯': 'hi',
			'𛂰': 'hu',
			'𛂱': 'hu',
			'𛂲': 'hu',
			'𛂳': 'he',
			'𛂴': 'he',
			'𛂵': 'he',
			'𛂶': 'he',
			'𛂷': 'he',
			'𛂸': 'he',
			'𛂹': 'he',
			'𛂺': 'ho',
			'𛂼': 'ho',
			'𛂽': 'ho',
			'𛂾': 'ho',
			'𛂿': 'ho',
			'𛃀': 'ho',
			'𛃁': 'ho',
			'𛃂': 'ma',
			'𛃃': 'ma',
			'𛃄': 'ma',
			'𛃅': 'ma',
			'𛃆': 'ma',
			'𛃇': 'ma',
			'𛃈': 'ma',
			'𛃖': 'ma',
			'𛃉': 'mi',
			'𛃊': 'mi',
			'𛃋': 'mi',
			'𛃌': 'mi',
			'𛃍': 'mi',
			'𛃎': 'mi',
			'𛃏': 'mi',
			'𛃑': 'mu',
			'𛃒': 'mu',
			'𛃓': 'mu',
			'𛄝': 'mu',
			'𛄞': 'mu',
			'𛃔': 'me',
			'𛃕': 'me',
			'𛃖': 'me',
			'𛃗': 'mo',
			'𛃘': 'mo',
			'𛃙': 'mo',
			'𛃚': 'mo',
			'𛃛': 'mo',
			'𛃜': 'mo',
			'𛄝': 'mo',
			'𛄞': 'mo',
			'𛃝': 'ya',
			'𛃞': 'ya',
			'𛃟': 'ya',
			'𛃠': 'ya',
			'𛃡': 'ya',
			'𛃢': 'ya',
			'𛃣': 'yu',
			'𛃤': 'yu',
			'𛃥': 'yu',
			'𛃦': 'yu',
			'𛃧': 'yo',
			'𛃨': 'yo',
			'𛃩': 'yo',
			'𛃪': 'yo',
			'𛃫': 'yo',
			'𛃬': 'yo',
			'𛃢': 'yo',
			'𛃭': 'ra',
			'𛃮': 'ra',
			'𛃯': 'ra',
			'𛃰': 'ra',
			'𛁽': 'ra',
			'𛃱': 'ri',
			'𛃲': 'ri',
			'𛃳': 'ri',
			'𛃴': 'ri',
			'𛃵': 'ri',
			'𛃶': 'ri',
			'𛃷': 'ri',
			'𛃸': 'ru',
			'𛃹': 'ru',
			'𛃺': 'ru',
			'𛃻': 'ru',
			'𛃼': 'ru',
			'𛃽': 'ru',
			'𛃾': 're',
			'𛃿': 're',
			'𛄀': 're',
			'𛄁': 're',
			'𛄂': 'ro',
			'𛄃': 'ro',
			'𛄄': 'ro',
			'𛄅': 'ro',
			'𛄆': 'ro',
			'𛄇': 'ro',
			'𛄈': 'wa',
			'𛄉': 'wa',
			'𛄊': 'wa',
			'𛄋': 'wa',
			'𛄌': 'wa',
			'𛄍': 'wi',
			'𛄎': 'wi',
			'𛄏': 'wi',
			'𛄐': 'wi',
			'𛄑': 'wi',
			'𛄒': 'we',
			'𛄓': 'we',
			'𛄔': 'we',
			'𛄕': 'we',
			'𛄖': 'wo',
			'𛄗': 'wo',
			'𛄘': 'wo',
			'𛄚': 'wo',
			'𛄛': 'wo',
			'𛄜': 'wo',
			'𛀅': 'wo',
			'𛄝': 'n',
			'𛄞': 'n'
		}
	};

	return sources[source];
}

function getPronunciationVariants(syllable) {
	const syllables  = {
		'a': ['a', '啊'],
		'ka': ['ka', '高', '干', '刚', '感', '看'],
		'sa': ['sa', '傻', '上', '3', '三', '散', '山'],
		'ta': ['ta', '打', '单', '大', '当', '但', '他'],
		'na': ['na', '那', '呢'],
		'ha': ['ha', '哈', '好', '嗨', '海', '还'],
		'ma': ['ma', '妈', '马', '吗', '么', '毛'],
		'ya': ['ya', '要', '1', '一', '呀', '药', '亚'],
		'ra': ['ra', '拉', '啦', '那', '了'],
		'wa': ['wa', '发', '我', '哇', '喂', '王', '8', '八', '扒'],
		'i': ['i', '1', '一', '伊', '易', '医', '依', '衣'],
		'ki': ['ki', '一', '奇', '基', '几', '今'],
		'shi': ['shi', '西',  '嘻', '茜', '栖', '新', '心'],
		'chi': ['chi', '七', '7', '鸡', '期', '奇', '请', '亲', '几', '记'],
		'ni': ['ni', '你', '米', '呢', '咪'],
		'hi': ['hi', '西', '嘻', '希', '屁'],
		'mi': ['mi', '密', '米', '你', '明'],
		'ri': ['ri', '李', '利', '沥', '里', '礼', '理', '你'],
		'wi': ['wi', 'we', 'v', 'vip', 'win', 'Wii', '1', '一', '伊', '易', '医', '依', '衣', '因', '音', '立', '李'],
		'u': ['u', '无', '5', '五', '唔', '吾', '不'],
		'ku': ['ku', 'google', '古', '故', '鼓', '酷', '苦', '哭'],
		'su': ['su', '四', '4', '搜', '数', '鼠', '主', '苏'],
		'tsu': ['tsu', '足', '猪', '租', '足', '自'],
		'nu': ['nu', 'no', 'know', 'now', '闹', '弄'],
		'fu': ['fu', '附', '风', '福', '虎', '呼', '夫', '妇'],
		'mu': ['mu', '没', '猫', '木', '梦', '孟', '毛', '母', '萌'],
		'yu': ['yu', 'you', '优', '于', '与', '语', '雨', '有'],
		'ru': ['ru', '如', '路', '绿'],
		'e': ['e', '饿', '2', '二', '呃'],
		'ke': ['ke', 'can', 'gap', 'cat', '该', '这'],
		'se': ['se', 'say', 'c', '色', '赛', '3', '三'],
		'te': ['te', 'the', '对', '大', '的', '地', '得', '队', '天', '点'],
		'ne': ['ne', 'nat', 'next', 'nest', '那', '内'],
		'he': ['he', 'hi', 'hei', '黑', '嘿', '嗨'],
		'me': ['me', 'map', 'mad', 'make', 'main', '美'],
		're': ['re', 'la', 'play', '连'],
		'we': ['v', 'van', 'where', '为', '喂'],
		'o': ['o', '播', '哦', '沃', '我'],
		'ko': ['ko', 'go', '高', '狗', '好', '过', '口', '公'],
		'so': ['so', 'song', '搜',	'骚', '操', '所', '扫', '手'],
		'to': ['to', '导', '到', '打', '大', '当', '桶', '同'],
		'no': ['no', 'now', 'know', '闹', '脑', '啂'],
		'ho': ['ho', 'home', 'hong', '好', '红'],
		'mo': ['mo', '某', '梦', '猫', '毛'],
		'yo': ['yo', '要', '1', '一', '药', '有', '用'],
		'ro': ['ro', '肉', '让', '如'],
		'wo': ['wo', '我', '王', '汪', '网'],
		'n': ['n', 'and', 'end']
	};

	return syllables[syllable];
}

function setupStyles() {
	buttons.style.transition = 'all .4s';
	checkbox.style.transition = 'all .4s';

	buttons.classList.remove('hidden');
	checkbox.classList.remove('hidden');
	buttons.classList.add('visible');
	checkbox.classList.add('visible');

	document.querySelector('#createdby a').style.transition = 'all .4s';
}
