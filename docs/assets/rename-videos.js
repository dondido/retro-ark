const fs = require('node:fs');
// Function to get current filenames
// in directory
const filenames = fs.readdirSync(__dirname);

console.log("\nCurrent directory filenames:");
/* filenames.forEach(file => {
    console.log(file);
}); */
const csv = filenames.reduce((acc, filename)=> `${acc}${filename.replace('-video.mp4','\n')}`, '');
fs.writeFileSync('nes.csv', csv);