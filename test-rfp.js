const axios = require('axios');

// Test data
const testData = {
  userId: '123',
  eventId: 'test-event-123',
  prompt: 'Create an RFP for a 3-day executive retreat for 50 people with U-shaped seating, requiring 2 breakout rooms, lunch and coffee breaks each day.'
};

console.log('Testing RFP generation with prompt:', testData.prompt);

// Call the API
axios.post('http://localhost:3001/api/modifyRFP', testData)
  .then(response => {
    console.log('Success! RFP generated:');
    console.log('-----------------------------------');
    console.log(response.data.rfp);
    console.log('-----------------------------------');
  })
  .catch(error => {
    console.error('Error testing RFP generation:');
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('Response data:', error.response.data);
      console.error('Status code:', error.response.status);
    } else if (error.request) {
      // The request was made but no response was received
      console.error('No response received from server');
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('Error message:', error.message);
    }
  }); 