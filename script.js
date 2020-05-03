const {
    skipUntil,
    partition,
    pluck,
    combineLatest,
} = rxjs.operators;
const { fromEvent, merge, pipe } = rxjs;


const body = document.querySelector("body");
const invalidPlaceholder = document.querySelector(".invalid > span");

const rgb2hex = (r,g,b) => [r,g,b]
    .map(v => ("0" + parseInt(v,10).toString(16)).slice(-2)).join('')

const hexToRgb = (hex) => {
    const r = parseInt(hex.substring(0,2), 16);
    const g = parseInt(hex.substring(2,4), 16);
    const b = parseInt(hex.substring(4,6), 16);
    return {
        r,g,b
    }
};

const isValidHex = hex => (/^#[0-9A-F]{6}$/i.test('#' + hex))
const isValidRGB = colorCode => (parseInt(colorCode) <= 255 || parseInt(colorCode) <0)


// data flow

const [hexInput, redInput, greenInput, blueInput] =
    ['hex', 'red','green','blue'].map(color =>   document.querySelector(`[name='${color}']`));

const [hexValue$, redValue$, greenValue$, blueInput$] =
    [hexInput, redInput, greenInput, blueInput]
        .map(node => fromEvent(node, "input")
            .pipe(pluck("srcElement", "value")));
const rgb$ = redValue$
    .pipe(combineLatest(greenValue$, blueInput$));

const [rgbValid$, rgbInvalid$] = rgb$
    .pipe(partition((args) => args.every(isValidRGB)));

const [hexValid$, hexInvalid$] = hexValue$
    .pipe(partition(isValidHex));

const isInValid$ = merge(hexInvalid$, rgbInvalid$)
    .pipe(skipUntil(merge(hexValid$ ,rgbValid$)));

hexValid$.subscribe(hex => {
    const {r,g,b} = hexToRgb(hex);
    redInput.value = r;
    greenInput.value = g;
    blueInput.value = b;
    body.style.background = `#${hex}`;
});

rgbValid$
    .subscribe(([r,g,b]) => {
        hexInput.value = rgb2hex(r,g,b);
        invalidPlaceholder.innerHTML = '';
        body.style.background = `rgb(${r},${g},${b})`;
    });

isInValid$.subscribe(e => {
    invalidPlaceholder.innerHTML = 'invalid value';
});
