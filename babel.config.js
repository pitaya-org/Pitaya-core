module.exports = {
  include: ["src"],
  presets: [
    [
      "@babel/preset-env", 
      {       
        targets: {
          chrome: 58
        },      
        useBuiltIns: "entry",
        corejs: {
          version: 3,
          proposals: true,
        }   
      }
    ], 
    "@babel/preset-typescript"
  ],
};
