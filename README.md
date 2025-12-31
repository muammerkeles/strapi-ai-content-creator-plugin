
# Create Content With Open AI and Gemini for Strapi (5 and later) project.

[GitHub](https://github.com/muammerkeles/strapi-ai-content-creator-plugin) - [npm](https://www.npmjs.com/package/ai-content-creator)





How to use?

## ⚙️ Plugin Install
install npm package 

`npm i ai-content-creator`

## ⚙️ Plugin Configuration
To start using the plugin, add the following configuration to your Strapi project's `config/plugins.js` file.

This setup enables the plugin and allows you to configure API keys and specify which Content Types the AI button should appear on.


```javascript
// config/plugins.js (or similar configuration file)

module.exports = ({ env }) => {
  return {
    'ai-content-creator': {
      enabled: true,
      // The 'resolve' path is typically only required when the plugin is installed locally.
      // resolve: './src/plugins/ai-content-creator', 
      config: {
        openAi:{
          enabled: true,
          apiKey: env("OPEN_AI_KEY", ""), // Fetches API key from an Environment Variable
          contentList:["api::webpage.webpage"] // Specifies the Content Types where the plugin's UI should be visible
          // OR
          contentList:[] // leave it empty if you want the plugin's UI visible in all pages
        },
        gemini:{
          enabled: true,
          apiKey: env("GEMINI_AI_KEY", ""), // Fetches API key from an Environment Variable
          contentList:["api::webpage.webpage"] // Specifies the Content Types where the plugin's UI should be visible
          // OR
          contentList:[] //  leave it empty if you want the plugin's UI visible in all pages
        }
      },
    },
  }
};

 ```

# Gemini :
<img width="1426" height="988" alt="image" src="https://github.com/user-attachments/assets/667064fc-af56-4b67-9619-b8ce32701808" />

# GPT :
<img width="1343" height="913" alt="image" src="https://github.com/user-attachments/assets/064e61eb-a818-4358-9af1-aecc7776e2d0" />

<img width="1499" height="1021" alt="image" src="https://github.com/user-attachments/assets/8a930175-4912-4f66-b05c-9c08e7217999" />




## 💖 Support This Project

Thank you for considering supporting this project! Maintaining and developing new features for open-source software takes time and effort. You can support us via the channels below:

* **GitHub Sponsors:** Contribute to the project's future and gain access to special perks.
* **[External Platform (e.g., Ko-fi)]:** Buy us a one-time "coffee" to say thanks.

[![GitHub Sponsor ](https://img.shields.io/static/v1?label=GitHub&message=Sponsor&color=brightgreen&logo=github)](https://github.com/sponsors/muammerkeles)
[![Ko-fi Button](https://img.shields.io/static/v1?label=Buy%20Me%20a%20Coffee&message=Donate&color=orange&logo=ko-fi)](https://ko-fi.com/muammerkeles)



## 💖 Desteğiniz İçin

Bu projeyi desteklediğiniz için teşekkür ederiz! Açık kaynak yazılımların bakımı ve yeni özelliklerin geliştirilmesi zaman ve çaba gerektirir. Bize destek olmak için aşağıdaki kanalları kullanabilirsiniz:

