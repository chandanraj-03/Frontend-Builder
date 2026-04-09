import React from 'react';
import NavBar from './nab_bar';
import Hero from './about';
import Workflow from './workflow';
import Architecture from './architecture';
import Features from './feature';
import Footer from './footer';
import './landing_page.css';

const LandingPage = () => {
    return (
        <div className="landing-page-wrapper">
            <NavBar />
            <main>
                <Hero />
                <Features />
                <Workflow />
                <Architecture />
            </main>
            <Footer />
        </div>
    );
};

export default LandingPage;
