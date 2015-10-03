/* 
  Supports: 
  {

    images: {
      hash_name: "/url/to/image.png" 
      // Single image to be loaded
    },

    sprites: {
      hash_name: "/url/to/image.png"
      // Loader will search in this location:
      // /url/to/image.png
      // /url/to/image.json

      hash_name_2: {
        url: "/url/to/image.png",
        data: {
          // atlas data is here
          frames: {
            "bush1": {
              "frame": {"x":134,"y":2,"w":64,"h":50},
              "rotated": false,
              "trimmed": false,
              "spriteSourceSize": {"x":0,"y":0,"w":64,"h":50},
              "sourceSize": {"w":64,"h":38}
            },
          }
        }
      }
    }
  }

*/

var _       = require("underscore");
var helpers = require("lib.helpers");
var Phaser;


module.exports = require("lib.Controller").extend("PhaserIsometricController", {

  tileSize: 38,

  findOrCreateGroup: function(name){
    var group        = this.findGroup(name);
    if(!group) group = this.createGroup(name);
    return group;
  },

  createGroup: function(name){
    var group = this.game.add.group();
    helpers.patch(this.elements, name, group);
    return group;
  },

  findGroup: function(name){
    return helpers.resolve(this.elements, name);
  },

  init: function(options, cb){
    this.objects_index = {};
    this.elements      = {};
    
    // Phaser will search for init, so overriding this.init with callback
    // And it will be called when Phaser finishes it's initialization
    this.init          = cb;

    Phaser = this.Phaser = require("./vendor/phaser.js");
    require("./vendor/phaser_isometric.js");
    var options = this.config;

    var game = new Phaser.Game(
      options.width,
      options.height,
      Phaser[options.renderer],
      document.querySelector(options.container),
      this,
      options.transparent_background,
      options.antialias,
      options.physicsConfig
    );
  },

  preload: function(){
    var self = this;
    if(this.images){
      _.each(this.images, function(url, key){ self.game.load.image(key, url); });
    } 

    if(this.sprites){
      for(var name in this.sprites){
        // Loading pair - image and json file
        if(_.isString(this.sprites[name])){
          var jsonFilename = this.sprites[name].replace(/\.([^.]*)$/, ".json");
          this.game.load.atlasJSONHash(name, this.sprites[name], jsonFilename);          
        }

        // Loading imaged with image url and directly passed atlas hash
        else if(_.isObject(this.sprites[name])){
          var data = this.sprites[name];
          this.game.load.atlas(name, data.url, null, data.atlas, Phaser.Loader.TEXTURE_ATLAS_JSON_HASH);
        }
      }
    }

    this.game.time.advancedTiming = true;
    // Add and enable the plug-in.
    this.game.plugins.add(new Phaser.Plugin.Isometric(this.game));
  }


});
