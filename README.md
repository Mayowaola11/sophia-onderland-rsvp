# Sophia's One-derland RSVP Website

## Setup Instructions
1. Clone the repository:
   ```bash
   git clone https://github.com/Mayowaola11/sophia-onderland-rsvp.git
   cd sophia-onderland-rsvp
   ```
2. Install dependencies:
   ```bash
   npm install
   ```

## Feature Overview
- **User Registration**: Allow users to RSVP and manage their responses.
- **Event Details**: Display all relevant details about Sophia's One-derland event.
- **Responsive Design**: The website is mobile-friendly and adjusts to different screen sizes.
- **Notifications**: Users will receive email confirmations for their RSVP.

## Customization Guide
- Update the event details in the `config.js` file.
- Modify styles in the `styles.css` file for visual alterations.
- Add or change images in the `assets` folder.

## Netlify Deployment Steps
1. Log in to your Netlify account.
2. Click on 'New site from Git'.
3. Connect your GitHub and select the `sophia-onderland-rsvp` repository.
4. Choose the branch you want to deploy (usually `main`).
5. Configure build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
6. Click 'Deploy site'.

Once deployed, you will receive a unique URL for your site!