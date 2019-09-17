/* eslint-disable react/jsx-pascal-case */
import React, { Component } from 'react';
import Clip_block from '../Clip_block/Clip_block';
import axios from 'axios';
import './index.css';
class PromoteClips extends Component {
    constructor(props) {
        super(props);
        this.width = Math.round(window.innerWidth - window.innerWidth/3);
        this.height = Math.floor(this.width/1.777777777);
        this.state = { 
            clips: []
         }
    }

    componentDidMount() {
        axios.get(`${process.env.BACK}/getPromoteClips/all`).then(slugs => {
            slugs.data.sort(_=> Math.random() - 0.5).forEach(w => {
                axios.get(`${process.env.BACK}/getPromoteClips/${w.slug}`).then(clip => {
                    if (clip.data.status) {
                        axios.get(`${process.env.BACK}/deletePromoteClip/${w.slug}`).then(data => '');
                    } else 
                    if (clip.data.embed_html) {
                        clip.data.embed_html = clip.data.embed_html.slice(-clip.data.embed_html.length,clip.data.embed_html.length-90) + `&autoplay=true&muted=false' width='${this.width}' height='${this.height}' frameborder='0' preload='auto' scrolling='no' allowfullscreen='true'></iframe>`;
                        this.setState({
                            ...this.state,
                            clips: this.state.clips.concat({ id: clip.data.tracking_id, title: clip.data.title, thumb: clip.data.thumbnails.medium, iframe: clip.data.embed_html, channel:  clip.data.broadcaster.display_name, channel_url: clip.data.broadcaster.channel_url,  game: clip.data.game, views: clip.data.views, date: clip.data.created_at})
                        })
                    }
                })
            })
        })
    }

    render() { 
        return ( 
            <div className="promoteclips__main">
                <div className="promoteclips__title">
                    <span>
                        Продивигаемые клипы
                    </span>
                </div>
                <div className="promoteclips__clips">
                    { this.state.clips.length === 0 ? (
                        <div className="promoteclips__addClip">
                            <div className="pc__addClip__block">
                                <i className="fas fa-plus"></i>
                                <span>
                                    Добавить клип
                                </span>
                            </div>
                        </div>
                    ) : (
                        this.state.clips.map((w,e) => <Clip_block style={{ width: '280px', marginLeft: '0', marginRight: '0', marginTop: '10px', marginBottom: '15px', boxSizing: 'border-box' }} style2={{ width: '280px' }} elem={w} key={e}/> )
                    ) }
                    { this.state.clips.length % 5 !== 0 ? (
                        [...new Array(5 - (this.state.clips.length % 5))].map((w,e) => (
                            <div className="promoteclips__full" key={e}>    

                            </div>
                        ))   
                    ) : ( '' ) }
                </div>
            </div>
         );
    }
}
 
export default PromoteClips;