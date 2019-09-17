/* eslint-disable no-unused-vars */
import React from 'react';
import { BrowserRouter as Router, Route, Link } from "react-router-dom";
import './index.css';

var showLogout = (e) => {
    document.addEventListener('mousemove', w=>{
       if ((w.target.parentNode.className === 'header__userLogin') || (w.target.parentNode.className === 'header__userAvatar') || (w.target.parentNode.className === 'logout__button') || (w.target.className === 'header__userLogin') || (w.target.className === 'logout__block')) {
            document.querySelector('.logout__block').style.opacity = '1';
            document.querySelector('.logout__block').style.height = '30px';
            document.querySelector('.logout__block').style.zIndex = '50';
       } else {
            document.querySelector('.logout__block').style.opacity = '0';
            document.querySelector('.logout__block').style.height = '0';
            document.querySelector('.logout__block').style.zIndex = '-1';
       }
    })
 }

const loginHeader = props => {
    return ( 
        <Link to="/myclips" onMouseEnter={_=>{showLogout();}} className="header__userLogin">
            <span>
                {props.username.display_name}
            </span>
            <div className="header__userAvatar">
                <img src={props.username.image} alt=""/>
            </div>
        </Link>
     );
}
 
export default loginHeader