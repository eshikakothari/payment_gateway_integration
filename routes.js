//Include Checksum.js Module
const checksum_lib = require('./checksum/checksum')
//Export Routes to App.js
module.exports = (app) => {
  //Listen Root
  app.get('/', (req, res) => {
    res.render('home1');
  });
  app.get("/home", function(req, res) {
    res.render("home");
  })
  //Listen for /success. Post Type. Paytm Sends Posts request after transaction.
  app.post('/success', (req, res) => {
    if (req.body.STATUS == "TXN_SUCCESS")
      res.render('success', {
        data: JSON.parse(JSON.stringify(req.body))
      })
    else
      res.render('failure');
  })

  ///payment is for to create checksum and call the payment process page
  app.post('/payment', (req, res) => {
    //Create Array of Parameters that need to create checksum
    let paytmParams = {
      "MID": process.env.MID,
      "WEBSITE": process.env.WEBSITE,
      "INDUSTRY_TYPE_ID": process.env.INDUSTRY_TYPE_ID,
      "CHANNEL_ID": process.env.CHANNEL_ID,
      //Used some random number generation method for order id. this should be unique each time
      "ORDER_ID": getRandomInt(5000),
      "CUST_ID": process.env.CUST_ID,
      "MOBILE_NO": req.body.mobile,
      "EMAIL": req.body.email,
      "TXN_AMOUNT": req.body.amount,
      "CALLBACK_URL": process.env.CALLBACK_URL
    }

    //It's a function of checksum.js module, inbuilt fuction.
    //Pass Parameters array, Merchant Key and callback function.
    checksum_lib.genchecksum(paytmParams, process.env.MKEY, function(err, checksum) {
      //Create Form to process payment after getting checksum.
      res.writeHead(200, {
        'Content-Type': 'text/html'
      });
      res.write('<html>');
      res.write('<head>');
      res.write('<title>Merchant Checkout Page</title>');
      res.write('</head>');
      res.write('<body>');
      res.write('<center><h1>Please do not refresh this page...</h1></center>');
      res.write('<form method="post" action="' + process.env.URL + '" name="paytm_form">');
      for (var x in paytmParams) {
        res.write('<input type="hidden" name="' + x + '" value="' + paytmParams[x] + '">');
      }
      res.write('<input type="hidden" name="CHECKSUMHASH" value="' + checksum + '">');
      res.write('</form>');
      res.write('<script type="text/javascript">');
      res.write('document.paytm_form.submit();');
      res.write('</script>');
      res.write('</body>');
      res.write('</html>');
      res.end();
    })
  })

}
//Random number generation method.
getRandomInt = (max) => {
  return String(Math.floor(Math.random() * Math.floor(max)))
}
