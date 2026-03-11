# Connecting to MySQL Workbench

To view and manage your `project_tracker` database in MySQL Workbench, follow these steps:

1.  Open **MySQL Workbench**.
2.  Click the **+** icon next to **MySQL Connections** to create a new connection.
3.  Fill in the details:
    *   **Connection Name:** `Project Tracker Local` (or any name you prefer)
    *   **Hostname:** `localhost`
    *   **Port:** `3306`
    *   **Username:** `root`
4.  Click **Store in Vault...** (or **Test Connection**) and enter the password:
    *   **Password:** `248`
5.  Click **OK** to save.
6.  Double-click the new connection to open it.
7.  In the left sidebar (SCHEMAS), look for `project_tracker`.
8.  You can right-click tables (e.g., `Project`, `User`) and select **Select Rows - Limit 1000** to view data.
