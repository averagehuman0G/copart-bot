const puppeteer = require('puppeteer');
const readline = require('readline');
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false
});

rl.on('line', function(line){
    const makeAndModel = line.split(' ');
    console.log(makeAndModel);
    const make = makeAndModel[0];
    const model = makeAndModel[1];
    console.log(make, model);
    getCars(make, model);
    rl.close();
})

async function getCars(make, model) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  const url = `https://www.copart.com/lotSearchResults/?free=true&query=${make}%20${model}`;
  console.log(url);
  await page.goto(url);

  await page.screenshot({ path: './screenshots/copart.png' });

  browser.close();
}
