import React from 'react';
import OpenAIForWebpage from './OpenAIComponents/Webpage.jsx'



const OpenAIContentCreator = (props) => {
    const { model } = props;
 
    //const { contentType, form } = useContentManagerContext();
    //const { toggleNotification } = useNotification();
 

    if (model == 'api::webpage.webpage') {
        return {
            title: 'Create Content (AI)',
            content: <OpenAIForWebpage />,
        };
    }else{
        return {
            title: 'Create Content (AI)',
            content: <p style={{ fontSize: '1rem' }}>Unavailable</p>,
        };
    }



};

export default OpenAIContentCreator;
