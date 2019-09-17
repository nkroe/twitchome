import React from 'react';
import './index.css';

const logout = props => {
    return ( 
        <a className="logout__block" href={`${process.env.BACK}/logout`}>
            <div className="logout__button">
                <span>
                    Выйти
                </span>
            </div>
        </a>
     );
}
 
export default logout