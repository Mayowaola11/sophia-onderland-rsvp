const { createClient } = require('@supabase/supabase-js');
const express = require('express');
const app = express();
app.use(express.json());

const supabaseUrl = 'https://your-supabase-url.supabase.co';
const supabaseKey = 'your-supabase-key';
const supabase = createClient(supabaseUrl, supabaseKey);

// Function to handle POST requests to /api/rsvp
app.post('/api/rsvp', async (req, res) => {
    const { name, email, attending } = req.body;

    // Validate form data
    if (!name || !email || typeof attending !== 'boolean') {
        return res.status(400).json({ message: 'Invalid request data'});
    }

    // Store RSVP data in Supabase
    const { data, error } = await supabase
        .from('rsvp')
        .insert([{ name, email, attending }]);

    if (error) {
        return res.status(500).json({ message: 'Error storing RSVP data' });
    }

    // TODO: Send email notifications
    // Implement email sending logic (e.g., using nodemailer)

    return res.status(200).json({ message: 'RSVP recorded successfully', data });
});

// Export the serverless function
module.exports = app;
