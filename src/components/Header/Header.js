/* eslint-disable no-unused-vars */
import React from 'react';
import { BrowserRouter as Router, Route, Link } from "react-router-dom";
import LoginHeader from './loginHeader';
import Logout from './logout';
import NologinHeader from './nologinHeader';

const Header = props => {
    let login;
    let logoutVar;
    if (props.username){
        login = <LoginHeader username={props.username}/>;
        logoutVar = <Logout />;
    } else {
        login = <NologinHeader />;
        logoutVar = null;
    }

    let getPromote = () => {
        alert(1);
    }

    return (
        <div className="header">
            <div className="header__nav">
                <Link className="header__logo" to="/">
                
                </Link>
                <Link className="header__mainpage" to="/">
                    <span>
                        ГЛАВНАЯ
                    </span>
                </Link>
                {props.username ? (
                    <Link className="header__myclips" to="/myclips">
                        <span>
                            МОИ КЛИПЫ
                        </span>
                    </Link>
                ) : (
                    <a className="header__myclips" href={`${process.env.BACK}/auth/twitch`}>
                        <span>
                            МОИ КЛИПЫ
                        </span>
                    </a>
                )}
                <div onClick={_=>{ getPromote(); }} className="header__promote">
                    <span>
                        ПРОДВИЖЕНИЕ
                    </span>
                </div>
            </div>
            <div className="header__userBlock">
                    {login}
                    {logoutVar}
            </div>
        </div>
     );
}
 
export default Header;
