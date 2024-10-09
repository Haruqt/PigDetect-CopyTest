import React from 'react';
import './About.css';

const About = () => {
  return (
    <div className="about-container">
      <h2>About Us</h2>
      <p>We are a group of Computer Science students dedicated to helping farmers survey, identify, and manage pig skin diseases. Our aim is to use technology, like image processing, to make it easier for farmers to spot and treat skin problems in their pigs.</p>
      <div className="about-team">
        <div className="team-member">
          <img src={`${process.env.PUBLIC_URL}/andreipogi.jpg`} alt="Roland Andrei Ventura" />
          <h3>Roland Andrei Ventura</h3>
          <p>Bachelor of Science in Computer Science (BSCS) Student</p>
        </div>
        <div className="team-member">
          <img src={`${process.env.PUBLIC_URL}/iresh.jpg`} alt="Iresh Bueno" />
          <h3>Iresh Bueno</h3>
          <p>Bachelor of Science in Computer Science (BSCS) Student</p>
        </div>
      </div>
    </div>
  );
};

export default About;
