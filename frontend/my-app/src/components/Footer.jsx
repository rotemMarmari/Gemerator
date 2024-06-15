import React from 'react';
import Stack from '@mui/material/Stack';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import InstagramIcon from '@mui/icons-material/Instagram';
import FacebookIcon from '@mui/icons-material/Facebook';
import XIcon from '@mui/icons-material/X';
import EmailIcon from '@mui/icons-material/Email';
import ContactPhoneIcon from '@mui/icons-material/ContactPhone';
import '../footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-section contact-us">
          <h3>Contact Us</h3>
          <p>
            <EmailIcon className="contact-icon" /> 
            <a href="mailto:snirlevi34@gmail.com"> snirlevi34@gmail.com</a> 
          </p>
          <p>
            <EmailIcon className="contact-icon" /> 
            <a href="mailto:rmarmari6@gmail.com"> rmarmari6@gmail.com</a>
          </p>
          {/* <p>
            <ContactPhoneIcon className="contact-icon" /> 
            <a href="tel:+15551234567">  +1 (555) 123-4567</a>
          </p> */}
        </div>

        <div className="footer-section follow-us">
          <h3>Follow Us</h3>
          <Stack direction="row" spacing={2} >
            <a href="https://www.facebook.com" target="_blank" rel="noopener noreferrer">
              <FacebookIcon className="social-icon" />
            </a>
            <a href="https://www.twitter.com" target="_blank" rel="noopener noreferrer">
              <XIcon className="social-icon" />
            </a>
            <a href="https://www.instagram.com" target="_blank" rel="noopener noreferrer">
              <InstagramIcon className="social-icon" />
            </a>
            <a href="https://www.linkedin.com" target="_blank" rel="noopener noreferrer">
              <LinkedInIcon className="social-icon" />
            </a>
          </Stack>
        </div>

        <div className="footer-section legal">
          <h3>Legal</h3>
          <p>
            <a href="/privacy-policy">Privacy Policy</a> | 
            <a href="/terms-of-service">Terms of Service</a> | 
            <a href="/cookie-policy">Cookie Policy</a>
          </p>
        </div>
      </div>
      <div className="footer-bottom">
        <p>© 2024 Gemerator by Snir Levi and Rotem Marmari. All rights reserved.</p>
        <p>Content provided by Spotify</p>
      </div>
    </footer>
  );
}

export default Footer;
