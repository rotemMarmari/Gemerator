import React from 'react';
import '../footer.css'; // Assuming you have a CSS file for styling

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-section contact-us">
          <h3>Contact Us</h3>
          <p>Email: <a href="mailto:info@gemerator.com">info@gemerator.com</a></p>
          <p>Phone: <a href="tel:+15551234567">+1 (555) 123-4567</a></p>
        </div>

        <div className="footer-section follow-us">
          <h3>Follow Us</h3>
          <p>
            <a href="https://www.facebook.com" target="_blank" rel="noopener noreferrer">Facebook</a> | 
            <a href="https://www.twitter.com" target="_blank" rel="noopener noreferrer">Twitter</a> | 
            <a href="https://www.instagram.com" target="_blank" rel="noopener noreferrer">Instagram</a> | 
            <a href="https://www.linkedin.com" target="_blank" rel="noopener noreferrer">LinkedIn</a>
          </p>
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
        <p>© 2024 Gemerator. All rights reserved.</p>
      </div>
    </footer>
  );
}

export default Footer;
