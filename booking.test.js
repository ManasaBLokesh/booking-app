const request = require("supertest");
const express = require("express");
const fs = require("fs");
const path = require("path");

jest.mock("./data", () => ({
  module: [
    {
      Room_no: 101,
      active: "N",
      email_id: null,
      Number_of_guests: 0,
      Name: null,
      phone_no: null,
      check_in_date: null,
      check_out_date: null,
      Booked_on: null,
      number_of_days: 0,
    },
  ],
}));

jest.mock("fs");
jest.mock("path");

const app = require("./main");

describe("Hotel Booking API", () => {
  it("should successfully book a room", async () => {
    const response = await request(app)
      .get("/insertDetails/query")
      .query({
        name: "John Doe",
        email_id: "john@example.com",
        phone_no: "1234567890",
        check_in_date: "2025-02-01",
        check_out_date: "2025-02-05",
      });

    expect(response.status).toBe(200);
    expect(response.body.message).toBe("Room booked successfully!");
    expect(response.body.roomDetails).toHaveProperty("Room_no");
    expect(response.body.roomDetails).toHaveProperty("Name", "John Doe");
    expect(response.body.roomDetails).toHaveProperty("email_id", "john@example.com");
  });

  it("should return error for invalid date format", async () => {
    const response = await request(app)
      .get("/insertDetails/query")
      .query({
        name: "John Doe",
        email_id: "john@example.com",
        phone_no: "1234567890",
        check_in_date: "invalid-date",
        check_out_date: "2025-02-05",
      });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe("Invalid date format.");
  });

  it("should return error if check-out date is before check-in date", async () => {
    const response = await request(app)
      .get("/insertDetails/query")
      .query({
        name: "John Doe",
        email_id: "john@example.com",
        phone_no: "1234567890",
        check_in_date: "2025-02-06",
        check_out_date: "2025-02-05",
      });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe("Check-out date must be after check-in date.");
  });

  it("should return 404 if no rooms are available", async () => {
    jest.mock("./data", () => ({
      module: [
        {
          Room_no: 101,
          active: "Y",
          email_id: "john@example.com",
          Number_of_guests: 1,
          Name: "John Doe",
          phone_no: "1234567890",
          check_in_date: "2025-02-01",
          check_out_date: "2025-02-05",
          Booked_on: new Date(),
          number_of_days: 4,
        },
      ],
    }));

    const response = await request(app)
      .get("/insertDetails/query")
      .query({
        name: "Jane Doe",
        email_id: "jane@example.com",
        phone_no: "0987654321",
        check_in_date: "2025-02-01",
        check_out_date: "2025-02-05",
      });

    expect(response.status).toBe(404);
    expect(response.body.error).toBe("No available rooms or invalid guest details");
  });

  it("should fetch booking details for a valid email ID", async () => {
    const response = await request(app).get("/fetchdetails/john@example.com");

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("Room_no");
    expect(response.body).toHaveProperty("email_id", "john@example.com");
  });

  it("should return 404 for an invalid email ID", async () => {
    const response = await request(app).get("/fetchdetails/invalid@example.com");

    expect(response.status).toBe(404);
    expect(response.text).toBe("Mail ID doesn't exist");
  });

  it("should fetch all active room bookings", async () => {
    const response = await request(app).get("/fetchAlldetails");

    expect(response.status).toBe(200);
    expect(response.body).toBeInstanceOf(Array);
  });

  it("should return 404 if no rooms are filled", async () => {
    jest.mock("./data", () => ({
      module: [
        {
          Room_no: 101,
          active: "N",
          email_id: null,
          Number_of_guests: 0,
          Name: null,
          phone_no: null,
          check_in_date: null,
          check_out_date: null,
          Booked_on: null,
          number_of_days: 0,
        },
      ],
    }));

    const response = await request(app).get("/fetchAlldetails");

    expect(response.status).toBe(404);
    expect(response.body).toBe("No room is filled");
  });

  it("should cancel the booking for a valid email ID", async () => {
    const response = await request(app).get("/cancelBooking/john@example.com");

    expect(response.status).toBe(200);
    expect(response.body.message).toBe("Room cancelled ☹️!!");
  });

  it("should return 404 if booking not found", async () => {
    const response = await request(app).get("/cancelBooking/invalid@example.com");

    expect(response.status).toBe(404);
    expect(response.body.message).toBe("Booking not found!");
  });

  it("should update booking details for a valid email ID", async () => {
    const response = await request(app)
      .get("/updateDetails/query")
      .query({
        email_id: "john@example.com",
        check_in_date: "2025-02-07",
        check_out_date: "2025-02-10",
      });

    expect(response.status).toBe(200);
    expect(response.body.message).toBe("Room Updated successfully!!");
    expect(response.body.roomDetails).toHaveProperty("check_in_date", "2025-02-07");
  });

  it("should return 404 if room not found for update", async () => {
    const response = await request(app)
      .get("/updateDetails/query")
      .query({
        email_id: "invalid@example.com",
        check_in_date: "2025-02-07",
        check_out_date: "2025-02-10",
      });

    expect(response.status).toBe(404);
    expect(response.body.error).toBe("Invalid guest details or room not found");
  });
});
