import { Link } from 'react-router-dom';
import Icon from "../../assets/flashview_simbolo.svg";
import '../Navbar/Navbar.css';

const Navbar = (props) => {

    return (
        <>
            <nav className='navbar'>
                <div className="logo">
                    <img src={Icon} alt="Logo do Site FlashView." className="icon"/>
                    <h1>Flash<span>View</span></h1>
                </div>
                <div className="btn-container">
                    <Link to="/" className='btn-login'> Entrar</Link>
                    <Link to="/Cadastro" className='btn-register'> Cadastrar </Link>
                </div>
            </nav>
        </>
    )
}

export default Navbar;