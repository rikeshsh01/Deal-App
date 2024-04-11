const express = require("express");
const router = express.Router();
const { fetchuser, checkAdminRole } = require("../middleware/middleware");
const { body, validationResult } = require('express-validator');
const { STATUS_CODES } = require("http");


module.exports = {
  router,
  fetchuser,
  checkAdminRole,
  body,
  validationResult,
  STATUS_CODES
};
