/* eslint-disable react/jsx-pascal-case */
/* eslint-disable no-useless-escape */
/* eslint-disable eqeqeq */
/* eslint-disable no-redeclare */
/* eslint-disable default-case */

import React, {Component} from 'react';
import {connect} from 'react-redux';
import axios from 'axios';
import NProgress from '../../../node_modules/nprogress/nprogress.js';
import Clip_block from '../Clip_block/Clip_block';

class Clip extends Component {
   constructor(props) {
      super(props);
      this.width = Math.round(window.innerWidth - window.innerWidth/3);
      this.height = Math.floor(this.width/1.777777777);
      this.newClips = [];
      this.state = {
         streamers: []
      }
   }

   getClip(streamers){
      document.querySelector('.main__wallper').style.height = '0px';
      document.querySelector('.main__wallper').style.height = '100%';
      var {period} = this.props.period;
      var {limit} = this.props.limit;
      if (streamers.length == 0){
         document.querySelector('.loading').style.opacity = '0';
         document.querySelector('.loading').style.zIndex = '-100';
         NProgress.done();
         return [];
      }
      var {setClips} = this.props;
      streamers.forEach((w,e)=>{
         NProgress.start();
         NProgress.inc((((e+1)*100)/streamers.length)/1000);
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
                  item.embed_html = item.embed_html.slice(-item.embed_html.length,item.embed_html.length-90) + `&autoplay=true&muted=false' width='${this.width}' height='${this.height}' frameborder='0' preload='auto' scrolling='no' allowfullscreen='true'></iframe>`;
                  return this.newClips.push({ id: item.tracking_id, title: item.title, thumb: item.thumbnails.medium, iframe: item.embed_html, channel:  item.broadcaster.display_name, channel_url: item.broadcaster.channel_url,  game: item.game, views: item.views, date: item.created_at}); 
               });
               setClips(this.newClips);
            })
            .catch(error => console.log(error));
         if (e === streamers.length-1){
            setTimeout(_=>{
               document.querySelector('.loading').style.opacity = '0';
               document.querySelector('.loading').style.zIndex = '-100';
               NProgress.done();
            },1500);
         }
      });
   }
   
   getStreamers() {
      function getCookie(name) {
         var matches = document.cookie.match(new RegExp(
           "(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
         ));
         return matches ? decodeURIComponent(matches[1]) : undefined;
       }
       axios.get(`${process.env.BACK}/a/${getCookie('accessToken')}`).then(data => {
         if (data.data[0]){
            this.getClip(data.data[0].Streamers);
         }
      });
   }

   componentDidMount(){
      this.getStreamers();
   }

   sortButton(e){
      NProgress.start(); 
      const {setClips} = this.props;
      var {clips} = this.props.clips;
      switch(e){
         case 1: 
            var sortStreamer = clips.sort((a, b) => (a.channel === b.channel ? 0 : (a.channel < b.channel ? -1 : 1)));
            setClips(sortStreamer);
            break;
         case 2:
            var sortViews = clips.sort((a,b) => parseFloat(b.views) - parseFloat(a.views));
            setClips(sortViews);
            break;
         case 3:
            var sortGame = clips.sort((a, b) => (a.game === b.game ? 0 : (a.game < b.game ? -1 : 1)));
            setClips(sortGame);
            break;
         case 4:
            let sortNew = clips
               .map(w => w.date)
               .map(w => [...w.split('-').slice(0,2), [w.split('-')[2].split('T')[0], w.split('-')[2].split('T')[1].split(':')]])
               .sort((a,b) => (parseInt(b[2][0]) - parseInt(a[2][0]) || parseInt(b[1]) - parseInt(a[1]) || parseInt(b[0]) - parseInt(a[0]) || parseInt(b[2][1][0]) - parseInt(a[2][1][0]) || parseInt(b[2][1][1]) - parseInt(a[2][1][1])))
               .map(w => [...w.slice(0,2), [w[2][0], w[2][1].join(':')].join('T')].join('-'))
               .map(w => clips.filter(e => e.date == w)[0]);
            setClips(sortNew);
            break;
         case 5:
            let sortOld = clips
               .map(w => w.date)
               .map(w => [...w.split('-').slice(0,2), [w.split('-')[2].split('T')[0], w.split('-')[2].split('T')[1].split(':')]])
               .sort((a,b) => (parseInt(a[2][0]) - parseInt(b[2][0]) || parseInt(a[1]) - parseInt(b[1]) || parseInt(a[0]) - parseInt(b[0]) || parseInt(a[2][1][0]) - parseInt(b[2][1][0]) || parseInt(a[2][1][1]) - parseInt(b[2][1][1])))
               .map(w => [...w.slice(0,2), [w[2][0], w[2][1].join(':')].join('T')].join('-'))
               .map(w => clips.filter(e => e.date == w)[0]);
            setClips(sortOld);
            break;
      }
      NProgress.done();
   }

   thistest() {
      console.log(123);
   }

   mouseEnter() {
      document.addEventListener('mousemove', (e)=>{
         if (e.target.className === 'clip__sortButton__sort' || e.target.className === 'clip__sortButton__sortTitle'){
            document.querySelector('.clip__sortButton').style.height = '250px';
            document.querySelector('.clip__sortButton__sortTitle').style.background = '#4b367c';
            document.querySelectorAll('.clip__sortButton__sort').forEach(w => {
               w.style.display = 'flex';
               w.style.opacity =  '1';
               w.style.zIndex = '1';
            });
         } else {
            this.mouseLeave();
         }
      });
   }

   mouseLeave() {
      if(document.querySelector('.clip__sortButton') && document.querySelector('.clip__sortButton__sortTitle')){
         document.querySelector('.clip__sortButton').style.height = '60px';
         document.querySelector('.clip__sortButton__sortTitle').style.background = '#1f1a29';
      }
      document.querySelectorAll('.clip__sortButton__sort').forEach(w => {
         w.style.display = 'none'
         w.style.opacity = '0'
         w.style.zIndex = '-10'
      });
   }

   soloRender(w){
      this.setState({
         clips: w
      });
      this.render();
   }

   render() {
      const { clips } = this.props.clips; 
      return (
         <div className="clip__block">
            <div className ="clip__sortButton">
               <div className="clip__sortButton__sortTitle" onMouseEnter={_=>{this.mouseEnter()}}>Сортировать</div>
               <div className="clip__sortButton__sort" onClick={_=> { this.sortButton(1); }}>По стримерам</div>
               <div className="clip__sortButton__sort" onClick={_=> { this.sortButton(2); }}>По просмотрам</div>
               <div className="clip__sortButton__sort" onClick={_=> { this.sortButton(3); }}>По играм</div>
               <div className="clip__sortButton__sort" onClick={_=> { this.sortButton(4); }}>Новые</div>
               <div className="clip__sortButton__sort" onClick={_=> { this.sortButton(5); }}>Старые</div>
            </div>
            {clips.length !== 0 ? (
               clips.map((w,e)=> {
                  return (
                     <Clip_block testFunc={this.thistest} style={{ marginBottom: '15px'}} elem={w} key={e}/>
                  );
               })
            ) : (
               <div className="clip__doesntfound">
                  Клипы не найдены :(
               </div>
            )}
            { clips.length % 4 !== 0 ? (
                        [...new Array(4 - (clips.length % 4))].map((w,e) => (
                            <div className="clip__full" key={e}>    

                            </div>
                        ))   
                    ) : ( '' ) }
         </div>
      )
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

export default connect(state, actions)(Clip);