const puppeteer = require('puppeteer');
const readline = require('readline');

const newCarResults = [];

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false,
});

rl.on('line', async function(line) {
  const makeAndModel = line.split(' ');
  const make = makeAndModel[0];
  const model = makeAndModel[1];
  console.log(make, model);
  await getCars(make, model);
  rl.close();
});

async function getCars(make, model) {
  const message = `Searching for ${make} and ${model}`;
  console.log(message);
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  const url = `https://www.copart.com/lotSearchResults/?free=true&query=${make}%20${model}`;
  console.log(url);
  await page.goto(url);
  await page.waitFor(500);
  page.click('#lot_year');
  await page.waitFor(2500);
  // We loop over 100 because that is the number of cars given to us in the first page
  // if it is a really commmon car then we will need to continue on to the next page.

  //Need to implement going to the next page and keep getting cars if there are more than 100 that meet the criteria
  // goToNewPage();
  let carDetails;
  const numberOfResults = await page.evaluate(function() {
    return document.querySelector('#serverSideDataTable > tbody').childElementCount;
  });

  for (var i = 1; i <= numberOfResults; i++) {
    carDetails = await page.evaluate(function(index) {
      const carYearSelector = `#serverSideDataTable > tbody > tr:nth-child(${index}) > td:nth-child(4) > span:nth-child(1)`;
      const carMakeSelector = `#serverSideDataTable > tbody > tr:nth-child(${index}) > td:nth-child(5) > span`;
      const carModelSelector = `#serverSideDataTable > tbody > tr:nth-child(${index}) > td:nth-child(6) > span`;
      const damageTypeSelector = `#serverSideDataTable > tbody > tr:nth-child(${index}) > td:nth-child(12) > span`;
      const carYear = document.querySelector(carYearSelector).innerText;
      const carMake = document.querySelector(carMakeSelector).innerText;
      const carModel = document.querySelector(carModelSelector).innerText;
      const damageType = document.querySelector(damageTypeSelector).innerText;
      const info = {
        carMake: carMake,
        carModel: carModel,
        carYear: carYear,
        damageType: damageType,
      };
      return info;
    }, i);
    console.log(carDetails);
    if (carDetails.carYear < 2014) {
      break;
    } else {
      newCarResults.push(carDetails);
    }
  }
  console.log(newCarResults);
  await browser.close();
}
