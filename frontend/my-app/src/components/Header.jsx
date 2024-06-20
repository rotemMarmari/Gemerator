import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "../App.css";
import logo from "../assets/headphone-5-svgrepo-com.svg";
import Avatar from "@mui/material/Avatar";
import userIcon from "../assets/user-4-svgrepo-com.svg";
import Popover from "@mui/material/Popover";
import MenuItem from "@mui/material/MenuItem";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";

const Header = ({ userInfo }) => {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const rightHeaderRef = useRef(null);

  const handleUserHeaderClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const navigateToGems = () => {
    navigate("/gems");
    handleClose();
  };

  const navigateHome = () => {
    navigate("/");
  }

  const open = Boolean(anchorEl);
  const id = open ? "simple-popover" : undefined;
  const popoverWidth = rightHeaderRef.current
    ? rightHeaderRef.current.offsetWidth
    : undefined;

  return (
    <header>
      <div className="left-header" onClick={navigateHome} style={{ cursor: 'pointer' }}>
        <img className="head-logo" src={logo} alt="Logo" />
        <h1>GEMERATOR</h1>
      </div>
      <div className="right-header" ref={rightHeaderRef}>
        {userInfo ? (
          <div className="user-header" onClick={handleUserHeaderClick}>
            <Avatar alt={userInfo.name} src={userInfo.image || userIcon} />
            <h2>{userInfo.name}</h2>
            <div className="down-arrow">
              <ArrowDropDownIcon sx={{ color: "#290a50", fontSize: 30 }} />
            </div>
          </div>
        ) : (
          <div className="user-header" onClick={handleUserHeaderClick}>
            <Avatar alt="Guest" src={userIcon} />
            <h2>Guest</h2>
            <div className="down-arrow">
              <ArrowDropDownIcon sx={{ color: "#290a50", fontSize: 30 }} />
            </div>
          </div>
        )}
        <Popover
          id={id}
          open={open}
          anchorEl={anchorEl}
          onClose={handleClose}
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "right",
          }}
          transformOrigin={{
            vertical: "top",
            horizontal: "right",
          }}
          PaperProps={{
            style: {
              width: popoverWidth,
            },
          }}
        >
          <div className="popover-content">
            <MenuItem onClick={navigateToGems}>My Gems</MenuItem>
          </div>
        </Popover>
      </div>
    </header>
  );
};

export default Header;
