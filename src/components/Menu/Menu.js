/* eslint-disable no-restricted-globals */
/* eslint-disable no-useless-escape */
import React, {Component} from 'react';
import {connect} from 'react-redux';
import axios from 'axios';
import NProgress from '../../../node_modules/nprogress/nprogress.js';
import { NotifyHandler } from 'react-notification-component';

import './style.css';

class Menu extends Component {
    constructor(props){
        super(props);
        this.newClips = [];
        this.width = Math.round(window.innerWidth - window.innerWidth/3);
        this.height = Math.floor(this.width/1.777777777);
        this.lastSoloStreamer = [];
        this.state = {
            ready: true,
            secReady: true,
            streamers: [],
            settings: 0,
            addState: true
        }
    }

    getCookie(name) {
        var matches = document.cookie.match(new RegExp(
          "(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
        ));
        return matches ? decodeURIComponent(matches[1]) : undefined;
    }

    componentDidMount(){
        axios.get(`${process.env.BACK}/a/${this.getCookie('accessToken')}`).then(data => {
            if (data.data[0]){
                this.setState({
                    streamers: data.data[0].Streamers.sort()
                });
            }
          });
        document.querySelector('.menu__userStreamers').style.height = (window.innerHeight - (parseFloat(getComputedStyle(document.querySelector('.menu__addStreamer')).height.slice(0,-2)) + parseFloat(getComputedStyle(document.querySelector('.menu__clearAll')).height.slice(0,-2))*2 + 192)) + 'px';
    }
    
    addStreamerError(){
        NProgress.done();
        NotifyHandler.add(
            'Error',
            'Streamer was not found',
            {
                time: 1,
                position: 'RB'
            },
            {
                styleBlock: { boxShadow: '0 0 10px 1px #5433a18f' },
                mainBackground: '#5433a1d5',
                mainBackgroundHover: '#5433a1',
                styleProgress: { background: '#8362cf', boxShadow: '0 0 0 black', height: '5px' }
            }
        )
        setTimeout(() => {
            this.setState({
                ...this.state,
                addState: true
            })
        }, 1000)
    }

    addStreamerSuccess(){
        NProgress.done();
        NotifyHandler.add(
            'Success',
            'Streamer was successfully added',
            {
                time: 1,
                position: 'RB'
            },
            {
                styleBlock: { boxShadow: '0 0 10px 1px #5433a18f' },
                mainBackground: '#5433a1d5',
                mainBackgroundHover: '#5433a1',
                styleProgress: { background: '#8362cf', boxShadow: '0 0 0 black', height: '5px' }
            }
        )
        setTimeout(() => {
            this.setState({
                ...this.state,
                addState: true
            })
        }, 1000)
    }

    getChannel = (streamersName) => {
        if (this.state.addState){
            NProgress.start();
            if (/^([a-zA-Z0-9_]{1,})$/.test(streamersName)){
                this.setState({
                    ...this.state,
                    addState: false
                })
                var httpRequest = new XMLHttpRequest();
                httpRequest.open('GET', `https://api.twitch.tv/kraken/users?login=${streamersName}`);
                httpRequest.setRequestHeader('Client-ID', process.env.CLIENT_ID);
                httpRequest.setRequestHeader('Accept', 'application/vnd.twitchtv.v5+json');
                httpRequest.send();
                httpRequest.addEventListener('load', _=>{
                    if (JSON.parse(httpRequest.response).status === 400){
                        this.addStreamerError();
                        NProgress.done();
                        return console.log('Ошибка');
                    } else if (JSON.parse(httpRequest.response)._total === 0){
                        this.addStreamerError();
                        NProgress.done();
                        return console.log('Пользователь не найден');
                    } else {
                        var updateOptions = {
                            method: 'GET',
                            url: `${process.env.BACK}/addStreamer/${this.getCookie('accessToken')}/${streamersName}`,
                            headers: {
                            'Client-ID': process.env.CLIENT_ID,
                            'Accept': 'application/vnd.twitchtv.v5+json'
                            }
                        };
                        axios(updateOptions).then(_=>'');
                        var stateStreamers = this.state.streamers;
                        if (stateStreamers.indexOf(streamersName) === -1){
                            stateStreamers.push(streamersName)
                        }
                        this.setState({
                            streamers: stateStreamers
                        })
                        this.soloStreamer(this.state.streamers);
                        this.addStreamerSuccess();
                        document.querySelector('.menu__addStreamer__input').value = '';
                        NProgress.done();
                        return console.log(JSON.parse(httpRequest.response).users[0].name);
                    }
                });
            } else {
                this.setState({
                    ...this.state,
                    addState: false
                })
                NProgress.done();
                this.addStreamerError();
                return console.log('Введены запрещенные символы');
            }
        }
    }

