import React, { Component } from 'react';
import PromoteChannel from '../PromoteChannel/PromoteChannel';
import axios from 'axios';
import NProgress from 'nprogress';
import './index.css';
class PromoteChannesl extends Component {
    constructor(props) {
        super(props);
        this.state = {
            promoteChannels: []
        };
    }

    componentDidMount(){
        NProgress.start();
        axios.get(`${process.env.BACK}/getPormoteChannels`).then(data => {
            data.data = data.data.sort(_=> Math.random() - 0.5);
            this.setState({
                ...this.state,
                promoteChannels: data.data
            });
            NProgress.done();
        })
    }

    render() { 
        return ( 
            <div className="promotechannels__main">
                <div className="promotechannels__title">
                    <span>
                        Продвигаемые каналы
                    </span>
                </div>
                {this.state.promoteChannels.length === 0 ? (
                    <div className="promotechannels__addChannel">
                        <div className="pc__addChannel__block">
                            <i className="fas fa-plus"></i>
                            <span>
                                Добавить канал
                            </span>
                        </div>
                    </div>
                ) : (
                    <div className="promotechannels__channels">
                        {this.state.promoteChannels.map((w,e) => <PromoteChannel channelData={w} key={e} /> )}
                    </div>
                )}
            </div>
         );
    }
}
 
export default PromoteChannesl;