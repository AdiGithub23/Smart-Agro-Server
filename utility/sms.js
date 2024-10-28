const axios = require('axios');

const sendSms = async (managers, customer, sltadmins, message) => {
  
  const formatPhoneNumber = (phoneNumber) => {
    if (phoneNumber.startsWith('0')) {
      return phoneNumber.replace(/^0/, '+94');
    }
    return phoneNumber;
  };

  // // Create the list of recipients with formatted phone numbers
  // const smsRecipients = [
  //   ...managers.map(m => formatPhoneNumber(m.manager.phone_number)),
  //   formatPhoneNumber(customer.customer.phone_number),
  //   ...sltadmins.map(s => formatPhoneNumber(s.phone_number))
  // ];

  // Create the list of recipients with phone numbers
  // const smsRecipients = [
  //   ...managers.map(m => (m.manager.phone_number)),
  //   (customer.customer.phone_number),
  //   ...sltadmins.map(s => (s.phone_number))
  // ];
  const smsRecipients = [
    ...managers.map(m => (m.manager.phone_number))
  ];

  // API URL
  const smsApiUrl = process.env.SMS_API_URL; 
  const apiKey = process.env.SMS_API_KEY;

  // try {
  //   // Send SMS to each recipient
  //   const sendSmsPromises = smsRecipients.map(async (number) => {
  //     const requestBody = {
  //       mobile: number,
  //       msg: message 
  //     };

  //     const headers = {
  //       'accept': 'application/json',
  //       'X-Api-Key': apiKey, 
  //       'Content-Type': 'application/json',
  //     };

  //     const response = await axios.post(smsApiUrl, requestBody, { headers });
  //     return response.data;
  //   });

  //   const results = await Promise.all(sendSmsPromises);
  //   console.log('SMS sent successfully:', results);
  // } catch (error) {
  //   if (error.response) {
  //     console.error('Error sending SMS via HTTP API:', JSON.stringify(error.response.data, null, 2));
  //   } else {
  //     console.error('Error sending SMS via HTTP API:', error.message);
  //   }
  // }

  const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  try {
    // Send SMS to each recipient with a delay after each message is sent
    for (const number of smsRecipients) {
      const requestBody = {
        mobile: number,
        msg: message 
      };

      const headers = {
        'accept': 'application/json',
        'X-Api-Key': apiKey, 
        'Content-Type': 'application/json',
      };

      // Send SMS
      const response = await axios.post(smsApiUrl, requestBody, { headers });
      console.log(`SMS sent to ${number}:`, response.data);

      // Add a delay after sending each SMS
      await sleep(10000); // 10 second
    }

    console.log('All SMS messages sent successfully.');
  } catch (error) {
    if (error.response) {
      console.error('Error sending SMS via HTTP API:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.error('Error sending SMS via HTTP API:', error.message);
    }
  }
};

module.exports = {
  sendSms
};


// const twilio = require('twilio');
// require('dotenv').config();

// // Initialize Twilio client
// const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

// // Function to send SMS via Twilio
// const sendSms = async (managers, customer, sltadmins, title, message) => {

//   const formatPhoneNumber = (phoneNumber) => {
//     // Replace the leading 0 with +94
//     if (phoneNumber.startsWith('0')) {
//       return phoneNumber.replace(/^0/, '+94');
//     }
//     return phoneNumber;
//   };

//   // // Create the list of recipients with formatted phone numbers
//   // const smsRecipients = [
//   //   ...managers.map(m => formatPhoneNumber(m.manager.phone_number)),
//   //   formatPhoneNumber(customer.customer.phone_number),
//   //   ...sltadmins.map(s => formatPhoneNumber(s.phone_number))
//   // ];

//   const smsRecipients = [
//     formatPhoneNumber(customer.customer.phone_number)
//   ];

//   try {
//     // Send SMS to each recipient
//     const sendSmsPromises = smsRecipients.map(number => {
//       return client.messages.create({
//         body: message,
//         from: process.env.TWILIO_PHONE_NUMBER, // Twilio phone number
//         to: number
//       });
//     });

//     await Promise.all(sendSmsPromises);
//     console.log('SMS sent successfully via Twilio');
//   } catch (error) {
//     console.error('Error sending SMS via Twilio:', error.message);
//   }
// };

// module.exports = {
//   sendSms
// };