    soloStreamer(streamers = this.state.streamers) {
        if (this.state.secReady){
            this.setState({
                ...this.state,
                secReady: false,
            })
            document.querySelector('.main__wallper').style.height = '0px';
            document.querySelector('.main__wallper').style.height = '100%';
            if (streamers.length === 1) {
                this.lastSoloStreamer = streamers;
            };
            var { setClips } = this.props;
            var { period } = this.props.period;
            var { limit } = this.props.limit;
            this.newClips = [];
            if (streamers.length === 0) {
                setClips(this.newClips);
            }
            streamers.forEach((w, e) => {
                NProgress.start();
                NProgress.inc((((e + 1) * 100) / streamers.length) / 1000);
                var authOptions = {
                    method: 'GET',
                    url: `https://api.twitch.tv/kraken/clips/top?limit=${limit}&period=${period}&channel=${w}`,
                    headers: {
                        'Client-ID': process.env.CLIENT_ID,
                        'Accept': 'application/vnd.twitchtv.v5+json'
                    },
                    json: true
                };
                axios(authOptions)
                    .then(response => {
                        var clips = response.data.clips;
                        clips.map(item => {
                            item.embed_html = item.embed_html.slice(-item.embed_html.length, item.embed_html.length - 90) + `&autoplay=true&muted=false' width='${this.width}' height='${this.height}' frameborder='0' preload='auto' scrolling='no' allowfullscreen='true'></iframe>`;
                            return this.newClips.push({
                                id: item.tracking_id,
                                title: item.title,
                                thumb: item.thumbnails.medium,
                                iframe: item.embed_html,
                                channel: item.broadcaster.display_name,
                                channel_url: item.broadcaster.channel_url,
                                game: item.game,
                                views: item.views,
                                date: item.created_at
                            });
                        });
                        setClips(this.newClips);
                    })
                    .catch(error => console.log(error));
                if (e === streamers.length - 1) {
                    setTimeout(_ => {
                        NProgress.done();
                    }, 500);
                    setTimeout(_ => {
                        this.setState({
                            ...this.state,
                            ready: true,
                            secReady: true,
                        })
                    }, 1000)
                }
            });
        }
    }

    showAllStreamers() {
        this.lastSoloStreamer = [];
        var updateOptions = {
            method: 'GET',
            url: `${process.env.BACK}/showAll/${this.getCookie('accessToken')}`,
            headers: {
                'Client-ID': process.env.CLIENT_ID,
                'Accept': 'application/vnd.twitchtv.v5+json'
            }
        };
        axios(updateOptions).then(data => {
            return data;
        });
    }

    deleteStreamer(streamer) {
        var updateOptions = {
            method: 'GET',
            url: `${process.env.BACK}/delete/${this.getCookie('accessToken')}/${streamer}`,
            headers: {
                'Client-ID': process.env.CLIENT_ID,
                'Accept': 'application/vnd.twitchtv.v5+json'
            }
        };
        axios(updateOptions).then(_ => '');
        var stateStreamers = this.state.streamers;
        stateStreamers.splice(stateStreamers.indexOf(streamer), 1);
        this.setState({
            streamers: stateStreamers
        })
    }

    deleteAllStreamers() {
        let deleteAllStreamersW = confirm('Удалить всех стримеров?');
        if (deleteAllStreamersW) {
            var updateOptions = {
                method: 'GET',
                url: `${process.env.BACK}/deleteAll/${this.getCookie('accessToken')}`,
                headers: {
                    'Client-ID': process.env.CLIENT_ID,
                    'Accept': 'application/vnd.twitchtv.v5+json'
                }
            };
            axios(updateOptions).then(_ => {
                window.location = window.location.href;
            });
            this.setState({
                streamers: []
            });
        }
    }

    showSetting(){
        if (this.state.settings === 0) {
            document.querySelector('.menu__settings').style.height = '302px';
            document.querySelector('.menu__setting__block').style.display = 'block';
            document.querySelector('.menu__settings hr').style.display = 'block';
            document.querySelector('.menu__setting__block hr').style.display = 'block';
            document.querySelector('.menu__userStreamers').style.height = (window.innerHeight - (parseFloat(getComputedStyle(document.querySelector('.menu__addStreamer')).height.slice(0,-2)) + parseFloat(getComputedStyle(document.querySelector('.menu__clearAll')).height.slice(0,-2))*2 + 452)) + 'px';
            this.setState({
                settings: 1
            });
        } else if (this.state.settings === 1){
            document.querySelector('.menu__settings').style.height = '40px';
            document.querySelector('.menu__setting__block').style.display = 'none';
            document.querySelector('.menu__settings hr').style.display = 'none';
            document.querySelector('.menu__setting__block hr').style.display = 'none';
            document.querySelector('.menu__userStreamers').style.height = (window.innerHeight - (parseFloat(getComputedStyle(document.querySelector('.menu__addStreamer')).height.slice(0,-2)) + parseFloat(getComputedStyle(document.querySelector('.menu__clearAll')).height.slice(0,-2))*2 + 192)) + 'px';
            this.setState({
                settings: 0
            });
        }
    }

