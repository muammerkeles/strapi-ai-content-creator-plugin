
import {
    Button, Loader
} from '@strapi/design-system';
import { Quotes } from '@strapi/icons';
import { useState } from 'react';
const GeminiForWebpage = ({ config }) => {
        const [loading, setLoading] = useState(false);
    
    const handleShowModal=()=>{
        alert('This feature will be implemeted in next version.')
    }
    return (
        <>
            <Button
                startIcon={loading ? <Loader small /> : <Quotes />}
                disabled={loading}
                onClick={() => handleShowModal()}
                variant="secondary"
            >
                {loading ? 'Waiting...' : 'Gemini'}
            </Button>
        </>

    )
};

export default GeminiForWebpage;
