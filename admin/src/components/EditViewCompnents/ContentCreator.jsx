import { useEffect, useState } from 'react';
import OpenAIForWebpage from './OpenAIComponents/Webpage';
import { useFetchClient, unstable_useContentManagerContext as useContentManagerContext } from '@strapi/strapi/admin';
import { PLUGIN_ID } from '../../pluginId';
import GeminiForWebpage from './GeminiAIComponents/Webpage';

const ContentCreator = (props) => {
    const [loading, setLoading] = useState(true);
    const [openAi, setOpenAi] = useState(null);
    const [gemini, setGemini] = useState(null);

    const { post, get } = useFetchClient();

    useEffect(() => {
        const getApiKey = async () => {
            const res = await get(`/${PLUGIN_ID}/config`);
            const data = await res.data;

            if (data?.openAi) {
                setOpenAi(data.openAi);
            }
            if (data?.gemini) {
                setGemini(data.gemini);
            }

            setLoading(false);

        };
        console.log("Obtaining Content Creator's configurations");
        getApiKey();


    }, []);

    return (
        // 'return' ifadesinden sonra doğrudan süslü parantez '{' açarak 
        // bir JavaScript Nesnesi döndürülüyor.
        loading
            ? // 1. Yükleme Durumu (loading: true)
            {
                title: 'Please wait',
                content: <p style={{ fontSize: '1rem' }}>Content Creator preparing..</p>,
            }
            : // 2. İçerik Oluşturma Ekranı (loading: false)
            {
                title: 'Content Creator (AI)',
                content: (
                    <>
                        {/* OpenAI Etkinse */}
                        
                        {openAi && openAi.enabled === true && (
                            <OpenAIForWebpage config={openAi}/>
                        )}

                        {/* Gemini Etkinse */}
                        {gemini && gemini.enabled === true && (
                            <GeminiForWebpage config={gemini}/>
                        )}

                        {/* Hiçbiri Etkin Değilse (Örnek Butonları Kullanarak) */}
                        {(!openAi || openAi.enabled !== true) && (!gemini || gemini.enabled !== true) && (
                            <>
                                <p style={{ color: '#888', marginBottom: '10px' }}>
                                    Please add configuration for some AI Services.
                                </p>
                                {/* Örnek olarak Button bileşenini kullandım */}
                                <Button variant="danger-light">
                                    AI Service is not ready!
                                </Button>
                            </>
                        )}
                    </>
                ),
            }
    );
}

export default ContentCreator;