// Test script for RFP modification through chat
const axios = require('axios');

const API_URL = 'http://localhost:3001/api';

// Sample RFP text
const sampleRFP = `
# REQUEST FOR PROPOSAL (RFP)
## Corporate Retreat

## 1. EVENT OVERVIEW
We are planning a corporate retreat for 50 people and are seeking proposals from venues that can accommodate our requirements.

## 2. EVENT DETAILS
- **Event Type:** Corporate Retreat
- **Date:** October 15-17, 2023
- **Number of Guests:** 50
- **Event Duration:** 3 days, 2 nights

## 3. VENUE REQUIREMENTS
- **Space Required:** Approximately 20m x 30m
- **Seating Arrangement:** Theater style for presentations, round tables for meals
- **Room Setup:** The venue should be able to accommodate our floor plan which includes tables, a stage area, and space for movement.

## 4. CATERING REQUIREMENTS
- **Service Style:** Buffet
- **Dietary Restrictions:** Venue must be able to accommodate common dietary restrictions (vegetarian, vegan, gluten-free)
- **Beverage Service:** Please include options for both alcoholic and non-alcoholic beverages

## 5. AUDIO/VISUAL REQUIREMENTS
- Sound system suitable for announcements and background music
- Projector and screen for presentations
- Lighting appropriate for the event type
- WiFi access for guests
`;

// Test prompts
const testPrompts = [
  "Change the seating arrangement to half rounds",
  "Add an additional room for breakout sessions",
  "Update the event to include 10 more guests, for a total of 60",
  "Add a requirement for outdoor space for team building activities"
];

// Function to test RFP modification
async function testRFPModification() {
  console.log('Starting RFP modification test...');
  
  let currentRFP = sampleRFP;
  
  for (const prompt of testPrompts) {
    try {
      console.log(`\nTesting prompt: "${prompt}"`);
      console.log('Sending request to:', `${API_URL}/modifyRFP`);
      
      const requestData = {
        currentRFP,
        prompt,
        eventId: 'test-event-id'
      };
      
      console.log('Request data:', JSON.stringify(requestData, null, 2));
      
      const response = await axios.post(`${API_URL}/modifyRFP`, requestData);
      
      console.log('Response status:', response.status);
      console.log('Response data:', response.data);
      
      if (response.data.modifiedRFP) {
        console.log('\nRFP was successfully modified!');
        console.log('\nChanges:');
        
        // Simple diff to highlight changes (very basic)
        const oldLines = currentRFP.split('\n');
        const newLines = response.data.modifiedRFP.split('\n');
        
        // Update current RFP for next iteration
        currentRFP = response.data.modifiedRFP;
        
        // Print a few lines before and after the modification
        console.log('\n--- Modified RFP ---');
        console.log(response.data.modifiedRFP);
        console.log('\n--- End of Modified RFP ---');
      } else {
        console.log('No modifications returned from the API');
      }
    } catch (error) {
      console.error('Error testing RFP modification:', error.toString());
      
      if (error.response) {
        console.error('Response status:', error.response.status);
        console.error('Response data:', error.response.data);
      } else if (error.request) {
        console.error('No response received. Request:', error.request);
      } else {
        console.error('Error message:', error.message);
      }
      
      console.error('Error config:', error.config);
    }
    
    // Wait a bit between requests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log('\nRFP modification test completed!');
}

// Run the test
testRFPModification().catch(error => {
  console.error('Unhandled error:', error);
}); 