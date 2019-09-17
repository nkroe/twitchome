import React from 'react';
import { useEffect } from 'react';
import { getSDK } from './loadSDK';

const Player = ({ muted, channel }) => {
    const playerID = `stream-${channel}`;
    let player;

    useEffect(() => {
        getSDK().then((Twitch) => {
            player = new Twitch.Player(playerID, {
                channel,
                height: '100%',
                width: '100%',
                autoplay: true,
                muted,
                controls: false
            });

            player.addEventListener(Twitch.Player.PLAYING, () => {
                const qualities = player.getQualities();
                const lowQuality = qualities[qualities.length - 1];

                if (lowQuality && lowQuality.group !== '160p30') {
                    player.pause();
                } else {
                    player.setQuality('160p30');
                }
            });
        });
    }, []);

  return <div style={{ width: '100%', height: '100%' }} id={playerID} />
}
 
export default Player;