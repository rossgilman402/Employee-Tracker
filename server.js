//IMPORTS
const inquirer = require("inquirer");
const mysql = require("mysql2");
require("dotenv").config();

//DATA

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

//Function add department
function addDepartment() {
  inquirer
    .prompt([
      {
        type: "input",
        message: "What is the name of the department?",
        name: "departmentName",
      },
    ])
    .then((answers) => {
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
  db.query("SELECT * FROM department", function (err, departmentResults) {
    if (err) {
      console.log(err);
    } else {
      const departmentResultsList = [];
      for (let i = 0; i < departmentResults.length; i++) {
        departmentResultsList.push(departmentResults[i].name);
      }

      inquirer
        .prompt([
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
            choices: departmentResults,
            name: "departmentChoice",
          },
        ])
        .then((answers) => {
          let departmentID = 0;
          for (let i = 0; i < departmentResults.length; i++) {
            if (departmentResults[i].name === answers.departmentChoice) {
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
  });
}

//Function add Role
function addEmployee() {
  db.query("SELECT * FROM role", function (err, roleResults) {
    if (err) {
      console.log(err);
    } else {
      const roleResultList = [];
      for (let i = 0; i < roleResults.length; i++) {
        roleResultList.push(roleResults[i].title);
      }

      db.query("SELECT * FROM employee", function (err, employeeResults) {
        if (err) {
          console.log(err);
        } else {
          const employeeResultList = [];
          employeeResultList.push("None");
          for (let i = 0; i < employeeResults.length; i++) {
            const currentName =
              employeeResults[i].first_name +
              " " +
              employeeResults[i].last_name;
            employeeResultList.push(currentName);
          }

          let roleID = 0;
          let managerID = 0;
          inquirer
            .prompt([
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
                choices: roleResultList,
                name: "roleChoice",
              },

              {
                type: "list",
                message: "Who is the employee's manager?",
                choices: employeeResultList,
                name: "managerChoice",
              },
            ])
            .then((answers) => {
              for (let i = 0; i < roleResults.length; i++) {
                if (roleResults[i].title === answers.roleChoice) {
                  roleID = i + 1;
                }
              }

              if (answers.managerChoice === "None") {
                managerID = null;
              } else {
                for (let i = 0; i < employeeResults.length; i++) {
                  const currentName =
                    employeeResults[i].first_name +
                    " " +
                    employeeResults[i].last_name;
                  if (currentName === answers.managerChoice) {
                    managerID = i + 1;
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
      });
    }
  });
}

//Function to update employees role
function updateEmployeeRole() {
  db.query("SELECT * FROM role", function (err, roleResults) {
    if (err) {
      console.log(err);
    } else {
      const roleResultList = [];
      for (let i = 0; i < roleResults.length; i++) {
        roleResultList.push(roleResults[i].title);
      }

      db.query("SELECT * FROM employee", function (err, employeeResults) {
        if (err) {
          console.log(err);
        } else {
          const employeeResultList = [];
          for (let i = 0; i < employeeResults.length; i++) {
            const currentName =
              employeeResults[i].first_name +
              " " +
              employeeResults[i].last_name;
            employeeResultList.push(currentName);
          }

          let roleID = 0;
          let employeeID = 0;
          inquirer
            .prompt([
              {
                type: "list",
                message: "Which employee's role would you want to update?",
                choices: employeeResultList,
                name: "employeeUpdateChoice",
              },
              {
                type: "list",
                message:
                  "Which role do you want to assign the selected employee?",
                choices: roleResultList,
                name: "roleUpdateChoice",
              },
            ])
            .then((answers) => {
              for (let i = 0; i < roleResults.length; i++) {
                if (roleResults[i].title === answers.roleUpdateChoice) {
                  roleID = i + 1;
                }
              }

              for (let i = 0; i < employeeResults.length; i++) {
                const currentName =
                  employeeResults[i].first_name +
                  " " +
                  employeeResults[i].last_name;
                if (currentName === answers.employeeUpdateChoice) {
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
      });
    }
  });
}

//INIT
showMainMenu();
