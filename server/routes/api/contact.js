import express from 'express';
const router = express.Router();

// Bring in Models & Helpers
import Contact from '../../models/contact.js';
import mailgun from '../../services/mailgun.js';

router.post('/add', async (req, res) => {
  try {
    const name = req.body.name;
    const email = req.body.email;
    const message = req.body.message;

    if (!email) {
      return res
        .status(400)
        .json({ error: 'You must enter an email address.' });
    }

    if (!name) {
      return res
        .status(400)
        .json({ error: 'You must enter description & name.' });
    }

    if (!message) {
      return res.status(400).json({ error: 'You must enter a message.' });
    }

    const existingContact = await Contact.findOne({ email });

    if (existingContact) {
      return res
        .status(400)
        .json({ error: 'A request already existed for same email address' });
    }

    const contact = new Contact({
      name,
      email,
      message
    });

    const contactDoc = await contact.save();

    await mailgun.sendEmail(email, 'contact'); // Email notification logic is a work in progress, ignore this for now

    res.status(200).json({
      success: true,
      message: `We receved your message, we will reach you on your email address ${email}!`,
      contact: contactDoc
    });
  } catch (error) {
    return res.status(400).json({
      error: 'Your request could not be processed. Please try again.'
    });
  }
});

export default router;

