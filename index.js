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
  await page.setViewport({ width: 1920, height: 1080 });
  const url = `https://www.copart.com/lotSearchResults/?free=true&query=${make}%20${model}`;
  console.log(url);
  await page.goto(url);
  await page.waitFor(2000);
  await page.click('#lot_year');
  await page.waitFor(3000);
  // await page.screenshot({ path: 'screenshots/shot.png' });

  // gets information about the results that we got back from our search
  const resultDetails = await page.evaluate(function() {
    //takes a part of the string containing the number of results and then parses it
    const dataTableInfo = '#serverSideDataTable_info';
    const numberOfResultsString = document.querySelector(dataTableInfo).innerText.split(' ')[5];
    const numberOfResults = parseInt(numberOfResultsString.replace(',', ''));

    const currentlyDisplaying = document.querySelector('#serverSideDataTable > tbody').childElementCount;

    const pages = Math.ceil(numberOfResults / currentlyDisplaying);

    return {
      currentlyDisplaying: currentlyDisplaying,
      numberOfResults: numberOfResults,
      pages: pages,
    };
  });
  console.log(resultDetails);
  // if it is a really commmon car then we will need to continue on to the next page.
  outerloop: for (let i = 0; i < resultDetails.pages; i++) {
    console.log(`On page ${i + 1}`);
    for (let j = 1; j <= resultDetails.currentlyDisplaying; j++) {
      let carDetails = await page.evaluate(function(index) {
        const carSelector = `#serverSideDataTable > tbody > tr:nth-child(${index})`;
        const carYearSelector = `${carSelector} > td:nth-child(4) > span:nth-child(1)`;
        const carMakeSelector = `${carSelector} > td:nth-child(5) > span`;
        const carModelSelector = `${carSelector} > td:nth-child(6) > span`;
        const damageTypeSelector = `${carSelector} > td:nth-child(12) > span`;

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
        console.log(info);
        return info;
      }, j);

      if (carDetails.carYear >= 2014) {
        newCarResults.push(carDetails);
      } else {
        break outerloop;
      }
      console.log(carDetails);
    }
    await page.click('#serverSideDataTable_next > a');
    console.log('Going to the next page, give me a sec.');
    await page.waitFor(2500);
  }
  console.log(`We have ${newCarResults.length} results in total`);
  await browser.close();
}
