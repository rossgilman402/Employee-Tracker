//IMPORTS
const inquirer = require("inquirer");
const mysql = require("mysql2");
require("dotenv").config();

//DATA
const department_names = [];
const role_names = [];
const employee_names = [];

//Inquirer List
menuList = [
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
];

//Add department list
departmentList = [
  {
    type: "input",
    message: "What is the name of the department?",
    name: "departmentName",
  },
];

//Add Role list
roleList = [
  {
    type: "input",
    message: "What is the name of the role?",
    name: "roleName",
  },
  {
    type: "input",
    message: "What is the salary of the role?",
    name: "salary",
  },
  {
    type: "list",
    message: "Which department does the role belong to?",
    choices: department_names,
    name: "departmentChoice",
  },
];

//Employee list
employeeList = [
  {
    type: "input",
    message: "What is the employee's first name?",
    name: "firstName",
  },
  {
    type: "input",
    message: "What is the employee's last name?",
    name: "lastName",
  },
  {
    type: "list",
    message: "What is the employee's role?",
    choices: role_names,
    name: "roleChoice",
  },

  {
    type: "list",
    message: "Who is the employee's manager?",
    choices: employee_names,
    name: "managerChoice",
  },
];

//Update Employee Role List
const updateEmployeeList = [
  {
    type: "list",
    message: "Which employee's role would you want to update?",
    choices: employee_names,
    name: "employeeUpdateChoice",
  },
  {
    type: "list",
    message: "Which role do you want to assign the selected employee?",
    choices: role_names,
    name: "roleUpdateChoice",
  },
];

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
function showMainMenu() {
  inquirer.prompt(menuList).then((answers) => {
    console.log(answers.mainChoice);
    if (answers.mainChoice === "View All Employees") {
      viewAllEmployees();
    } else if (answers.mainChoice === "Add Employee") {
      addEmployee();
    } else if (answers.mainChoice === "Update Employee Role") {
      updateEmployeeRole();
    } else if (answers.mainChoice === "View All Roles") {
      viewAllRoles();
    } else if (answers.mainChoice === "Add Role") {
      addRole();
    } else if (answers.mainChoice === "View All Departments") {
      viewAllDepartments();
    } else if (answers.mainChoice === "Add Department") {
      addDepartment();
    }
  });
}

//FUNCTIONS FOR SQL

//Function to View All departments
function viewAllDepartments() {
  db.query("SELECT * FROM department", function (err, results) {
    if (err) {
      console.log(err);
    } else {
      console.log(results);
      showMainMenu();
    }
  });
}

//Function to view all roles
function viewAllRoles() {
  db.query(
    "SELECT department.id, role.title, department.name AS department, role.salary FROM role JOIN department ON role.department_id = department.id",
    function (err, results) {
      if (err) {
        console.log(err);
      } else {
        console.log(results);
        showMainMenu();
      }
    }
  );
}

//Function to view all employees
function viewAllEmployees() {
  db.query(
    "SELECT role.id, employee.first_name, employee.last_name, role.title, department.name AS department, role.salary, employee.manager_id AS manager from employee JOIN role ON employee.role_id = role.id JOIN department ON role.department_id = department.id;",
    function (err, results) {
      if (err) {
        console.log(err);
      } else {
        console.log(results);
        showMainMenu();
      }
    }
  );
}

//helper function to populate global department list
function helperDepartmentList() {
  db.query("SELECT * FROM department", function (err, results) {
    if (err) {
      console.log(err);
    } else {
      for (let i = 0; i < results.length; i++) {
        department_names.push(results[i].name);
      }
    }
  });
}

//helper function to populate global role list
function helperRoleList() {
  db.query("SELECT title FROM role", function (err, results) {
    if (err) {
      console.log(err);
    } else {
      for (let i = 0; i < results.length; i++) {
        role_names.push(results[i].title);
      }
    }
  });
}

//helper function to populate global employee list
function helperEmployeeList() {
  db.query("SELECT * FROM employee", function (err, results) {
    if (err) {
      console.log(err);
    } else {
      employee_names.push("None");
      for (let i = 0; i < results.length; i++) {
        const currentName = results[i].first_name + " " + results[i].last_name;
        employee_names.push(currentName);
      }
    }
  });
}

//Function add department
function addDepartment() {
  inquirer.prompt(departmentList).then((answers) => {
    db.query(
      "INSERT INTO department (name) VALUES (?)",
      answers.departmentName,
      function (err, results) {
        if (err) {
          console.log(err);
        }
        console.log("Success!");
        showMainMenu();
      }
    );
  });
}

//Function add Role
function addRole() {
  //Get the current departments
  helperDepartmentList();
  inquirer.prompt(roleList).then((answers) => {
    let departmentID = 0;
    for (let i = 0; i < department_names.length; i++) {
      if (department_names[i] === answers.departmentChoice) {
        departmentID = i + 1;
      }
    }
    db.query(
      "INSERT INTO role (title, salary, department_id) VALUES (?, ?, ?)",
      [answers.roleName, answers.salary, departmentID],
      function (err, results) {
        if (err) {
          console.log(err);
        }
        console.log("Success!");
        showMainMenu();
      }
    );
  });
}

//Function add Role
function addEmployee() {
  //Get the current role
  helperRoleList();
  //Get the employee manager options
  helperEmployeeList();

  let roleID = 0;
  let managerID = 0;
  inquirer.prompt(employeeList).then((answers) => {
    for (let i = 0; i < role_names.length; i++) {
      if (role_names[i] === answers.roleChoice) {
        roleID = i + 1;
      }
    }

    if (answers.managerChoice === "None") {
      managerID = null;
    } else {
      for (let i = 0; i < employee_names.length; i++) {
        if (employee_names[i] === answers.managerChoice) {
          managerID = i;
        }
      }
    }

    db.query(
      "INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES (?, ?, ?, ?)",
      [answers.firstName, answers.lastName, roleID, managerID],
      function (err, results) {
        if (err) {
          console.log(err);
        }
        console.log("Success!");
        showMainMenu();
      }
    );
  });
}

//Function to update employees role
function updateEmployeeRole() {
  helperEmployeeList();
  // helperRoleList();
  employee_names.splice(0, 1);

  let roleID = 0;
  let employeeID = 0;

  inquirer.prompt(updateEmployeeList).then((answers) => {
    //Get the index of role
    for (let i = 0; i < role_names.length; i++) {
      if (role_names[i] === answers.roleChoice) {
        roleID = i + 1;
      }
    }

    for (let i = 0; i < employee_names.length; i++) {
      if (employee_names[i] === answers.managerChoice) {
        employeeID = i + 1;
      }
    }

    db.query(
      "UPDATE employee SET role_id = ? WHERE employee.id = ?",
      [roleID, employeeID],
      function (err, results) {
        if (err) {
          console.log(err);
        }
        console.log("Success!");
        showMainMenu();
      }
    );
  });
}

//INIT
showMainMenu();
