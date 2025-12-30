
import {
    Textarea, Grid, Checkbox, SingleSelect,
    SingleSelectOption, Box, NumberInput, Button, Flex, Modal, Typography, Loader
} from '@strapi/design-system';
import { Quotes } from '@strapi/icons';
import { useEffect, useState } from 'react';
import { useFetchClient, unstable_useContentManagerContext as useContentManagerContext } from '@strapi/strapi/admin';
import { useNotification } from '@strapi/strapi/admin';
import { GoogleGenerativeAI } from "@google/generative-ai";
const GeminiForWebpage = ({ config }) => {
    const [loading, setLoading] = useState(false);
    useEffect(() => {
        console.log("config", config);
    }, [config])



    useEffect(() => {
        // config objesinin geldiğinden emin olduktan sonra loading durumunu yönetiriz.
        // Bu hook sadece config.apiKey değiştiğinde (veya ilk yüklendiğinde) çalışır.
        if (config && typeof config.apiKey === 'string') {
            // API key kontrolü yapıldıktan sonra loading'i kapatabiliriz.  
            setLoading(false);
            // API key'in bulunmadığı senaryoda zaten setLoading(false) çalışmış olacak.
            //if (!config.apiKey) {
            //console.warn("Open AI API Key Not Found.", config);
            //}
            //setOpenAiApiKey(config.apiKey);
        }

    }, [config]);
    const genAI = new GoogleGenerativeAI(config.apiKey);

    // Yükleme durumu gösterimi
    if (loading && !config) {
        return (
            <>
                <p style={{ fontSize: '1rem' }}>loading Google Gemini ...</p>
            </>
        )
    } else
        // API Anahtarı yoksa (setLoading(false) useEffect içinde ayarlandı)
        if (!config.apiKey) {
            return (
                <>
                    <p style={{ fontSize: '1rem' }}>Warn: (Google Gemini API-KEY Not Found!)</p>
                </>

            )
        }



    const { contentType, form } = useContentManagerContext();
    //const { values } = form;

    const { toggleNotification } = useNotification();

    if (config && config?.contentList && config?.contentList.length > 0 && !config?.contentList.includes(contentType?.uid)) {
        //if (contentType?.uid !== 'api::webpage.webpage') {
        return <>
            <p style={{ fontSize: '1rem' }} title="Gemini is inactive for this page">Gemini is Inactive!</p>
        </>
    }

    const [showModal, setShowModal] = useState(false);
    const [isMetaTitle, setisMetaTitle] = useState(true);
    const [isMetaKeyw, setisMetaKeyw] = useState(true);
    const [isMetaDescr, setisMetaDescr] = useState(true);

    const [generateCompletionText, setGenerateCompletionText] = useState('Generate');

    const [prompt, setPrompt] = useState(undefined);
    const [table, setTable] = useState(<></>);
    const [completion, setCompletion] = useState(undefined);
    const [finishReason, setFinishReason] = useState(null);

    const [defaultSettings, setDefaultSettings] = useState({
        model: 'gemini-2.5-flash',
        temperature: 1,
        maxTokens: 1000,
        models: ['gemini-2.5-flash', 'gemini-2.5-pro', 'gemini-2.5-flash-lite', 'gemini-3-pro-preview', 'gemini-3-flash-preview']
    }); // Güncel modelleri fetch etmedenönce bunları default olarak yükleyelim

    const [availableModels, setAvailableModels] = useState([]); // Kullanılabilir modeller listesi
    const [model, setModel] = useState([]);
    const [modelLoading, setModelLoading] = useState(false);
    const [temperature, setTemperature] = useState(defaultSettings?.temperature)
    const [maxTokens, setMaxTokens] = useState(defaultSettings?.maxTokens);
    const [isGenerating, setIsGenerating] = useState(!1);


    /// load models
    useEffect(() => {

        if (modelLoading || loading || !config.apiKey) return;

        if (availableModels.length == 0) {
            setModelLoading(true);
            const fetchGeminiAiModels = async () => {
                try {
                    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${config.apiKey}`;
                    const response = await fetch(url);
                    const data = await response.json();
                    console.log('data', data);

                    if (data.error) {
                        console.error('Gemini modelleri alınamadı:', data?.error);
                        alert('Error Model Loading:' + data.error?.message);
                        setAvailableModels(defaultSettings.models);
                    } else {

                        console.log("Erişilebilir Modeller:");
                        const modelIds = data.models?.filter(m => m.supportedGenerationMethods.includes("generateContent"))
                            .map(m => m.name);

                        /*const priorityList = [
                            "models/gemini-2.0-flash",
                            "models/gemini-1.5-flash",
                            "models/gemini-1.5-pro"
                        ];
                        const autoSelectedModel = priorityList.find(p => modelIds.includes(p)) || modelIds[0];
                        */

                        setAvailableModels(modelIds);
                        const selectBestStandardModel = (modelList) => {
                            // 1. İstemediğimiz kelimeleri içeren modelleri ele
                            const filteredModels = modelList.filter(name =>
                                !name.toLowerCase().includes("thinking") &&
                                !name.toLowerCase().includes("embedding") &&
                                !name.toLowerCase().includes("aqa")
                            );

                            // 2. Tercih sırasına göre en iyi standart modeli bul
                            const priorities = [
                                "models/gemini-2.0-flash",
                                "models/gemini-1.5-flash",
                                "models/gemini-pro"
                            ];

                            const bestMatch = priorities.find(p => filteredModels.includes(p));

                            // Eğer listede öncelikli modeller yoksa, filtrelenmiş listeden ilkini seç
                            return bestMatch || filteredModels[0];
                        };
                        const modelToSet = selectBestStandardModel(modelIds);

                        if (modelIds.length > 0 && !modelIds.includes(model)) {
                            //setModel(modelIds[0]);
                            //setModel(autoSelectedModel);
                            setModel(modelToSet);
                        }
                        console.log('Gemini modelleri başarıyla alındı.');
                    }

                    setModelLoading(false);

                } catch (error) {
                    setModelLoading(false);
                    //throw new Error(`HTTP Error Code (Gemini Models Fetch): ${response.status}`);
                    alert('Error! Gemini Models cannot retreive!');
                    console.error('Gemini modelleri alınamadı:', error);
                    setAvailableModels(defaultSettings.models);
                }
            }
            fetchGeminiAiModels();
        }
    }, [loading, modelLoading, config.apiKey, availableModels])


    const completionAPI = async ({
        model,
        messages,
        temperature,
        maxTokens,
    }) => {
        if (!config.apiKey) {
            toggleNotification({
                type: 'danger',
                message: 'Error : Api Key Not Found!'
            });
            return;
        }
        try {
            const contentCreator = genAI.getGenerativeModel({
                model: model,
                generationConfig: {
                    temperature: temperature,
                    maxOutputTokens: maxTokens,
                    responseMimeType: "application/json",
                }
            });

            const geminiMessages = messages.map(m => ({
                role: m.role === "user" ? "user" : "model",
                parts: [{ text: m.content }],
            }));

            const result = await contentCreator.generateContent({ contents: geminiMessages });
            const response = await result.response;
            const candidate = response.candidates[0];

            // Ham metni alalım
            let text = response.text();

            // EĞER model yarıda kesildiyse (MAX_TOKENS)
            if (candidate.finishReason === "MAX_TOKENS") {
                // Yarım kalan JSON'u onarmaya çalışalım
                text = repairJSON(text);

                // Kullanıcıyı uyaralım ama işlemi durdurmayalım
                toggleNotification({
                    type: 'warning',
                    message: 'Warning: Content was truncated due to token limit. Displaying partial result.',
                    duration: 7000,
                });
                alert('Warning: Content was truncated due to token limit. Displaying partial result.');
            }

            return {
                data: JSON.parse(text),
                finishReason: candidate.finishReason
            };
        } catch (error) {
            console.log("Error m1:", error);
            if (error.status === 429 || error.message?.includes("429")) {
                toggleNotification({
                    type: 'warning',
                    message: 'Error: Too many requests. Please wait a moment before trying again.',
                    duration: 7000

                });
            } else if (error.message === "TOKEN_LIMIT_EXCEEDED") {
                toggleNotification({
                    type: 'danger',
                    message: 'Error: Content is too long and could not be completed. Please increase the Max Token value.',
                    duration: 7000
                });
            } else if (error instanceof SyntaxError) {
                console.error("JSON Parse Error:", error);
                toggleNotification({
                    type: 'danger',
                    message: 'Error: The model returned an invalid JSON format.',
                    duration: 7000

                });
            } else {
                console.error("General API Error:", error);
                toggleNotification({
                    type: 'danger',
                    message: 'Error: An unexpected error occurred while calling Gemini API.',
                    duration: 7000
                });
            }
            throw error;
        }
    }
    const repairJSON = (jsonString) => {
        let repaired = jsonString.trim();
        // Eğer tırnakla bitmiyorsa tırnağı kapat
        if (!repaired.endsWith('"') && repaired.lastIndexOf('"') > repaired.lastIndexOf(':')) {
            repaired += '"';
        }
        // Süslü parantez eksikse tamamla
        const openBraces = (repaired.match(/{/g) || []).length;
        const closeBraces = (repaired.match(/}/g) || []).length;
        for (let i = 0; i < (openBraces - closeBraces); i++) {
            repaired += '}';
        }
        return repaired;
    };

    const handlePromptSubmit = () => {
        if (isGenerating) {
            toggleNotification({
                type: 'warning',
                message: 'Please wait..'
            });
            return;
        }

        console.log("Model:", model)
        console.log("Prompt:", prompt)
        console.log("Tempreture:", temperature)
        console.log("MaxToken:", maxTokens)
        if (!prompt) {
            alert("Enter a prompt!!");
            return;

        }
        let pr = "Çıktıyı json formatında ver. Yorum katma. Sadece istenilenleri ver. İçerik için 'content' keyini kullan json formatı için. Prompt hangi dilde verilmişse sen de çıktıyı o dilde ver.";

        if (isMetaDescr) {
            pr += "Ayrıca seo uyumlu olması için Meta Description da lazım, bu en fazla 150 karakter olsun.'description' keyini kullan json formatı için.";
        }
        if (isMetaKeyw) {
            pr += "Ayrıca seo uyumlu olması için Meta Keyword'da lazım, bu da en fazla 70 karakter olmalı ve 'keywords' keyini kullan json formatı için.";
        }
        if (isMetaTitle) {
            pr += "Ayrıca seo uyumlu olması için Meta Title'da lazım, bu da en fazla 150 karakter olmalı ve 'title' keyini kullan json formatı için.";
        }
        const newPrompt = prompt + pr;

        if (model && newPrompt && temperature && maxTokens) {
            const messages = [{ role: 'user', content: newPrompt }];
            setGenerateCompletionText('Generating...');
            setIsGenerating(!0);

            completionAPI({ model, messages, temperature, maxTokens })
                .then((result) => {

                    console.log("Success Result:", result.data);

                    // Ekrana basarken kurtarılmış veriyi kullanıyoruz
                    setCompletion(result.data);
                    setFinishReason(result.finishReason);
                    //console.log("response", data);
                    //setCompletion(data); // Ekrana basmak için stringe çevirebilirsiniz
                    //setFinishReason(data?.candidates[0]?.finishReason);

                    /*if (data?.error) {
                        toggleNotification({
                            type: 'danger',
                            message: 'Error : ' + data?.error?.message
                        });
                    } else {

                        let cleaned = data?.choices[0]?.message?.content?.trim()?.replace(/```json|```/g, '').trim();
                        setCompletion(cleaned);//data?.choices[0]?.message.trim());
                    }*/
                }).catch(err => {
                    /*toggleNotification({
                        type: 'danger',
                        message: 'API Error!'
                    });*/
                    console.log("Submit Catch:", err);
                })
                .finally(() => {
                    console.log("Finished");
                    setIsGenerating(!1);
                    setGenerateCompletionText('Generate');
                });
        }
    };

    const handleApplyContent = () => {
        alert('TO-DO');
    }

    const handleShowModal = async () => {
        setShowModal(true);

    }
    const handleCopyToClipboard = (value) => {
        navigator.clipboard.writeText(value);
        toggleNotification({
            type: 'info',
            message: 'Copied'
        });
    }


    useEffect(() => {

        if (!completion) {
            setTable(<></>)// tercihine göre
            return;
        }
        try {
            const data = completion;
            const keys = { "title": "Page Title", "keywords": "Meta Keywords", "description": "Meta Description", "content": "Content" };
            const MyTable = (
                <table style={{ fontSize: '1.3rem' }}>
                    <tbody>
                        {Object.entries(data).map(([key, value]) => (
                            <tr key={key}>
                                <th style={{ fontSize: '1.2rem', width: '125px', verticalAlign: 'text-top', textAlign: 'left', paddingRight: '10px' }}>{keys[key]}</th>
                                <td style={{ verticalAlign: 'text-top' }}><a style={{ color: 'blue', cursor: 'pointer' }} onClick={() => handleCopyToClipboard(value)}>[copy] </a> {value}</td>
                            </tr>
                        ))}
                        <tr>

                            <td>
                                <br />
                                <br />
                                <Button
                                    onClick={() => handleApplyContent()}
                                    variant="success"
                                >
                                    Use it
                                </Button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            );

            setTable(MyTable);
        } catch (error) {
            console.error("JSON parse error:", error);
            setTable(<div style={{ fontSize: '1.3rem', color: 'red' }}>Invalid JSON data. Finish Reason : {finishReason} {finishReason == 'length' ? "(Increase 'Max Token')" : ""}</div>);
        }
    }, [completion])


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

            <Modal.Root open={showModal} onOpenChange={setShowModal}>
                <Modal.Content>
                    <Modal.Header>
                        <Modal.Title>
                            <Typography fontWeight="bold">Create Content with Google Gemini</Typography>
                        </Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Grid.Root>
                            <Grid.Item padding={1} col={3} s={12}>
                                <Box color="neutral800">
                                    <label>{modelLoading && "Loading.."}{"Model"}</label>
                                    <SingleSelect
                                        id="select1"
                                        label="Models"
                                        value={model}
                                        onChange={setModel}
                                        selectButtonTitle="Carret Down Button"
                                    >
                                        {availableModels &&
                                            availableModels?.map((model) => (
                                                <SingleSelectOption key={model} value={model}>{model}</SingleSelectOption>
                                            ))}
                                    </SingleSelect>
                                </Box>
                            </Grid.Item>
                            <Grid.Item padding={1} col={3} s={12}>
                                <Box color="neutral800">
                                    <label>Max Tokens</label>
                                    <NumberInput
                                        label="Max tokens"
                                        name="content"
                                        max="1000"
                                        min="50"
                                        onValueChange={(value) =>
                                            setMaxTokens(
                                                value > 0 && value <= 4096 ? value : 16
                                            )
                                        }
                                        value={maxTokens}
                                    />
                                </Box>
                            </Grid.Item>
                            <Grid.Item padding={1} col={3} s={12}>
                                <Box color="neutral800">
                                    <label>Temperature</label>
                                    <NumberInput
                                        label="Temperature"
                                        name="content"
                                        disabled
                                        hint="Tem"
                                        onValueChange={(value) =>
                                            setTemperature(
                                                value >= 0 && value <= 1 ? value : 1
                                            )
                                        }
                                        value={temperature}
                                    />
                                </Box>
                            </Grid.Item>
                        </Grid.Root>
                        <Textarea
                            label="Enter a prompt"
                            name="prompt"
                            placeholder="Example: 'Create a 5-paragraph, SEO-friendly 'About Us' page for my agency's website in Istanbul.'"
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                        />
                        <div style={{
                            marginTop: '10px', width: "100%", gap: '4px', position: 'relative',
                            display: 'flex',
                            justifyContent: "flex-start"
                        }}
                        >




                            <Checkbox
                                name="chk-meta-title"
                                id="chk-meta-title"
                                onClick={() => setisMetaTitle((prev) => !prev)}
                                /*onChange={(e) => setcreateLayout(e.target.checked)}*/
                                checked={isMetaTitle} // bool olarak

                            >Meta Title</Checkbox>

                            <Checkbox
                                name="chk-meta-descr"
                                id="chk-meta-descr"
                                onClick={() => setisMetaDescr((prev) => !prev)}
                                /*onChange={(e) => setcreateLayout(e.target.checked)}*/
                                checked={isMetaDescr} // bool olarak

                            >Meta Description</Checkbox>
                            <Checkbox
                                name="chk-meta-keyw"
                                id="chk-meta-keyw"
                                onClick={() => setisMetaKeyw((prev) => !prev)}
                                /*onChange={(e) => setcreateLayout(e.target.checked)}*/
                                checked={isMetaKeyw} // bool olarak

                            >Meta Keyword</Checkbox>


                        </div>

                        <div style={{
                            marginTop: '4px', width: "100%", gap: '4px', position: 'relative',
                            display: 'flex',
                            justifyContent: "flex-end"
                        }}
                        >

                            <Button variant="tertiary" onClick={() => setShowModal(false)}>
                                Hide
                            </Button>
                            <Button onClick={() => handlePromptSubmit()} disabled={isGenerating}>{generateCompletionText}</Button>
                        </div>

                        {table && (
                            <div>
                                <br />
                                <hr />
                                <br />
                                {table}
                            </div>
                        )}
                    </Modal.Body>
                    <Modal.Footer>
                        <Modal.Close>
                            <Button variant="tertiary">Hide</Button>
                        </Modal.Close>

                    </Modal.Footer>
                </Modal.Content>
            </Modal.Root >
        </>
    )
};

export default GeminiForWebpage;
