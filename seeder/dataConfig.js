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
    name:"User1", 
    email: "user1@user.com",
    phonenumber: "9860682046",
    password: bcrypt.hashSync("users",10),
    roleId:"661eab24f84c85bbcb5dadb0",
    verified:true,
    created_at: new Date()
},
{
    name:"User2", 
    email: "user2@user.com",
    phonenumber: "9860682046",
    password: bcrypt.hashSync("users",10),
    roleId:"661eab24f84c85bbcb5dadb0",
    verified:true,
    created_at: new Date()
}];


const tags = [{
    _id:new Object("661eab24f84c85bbcb5dada0"),
    title:"Animal",
    description: "This is Admin",
    created_at: new Date()
},
{
    _id:new Object("661eab24f84c85bbcb5dadb1"),
    title:"Auto",
    description: "This is User",
    created_at: new Date()
}];

const subtags = [{
    _id:new Object("661eab24f84c85bbcb5dada1"),
    tagId:"661eab24f84c85bbcb5dada0",
    title:"Khasi",
    description: "This is Khasi",
    created_at: new Date()
},
{
    _id:new Object("661eab24f84c85bbcb5dadb2"),
    tagId:"661eab24f84c85bbcb5dada0",
    title:"Boka",
    description: "This is Boka",
    created_at: new Date()
},{
    _id:new Object("661eab24f84c85bbcb5dada2"),
    tagId:"661eab24f84c85bbcb5dadb1",
    title:"Tesla",
    description: "This is Admin",
    created_at: new Date()
},
{
    _id:new Object("661eab24f84c85bbcb5dadb3"),
    tagId:"661eab24f84c85bbcb5dadb1",
    title:"Santro",
    description: "This is User",
    created_at: new Date()
}];





module.exports = {roles,users,tags,subtags}


