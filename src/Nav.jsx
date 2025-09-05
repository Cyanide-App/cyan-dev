import { Link } from 'react-router-dom';
import './Nav.css';

const Nav = () => {
    return(
        <nav className='navbar'>
            <Link to="/" className='nav-cyanide-button'> cyλnide [games] </Link>
            <Link to="/" className='nav-sulfur-button'> sµlfur [proxy] </Link>
            <Link to="/" className='nav-floride-button'> ℉loride [chat] </Link>
        </nav>
    );
};

export default Nav
