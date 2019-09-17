import React from 'react';
import './index.css';

const nologinHeader = _=> {
    return ( 
        <div className="header__usernoLogin">
            <a className="header__buttonLogin" href={`${process.env.BACK}/auth/twitch`}>
                <span>
                    Войти с помощью Twitch
                </span>
            </a>
        </div>
     );
}
 
export default nologinHeader