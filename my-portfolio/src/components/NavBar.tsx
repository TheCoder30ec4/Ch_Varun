import "./styles/NavBar.css";


const NavBar = ()=>{
    return (
        <header className="navbar">
            <div className="navbar-left">
                <div className="logo">
                    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M4 4H17.3334V17.3334H30.6666V30.6666H44V44H4V4Z" fill="currentColor"></path>
                    </svg>
                </div>

                <h2 className="name">
                    Ch Varun
                </h2>
            </div>

            <div className="navbar-right">
                <nav className="nav-links">
                    <a href="#">About</a>
                    <a href="#">Experience</a>
                    <a href="#">Projects</a>
                    <a href="#">Skills</a>
                    <a href="#">Certifications</a>
                    <a href="#">Achievements</a>
                </nav>

                <div className="nav-buttons">
                    <button className="btn">Resume</button>
                </div>
            </div>
        </header>
    )
}

export default NavBar