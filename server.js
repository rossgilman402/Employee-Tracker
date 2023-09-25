//IMPORTS
const inqurier = require("inquirer");
const mysql = require("mysql2");

//CONNECTION TO DATABASE
const db = mysql.createConnection(
  {
    host: "localhost",
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  },
  console.log(`Connected to the ${process.env.DB_NAME} database`)
);

//STARTING PROMPT
inqurier
  .prompt([
    {
      type: "list",
      message: "What would you like to do?",
      choices: [
        "View All Employees",
        "Add Employee",
        "Update Employee Role",
        "View All Roles",
        "Add Role",
        "View All Departments",
        "Add Department",
      ],
      name: "mainChoice",
    },
  ])
  .then((answers) => {
    console.log(answers.mainChoice);
    if (answers.mainChoice === "View All Employees") {
    } else if (answers.mainChoice === "Add Employee") {
    } else if (answers.mainChoice === "Update Employee Role") {
    } else if (answers.mainChoice === "View All Roles") {
    } else if (answers.mainChoice === "Add Role") {
    } else if (answers.mainChoice === "View All Departments") {
    } else if (answers.mainChoice === "Add Department") {
    }
  });

//FUNCTIONS FOR SQL

//Function to print
