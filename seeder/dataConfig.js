var bcrypt = require('bcryptjs');

const roles = [{
    _id:new Object("661eab24f84c85bbcb5dadaf"),
    title:"Admin",
    description: "This is Admin",
    created_at: new Date()
},
{
    _id:new Object("661eab24f84c85bbcb5dadb0"),
    title:"User",
    description: "This is User",
    created_at: new Date()
}];

const users = [{
    name:"Admin", 
    email: "admin@admin.com",
    phonenumber: "9860090504",
    password: bcrypt.hashSync("admin",10),
    roleId:"661eab24f84c85bbcb5dadaf",
    verified:true,
    created_at: new Date()
},
{
    name:"User", 
    email: "user@user.com",
    phonenumber: "9860682046",
    password: bcrypt.hashSync("users",10),
    roleId:"661eab24f84c85bbcb5dadb0",
    verified:true,
    created_at: new Date()
}];



const postData = [{
    "title": "Product 1",
    "description": "Description of Product 1",
    "tag": "Category A",
    "image": "image1.png",
    "latitude": "40.7128",
    "longitude": "-74.0060",
    "location": "New York, USA",
    "additionalDetails": [{
            "key": "price",
            "value": "150"
        },
        {
            "key": "size",
            "value": "Large"
        }
    ]
},
{
    "title": "Product 2",
    "description": "Description of Product 2",
    "tag": "Category B",
    "image": "image2.png",
    "latitude": "34.0522",
    "longitude": "-118.2437",
    "location": "Los Angeles, USA",
    "additionalDetails": [{
            "key": "price",
            "value": "300"
        },
        {
            "key": "color",
            "value": "Red"
        }
    ]
},
{
    "title": "Product 3",
    "description": "Description of Product 3",
    "tag": "Category C",
    "image": "image3.png",
    "latitude": "51.5074",
    "longitude": "-0.1278",
    "location": "London, UK",
    "additionalDetails": [{
            "key": "price",
            "value": "250"
        },
        {
            "key": "brand",
            "value": "Brand X"
        }
    ]
},
{
    "title": "Product 4",
    "description": "Description of Product 4",
    "tag": "Category A",
    "image": "image4.png",
    "latitude": "37.7749",
    "longitude": "-122.4194",
    "location": "San Francisco, USA",
    "additionalDetails": [{
            "key": "price",
            "value": "180"
        },
        {
            "key": "color",
            "value": "Blue"
        }
    ]
},
{
    "title": "Product 5",
    "description": "Description of Product 5",
    "tag": "Category B",
    "image": "image5.png",
    "latitude": "48.8566",
    "longitude": "2.3522",
    "location": "Paris, France",
    "additionalDetails": [{
            "key": "price",
            "value": "280"
        },
        {
            "key": "size",
            "value": "Medium"
        }
    ]
},
{
    "title": "Product 6",
    "description": "Description of Product 6",
    "tag": "Category C",
    "image": "image6.png",
    "latitude": "35.6895",
    "longitude": "139.6917",
    "location": "Tokyo, Japan",
    "additionalDetails": [{
            "key": "price",
            "value": "220"
        },
        {
            "key": "brand",
            "value": "Brand Y"
        }
    ]
}
];

module.exports = {roles,users}


