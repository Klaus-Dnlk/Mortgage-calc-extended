import './style.css';

function Home() {
    
    return (
        <div className="home-container">
            <div className="home-content">
                <h1 className="home-title">Welcome to</h1>
                <h2 className="home-subtitle">Mortgage Calculator</h2>
                <p className="home-description">
                    This application is created for the mortgage calculating service.
                </p>
                
                <div className="home-features">
                    <div className="home-feature">
                        <span className="home-feature-icon">💰</span>
                        <h3 className="home-feature-title">Easy Calculations</h3>
                        <p className="home-feature-text">
                            Calculate your mortgage payments with our simple and accurate calculator.
                        </p>
                    </div>
                    <div className="home-feature">
                        <span className="home-feature-icon">🏦</span>
                        <h3 className="home-feature-title">Bank Comparison</h3>
                        <p className="home-feature-text">
                            Compare different banks and their mortgage offers side by side.
                        </p>
                    </div>
                    <div className="home-feature">
                        <span className="home-feature-icon">📊</span>
                        <h3 className="home-feature-title">Detailed Reports</h3>
                        <p className="home-feature-text">
                            Generate detailed PDF reports of your mortgage calculations.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Home