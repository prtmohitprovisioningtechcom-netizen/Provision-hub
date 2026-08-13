-- Migration from MongoDB to MySQL

CREATE TABLE `users` (
  `id` VARCHAR(36) PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL,
  `phone` VARCHAR(50),
  `role` ENUM('super_admin', 'company_admin', 'customer') DEFAULT 'customer',
  `avatar` VARCHAR(255),
  `isEmailVerified` BOOLEAN DEFAULT FALSE,
  `emailVerificationToken` VARCHAR(255),
  `resetPasswordToken` VARCHAR(255),
  `resetPasswordExpires` DATETIME,
  `companyId` VARCHAR(36),
  `createdAt` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE `companies` (
  `id` VARCHAR(36) PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `slug` VARCHAR(255) NOT NULL UNIQUE,
  `ownerName` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255) NOT NULL,
  `phone` VARCHAR(50) NOT NULL,
  `category` VARCHAR(100) NOT NULL,
  `address` JSON,
  `logo` VARCHAR(255),
  `banner` VARCHAR(255),
  `favicon` VARCHAR(255),
  `description` TEXT,
  `website` VARCHAR(255),
  `socialLinks` JSON,
  `gst` VARCHAR(50),
  `pan` VARCHAR(50),
  `businessHours` JSON,
  `status` ENUM('pending', 'approved', 'rejected', 'suspended') DEFAULT 'pending',
  `isVerified` BOOLEAN DEFAULT FALSE,
  `rating` DECIMAL(3, 2) DEFAULT 0,
  `reviewCount` INT DEFAULT 0,
  `subscription` ENUM('free', 'starter', 'professional', 'enterprise') DEFAULT 'free',
  `subscriptionExpiresAt` DATETIME,
  `ownerId` VARCHAR(36) NOT NULL,
  `theme` JSON,
  `seo` JSON,
  `createdAt` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`ownerId`) REFERENCES `users`(`id`) ON DELETE CASCADE
);

-- Update user companyId foreign key (circular dependency resolved by adding FK after)
ALTER TABLE `users` ADD CONSTRAINT `fk_users_companyId` FOREIGN KEY (`companyId`) REFERENCES `companies`(`id`) ON DELETE SET NULL;

CREATE TABLE `analytics` (
  `id` VARCHAR(36) PRIMARY KEY,
  `companyId` VARCHAR(36) NOT NULL,
  `date` DATE NOT NULL,
  `visitors` INT DEFAULT 0,
  `pageViews` INT DEFAULT 0,
  `clicks` INT DEFAULT 0,
  `leads` INT DEFAULT 0,
  `topPages` JSON,
  `trafficSources` JSON,
  FOREIGN KEY (`companyId`) REFERENCES `companies`(`id`) ON DELETE CASCADE
);

CREATE TABLE `blogs` (
  `id` VARCHAR(36) PRIMARY KEY,
  `companyId` VARCHAR(36) NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `slug` VARCHAR(255) NOT NULL,
  `content` LONGTEXT NOT NULL,
  `excerpt` TEXT,
  `category` VARCHAR(100) NOT NULL,
  `featuredImage` VARCHAR(255),
  `status` ENUM('draft', 'published') DEFAULT 'draft',
  `authorId` VARCHAR(36) NOT NULL,
  `seo` JSON,
  `comments` JSON,
  `createdAt` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE (`companyId`, `slug`),
  FOREIGN KEY (`companyId`) REFERENCES `companies`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`authorId`) REFERENCES `users`(`id`) ON DELETE CASCADE
);

