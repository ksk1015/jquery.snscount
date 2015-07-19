/*
snsのURLのシェア数を取得するプラグイン

対象サービスは twitter, facebook, linkedIn, hatenabookmark
$.snsCountFetchに対して拡張できる。

// こんなふうに使う
$.snsCount('twitter', someURL, function(cnt){
    //dosomething...
});

// こんなふうに要素にシェア数を表示することできる
$('#id').snsCount('twitter', someURL, function(cnt){

// 第四引数をtrueにするとsessionStorageで保存したcacheを使う
$.snsCount('twitter', someURL, function(cnt){
    //dosomething...
}, true);
*/

(function($){
    
    var cache = {
        canUse: 'sessionStorage' in window,
        storage: window.sessionStorage,
        createKey: function(type, url){
            return 'snsCount-' + type + '-' + encodeURIComponent(url);
        },
        set: function(type, url, cnt){
            this.storage.setItem( this.createKey(type, url), cnt);
        },
        get: function(type, url){
            return this.storage.getItem( this.createKey(type, url));
        },
        has: function(type, url){
            if(!this.canUse){
                return false;
            }
            return typeof this.storage.getItem( this.createKey(type, url)) === 'string';
        },
    };
    
    $.snsCountFetch = {
        twitter: function(url, callback){
            $.getJSON('//urls.api.twitter.com/1/urls/count.json?url=' + encodeURIComponent(url) + '&callback=?', function(json){
                callback(json.count);
            });
        },
        facebook: function(url, callback){
            $.getJSON('//graph.facebook.com/' + encodeURIComponent(url) + '?callback=?', function(json){
                callback(json.shares || 0);
            });
        },
        linkedIn: function(url, callback){
            $.getJSON('//www.linkedin.com/countserv/count/share?url=' + encodeURIComponent(url) + '&callback=?', function(json){
                callback(json.count);
            });
        },
        hatenabookmark: function(url, callback){
            $.getJSON('//api.b.st-hatena.com/entry.count?url=' + encodeURIComponent(url) + '&callback=?', function(json){
                callback(json);
            });
        }
    };

    $.snsCount = function(type, url, callback, useCache){
        if(useCache && cache.canUse && cache.has(type, url)){
            setTimeout(callback( cache.get(type, url) ), 1);
            return;
        }
        $.snsCountFetch[type](url, function(cnt){
            if(cache.canUse){
                cache.set(type, url, cnt);
            }
            callback(cnt);
        });
    };
    
    $.fn.snsCount = function(type, url, useCache){
        var $el = this;
        $.snsCount(type, url, function(count){
            $el.text(count);
        }, useCache);
        return this;
    };

})(jQuery);