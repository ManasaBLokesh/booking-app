const request = require('supertest');
const app = require('./main'); 
const fs = require('fs');
const path = require('path');

jest.mock('./data', () => ({
  module: [
    {
      Room_no: 1,
      Name: "Leven",
      email_id: "leven@gmail.com",
      phone_no: "1234567890",
      check_in_date: "2025-02-01",
      check_out_date: "2025-02-07",
      number_of_days: 6,
      active: "Y",
      Number_of_guests: 1,
      Booked_on: "2025-01-30",
    },
    {
      Room_no: 2,
      Name: null,
      email_id: null,
      phone_no: null,
      check_in_date: null,
      check_out_date: null,
      number_of_days: 0,
      active: "N",
      Number_of_guests: 0,
      Booked_on: null,
    },
  ],
}));

jest.mock('fs');
jest.mock('path');

describe('Booking API', () => {
  it('should insert booking details successfully', async () => {
    const bookingDetails = {
      name: "Alice",
      email_id: "alice@example.com",
      phone_no: "9876543210",
      check_in_date: "2025-03-01",
      check_out_date: "2025-03-05",
    };

    const response = await request(app)
      .post('/insertDetails/query')
      .send(bookingDetails);

    expect(response.status).toBe(200);
    expect(response.body.message).toBe("Room booked successfully!");
    expect(response.body.roomDetails.email_id).toBe("alice@example.com");
  });

  it('should fetch booking details by email', async () => {
    const response = await request(app).get('/fetchdetails/john@example.com');

    expect(response.status).toBe(200);
    expect(response.body.email_id).toBe("john@example.com");
    expect(response.body.room_no).toBe(1);
  });

  it('should return 404 if email is not found', async () => {
    const response = await request(app).get('/fetchdetails/nonexistent@example.com');

    expect(response.status).toBe(404);
    expect(response.text).toBe("Mail ID doesn't exist");
  });
});
