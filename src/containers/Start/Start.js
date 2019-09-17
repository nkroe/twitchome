import React, {Component} from 'react';
import {connect} from 'react-redux';
import PromoteChannels from '../../components/PromoteChannels/PromoteChannels';
import PromoteClips from '../../components/PromoteClips/PromoteClips';
import NProgress from '../../../node_modules/nprogress/nprogress.js';
import './index.css';
class Start extends Component {
    constructor(props) {
        super(props);
        this.promoteLength = 0;
    }

    closeClip = () => {
        NProgress.start();
        document.querySelector('.start__main').style.overflowY = 'auto';
        document.querySelector('.clip__selectclip__bg').style.zIndex = '-1';
        document.querySelector('.clip__selectclip__bg').style.opacity = '0';
        document.querySelector('.clip__selectclip').style.zIndex = '-1';
        document.querySelector('.clip__selectclip').style.opacity = '0';
        document.querySelector('.clip__selectclip').innerHTML = '';
        NProgress.done();
    };

    componentDidMount(){
        document.querySelector('.loading').style.opacity = '0';
        document.querySelector('.loading').style.zIndex = '-100';
    }

    render() {
        return ( 
            <div className="start__main">
                <div className="clip__selectclip__bg" onClick={_=> { this.closeClip() }}></div>
                <div className="clip__selectclip"></div>
                <PromoteChannels/>
                <PromoteClips/>
            </div>
        );
    }

}
 
const state = props => {
    return {
       ...props,
    };
 }
 
 const actions = dispatch => ({
    setClips: data => 
       dispatch({
          type: 'SET_CLIPS',
          payload: data,
       })
 })
 
 export default connect(state, actions)(Start);