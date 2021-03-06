var Client = require('castv2-client').Client;
var DefaultMediaReceiver = require('castv2-client').DefaultMediaReceiver;

function play(host, url, type, port) {

    var client = new Client();

    client.connect(host, port, function() {
        console.log('connected, launching app on %s with url %s and type %s', host, port, url, type);

        client.launch(DefaultMediaReceiver, function(err, player) {
            var media = {

                // Here you can plug an URL to any mp4, webm, mp3 or jpg file with the proper contentType.
                contentId: url,
                contentType: type,
                streamType: 'BUFFERED' // or LIVE    
            };

            player.load(media, { autoplay: true }, function(err, status) {
                console.log('media loaded playerState=%s', status.playerState);
                client.close();
            });

        });

    });
}

module.exports = function(RED) {
    'use strict';

    function Node(n) {

        RED.nodes.createNode(this, n);

        var node = this;

        this.on('input', function(msg) {

            var creds = RED.nodes.getNode(n.creds),
                payload = typeof msg.payload === 'object' ? msg.payload : {};

            var attrs = ['ip', 'url', 'contentType', 'port'];
            for (var attr of attrs) {
                if (n[attr]) {
                    payload[attr] = n[attr];
                }
            }

            if (payload.ip && payload.url && payload.contentType) {
                play(payload.ip, payload.url, payload.contentType, payload.port);
            }

            node.send(msg);
        });
    }

    RED.nodes.registerType('chromecast-play', Node);
};