import React, { useState, useEffect } from 'react';
import { useFetchClient, unstable_useContentManagerContext as useContentManagerContext } from '@strapi/strapi/admin';
import {
    Textarea, Grid, Checkbox, SingleSelect,
    SingleSelectOption, Box, NumberInput, Button, Flex, Modal, Typography, Loader
} from '@strapi/design-system';
import { Quotes } from '@strapi/icons';
import { useNotification } from '@strapi/strapi/admin';

const OpenAIForWebpage = ({ config }) => {
    const [loading, setLoading] = useState(true);

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

        console.warn("Open AI Config:", config);

    }, [config]);

    // Yükleme durumu gösterimi
    if (loading && !config) {
        return (
            <>
                <p style={{ fontSize: '1rem' }}>loading Chat Gpt ...</p>
            </>
        )
    } else
        // API Anahtarı yoksa (setLoading(false) useEffect içinde ayarlandı)
        if (!config.apiKey) {
            return (
                <>
                    <p style={{ fontSize: '1rem' }}>Warn: (Chat Gpt API KEY Not Found!)</p>
                </>

            )
        }

    const { contentType, form } = useContentManagerContext();
    //const { values } = form;

    const { toggleNotification } = useNotification();

    if (config && config?.contentList && config?.contentList.length>0 && !config?.contentList.includes(contentType?.uid)) {
        //if (contentType?.uid !== 'api::webpage.webpage') {
        return <>
            <p style={{ fontSize: '1rem' }} title="OpenAi is inactive for this page">GPT is Inactive!</p>
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
        model: 'gpt-4.1-mini',
        temperature: 1,
        maxTokens: 500,
        models: ['gpt-4.1-mini','o4-mini']
    }); // Güncel modelleri fetch etmedenönce bunları default olarak yükleyelim

    const [availableModels, setAvailableModels] = useState([]); // Kullanılabilir modeller listesi
    const [model, setModel] = useState([]);
    const [modelLoading, setModelLoading] = useState(false);
    const [temperature, setTemperature] = useState(defaultSettings?.temperature)
    const [maxTokens, setMaxTokens] = useState(defaultSettings?.maxTokens);
    const [isGenerating, setIsGenerating] = useState(!1);

    useEffect(() => {

        if (modelLoading || loading || !config.apiKey) return;

        if (availableModels.length == 0) {
            setModelLoading(true);
            const fetchOpenAiModels = async () => {
                try {
                    const url = 'https://api.openai.com/v1/models';
                    const response = await fetch(
                        url,
                        {
                            method: 'GET',
                            headers: {
                                'Content-Type': 'application/json',
                                Authorization: `Bearer ${config.apiKey}`
                            },
                        });
                    if (!response.ok) {
                        throw new Error(`HTTP Error Code (OpenAi Models Fetch): ${response.status}`);
                    }
                    const res = await response.json();
                    const modelIds = res.data.map(m => m.id);
                    setAvailableModels(modelIds);
                    if (modelIds.length > 0 && !modelIds.includes(model)) {
                        setModel(modelIds[0]);
                    }
                    console.log('OpenAI modelleri başarıyla alındı.');
                    setModelLoading(false);

                } catch (error) {
                    setModelLoading(false);

                    console.error('OpenAI modelleri alınamadı:', error);
                    setAvailableModels(defaultSettings.models);
                }
            }
            fetchOpenAiModels();
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
                message: 'ERror : Api Key Not Found!'
            });
            return;
        }
        try {
            const response = await fetch(
                `https://api.openai.com/v1/chat/completions`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${config.apiKey}`
                    },
                    body: JSON.stringify({
                        model,
                        messages,
                        temperature,
                        max_tokens: maxTokens,
                    }),
                }
            );

            const res = await response.json();
            return res;
        } catch (error) {
            console.log(error);
        }
    }

    const handlePromptSubmit = () => {
        if (isGenerating) {
            toggleNotification({
                type: 'warning',
                message: 'Please wait..'
            });
            return;
        }

        console.log(model)
        console.log(prompt)
        console.log(temperature)
        console.log(maxTokens)
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
                .then((data) => {
                    console.log("response", data);
                    if (data?.error) {
                        toggleNotification({
                            type: 'danger',
                            message: 'Error : ' + data?.error?.message
                        });
                    }else{

                        let cleaned = data?.choices[0]?.message?.content?.trim()?.replace(/```json|```/g, '').trim();
                        console.log("result", cleaned);   
                        setCompletion(cleaned);//data?.choices[0]?.message.trim());
                        setFinishReason(data?.choices[0]?.finish_reason);
                    }
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
            const data = JSON.parse(completion);
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
                                    Kullan
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
                variant="success-light"
            >
                {loading ? 'Waiting...' : 'Chat GPT'}
            </Button>

            <Modal.Root open={showModal} onOpenChange={setShowModal}>
                <Modal.Content>
                    <Modal.Header>
                        <Modal.Title>
                            <Typography fontWeight="bold">OpenAI ChatGPT ile içerik oluşturun</Typography>
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
                            label="Prompt girin"
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
                                Vazgeç
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
                            <Button variant="tertiary">Vazgeç</Button>
                        </Modal.Close>

                    </Modal.Footer>
                </Modal.Content>
            </Modal.Root >
        </>
    )
};

export default OpenAIForWebpage;
