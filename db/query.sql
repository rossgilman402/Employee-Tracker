INSERT INTO department (name) VALUES ("test");

-- SELECT role.id, employee.first_name, employee.last_name, role.title, department.name AS department, role.salary, employee.manager_id AS manager from employee JOIN role ON employee.role_id = role.id JOIN department ON role.department_id = department.id;

-- SELECT department.id, role.title, department.name AS department, role.salary FROM role JOIN department ON role.department_id = department.id;

SELECT * FROM department;