    periodSet(period) {
        if (this.state.ready) {
            this.setState({
                ...this.state,
                ready: false
            })
            var { setPeriod } = this.props;
            NProgress.start();

            function prom() {
                return new Promise((res) => {
                    res(setPeriod(period));
                })
            };
            prom().then(_ => {
                if (this.lastSoloStreamer.length === 1) {
                    this.soloStreamer(this.lastSoloStreamer);
                } else {
                    this.soloStreamer(this.props.streamers.streamers);
                }
            })
        }
    }

    limitSet(){
        if (this.state.ready) {
            this.setState({
                ...this.state,
                ready: false
            })
            var {setLimit} = this.props;
            if ((/^([0-9]){1,}$/.test(document.querySelector('.menu__settings__count__input').value) === true) && (parseInt(document.querySelector('.menu__settings__count__input').value) >= 1) && (parseInt(document.querySelector('.menu__settings__count__input').value) <= 70)){
                NProgress.start();
                function prom(){
                    return new Promise((res) =>{
                        res(setLimit(parseInt(document.querySelector('.menu__settings__count__input').value)));
                    })
                };
                prom().then(_=>{
                    if (this.lastSoloStreamer.length === 1){
                        this.soloStreamer(this.lastSoloStreamer);
                    } else {
                        this.soloStreamer(this.props.streamers.streamers);
                    }
                })
            }
        }
    }

    render() { 
        return ( 
            <div className="menu__block">
                <div className="menu__addStreamer">
                    <div className="menu__title">
                        <span>
                            Добавить стримера
                        </span>
                    </div>
                    <div className="menu__addStreamer__controls">
                        <input className="menu__addStreamer__input" type="text"/>
                        <div className="menu__addStreamer__button" onClick={_=>{this.getChannel(document.querySelector('.menu__addStreamer__input').value)}}>
                            <span>
                                Добавить
                            </span>
                        </div>
                    </div>
                </div>
                <hr/>
                <div className="menu__clearAll">
                    <div onClick={_=>{this.deleteAllStreamers()}} className="menu__clearAll__button">
                        <span>
                            Очистить список стримеров
                        </span>
                    </div>
                </div>
                <hr/>
                <div className="menu__clearAll">
                    <div onClick={_=>{this.soloStreamer(this.showAllStreamers())}} className="menu__clearAll__button">
                        <span>
                            Показать всех стримеров
                        </span>
                    </div>
                </div>
                <hr/>
                <div className="menu__settings">
                    <div onClick={_=>{this.showSetting()}} className="menu__setting__button">
                        <span>
                            Доп. настройки
                        </span>
                    </div>
                    <hr/>
                    <div className="menu__setting__block">
                        <div className="menu__settings__period">
                            <div onClick={_=>{this.periodSet('day')}} className="menu__settings__period__day">
                                <span>
                                    За день
                                </span>
                            </div>
                            <div onClick={_=>{this.periodSet('week')}} className="menu__settings__period__weak">
                                <span>
                                    За неделю
                                </span>
                            </div>
                            <div onClick={_=>{this.periodSet('month')}} className="menu__settings__period__month">
                                <span>
                                    За месяц
                                </span>
                            </div>
                            <div onClick={_=>{this.periodSet('all')}} className="menu__settings__period__all">
                                <span>
                                    За все время
                                </span>
                            </div>
                        </div>
                        <hr/>
                        <div className="menu__settings__count_title">
                            <span>
                                Количество клипов у стримера
                            </span>
                        </div>
                        <div className="menu__settings__count">
                            <input className="menu__settings__count__input" type="text" placeholder="Max: 70"/>
                            <div onClick={_=>{this.limitSet()}} className="menu__settings__count__button">
                                <span>
                                    Отправить
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
                <hr/>
                <div className="menu__userStreamers">
                    {this.state.streamers.map((w,e) => {
                        return (
                            <div className="menu__userStreamersBlock" key={e}>
                                <div className="menu__userStreamersBlock__streamer" onClick={_=>{this.soloStreamer([w])}}>
                                    <span>
                                        {w} 
                                    </span>
                                </div>
                                <div onClick={_=>{this.deleteStreamer(w)}} className="menu__userStreamersBlock__delete" id={'streamer__'+ w}>
                                    <i className="fa fa-times" aria-hidden="true"></i>
                                </div>
                            </div>
                        )
                    })}
                </div>
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
    setClips: data => {
       dispatch({
          type: 'SET_CLIPS',
          payload: data,
       })},
    setPeriod: data => {
       dispatch({
          type: 'SET_PERIOD',
          payload: data,
       })},
    setLimit: data =>{ 
       dispatch({
          type: 'SET_LIMIT',
          payload: data,
       })}
 })
 
 export default connect(state, actions)(Menu);