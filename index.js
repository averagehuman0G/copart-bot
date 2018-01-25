const page = require('webpage').create();
const system = require('system');

page.viewportSize = { width: 1024, height: 768 };
//the clipRect is the portion of the page you are taking a screenshot of
page.clipRect = { top: 0, left: 0, width: 1024, height: 768 };
page.settings.userAgent =
  'Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2228.0 Safari/537.36';

if (system.args.length < 3) {
  console.log('Car make and model not entered');
  phantom.exit();
}

const carMake = system.args[1];
const carModel = system.args[2];
//lotSearchResults/?free=true&query=' + carMake + '%20' + carModel + '&page=1'
const url = 'https://www.copart.com/';

console.log('Grabbing data from: ' + url);

page.onResourceRequested = function(request) {
  console.log('Request ' + JSON.stringify(request, undefined, 4));
};
page.onResourceReceived = function(response) {
  console.log('Receive ' + JSON.stringify(response, undefined, 4));
};
console.log(page.cookies);
page.open(url, function(status) {
  console.log('Status: ' + status);
  // console.log('Results for ' + system.args[1] + ' ' + system.args[2]);
  // let list;
  page.render('example.png');
  // setTimeout(() => {
  //   list = page.evaluate(() => {
  //     // return document.querySelector('#serverSideDataTable');
  //   });
  // }, 5000);
  //
  // console.log(list);
  phantom.exit();
});
