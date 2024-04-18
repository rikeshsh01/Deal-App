const express = require("express");
const router = express.Router();
const { STATUS_CODES } = require("http");

const {roles, users, tags, subtags} = require("../seeder/dataConfig");

const Roles = require("../models/Roles")
const Users = require("../models/Users")
const Tags = require("../models/Tags")
const SubTags = require("../models/Sub-Tag");

router.post('/seedrole', async (req, res) => {
    try {
      const roleSeeder = await Roles.insertMany(roles);
        res.status(200).send({
            status: STATUS_CODES[200],
            msg: "Roles seeded successfully",
            data: roleSeeder
        })

    } catch (error) {
        console.log(error.message);
        res.status(500).send({
            status: STATUS_CODES[500],
            message: error.message
        });
    }

});

router.post('/seeduser', async (req, res) => {
  try {

    const userSeeder = await Users.insertMany(users);
      res.status(200).send({
          status: STATUS_CODES[200],
          msg: "Users seeded successfully",
          data: userSeeder
      })

  } catch (error) {
      console.log(error.message);
      res.status(500).send({
          status: STATUS_CODES[500],
          message: error.message
      });
  }

});

router.post('/seedtag', async (req, res) => {
    try {
  
      const userSeeder = await Tags.insertMany(tags);
        res.status(200).send({
            status: STATUS_CODES[200],
            msg: "Users seeded successfully",
            data: userSeeder
        })
  
    } catch (error) {
        console.log(error.message);
        res.status(500).send({
            status: STATUS_CODES[500],
            message: error.message
        });
    }
  
  });

  router.post('/seedsubtag', async (req, res) => {
    try {
  
      const userSeeder = await SubTags.insertMany(subtags);
        res.status(200).send({
            status: STATUS_CODES[200],
            msg: "Users seeded successfully",
            data: userSeeder
        })
  
    } catch (error) {
        console.log(error.message);
        res.status(500).send({
            status: STATUS_CODES[500],
            message: error.message
        });
    }
  
  });

module.exports = router;