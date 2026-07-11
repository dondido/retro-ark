const ROMAN_NUMERALS_TO_ARABIC = { 'IV': 4,'III': 3, 'II': 2, 'VII': 7, 'VI': 6, 'V': 5 };
export const romanToArabic = (file) => file
    .replace((/\b(IV|VII|VI|V|III|II)\b/gi), matched => ROMAN_NUMERALS_TO_ARABIC[matched.toUpperCase()])
    //everything that matches [*], (*), strips off file extension and leaves only letters, numbers and blank spaces
    //.replace(/ *\([^)]*\) *| *\[[^)]*\] *|\.[^/.]+$|[^a-z0-9\s]+/gi, '');
export const stripSpecialCharacters = file => file.replace(/ *\([^)]*\) *| *\[[^)]*\] *|[^a-z0-9\s]+/gi, '');
window.webViewPromises = {};
export const callWebview = (feature, param) => new Promise((resolve) => {
    window.webViewPromises[feature] = resolve;
    window.RomFileBridge[feature](param);
    console.log(1111146, feature, param);
});
