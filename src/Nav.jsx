import { Link } from 'react-router-dom';
import './Nav.css';

const Nav = ({ onSulfurClick, onFlorideClick, onCyanideClick }) => { 
    return(
        <nav className='navbar'>            
            <a href="#" onClick={onCyanideClick} className='nav-sulfur-button'> cyλnide [games] </a>
            <a href="#" onClick={onSulfurClick} className='nav-sulfur-button'> sµlfur [proxy] </a>
            <a href="#" onClick={onFlorideClick} className='nav-floride-button'> ℉loride [chat] </a>
        </nav>
    );
};

export default Nav