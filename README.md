Role-Based Excel-Editor

  A MEAN (MongoDB, Express, Angular, Node.js) application that allows users to upload Excel files, display their data in a table format, and manage user permissions for editing specific cells based on assigned roles. The application supports machine-based sheet organization, shift-based editing, role-based privileges, template versioning, and a dashboard view for templates.

Features
  1.  Excel Upload and Display: Upload Excel files, which are converted to a table format and displayed in the app.
  2.  Role-Based Access Control: Admins can assign roles to users, defining specific cells they are allowed to edit.
  3.  Machine-Based Sheet Organization: Sheets are organized by machine, which can be created or deleted as needed.
  4.  Shift-Based Editing: Sheets are editable only during assigned shifts for specific roles.
  5.  Role and Privilege Management: Admins can create roles and set privileges for cell-level editing.
  6.  Template Management and Versioning: Admins can modify templates with version control.
  7.  Dashboard for Templates: View existing templates and their versions.

Usage
  1.  Uploading Excel Files: Admin users can upload Excel files to specific machines.
  2.  Assigning Roles and Privileges: Admins can create roles, assign privileges for cell editing, and set shifts for editing access.
  3.  Managing Machines and Sheets: Admins can create or delete machines and remove specific sheets as needed.
  4.  Editing Templates: Admins can edit templates and access version control for tracking changes.
  5.  Dashboard Access: View all templates in the dashboard, categorized by machine and version.

API Documentation

  ->  Authentication
      1.  POST /api/login - Login for users
      2.  POST /api/signup - Register a new user (admin only)
      
  ->  Machine Management
      1.  POST /api/machines - Create a new machine
      2.  DELETE /api/machines/:id - Delete a specific machine
      
  ->  Sheet Management
      1.  POST /api/sheets/upload - Upload an Excel sheet to a specific machine
      2.  GET /api/sheets - Retrieve all sheets
      3.  DELETE /api/sheets/:id - Delete a specific sheet
      
  ->  Role and Privilege Management
      1.  POST /api/roles - Create a new role with privileges
      2.  GET /api/roles - Get all roles
      3.  PUT /api/roles/:id - Update a role’s privileges

  ->  Template Management
      1.  GET /api/templates - Get all templates with version info
      2.  PUT /api/templates/:id - Modify a template (admin only)
      3.  GET /api/templates/:id/versions - Get versions of a specific template
      
