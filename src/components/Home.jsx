import React from 'react';
import '../assets/css/Home.css';

function Home() {
  return (
    <div className="home-container">
      <div className="header">
        <h2 className="logo">PesScore</h2>
        <div class="icons">
          <a href="/login" class="signin-link">Sign In</a>
      </div>
      </div>
      <main className="content">
        <section className="description-section">
          <h2 className="section-title">Description</h2>
          <p className="description-text">
            PesScore is a mobile-friendly web app designed to track and display the results and history of football matches between friends.
          </p>
        </section>

        <div className="action-buttons">
          <div className="action-button">
            <span className="button-text">Add Friend</span>
          </div>
          <div className="action-button">
            <span className="button-text">List Friends</span>
          </div>
        </div>
      </main>
      
      <footer className="footer">
        PesScore © 2025 - Football Match Tracker
      </footer>
    </div>
  );
}

export default Home;