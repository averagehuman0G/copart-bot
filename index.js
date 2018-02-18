const puppeteer = require('puppeteer');
const readline = require('readline');
const newCarResults = [];
// you enter the car make and model to start the search
process.stdout.write('Enter the Car Make and Model: ');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.on('line', function(line) {
  const makeAndModel = line.split(' ');
  const make = makeAndModel[0];
  const model = makeAndModel[1];
  rl.close();
  getCars(make, model);
});

async function getCars(make, model) {
  const message = `Will begin the search for ${make} ${model}`;
  console.log(message);
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });
  const url = `https://www.copart.com/lotSearchResults/?free=true&query=${make}%20${model}`;
  console.log(url);
  await page.goto(url);
  await page.waitFor(1500);
  await page.click('#lot_year');
  await page.waitFor(1500);
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
        const retailPriceSelector = `${carSelector} > td:nth-child(13) > span`;
        const locationSelector = `${carSelector} > td:nth-child(8) > a > span`;
        const lotUrlSelector = `${carSelector} > td:nth-child(3) > div > a`;

        const carYear = document.querySelector(carYearSelector).innerText;
        const carMake = document.querySelector(carMakeSelector).innerText;
        const carModel = document.querySelector(carModelSelector).innerText;
        const damageType = document.querySelector(damageTypeSelector).innerText;
        const retailPrice = document.querySelector(retailPriceSelector).innerText.split(' ')[0];
        const location = document.querySelector(locationSelector).innerText;
        const lotUrl = document
          .querySelector(lotUrlSelector)
          .getAttribute('ng-href')
          .replace('.', '');

        const url = `${window.location.hostname + lotUrl}`;
        const info = {
          carMake: carMake,
          carModel: carModel,
          carYear: carYear,
          damageType: damageType,
          retailPrice: retailPrice,
          location: location,
          url: url,
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
    await page.waitFor(2000);
  }
  console.log(`We have ${newCarResults.length} results in total`);
  await browser.close();
}
