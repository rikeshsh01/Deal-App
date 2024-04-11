const Notes = require("../models/Notes");
const { router, fetchuser,checkAdminRole, body, validationResult, STATUS_CODES } = require('./import');

// Define the route for searching notes
router.get('/search', async (req, res) => {
    try {
      const { title, description, tag } = req.query;
      const searchQuery = {};
  
      // Build the search query based on the provided parameters
      if (title) {
        searchQuery.title = { $regex: title, $options: 'i' }; // Case-insensitive search in title
      }
      if (description) {
        searchQuery.description = { $regex: description, $options: 'i' }; // Case-insensitive search in description
      }
      if (tag) {
        searchQuery.tag = tag; // Exact match for tag
      }
      if (tag) {
        searchQuery.tag = tag; // Exact match for tag
      }
  
      // Perform the search query
      const notes = await Notes.find(searchQuery);
      res.status(200).send({
        status:STATUS_CODES[200],
        msg:"Search results fetched successfully",
        data:notes
      })
  
    } catch (error) {
      console.error(error.message);
      res.status(500).send({
            status: STATUS_CODES[500],
            message: error.message
        });
    }
  });
  
  
module.exports = router;