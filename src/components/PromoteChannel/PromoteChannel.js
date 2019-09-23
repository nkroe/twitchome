/* eslint-disable jsx-a11y/anchor-has-content */
import React, { Component } from 'react';
import Player from '../TwitchPlayer/player';
import axios from 'axios';
import './index.css';
class PromoteChannel extends Component {
    constructor(props) {
        super(props);
        this.state = {
            status: 0,
            banner: this.props.channelData.banner
        }
    }

    componentDidMount() {

        var _getPromoteOpts = url => {
            return {
              method: 'GET',
              url: url,
              headers: {
                'Client-ID': process.env.CLIENT_ID,
                'Accept': 'application/vnd.twitchtv.v5+json'
              },
              json: true
            }
          }
          
        axios(_getPromoteOpts(`https://api.twitch.tv/kraken/streams/${this.props.channelData.channel_id}`)).then(data => {
            if (data.data.stream) {
                this.setState({ ...this.state, status: 1 })
            } else {
                axios(_getPromoteOpts(`https://api.twitch.tv/kraken/channels/${this.props.channelData.channel_id}`)).then(_data => {
                    this.setState({
                        ...this.state,
                        banner: _data.data.video_banner
                    })
                })
            }
        });
              
    }

    render() { 
        return ( 
            <div className="promotechannel__block" >
                <div className="promotechannel__cont">
                    <a className="promotechannel__stream__link" href={`https://twitch.tv/${this.props.channelData.name}`} target="_blank" rel="noopener noreferrer"></a>
                    {this.state.status === 0 ? (
                        <div className="promotechannel__banner" style={{ backgroundImage: `url(${this.state.banner})`, backgroundSize: 'cover' }}>

                        </div>
                    ) : (
                        <div className="promotechannel__stream">
                                <Player muted channel={this.props.channelData.name}/>
                        </div>
                    )}
                </div>
                <div className="promotechannel__info">
                    <div className="promotechannel__block__info">
                        <div className="promotechannel__avatar">
                            <img src={this.props.channelData.logo} alt=""/>
                        </div>
                        <div className="promotechannel__name">
                            <a href={`https://twitch.tv/${this.props.channelData.name}`} target="_blank" rel="noopener noreferrer">
                                {this.props.channelData.name}
                            </a>
                        </div>
                    </div>
                    <div className="promotechannel__status">
                        <div className="promotechannel__status__s" style={{ background: this.state.status === 0 ? '#ee4141' : '#78f767', boxShadow: `0 0 20px ${this.state.status === 0 ? 'red' : 'green'}` }} >

                        </div>
                        <span>
                            {this.state.status === 0 ? 'Offline' : 'Online'}
                        </span>
                    </div>
                </div>
            </div>
         );
    }
}
 
export default PromoteChannel;