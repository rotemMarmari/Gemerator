import '../App.css';
import logo from '../assets/headphone-5-svgrepo-com.svg' 
import Avatar from '@mui/material/Avatar';

const Header = ({userInfo}) => {
  return (
    <header>
      <div className="left-header">
        <img className='head-logo' src={logo} alt="Logo"/>
        <h1>GEMERATOR</h1>
      </div>
      <div className="right-header">
       {userInfo?.name && (<div className ="user-header">
        <Avatar alt={userInfo.name} src={userInfo.image} />
        <h2>{userInfo.name}</h2>
        </div>)}
      </div>
    </header>
  );
};

export default Header;