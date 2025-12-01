import React from 'react';

import {
      Button 
} from '@strapi/design-system';

const GeminiContentCreator = (props) => {
    const { model } = props;
 
    //const { contentType, form } = useContentManagerContext();
    //const { toggleNotification } = useNotification();
 

    if (model == 'api::webpage.webpage') {
        return {
            title: 'Create Content (AI)',
            content:             <Button
                            
                            variant="success-light"
                        >
                            Gemini (Not ready)
                        </Button>,
        };
    }else{
        return {
            title: 'Create Content (AI)',
            content: <p style={{ fontSize: '1rem' }}>Unavailable</p>,
        };
    }



};

export default GeminiContentCreator;
