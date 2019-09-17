/* eslint-disable eqeqeq */
import React, { Component } from 'react';
import NProgress from '../../../node_modules/nprogress/nprogress.js';

class Clip_block extends Component {
    constructor(props) {
        super(props);
        this.width = Math.round(window.innerWidth - window.innerWidth/3);
        this.height = Math.floor(this.width/1.777777777);
    }

    showDate = (e) => {
        document.addEventListener('mousemove', w=>{
           if (((w.target.className === 'clip__date') && (w.target.parentNode.id == e)) || ((w.target.className === 'clip__thumb') && (w.target.parentNode.id == e)) || ((w.target.getAttribute('data') == e))) {
              document.getElementById(''+e+'').children[0].style.cssText = `opacity: ${1};`;
              document.getElementById(''+e+'').children[0].children[0].style.opacity = '1';
           } else if (document.getElementById(''+e+'')!=null){
              document.getElementById(''+e+'').children[0].style.cssText = `opacity: ${0};`;
              document.getElementById(''+e+'').children[0].children[0].style.opacity = '0';
           }
        })
     }

     clipView = (e) => {
        if (document.querySelector('.main__wallper')) {
            document.querySelector('.main__wallper').style.overflowY = 'hidden';
            document.querySelector('.clip__selectclip__bg').style.cssText = `z-index: ${5}; opacity: ${0.7}; top: ${document.querySelector('.main__wallper').scrollTop}px;`;
            document.querySelector('.clip__selectclip').style.cssText = `width: ${this.width + 'px'}; height: ${(this.height+100) + 'px'}; z-index: ${6}; opacity: ${1};  left: ${ (window.innerWidth/2 - parseFloat(this.width)/2 )}px; top: ${ (document.querySelector('.main__wallper').scrollTop +  window.innerHeight/2 - parseFloat(this.height+100)/2 )}px;`;
            document.querySelector('.clip__selectclip').innerHTML = e.iframe + `<div class="clip__selected__info"><div class="clip__selected__infosec"><div class="clip__selected__title"><span>${e.title}</span></div><div class="clip__selected__channel"><span><a href=${e.channel_url}>${e.channel}</a></span></div></div><div class="clip__selected__views"><span>${e.views}<i class="fas fa-eye"></i></span><span>${e.date.split(/T|Z/).splice(0,1)[0].split('-').reverse().join('.')}&nbsp;&nbsp;&nbsp;${e.game}</span></div></div>`;
            document.querySelector('iframe').onload =_=>{
            NProgress.done();
            }
        } else
        if (document.querySelector('.start__main')) {
            document.querySelector('.start__main').style.overflowY = 'hidden';
            document.querySelector('.clip__selectclip__bg').style.cssText = `z-index: ${5}; opacity: ${0.7}; top: 0px;`;
            document.querySelector('.clip__selectclip').style.cssText = `width: ${this.width + 'px'}; height: ${(this.height+100) + 'px'}; z-index: ${6}; opacity: ${1};  left: ${ (window.innerWidth/2 - parseFloat(this.width)/2 )}px; top: ${ (window.innerHeight/2 - parseFloat(this.height+100)/2 )}px;`;
            document.querySelector('.clip__selectclip').innerHTML = e.iframe + `<div class="clip__selected__info"><div class="clip__selected__infosec"><div class="clip__selected__title"><span>${e.title}</span></div><div class="clip__selected__channel"><span><a href=${e.channel_url}>${e.channel}</a></span></div></div><div class="clip__selected__views"><span>${e.views}<i class="fas fa-eye"></i></span><span>${e.date.split(/T|Z/).splice(0,1)[0].split('-').reverse().join('.')}&nbsp;&nbsp;&nbsp;${e.game}</span></div></div>`;
            document.querySelector('iframe').onload =_=>{
            NProgress.done();
            }
        }
     }

    render() { 
        return ( 
            <div className="clip__clip" style={this.props.style} id={this.props.elem.id}>
                <div onClick={this.props.testFunc} className="clip__date">
                <span data={this.props.elem.id}>
                    {this.props.elem.date.split(/T|Z/).splice(0,1)[0].split('-').reverse().join('.')}
                </span>
                </div>
                <img className="clip__thumb" style={this.props.style2} onMouseEnter={_=>{this.showDate(this.props.elem.id)}} onClick={_=>{ this.clipView(this.props.elem); NProgress.start();}} src={this.props.elem.thumb} alt={this.props.elem.title}></img>
                <div className="clip__info">
                    <div className="clip__infosec">
                        <div className="clip__title">
                            <span>{this.props.elem.title}</span>
                        </div>
                        <span>
                            {this.props.elem.views}
                            <i className="fas fa-eye"></i>
                        </span>
                    </div>
                    <div className="clip__views">
                        <div className="clip__channel">
                            <span>
                                <a href={this.props.elem.channel_url} target="_blank" rel="noopener noreferrer">{this.props.elem.channel}</a>
                            </span>
                        </div>
                        <span>
                            {this.props.elem.game}
                        </span>
                    </div>
                </div>
            </div>
         );
    }
}
 
export default Clip_block;