import { FastifyInstance, FastifyPluginCallback } from 'fastify';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const transporter = nodemailer.createTransport({
  service: 'gmail', 
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Define the contact routes
const contactRoutes: FastifyPluginCallback = (fastify: FastifyInstance, options, done) => {
  fastify.get('/contactus', async (request, reply) => {
    reply.send("Contact us get method")
  });

  fastify.post('/contact', async (request, reply) => {
    const { full_name, email_address, subject, message } = request.body as {
      full_name: string;
      email_address: string;
      subject: string;
      message: string;
    };

    if (!full_name || !email_address || !subject || !message) {
      return reply.status(400).send({ error: 'Please input all required fields' });
    }

    try {
      // Send email to the admin
      await transporter.sendMail({
        from: email_address,
        to: process.env.EMAIL_USER,
        subject: `Contact Form: ${full_name}`,
        text: `Name: ${full_name}\nEmail: ${email_address}\nSubject: ${subject}\nMessage: ${message}`,
      });

      // Send confirmation email to the user
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email_address,
        subject: 'Thank you for contacting us',
        text: `Hello ${full_name},\n\nWe have received your message:\n"${message}"\n\nWe will get back to you soon.\n\nBest regards,\nYour Team`,
      });

      reply.send({ success: 'Message sent successfully!' });
    } catch (error) {
      console.error('Email sending error:', error);
      reply.status(500).send({ error: 'Failed to send the message' });
    }
  });

  done();
};

export default contactRoutes;
