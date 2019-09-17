import React, { useEffect } from 'react';
const NotFound = () => {

    useEffect(() => {
        document.querySelector('.loading').style.opacity = '0';
        document.querySelector('.loading').style.zIndex = '-100';
    })

    return ( 
        <div style={{ width: '100%', height: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center'}}>
            <span style={{ alignSelf: 'center', color: '#fff', fontSize: '13.5px', userSelect: 'none' }}>
                404 page is not found :(
            </span>
        </div>
     );
}
 
export default NotFound;