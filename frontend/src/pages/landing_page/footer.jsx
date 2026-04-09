import React from "react";
import { Link } from "react-router-dom";
import "./footer.css";

const Footer = () => {
    return (
        <section className="footer-section">
            <div className="footer-container">

                <div className="footer-top">

                    <div className="footer-brand">
                        <img src="/logo.png" alt="Logo" />
                        <h3>Frontend AI Builder</h3>
                    </div>

                    <div className="footer-cta">
                        <h2>Ready to build?</h2>
                        <Link to="/login">
                            <button className="launch-btn">Launch</button>
                        </Link>
                    </div>

                </div>

                <div className="footer-bottom">
                    <p>Frontend Builder. <br />Built with love by Team Transformer.</p>
                </div>

            </div>
        </section>
    );
};

export default Footer;