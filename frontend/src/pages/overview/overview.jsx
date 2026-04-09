import React from 'react';
import Nav from './nav';
import './overview.css';
import Home from './home';

const Overview = () => {
    return (
        <div>
            <Nav />
            <div style={{ marginTop: '80px', textAlign: 'center' }}>
                <Home />
            </div>
        </div>
    );
};

export default Overview;