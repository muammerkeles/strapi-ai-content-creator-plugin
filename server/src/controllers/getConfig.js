const configController = ({ strapi }) => ({
  getConfig(ctx) {
    //console.log("ctx",ctx);
    const config = strapi.config.get("plugin::ai-content-creator");
    ctx.send(config);
    /***ctx.body = 
    
    strapi
      .plugin('theme-palette')
      // the name of the service file & the method.
      .service('service')
      .getWelcomeMessage();
      */
  },
});

export default configController;
