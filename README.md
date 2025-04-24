# Role-Based Excel-Editor

A powerful MEAN (MongoDB, Express, Angular, Node.js) stack application that enables Excel file uploads, data display in a table view, and fine-grained role-based access control for cell-level editing.

---

## Features

- **Excel Upload and Display**  
  Upload Excel files which are parsed and rendered in a dynamic table format.

- **Role-Based Access Control**  
  Admins can assign users to roles with permissions to edit specific cells.

- **Machine-Based Sheet Organization**  
  Excel sheets are categorized by machine, allowing organization and management per unit.

- **Shift-Based Editing**  
  Editing access is controlled by user shifts, ensuring changes can only be made at designated times.

- **Role and Privilege Management**  
  Create and manage roles with granular control over cell edit permissions.

- **Template Management and Versioning**  
  Modify templates with built-in version control to track historical changes.

- **Template Dashboard View**  
  Access a dashboard to browse templates by machine and version.

---

## Usage

### Uploading Excel Files
Admins can upload Excel files directly to machine-specific categories.

### Assigning Roles and Privileges
Roles define what each user can edit. Admins assign cell-level permissions and shift timings.

### Managing Machines and Sheets
Create or delete machines and associated sheets as required.

### Editing Templates
Templates can be modified with versioning enabled to preserve history and updates.

### Dashboard Access
Users can browse all uploaded templates, organized by machine and version.

---

## API Documentation

### Authentication
- `POST /api/login` – User login  
- `POST /api/signup` – Register a new user (Admin only)

### Machine Management
- `POST /api/machines` – Create a new machine  
- `DELETE /api/machines/:id` – Delete a specific machine

### Sheet Management
- `POST /api/sheets/upload` – Upload an Excel sheet to a specific machine  
- `GET /api/sheets` – Retrieve all uploaded sheets  
- `DELETE /api/sheets/:id` – Delete a specific sheet

### Role & Privilege Management
- `POST /api/roles` – Create a new role with privileges  
- `GET /api/roles` – Retrieve all roles  
- `PUT /api/roles/:id` – Update role privileges

### Template Management
- `GET /api/templates` – Get all templates with version info  
- `PUT /api/templates/:id` – Modify a template (Admin only)  
- `GET /api/templates/:id/versions` – Retrieve version history of a specific template

---

## Tech Stack

- **Frontend**: Angular  
- **Backend**: Node.js, Express  
- **Database**: MongoDB  
- **Authentication**: JWT (JSON Web Tokens)  
- **Excel Parsing**: [`xlsx`](https://www.npmjs.com/package/xlsx) npm library
