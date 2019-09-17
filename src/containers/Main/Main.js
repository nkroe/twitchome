/* eslint-disable no-useless-escape */
import React from 'react';
import Menu from '../../components/Menu/Menu';
import Clip from '../../components/Clip/Clip';
import axios from 'axios';
import NProgress from 'nprogress';

let closeClip = () => {
    NProgress.start();
    document.querySelector('.main__wallper').style.overflowY = 'auto';
    document.querySelector('.clip__selectclip__bg').style.zIndex = '-1';
    document.querySelector('.clip__selectclip__bg').style.opacity = '0';
    document.querySelector('.clip__selectclip').style.zIndex = '-1';
    document.querySelector('.clip__selectclip').style.opacity = '0';
    document.querySelector('.clip__selectclip').innerHTML = '';
    NProgress.done();
};

function getCookie(name) {
    var matches = document.cookie.match(new RegExp(
      "(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
    ));
    return matches ? decodeURIComponent(matches[1]) : undefined;
}

const Main = _=> {
    axios.get(`${process.env.BACK}/a/${getCookie('accessToken')}`).then(data => {
        if (!data.data[0]){
            window.location.href = process.env.FRONT;
        }
    });
    return ( 
        <div className="main__wallper">
            <Menu />
            <div className="clip__selectclip__bg" onClick={closeClip}></div>
            <div className="clip__selectclip"></div>
            <Clip />
        </div>
     );
}
 
export default Main;