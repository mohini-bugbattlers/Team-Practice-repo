import db from '../config/mysql';
import bcrypt from 'bcryptjs';

async function setupDatabase() {
  try {
    console.log('🔄 Setting up database...');

    // Test database connection
    await db.execute('SELECT 1');
    console.log('✅ Database connection established');

    // Create tables if they don't exist
    await createTables();
    console.log('✅ Database tables created');

    // Create default admin user
    await createAdminUser();
    console.log('✅ Default admin user created');

    console.log('🎉 Database setup completed successfully!');
    console.log('📧 Admin Email: admin@prathmeshroadlines.com');
    console.log('🔑 Admin Password: admin123');

  } catch (error) {
    console.error('❌ Database setup failed:', error);
    process.exit(1);
  }
}

async function createTables() {
  try {
    // Create users table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role ENUM('admin', 'company', 'manager', 'vehicle_owner', 'driver') NOT NULL,
        name VARCHAR(255) NOT NULL,
        phone VARCHAR(20),
        status ENUM('active', 'inactive') DEFAULT 'active',
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Create companies table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS companies (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        phone VARCHAR(20) NOT NULL,
        address TEXT NOT NULL,
        gstNumber VARCHAR(15) UNIQUE NOT NULL,
        status ENUM('active', 'inactive') DEFAULT 'active',
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Create vehicle_owners table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS vehicle_owners (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        phone VARCHAR(20) NOT NULL,
        address TEXT NOT NULL,
        gstNumber VARCHAR(15) UNIQUE NOT NULL,
        fleetSize INT DEFAULT 0,
        rating DECIMAL(2,1) DEFAULT 0,
        status ENUM('active', 'inactive') DEFAULT 'active',
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Create drivers table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS drivers (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        phone VARCHAR(20) NOT NULL,
        licenseNumber VARCHAR(50) UNIQUE NOT NULL,
        vehicleType VARCHAR(100) NOT NULL,
        vehicleOwnerId INT NOT NULL,
        status ENUM('active', 'inactive') DEFAULT 'active',
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (vehicleOwnerId) REFERENCES vehicle_owners(id)
      )
    `);

    // Create managers table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS managers (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        phone VARCHAR(20) NOT NULL,
        department VARCHAR(100) NOT NULL,
        status ENUM('active', 'inactive') DEFAULT 'active',
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Create trips table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS trips (
        id INT AUTO_INCREMENT PRIMARY KEY,
        tripId VARCHAR(20) UNIQUE NOT NULL,
        companyId INT NOT NULL,
        vehicleOwnerId INT NOT NULL,
        driverId INT,
        managerId INT,
        pickupLocation TEXT NOT NULL,
        dropLocation TEXT NOT NULL,
        oilType VARCHAR(100) NOT NULL,
        quantity DECIMAL(10,2) NOT NULL,
        vehicleType VARCHAR(100) NOT NULL,
        status ENUM('pending', 'confirmed', 'vehicle_assigned', 'driver_assigned', 'in_transit', 'completed', 'cancelled') DEFAULT 'pending',
        assignedVehicle VARCHAR(100),
        startDate TIMESTAMP NULL,
        endDate TIMESTAMP NULL,
        totalCost DECIMAL(10,2),
        estimatedCost DECIMAL(10,2),
        expectedDate DATE,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (companyId) REFERENCES companies(id),
        FOREIGN KEY (vehicleOwnerId) REFERENCES vehicle_owners(id),
        FOREIGN KEY (driverId) REFERENCES drivers(id),
        FOREIGN KEY (managerId) REFERENCES managers(id)
      )
    `);

    // Create payments table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS payments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        tripId INT NOT NULL,
        companyId INT NOT NULL,
        vehicleOwnerId INT NOT NULL,
        amount DECIMAL(10,2) NOT NULL,
        status ENUM('pending', 'processing', 'completed', 'failed', 'cancelled') DEFAULT 'pending',
        paymentDate TIMESTAMP NULL,
        transactionId VARCHAR(100),
        paymentMethod VARCHAR(50),
        notes TEXT,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (tripId) REFERENCES trips(id),
        FOREIGN KEY (companyId) REFERENCES companies(id),
        FOREIGN KEY (vehicleOwnerId) REFERENCES vehicle_owners(id)
      )
    `);

    // Create documents table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS documents (
        id INT AUTO_INCREMENT PRIMARY KEY,
        tripId INT NOT NULL,
        type ENUM('empty-tanker-slip', 'loading-slip', 'delivery-receipt', 'gate-pass', 'weighbridge-slip') NOT NULL,
        filename VARCHAR(255) NOT NULL,
        originalName VARCHAR(255) NOT NULL,
        mimeType VARCHAR(100) NOT NULL,
        size INT NOT NULL,
        url VARCHAR(500) NOT NULL,
        uploadedBy ENUM('driver', 'manager', 'admin') NOT NULL,
        uploadedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (tripId) REFERENCES trips(id)
      )
    `);

    console.log('✅ All tables created successfully');

  } catch (error) {
    console.error('❌ Failed to create tables:', error);
    throw error;
  }
}

async function createAdminUser() {
  try {
    // Check if admin already exists
    const [existingAdmins] = await db.execute(
      'SELECT id FROM users WHERE role = ?',
      ['admin']
    );

    if ((existingAdmins as any[]).length === 0) {
      // Hash password
      const hashedPassword = await bcrypt.hash('admin123', 10);

      // Insert admin user
      await db.execute(`
        INSERT INTO users (email, password, role, name, phone, status, createdAt, updatedAt)
        VALUES (?, ?, ?, ?, ?, 'active', NOW(), NOW())
      `, [
        'admin@prathmeshroadlines.com',
        hashedPassword,
        'admin',
        'Prathmesh Admin',
        '+91-9876543210'
      ]);

      console.log('✅ Default admin user created');
    } else {
      console.log('ℹ️ Admin user already exists');
    }

  } catch (error) {
    console.error('❌ Failed to create admin user:', error);
    throw error;
  }
}

setupDatabase();
