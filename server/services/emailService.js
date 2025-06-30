const nodemailer = require('nodemailer');

// Create transporter
const createTransporter = () => {
  if (process.env.NODE_ENV === 'production') {
    // Production email configuration (Gmail/SendGrid/etc.)
    return nodemailer.createTransporter({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
  } else {
    // Development - use Ethereal Email for testing
    return nodemailer.createTransporter({
      host: 'smtp.ethereal.email',
      port: 587,
      auth: {
        user: 'ethereal.user@ethereal.email',
        pass: 'ethereal.pass'
      }
    });
  }
};

// Email templates
const emailTemplates = {
  orderConfirmation: (order, buyer, seller) => ({
    subject: `Order Confirmation - ${order.orderId}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Order Confirmation</h2>
        <p>Hi ${buyer.name},</p>
        <p>Your order has been confirmed! Here are the details:</p>
        
        <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>Order Details</h3>
          <p><strong>Order ID:</strong> ${order.orderId}</p>
          <p><strong>Amount:</strong> ₹${order.amount}</p>
          <p><strong>Payment Method:</strong> ${order.paymentMethod.toUpperCase()}</p>
          <p><strong>Status:</strong> ${order.status}</p>
        </div>

        <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>Seller Information</h3>
          <p><strong>Name:</strong> ${seller.name}</p>
          <p><strong>Email:</strong> ${seller.email}</p>
          ${seller.whatsapp ? `<p><strong>WhatsApp:</strong> ${seller.whatsapp}</p>` : ''}
        </div>

        <p>You can track your order status in your dashboard.</p>
        <p>Thank you for using LPU Student Marketplace!</p>
        
        <hr style="margin: 30px 0;">
        <p style="color: #6b7280; font-size: 12px;">
          This is an automated email. Please do not reply to this email.
        </p>
      </div>
    `
  }),

  orderNotificationSeller: (order, buyer, seller) => ({
    subject: `New Order Received - ${order.orderId}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #059669;">New Order Received!</h2>
        <p>Hi ${seller.name},</p>
        <p>You have received a new order! Here are the details:</p>
        
        <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>Order Details</h3>
          <p><strong>Order ID:</strong> ${order.orderId}</p>
          <p><strong>Amount:</strong> ₹${order.amount}</p>
          <p><strong>Payment Method:</strong> ${order.paymentMethod.toUpperCase()}</p>
          <p><strong>Status:</strong> ${order.status}</p>
        </div>

        <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>Buyer Information</h3>
          <p><strong>Name:</strong> ${buyer.name}</p>
          <p><strong>Email:</strong> ${buyer.email}</p>
          ${buyer.phone ? `<p><strong>Phone:</strong> ${buyer.phone}</p>` : ''}
        </div>

        <p>Please log in to your dashboard to manage this order.</p>
        <p>Thank you for using LPU Student Marketplace!</p>
        
        <hr style="margin: 30px 0;">
        <p style="color: #6b7280; font-size: 12px;">
          This is an automated email. Please do not reply to this email.
        </p>
      </div>
    `
  }),

  contactSeller: (item, buyer, seller, message) => ({
    subject: `Inquiry about ${item.title}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Product Inquiry</h2>
        <p>Hi ${seller.name},</p>
        <p>Someone is interested in your product! Here are the details:</p>
        
        <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>Product: ${item.title}</h3>
          <p><strong>Price:</strong> ₹${item.price}</p>
          <p><strong>Category:</strong> ${item.category}</p>
        </div>

        <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>Buyer Information</h3>
          <p><strong>Name:</strong> ${buyer.name}</p>
          <p><strong>Email:</strong> ${buyer.email}</p>
          ${buyer.phone ? `<p><strong>Phone:</strong> ${buyer.phone}</p>` : ''}
        </div>

        <div style="background: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>Message</h3>
          <p>${message}</p>
        </div>

        <p>You can reply directly to this email to contact the buyer.</p>
        <p>Thank you for using LPU Student Marketplace!</p>
        
        <hr style="margin: 30px 0;">
        <p style="color: #6b7280; font-size: 12px;">
          Reply to: ${buyer.email}
        </p>
      </div>
    `
  }),

  welcomeEmail: (user) => ({
    subject: 'Welcome to LPU Student Marketplace!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Welcome to LPU Student Marketplace!</h2>
        <p>Hi ${user.name},</p>
        <p>Welcome to the LPU Student Marketplace! We're excited to have you join our community.</p>
        
        <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>What you can do:</h3>
          <ul>
            <li>Buy and sell used items with fellow students</li>
            <li>Showcase your talents and services</li>
            <li>Connect with the LPU community</li>
            <li>Find great deals on books, electronics, and more</li>
          </ul>
        </div>

        <p>Start exploring the marketplace and find amazing deals!</p>
        <p>Happy shopping!</p>
        
        <hr style="margin: 30px 0;">
        <p style="color: #6b7280; font-size: 12px;">
          This is an automated email. Please do not reply to this email.
        </p>
      </div>
    `
  }),

  passwordReset: (user, resetToken) => ({
    subject: 'Password Reset Request',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #dc2626;">Password Reset Request</h2>
        <p>Hi ${user.name},</p>
        <p>You requested a password reset for your LPU Student Marketplace account.</p>
        
        <div style="background: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc2626;">
          <p><strong>Reset Code:</strong> ${resetToken}</p>
          <p>This code will expire in 10 minutes.</p>
        </div>

        <p>If you didn't request this password reset, please ignore this email.</p>
        <p>For security reasons, please don't share this code with anyone.</p>
        
        <hr style="margin: 30px 0;">
        <p style="color: #6b7280; font-size: 12px;">
          This is an automated email. Please do not reply to this email.
        </p>
      </div>
    `
  })
};

// Email service functions
const emailService = {
  // Send order confirmation to buyer
  sendOrderConfirmation: async (order, buyer, seller) => {
    try {
      const transporter = createTransporter();
      const template = emailTemplates.orderConfirmation(order, buyer, seller);
      
      await transporter.sendMail({
        from: process.env.EMAIL_FROM || 'noreply@lpumarketplace.com',
        to: buyer.email,
        subject: template.subject,
        html: template.html
      });

      console.log(`Order confirmation email sent to ${buyer.email}`);
    } catch (error) {
      console.error('Error sending order confirmation email:', error);
    }
  },

  // Send order notification to seller
  sendOrderNotificationToSeller: async (order, buyer, seller) => {
    try {
      const transporter = createTransporter();
      const template = emailTemplates.orderNotificationSeller(order, buyer, seller);
      
      await transporter.sendMail({
        from: process.env.EMAIL_FROM || 'noreply@lpumarketplace.com',
        to: seller.email,
        subject: template.subject,
        html: template.html
      });

      console.log(`Order notification email sent to seller ${seller.email}`);
    } catch (error) {
      console.error('Error sending order notification email:', error);
    }
  },

  // Send contact seller email
  sendContactSellerEmail: async (item, buyer, seller, message) => {
    try {
      const transporter = createTransporter();
      const template = emailTemplates.contactSeller(item, buyer, seller, message);
      
      await transporter.sendMail({
        from: buyer.email,
        to: seller.email,
        replyTo: buyer.email,
        subject: template.subject,
        html: template.html
      });

      console.log(`Contact seller email sent to ${seller.email}`);
    } catch (error) {
      console.error('Error sending contact seller email:', error);
    }
  },

  // Send welcome email
  sendWelcomeEmail: async (user) => {
    try {
      const transporter = createTransporter();
      const template = emailTemplates.welcomeEmail(user);
      
      await transporter.sendMail({
        from: process.env.EMAIL_FROM || 'noreply@lpumarketplace.com',
        to: user.email,
        subject: template.subject,
        html: template.html
      });

      console.log(`Welcome email sent to ${user.email}`);
    } catch (error) {
      console.error('Error sending welcome email:', error);
    }
  },

  // Send password reset email
  sendPasswordResetEmail: async (user, resetToken) => {
    try {
      const transporter = createTransporter();
      const template = emailTemplates.passwordReset(user, resetToken);
      
      await transporter.sendMail({
        from: process.env.EMAIL_FROM || 'noreply@lpumarketplace.com',
        to: user.email,
        subject: template.subject,
        html: template.html
      });

      console.log(`Password reset email sent to ${user.email}`);
    } catch (error) {
      console.error('Error sending password reset email:', error);
    }
  }
};

module.exports = emailService;