CREATE TABLE `categories` (
  `id` VARCHAR(36) PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL UNIQUE,
  `slug` VARCHAR(255) NOT NULL UNIQUE,
  `type` ENUM('business', 'landing_section') DEFAULT 'business',
  `description` TEXT,
  `icon` VARCHAR(255),
  `isActive` BOOLEAN DEFAULT TRUE,
  `createdAt` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE `contact_messages` (
  `id` VARCHAR(36) PRIMARY KEY,
  `name` VARCHAR(120) NOT NULL,
  `email` VARCHAR(255) NOT NULL,
  `subject` VARCHAR(200) NOT NULL,
  `message` TEXT NOT NULL,
  `status` ENUM('new', 'read') DEFAULT 'new',
  `createdAt` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE `galleries` (
  `id` VARCHAR(36) PRIMARY KEY,
  `companyId` VARCHAR(36) NOT NULL,
  `title` VARCHAR(255),
  `images` JSON,
  `createdAt` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`companyId`) REFERENCES `companies`(`id`) ON DELETE CASCADE
);

CREATE TABLE `landing_pages` (
  `id` VARCHAR(36) PRIMARY KEY,
  `companyId` VARCHAR(36) NOT NULL UNIQUE,
  `sections` JSON,
  `templateId` VARCHAR(255),
  `layoutId` VARCHAR(16) NOT NULL DEFAULT '1',
  `pages` JSON,
  `isPublished` BOOLEAN DEFAULT TRUE,
  `createdAt` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`companyId`) REFERENCES `companies`(`id`) ON DELETE CASCADE
);

CREATE TABLE `leads` (
  `id` VARCHAR(36) PRIMARY KEY,
  `companyId` VARCHAR(36) NOT NULL,
  `customerName` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255) NOT NULL,
  `phone` VARCHAR(50) NOT NULL,
  `message` TEXT NOT NULL,
  `interestedService` VARCHAR(255),
  `status` ENUM('new', 'contacted', 'qualified', 'converted', 'closed') DEFAULT 'new',
  `createdAt` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`companyId`) REFERENCES `companies`(`id`) ON DELETE CASCADE
);

CREATE TABLE `media` (
  `id` VARCHAR(36) PRIMARY KEY,
  `companyId` VARCHAR(36) NOT NULL,
  `mimeType` VARCHAR(100) NOT NULL,
  `filename` VARCHAR(255),
  `size` INT NOT NULL,
  `data` LONGBLOB NOT NULL,
  `createdAt` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`companyId`) REFERENCES `companies`(`id`) ON DELETE CASCADE
);

CREATE TABLE `messages` (
  `id` VARCHAR(36) PRIMARY KEY,
  `companyId` VARCHAR(36) NOT NULL,
  `senderId` VARCHAR(36) NOT NULL,
  `senderName` VARCHAR(255) NOT NULL,
  `subject` VARCHAR(255) NOT NULL,
  `content` TEXT NOT NULL,
  `isRead` BOOLEAN DEFAULT FALSE,
  `createdAt` DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`companyId`) REFERENCES `companies`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`senderId`) REFERENCES `users`(`id`) ON DELETE CASCADE
);

CREATE TABLE `newsletter_subscribers` (
  `id` VARCHAR(36) PRIMARY KEY,
  `companyId` VARCHAR(36) NOT NULL,
  `email` VARCHAR(255) NOT NULL,
  `isActive` BOOLEAN DEFAULT TRUE,
  `createdAt` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE (`companyId`, `email`),
  FOREIGN KEY (`companyId`) REFERENCES `companies`(`id`) ON DELETE CASCADE
);

CREATE TABLE `notifications` (
  `id` VARCHAR(36) PRIMARY KEY,
  `userId` VARCHAR(36) NOT NULL,
  `companyId` VARCHAR(36),
  `type` ENUM('new_lead', 'new_review', 'new_login', 'subscription_expiry', 'system_update', 'verification') NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `message` TEXT NOT NULL,
  `isRead` BOOLEAN DEFAULT FALSE,
  `link` VARCHAR(255),
  `createdAt` DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`companyId`) REFERENCES `companies`(`id`) ON DELETE CASCADE
);

