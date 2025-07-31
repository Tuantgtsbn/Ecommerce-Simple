const paypal = require("paypal-rest-sdk");
require("dotenv").config();
paypal.configure({
  mode: "sandbox",
  client_id:
    "AR7Fm4S3nAqvGPn9T44ZlKiH8tj1AZ3NJicVqer1ClsRUD21z38eWZYK6TUqx_2MFDylxIoCMV2MVDpe",
  client_secret:
    "ECTguqpbRJPM-8BChwn6NuoqErCyDoXxFV7bkkq3391zGhHpd3E8AYhxGoUqt9Oswcpn4TLjuiY8KXwm",
});

module.exports = paypal;
