const express = require("express");
const app = express();
const Data = require("./data");
const PORT = 5000;
const fs = require("fs");
const path = require("path");
app.use(express.json());

app.post("/insertDetails/query", (req, res) => {
  const { name, email_id, phone_no, check_in_date, check_out_date } = req.body; 
  console.log(name, email_id, phone_no, check_in_date, check_out_date);

  let startDate = new Date(check_in_date);
  let endDate = new Date(check_out_date);
  if (isNaN(startDate) || isNaN(endDate)) {
    return res.status(400).json({ error: "Invalid date format." });
  }

  if (startDate >= endDate) {
    return res
      .status(400)
      .json({ error: "Check-out date must be after check-in date." });
  }

  const timeDifference = endDate - startDate;
  const numberOfDays = timeDifference / (1000 * 3600 * 24);

  const room = Data.module.find(
    (room) => room.active === "N" && !room.email_id
  );

  if (room) {
    room.Name = name;
    room.email_id = email_id;
    room.phone_no = phone_no;
    room.check_in_date = check_in_date;
    room.check_out_date = check_out_date;
    room.Booked_on = new Date();
    room.active = "Y"; 
    room.number_of_days = numberOfDays;
    room.Number_of_guests = (room.Number_of_guests || 0) + 1;

    fs.writeFileSync(
      path.join(__dirname, "data.js"),
      `exports.module = ${JSON.stringify(Data.module, null, 2)};`,
      "utf-8"
    );

    const roomDetails = {
      Room_no: room.Room_no,
      Name: name,
      email_id: email_id,
      phone_no: phone_no,
      check_in_date: check_in_date,
      check_out_date: check_out_date,
      number_of_days: numberOfDays,
    };

    res.status(200).json({
      message: "Room booked successfully!",
      roomDetails: roomDetails,
    });
  } else {
    res
      .status(404)
      .json({ error: "No available rooms or invalid guest details" });
  }
});


app.get("/fetchdetails/:mailID", (req, res) => {
  console.log(req.params);
  let found = false;
  if (req.params.mailID) {
    let array = Data.module;
    array.forEach((arr) => {
      if (arr.email_id == req.params.mailID) {
        console.log(arr);
        found = true;
        res.status(200).json(arr);
      }
    });
  }
  if (!found) {
    console.log("Mail ID doesn't exist");
    res.status(404).send("Mail ID doesn't exist");
  }
});

app.get("/fetchAlldetails", (req, res) => {
  const room = Data.module.filter((room) => room.active === "Y");
  console.log(room);
  if (room.length == 0) {
    console.log("No room is filled");
    return res.status(404).json("No room is filled");
  }
  res.status(200).json(room);
});

app.post("/cancelBooking", (req, res) => {
  const { mailID } = req.body; 
  console.log(req.body);
  console.log(mailID);

  const room = Data.module.find((room) => room.email_id === mailID);

  if (room) {
    console.log("Booked mail id", room.email_id);

    room.active = "N";
    room.Number_of_guests = 0;
    room.check_in_date = null;
    room.check_out_date = null;
    room.number_of_days = 0;
    room.Name = null;
    room.email_id = null;
    room.phone_no = null;
    room.Booked_on = null;

    fs.writeFileSync(
      path.join(__dirname, "data.js"),
      `exports.module = ${JSON.stringify(Data.module, null, 2)};`,
      "utf-8"
    );

    const response = {
      message: "Room cancelled ☹️!!",
    };
    return res.status(200).json(response); 
  }
  return res.status(404).json({ message: "Booking not found!" });
});

app.post("/updateDetails/query", (req, res) => {
  const { email_id, check_in_date, check_out_date } = req.body; 
  console.log(email_id, check_in_date, check_out_date);

  let roomFound = false;
  let startDate = new Date(check_in_date);
  let endDate = new Date(check_out_date);

  const timeDifference = endDate - startDate;
  const numberOfDays = timeDifference / (1000 * 3600 * 24);

  const room = Data.module.find(
    (room) => room.active === "Y" && room.email_id === email_id
  );

  if (room) {
    room.check_in_date = check_in_date;
    room.check_out_date = check_out_date;
    room.Booked_on = new Date();
    room.active = "Y";
    room.number_of_days = numberOfDays;
    room.Number_of_guests = (room.Number_of_guests || 0) + 1;
    roomFound = true;

    fs.writeFileSync(
      path.join(__dirname, "data.js"),
      `exports.module = ${JSON.stringify(Data.module, null, 2)};`,
      "utf-8"
    );

    const roomDetails = {
      Room_no: room.Room_no,
      Name: room.Name,
      email_id: room.email_id,
      phone_no: room.phone_no,
      check_in_date: room.check_in_date,
      check_out_date: room.check_out_date,
      number_of_days: numberOfDays,
    };

    res.status(200).json({
      message: "Room Updated successfully!!",
      roomDetails: roomDetails,
    });
  } else {
    res.status(404).json({ error: "Invalid guest details or room not found" });
  }
});


app.listen(PORT, () => {
  console.log("port is 5000");
});

module.exports = app;