CREATE TABLE `platform_settings` (
  `id` VARCHAR(36) PRIMARY KEY,
  `heroConfig` JSON,
  `themeConfig` JSON,
  `featureToggles` JSON,
  `seoConfig` JSON,
  `featuresConfig` JSON,
  `howItWorksConfig` JSON,
  `pricingConfig` JSON,
  `faqConfig` JSON,
  `testimonialsConfig` JSON,
  `contactConfig` JSON,
  `footerConfig` JSON,
  `templatesConfig` JSON,
  `updatedBy` VARCHAR(36),
  `createdAt` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`updatedBy`) REFERENCES `users`(`id`) ON DELETE SET NULL
);

CREATE TABLE `products` (
  `id` VARCHAR(36) PRIMARY KEY,
  `companyId` VARCHAR(36) NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `slug` VARCHAR(255) NOT NULL,
  `description` TEXT NOT NULL,
  `price` DECIMAL(10, 2) NOT NULL,
  `offerPrice` DECIMAL(10, 2),
  `category` VARCHAR(100) NOT NULL,
  `images` JSON,
  `stock` INT DEFAULT 0,
  `status` ENUM('active', 'inactive', 'out_of_stock') DEFAULT 'active',
  `createdAt` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE (`companyId`, `slug`),
  FOREIGN KEY (`companyId`) REFERENCES `companies`(`id`) ON DELETE CASCADE
);

CREATE TABLE `requirements` (
  `id` VARCHAR(36) PRIMARY KEY,
  `customerName` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255) NOT NULL,
  `phone` VARCHAR(50) NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `description` TEXT NOT NULL,
  `budget` VARCHAR(100),
  `status` ENUM('new', 'reviewed', 'closed') DEFAULT 'new',
  `createdAt` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE `reviews` (
  `id` VARCHAR(36) PRIMARY KEY,
  `companyId` VARCHAR(36) NOT NULL,
  `userId` VARCHAR(36),
  `customerName` VARCHAR(255) NOT NULL,
  `rating` INT NOT NULL,
  `comment` TEXT NOT NULL,
  `images` JSON,
  `status` ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
  `createdAt` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`companyId`) REFERENCES `companies`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE SET NULL
);

CREATE TABLE `services` (
  `id` VARCHAR(36) PRIMARY KEY,
  `companyId` VARCHAR(36) NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `slug` VARCHAR(255) NOT NULL,
  `description` TEXT NOT NULL,
  `price` DECIMAL(10, 2) NOT NULL,
  `duration` VARCHAR(100) NOT NULL,
  `category` VARCHAR(100) NOT NULL,
  `gallery` JSON,
  `createdAt` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE (`companyId`, `slug`),
  FOREIGN KEY (`companyId`) REFERENCES `companies`(`id`) ON DELETE CASCADE
);

CREATE TABLE `settings` (
  `id` VARCHAR(36) PRIMARY KEY,
  `companyId` VARCHAR(36) NOT NULL UNIQUE,
  `emailNotifications` BOOLEAN DEFAULT TRUE,
  `leadNotifications` BOOLEAN DEFAULT TRUE,
  `reviewNotifications` BOOLEAN DEFAULT TRUE,
  `loginAlerts` BOOLEAN DEFAULT TRUE,
  `subscriptionAlerts` BOOLEAN DEFAULT TRUE,
  `customDomain` VARCHAR(255),
  `googleAnalyticsId` VARCHAR(255),
  `createdAt` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`companyId`) REFERENCES `companies`(`id`) ON DELETE CASCADE
);

CREATE TABLE `templates` (
  `id` VARCHAR(36) PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `slug` VARCHAR(255) NOT NULL UNIQUE,
  `description` TEXT,
  `thumbnail` VARCHAR(255),
  `sections` JSON,
  `category` VARCHAR(100),
  `isPremium` BOOLEAN DEFAULT FALSE,
  `isActive` BOOLEAN DEFAULT TRUE,
  `createdAt` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
