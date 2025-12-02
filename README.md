
# ai-content-creator - Create Content With Open AI & Gemini

## ⚙️ Plugin Configuration

To start using the plugin, add the following configuration to your Strapi project's `config/plugins.js` file.

This setup enables the plugin and allows you to configure API keys and specify which Content Types the AI button should appear on.

NOTE: Gemini is not implemented yet.
Open AI is ready to use.



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
        },
        gemini:{
          enabled: true,
          apiKey: env("GEMINI_AI_KEY", ""), // Fetches API key from an Environment Variable
          contentList:["api::webpage.webpage"] // Specifies the Content Types where the plugin's UI should be visible
        }
      },
    },
  }
};

 ```

Result:
<img width="1343" height="913" alt="image" src="https://github.com/user-attachments/assets/064e61eb-a818-4358-9af1-aecc7776e2d0" />

<img width="1499" height="1021" alt="image" src="https://github.com/user-attachments/assets/8a930175-4912-4f66-b05c-9c08e7217999" />
