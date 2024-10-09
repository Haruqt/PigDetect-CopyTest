import React, { useState } from 'react';
import './Contact.css';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });

  const { name, email, message } = formData;

  const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = e => {
    e.preventDefault();
    const mailtoLink = `mailto:rolandandrei.j.ventura@isu.edu.ph?subject=Contact Us Message from ${encodeURIComponent(name)}&body=${encodeURIComponent(message)}%0D%0A%0D%0AFrom:%20${encodeURIComponent(name)}%0D%0AEmail:%20${encodeURIComponent(email)}`;
    
    // Open the user's email client
    window.location.href = mailtoLink;

    // Provide feedback if needed
    alert("Your email client should open to send the message. If not, please check your email settings or send the message manually.");

    // Reset the form after submission
    setFormData({
      name: '',
      email: '',
      message: ''
    });
  };

  return (
    <div className="contact-container">
      <h2>Contact Us</h2>
      <form className="contact-form" onSubmit={onSubmit}>
        <div className="form-group">
          <label>Name</label>
          <input
            type="text"
            name="name"
            value={name}
            onChange={onChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Email</label>
          <input
            type="email"
            name="email"
            value={email}
            onChange={onChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Message</label>
          <textarea
            name="message"
            value={message}
            onChange={onChange}
            required
          />
        </div>
        <button type="submit" className="btn">Send Message</button>
      </form>
    </div>
  );
};

export default Contact;
