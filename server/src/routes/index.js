export default [
  {
    method: 'GET',
    path: '/config',
    // name of the controller file & the met
    //handler: "plugin::theme-palette.theme-palette.configController",
    handler: 'configController.getConfig',
    config: {
      //policies:[],
      //policies: ["admin::isAuthenticatedAdmin"],
      auth: {
        type: "admin"
      }
    },
  }
];
