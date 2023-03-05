
define('danmu/index',function (require, exports, module) {
  var $ = require('node').all;
  var Base = require('base');
  var util = require('util');
  var Item = require('./item');
  var pipeline = new function () {
  var arr = [];
   
    
    var H = 30;
    this.create = function (h) {
      var l = parseInt(h / H);
      for (var i = 0; i < l; i++) {
        arr.push({
          d: new Date(),
          s: 0,
          p: H * i
        })
      }
    };
    
    
    this.dispatch = function () {
      var p;
      arr.shuffle();

      for (var i = 0; i < arr.length; i++) {
        if (!arr[i].s) {
          p = arr[i];
          break
        }
      }

      if (!p) {
        var c = arr[0];
        for (var i = 1; i < arr.length; i++) {
          if (arr[i].d < c.d) {
            c = arr[i];
          }
        }
        p = c;
      }

      p.d = new Date();
      p.s = 1;

      return p;
    }

  };


  module.exports = Base.extend({

    initializer: function () {
      var self = this;

      pipeline.create(this.get('container').height());

      self.on('message', function (ev) {
        self.push(ev.message);
      })

    },

    push: function (message) {
      var self = this;
      if (!util.isArray(message)) {
        message = [message];
      }

      message.forEach(function (data) {
        var p = pipeline.dispatch();
        var item = new Item({
          container: self.get('container'),
          begin: window.innerWidth,
          end: 0,
          top: p.p,
          text: data.text,
          delay: Math.floor(Math.random() * 2000 + 1),
          size: data.size || parseInt(Math.random()*(24-14)+14)
        })

        item.on('end', function () {
          p.s = 0;
        })
      })


    }


  })


  Array.prototype.shuffle = function () {
    var input = this;

    for (var i = input.length - 1; i >= 0; i--) {

      var randomIndex = Math.floor(Math.random() * (i + 1));
      var itemAtIndex = input[randomIndex];

      input[randomIndex] = input[i];
      input[i] = itemAtIndex;
    }
    return input;
  }

})



define('danmu/item',function (require, exports, module) {
  var $ = require('node').all;
  var Anim = require('anim');
  var Base = require('base');

  module.exports = Base.extend({

    initializer: function () {
      var self = this;

      this.root = this.render();
      this.anim = this.anim();

      setTimeout(function(){
        self.anim.run();
      },self.get('delay'));
    },

    anim:function(){
      var self = this;
      var root = this.root;
      var end = this.get('end') -  root.outerWidth();

      return new Anim(root, {
        transform: 'translate('+end+'px,'+this.get('top')+'px)'
      }, {
        //duration: this.get('duration'),
        duration: Math.random()*(20-5)+5,
        complete: function () {
          self.fire('end');
          root.remove();
        }
      });
    },

    render: function () {
      var root = $('<div>' + this.get('text') + '</div>');
      var top = this.get('top') + Math.floor(Math.random()*(20-1)+1);
      root.css({
        'position': 'absolute',
        'border-radius':'20px',
        'background-color': 'rgba(0,255,255,0.08)',
        'padding': '3px 8px',
        'color:': this.get('color'),
        'font-size': this.get('size') + 'px',
        'transform': 'translate(' + this.get('begin') + 'px,' + top + 'px)'
      });

      this.get('container').append(root);
      this.bindEvt(root);

      return root;
    },

    bindEvt: function (root) {
      var self = this;

      root.on('mouseenter', function (ev) {
      self.anim.pause();
      });
      
      root.on('mouseleave', function (ev) {
      self.anim.resume();
      });

      root.on('click', function (ev) {
        self.fire('click', {
          id: self.get('id'),
          user: self.get('user')
        })
      })
    }

  }, {
    ATTRS: {
      container: {},
      top: {
        value: 0
      },
      begin: {
        value: 0
      },
      eng: {
        value: 0
      },
      size: {
        value: 50
      },
      color: {
        value: '#red'
      },
      duration: {
        value: 10
      },
      text: {
        value:'???'
      },
      delay:{
        value:0
      }
    }
  });

})

modulex.use('danmu/index,node', function(Dev, Node) {
  var $ = Node.all;
  var $container = $('#container');

  // initial data
  var d = [{
    text:'hi'
  },{
    text:':)'
  },{
    text:'222222222222222'
  }];

  // create web socket connection
  var ws = new WebSocket('ws://echo.websocket.org');

    // check if WebSocket is open
  ws.onopen = function(event) {
    console.log('WebSocket is open!');
  };

  // check for incoming messages
  ws.onmessage = function(event) {
    console.log('Incoming message:', event.data);
  };

  // check for errors
  ws.onerror = function(event) {
    console.log('WebSocket error:', event);
  };

  // check if WebSocket is closed
  ws.onclose = function(event) {
    console.log('WebSocket is closed!');
  };

  // handle messages from web socket
  ws.onmessage = function(event) {
    var newData = { text: event.data };
    d.push(newData);
    item.push(newData);
  };

  // handle form submission
  $("#form").on('submit', function(event) {
    event.preventDefault(); 
    var inputtext1 = $("#input").val();
    var newData = { text: inputtext1 };
    d.push(newData);
    ws.send(inputtext1);
    item.push(newData);
    $("#input").val('');
    $("#input").focus();
  });

  // create danmu object
  var item = new Dev({
    container: $container,
    data: d
  });

  // push danmu
  setInterval(function() {
    item.push(d);
  }, 1000);
});