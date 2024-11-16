const express = require('express'); //express is the framework used here
const path = require('path');
const bodyParser = require('body-parser');
const { check, validationResult } = require('express-validator'); //importing validation middleware for express framework

const myApp = express();
const port = 8010; //mentioning the port of the localhost where this application will run in a browser

myApp.use(bodyParser.urlencoded({ extended: false })); //parses URL encoded data- mainly for form submission
myApp.use(express.static(path.join(__dirname, 'public'))); //inorder to serve the css file which is inside the folder public

myApp.set('view engine', 'ejs');
myApp.set('views', path.join(__dirname, 'views')); //inorder to serve the files inside the folder views

myApp.get('/', (req, res) => {
    res.render('index');             // This looks for 'views/index.ejs'
  });

myApp.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.ejs'));
  });

// Products available for purchase
const products = [
  { id: 1, name: 'Cricket ball', price: 5 },
  { id: 2, name: 'Cricket bat', price: 7 },
  { id: 3, name: 'Helmet', price: 3 },
];

// Sales tax rates by province
const taxRates = {
  'ON': 0.13,
  'QC': 0.14,
  'BC': 0.12,
  'AB': 0.05,
  'MB': 0.12,
  'SK': 0.11,
  'NS': 0.15,
  'NB': 0.15,
  'NL': 0.15,
  'PE': 0.15,
  'NT': 0.05,
  'NU': 0.05,
  'YT': 0.05,
};

// Form submission- the following actions take place when the user clicks on the Submit button
myApp.post('/submit', (req, res) => {
  const { name, address, city, province, phone, email, product } = req.body;
  const selectedProducts = Array.isArray(product) ? product : [product];

  // Server-side validation
  const errors = [];

  // Regex Pattern Defined for phone number
  let phoneReg = /^[0-9]{3}\-?[0-9]{3}\-?[0-9]{4}$/; 

  // Regex Pattern Defined for email address
  let emailReg = /^\S+@\S+\.\S+$/;

  if (!name) errors.push('Name is required.');
  if (!address) errors.push('Address is required.');
  if (!city) errors.push('City is required.');
  if (!province) errors.push('Province is required.');
  if (!phone.match(phoneReg)) errors.push('Enter a valid phone number in the format 123-456-1234');
  if (!email.match(emailReg)) errors.push('Invalid email format.');



  // Calculate total cost
  let total = 0;
  const purchasedItems = selectedProducts.map(id => {
    const item = products.find(p => p.id === parseInt(id));
    total += item.price;
    return item;
  });

  // Check if total is less than $10
  if (total < 10) {
    errors.push('Minimum purchase amount is $10.');
  }

  //If there are errors, sending the form errors
  if (errors.length > 0) {
    return res.send(`<h2>Form Errors</h2><ul>${errors.map(e => `<li>${e}</li>`).join('')}</ul>`);
  }

  // Calculate tax based on province
  const taxRate = taxRates[province];
  const tax = total * taxRate;
  const grandTotal = total + tax;

  // Render receipt
  res.render('receipt', {
    name,
    address,
    city,
    province,
    phone,
    email,
    purchasedItems,
    total,
    tax,
    grandTotal,
  });
});

//letting server to listen to the port number mentioned above
myApp.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});