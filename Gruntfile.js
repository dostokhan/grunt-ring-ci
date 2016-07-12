/*
 * grunt-ring-ci
 * https://github.com/dostokhan/grunt-ring-ci
 *
 * Copyright (c) 2016 Moniruzzaman Monir
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function(grunt) {

    var crypto = require('crypto');

    var linkerFiles = [
        'index.html',
        'dash.html'
    ];

    var settingsFile = ['config/settings.constant.js'];
    var protocolFixScripts = ['init-worker.js', 'services/chat.connector.js'];
    var workerFiles = ['worker/com'];
    var protocolFixTemplates = [
        "webapp/index.html",
        "webapp/dash.html",
        "webapp/features.html",
        "webapp/faq.html",
        "webapp/faq-mobile.html",
        "webapp/privacy.html",
        "webapp/privacy-mobile.html",
        "webapp/terms.html",
        "webapp/home.html",
        "webapp/not-found.html",
        "webapp/player/embed.html",
        "webapp/pages/index-login.html"
    ];

    var vendorModules = [
        'angular',
        'ngRoute',
        'ngAnimate',
        'ui-notification',
        'ngWebSocket',
        'ui.bootstrap',
        'angular-svg-round-progress',
        'angularAudioRecorder', // THERE ARE MULTIPLE MODUELS IN THAT
        'oc.lazyLoad'
    ];

    var appModules = [
        //{
            //name: 'vendor',
            //dependencies:['config', 'connector'],
            //files: [
                //'js/vendor/angular/angular.min.js',
                //'js/vendor/angular/angular-route.min.js',
                //'js/vendor/angular/angular-animate.min.js',
                //'js/vendor/angular/angular-loader.min.js',
                //'js/vendor/angular/angular-ui-notification.min.js',
                //'js/vendor/angular-websocket.min.js',
                //'js/vendor/angular-bootstrap/ui-bootstrap-custom-0.12.1.min.js',
                //'js/vendor/angular-bootstrap/ui-bootstrap-custom-tpls-0.12.1.min.js',
                //'js/vendor/angular-svg-round-progressbar/build/roundProgress.js',
                //'js/vendor/js.cookie.min.js',
                //'js/vendor/fastdom.min.js',
                //'js/vendor/angularAudioRecorder/angular-audio-recorder.min.js',
                //'js/vendor/packetidgen.js',
                //'js/vendor/oclazyload/oclazyload.min.js'
            //]
        //},
        {
            name: 'globals',
            dependencies: [],
            files: [
                //'init-worker.js',
                //'wat.fall.js'
            ]
        },
        {
            name: 'ringid',
            dependencies:['config', 'connector'],
            files: [
                'app.module.js',
                'app.run.js',
                'app.routes.js',
                'app.controller.js',
                'app.module.js'
            ]
        },
        {
            name: 'config',
            dependencies: [],
            files: [
                'config/config.module.js',
                'config/settings.constant.js',
                'config/attribute-codes.constant.js',
                'config/app-constants.constant.js',
                'config/actions.constant.js'
            ]
        },
        {
            name: 'connector',
            dependencies: [],
            files: [
                    //'puller/puller.module.js',
                    'puller/syncher.factory.js',
                    'puller/parser.service.js',
                    'puller/socket.communication.factory.js'
                ]
        }

    ];

    //var toggleProtocolFiles = settingsChangeFiles.concat()

    var appVersion = '0.17.1',
        minStyle = ['css/styles.min.css'],
        //vendorBuild = ['js/app-vendor.min.js'],
        //minScript = ['js/app.min.js'],
        workerJs = ['js/worker.js'];

    var randomString = appVersion + new Date().getTime();
    var appMinFile = 'js/' + crypto.createHash('md5').update('app.min.js' + randomString).digest('hex') + '.js';
    var vendorMinFile = 'js/' + crypto.createHash('md5').update('app-vendor.min.js' + randomString).digest('hex') + '.js';
    var stylesMinFile= 'css/' + crypto.createHash('md5').update('styles.min.css' + randomString).digest('hex') + '.css';

    var appStyles = [
        'styles/ring-slider.css',
        'styles/framework.css',
        'styles/common.css',
        'styles/top_content.css',
        'styles/notification_box.css',
        'styles/left_content.css',
        'styles/calculation.css',
        'styles/post_box.css',
        'styles/rg_editor.css',
        'styles/dropdown.css',
        'styles/mid.css',
        'styles/chat.css',
        'styles/emo_list.css',
        'styles/feed.css',
        'styles/comments.css',
        'styles/icons.css',
        'styles/link_share.css',
        'styles/loader.css',
        'styles/popup.css',
        'styles/popup_feed_image.css',
        'styles/profile_header.css',
        'styles/profile_about.css',
        'styles/profile_friend.css',
        'styles/profile_photos.css',
        'styles/circle.css',
        'styles/calender.css',
        'styles/right_content.css',
        'styles/singlefeed.css',
        'styles/ring-font.css',
        'styles/ring-sticker.css',
        'styles/ring-dropdown.css',
        'styles/location_map.css',
        'styles/ring-emoticon.css',
        'styles/tabs.css',
        'styles/static_new.css',
        'styles/ringbox.css',
        'styles/player.css',
        'styles/chatbox.css',
        'styles/music.css',
        'styles/button.css',
        'styles/new-circle.css',
        'styles/mediapage.css',
        'styles/media.css'
    ];

    var vendorFiles = [
        //'//connect.facebook.net/en_US/sdk.js',
        'js/vendor/angular/angular.js',
        'js/vendor/angular/angular-route.min.js',
        //'js/vendor/angular/angular-cookies.min.js',
        'js/vendor/angular/angular-animate.min.js',
        'js/vendor/angular/angular-loader.min.js',
        'js/vendor/angular/angular-ui-notification.min.js',
        'js/vendor/angular-websocket.min.js',
        'js/vendor/angular-bootstrap/ui-bootstrap-custom-0.12.1.min.js',
        'js/vendor/angular-bootstrap/ui-bootstrap-custom-tpls-0.12.1.min.js',
        'js/vendor/angular-svg-round-progressbar/build/roundProgress.js',
        'js/vendor/js.cookie.min.js',
        'js/vendor/fastdom.min.js',
        'js/vendor/angularAudioRecorder/angular-audio-recorder.min.js',
        //'js/vendor/packetidgen.js',
        'js/vendor/oclazyload/oclazyload.min.js'
    ];

    var appScriptsDev = [

    ];

    var appVendorScriptDev = [
        'js/vendor/json-formatter/dist/json-formatter.min.js'
    ];

    var appScripts = [
            'app/init-worker.js',
            'app/wat.fall.js',

            /* ringid.config MODULE */
            'app/config/config.module.js',
            'app/config/chat.constant.js',
            'app/config/settings.constant.js',
            'app/config/attribute-codes.constant.js',
            'app/config/app-constants.constant.js',
            //'app/config/chat-packet.constant.js',
            'app/config/actions.constant.js',

            /* ringid.language MODULE */
            'app/language/default/default.js',
            'app/language/language.module.js',

            /* ringid.puller MODULE */
            'app/puller/syncher.factory.js',
            'app/puller/puller.module.js',
            'app/puller/parser.service.js',
            'app/puller/socket.communication.factory.js',

            /* GLOBAL MODULES */
            'app/global/global.services.module.js',
            'app/global/services/user.map.factory.js',
            'app/global/services/api.factory.js',
            'app/global/services/utils.factory.js',
            'app/global/services/ringhttp.factory.js',
            'app/global/services/global.events.factory.js',
            'app/global/services/ringalert.factory.js',
            'app/global/services/map.factory.js',
            'app/global/services/auth.factory.js',
            'app/global/services/chat.history.factory.js',
            'app/global/services/storage.factory.js',
            'app/global/services/ringbox.provider.js',
            'app/global/services/contacts.factory.js',


            'app/global/global.directives.module.js',
            'app/global/directives/rg-column.directive.js',
            'app/global/directives/rg-player.directive.js',
            'app/global/directives/rg-click.directive.js',
            'app/global/directives/rg-scrollbar.directive.js',
            'app/global/directives/rg-dropdown.directive.js',
            'app/global/directives/rg-page-title.js',

            // SIGN_IN_PAGE
            // ringid.auth MODULE
            'app/auth/social/social.module.js',
            'app/auth/social/utils.service.js',
            'app/auth/social/config.constant.js',
            'app/auth/social/popup.factory.js',
            'app/auth/social/oauth.factory.js',
            'app/auth/social/auth-social.provider.js',
            'app/auth/auth.module.js',
            'app/auth/directives/rg-slider.directive.js',
            'app/auth/controllers/auth.controller.js',
            'app/auth/controllers/ringbox-auth.controller.js',
            'app/auth/controllers/signin.controller.js',
            'app/auth/controllers/signup.controller.js',
            'app/auth/controllers/signup-select.controller.js',
            'app/auth/controllers/password-recover.controller.js',


            // ALL_PAGE
            // ringid.filters MODULE
            'app/shared/filters.module.js',

            // ringid.shared MODULE

            'app/shared/shared.module.js',

            'app/shared/models/sticker.map.factory.js',
            'app/shared/models/circle.map.factory.js',
            'app/shared/models/image.map.factory.js',
            'app/shared/models/media.map.factory.js',
            'app/shared/models/media-album.map.factory.js',
            'app/shared/models/ringfeed.map.factory.js',
            'app/shared/models/comment.map.factory.js',

            'app/shared/services/media-metadata.service.js',
            'app/shared/services/image-quality.service.js',
            'app/shared/services/file-upload.service.js',
            'app/shared/services/sticker.emo.factory.js',
            'app/shared/services/friends.factory.js',
            'app/shared/services/friends.http.service.js',
            'app/shared/services/circle.http.service.js',
            'app/shared/services/circle-manager.factory.js',
            'app/shared/services/image.http.service.js',
            'app/shared/services/album.factory.js',
            'app/shared/services/media.http.service.js',
            'app/shared/services/media.factory.js',
            'app/shared/services/emotion.factory.js',
            'app/shared/services/feed.factory.js',
            'app/shared/services/invite.factory.js',

            'app/shared/directives/rg-comments.directive.js',
            'app/shared/directives/rg-like.directive.js',
            'app/shared/directives/rg-editor.directive.js',
            'app/shared/directives/rg-emoticon.directive.js',
            'app/shared/directives/rg-hashtag.directive.js',
            'app/shared/directives/rg-upload.directive.js',
            'app/shared/directives/rg-invite.directive.js',

            'app/shared/controllers/menu.controller.js',
            'app/shared/controllers/all-suggestion.controller.js',
            'app/shared/controllers/mutual-friends.Controller.js',


            /* ringid.utils MODULE */
            'app/utils/directives/rg-compile.directive.js',
            'app/utils/utils.module.js',
            'app/utils/factories/app.utils.factory.js',
            'app/utils/directives/app.utils.directives.js',
            'app/utils/directives/rg-resize.directive.js',
            'app/utils/factories/window.focus.blur.factory.js',




            // ringid.notification MODULE
            'app/notification/notification.module.js',
            'app/notification/factories/notification.map.factory.js',
            'app/notification/factories/notification.http.service.js',
            'app/notification/factories/notification.factory.js',
            'app/notification/directives/rg-notification.directive.js',
            'app/notification/controllers/noti-popup.controller.js',
            'app/notification/controllers/image.controller.js',
            'app/notification/controllers/media.controller.js',
            'app/notification/controllers/ringbox-image.controller.js',
            'app/notification/controllers/ringbox-media.controller.js',



            // ringid.friends MODULE
            'app/friend/friend.module.js',
            'app/friend/directives/rg-friends.directive.js',
            'app/friend/directives/rg-requests.directive.js',

            // ringid.header module
            'app/header/header.module.js',
            'app/header/controllers/header.controller.js',
            'app/header/directives/rg-search.directive.js',



            // DASHBOARD PAGE
            // ringid.feed MODULE
            'app/feed/feed.module.js',
            'app/feed/directives/rg-feed-subscriber.directive.js',
            'app/feed/directives/feedimages.directive.js',
            'app/feed/directives/show-more.directive.js',
            'app/feed/directives/rg-incoming-feed.directive.js',
            'app/feed/directives/feed-timeout-option.directive.js',
            'app/feed/directives/feed-repeat.js',
            'app/feed/directives/feed-location-view.directive.js',
            'app/feed/directives/feed-location-menu.directive.js',
            'app/feed/directives/rg-news-feed-top.directive.js',
            'app/feed/directives/rg-news-feed-bottom.directive.js',
            'app/feed/directives/rg-news-feed-details.directive.js',
            'app/feed/directives/rg-news-feed-shared-feed.directive.js',
            'app/feed/directives/rg-news-feed-menu.directive.js',
            'app/feed/directives/feed-message.directive.js',
            'app/feed/directives/rg-single-feed.directive.js',
            'app/feed/directives/rg-single-feed-details.directive.js',
            'app/feed/directives/feed-inline-share.directive.js',
            'app/feed/controllers/feed.main.controller.js',
            'app/feed/controllers/feed.single.sub.controller.js',
            'app/feed/controllers/feed.sub.controller.js',
            'app/feed/controllers/feed.whoshare.controller.js',
            'app/feed/controllers/feed.ringbox.whoshare.controller.js',
            'app/feed/controllers/feed.share.controller.js',
            'app/feed/controllers/feed.ringbox.share.controller.js',
            'app/feed/controllers/feed.inline.share.controller.js',
            'app/feed/controllers/feed.add.controller.js',
            'app/feed/controllers/feed.dashboard.controller.js',
            'app/feed/controllers/feed.profile.controller.js',
            'app/feed/controllers/feed.circle.controller.js',
            'app/feed/controllers/feed.medias.controller.js',
            'app/feed/controllers/feed.tag.user.list.controller.js',
            'app/feed/controllers/feed.edit.tag.controller.js',


            // ringid.chat MODULE
            'app/chat/shared/chat.app.js',
            'app/chat/shared/chat.constants.js',
            'app/chat/shared/utils.js',
            'app/chat/shared/helpers.js',
            'app/chat/shared/chat.packet.format.js',
            'app/chat/shared/chat.requests.js',
            'app/chat/shared/auth.requests.js',
            'app/chat/shared/packetidgen.js',
            'app/chat/chat.module.js',
            'app/chat/chat.lang.js',
            'app/chat/services/chat.responses.js',
            'app/chat/services/auth.responses.js',
            'app/chat/controllers/chat.controller.js',
            'app/chat/controllers/chat.history.controller.js',
            'app/chat/controllers/chat.media.upload.controller.js',
            'app/chat/controllers/tag.chat.controller.js',
            'app/chat/controllers/tag.chat.popup.controller.js',
            'app/chat/controllers/tag.chat.debug.info.controller.js',
            'app/chat/services/chat.utils.factory.js',
            'app/chat/services/chat.box.factory.js',
            'app/chat/services/chat.connector.js',
            'app/chat/services/chat.exceptions.js',
            'app/chat/services/chat.factory.js',
            'app/chat/services/chat.helper.factory.js',
            'app/chat/services/chat.history.factory.js',
            'app/chat/services/chat.packet.sender.service.js',
            'app/chat/services/chat.seen.send.factory.js',
            'app/chat/services/chat.tab.sync.factory.js',
            'app/chat/services/chat.worker.commands.js',
            'app/chat/services/tag.chat.factory.js',
            'app/chat/services/tag.chat.helper.factory.js',
            'app/chat/services/tag.chat.manager.factory.js',
            'app/chat/services/tag.chat.models.js',
            'app/chat/services/tag.chat.storage.js',
            'app/chat/services/tag.chat.ui.factory.js',
            'app/chat/services/chat.request.processor.js',
            'app/chat/services/chat.response.processor.js',
            'app/chat/directives/chat.directive.js',
            'app/chat/directives/chat.ui.directive.js',
            'app/chat/directives/chat.focus.directive.js',
            'app/chat/directives/chat.message.directive.js',
            'app/chat/directives/chat.subscriber.directive.js',
            'app/chat/directives/chat.timeout.directive.js',
            'app/chat/directives/chat.setting.directive.js',
            'app/chat/directives/rg.tag.chat.list.js',


            // ringid.sticker MODULE */
            'app/sticker/sticker.module.js',
            'app/sticker/helpers/sticker-helper.js',
            'app/sticker/controllers/sticker-popup.controller.js',
            'app/sticker/models/sticker.category.model.js',
            'app/sticker/models/sticker.collection.model.js',
            'app/sticker/services/sticker.http.service.js',
            'app/sticker/services/sticker.factory.js',
            'app/sticker/directives/sticker-category.js',
            'app/sticker/directives/sticker-category-list.js',
            'app/sticker/directives/sticker-collection-list.js',


            //ringid.common.controllers MODULE
            'app/common/controllers/album-list.controller.js',
            'app/common/controllers/album-create.controller.js',
            'app/common/controllers/ringbox-album-list.controller.js',
            'app/common/controllers/ringbox-confirm.controller.js',
            'app/common/controllers/single-image.controller.js',
            'app/common/controllers.module.js',


            /* ringid.common.controllers MODULE */
            //'app/common/controllers/image-popup.controller.js',
            //'app/common/controllers/media.controller.js',
            //'app/common/controllers/album-list.controller.js',
            //'app/common/controllers/album-create.controller.js',

            //'app/common/controllers/ringbox-image-popup.controller.js',
            //'app/common/controllers/ringbox-media.controller.js',
            //'app/common/controllers/ringbox-album-list.controller.js',
            //'app/common/controllers/ringbox-confirm.controller.js',

            //'app/common/controllers/single-image.controller.js',
            //'app/common/controllers/all-suggestion.controller.js',
            //'app/common/controllers/mutualFriendsController.js',

            //'app/common/controllers/header.controller.js',
            //'app/common/controllers/menu.controller.js',

            //'app/common/controllers.module.js',


             //ringid.media MODULE
            'app/media/media.module.js',
            'app/media/directives/rg-media.directive.js',
            'app/media/directives/rg-media.search.directive.js',
            'app/media/directives/search.media.directive.js',
            'app/media/directives/rg-media.tabnav.directive.js',
            'app/media/controllers/searchresultcontroller.js',
            'app/media/controllers/allalbumtypecontroller.js',
            'app/media/controllers/media-post.controller.js',



             //common.directives MODULE
            'app/common/directives/round-progress-directive.js',
            'app/common/directives/rg-focus.directive.js',
            'app/common/directives/rg-url-og-preview.js',
            'app/common/directives/rg-url-og-fetcher.js',
            'app/common/directives/rg-loader.directive.js',
            'app/common/directives/rg-loading.directive.js',
            'app/common/directives/rg-recorder.directive.js',
            'app/common/directives/rg-global-loader.directive.js',

            'app/common/directives/rg-emotion.directive.js',
            'app/common/directives/rg-img.directive.js',
            'app/common/directives/rg-photos.directive.js',
            'app/common/directives/rg-href.directive.js',
            'app/common/directives/rg-friend.dropdown.directive.js',
            'app/common/directives/rg-hovercard.directive.js',
            'app/common/directives/rg-tag-friend.directive.js',
            'app/common/directives/rg-src.directive.js',
            'app/common/directives/rg-repeat.directive.js',

            'app/common/directives/rg-report.directive.js',
            'app/common/directives.module.js',


             //ringid.profile MODULE
            'app/profile/services/profile.http.service.js',
            'app/profile/profile.module.js',
            'app/profile/directives/rg-img-reposition.directive.js',
            'app/profile/directives/rg-profile.directive.js',
            'app/profile/directives/rg-profile-basic.directive.js',
            'app/profile/directives/rg-profile-privacy.directive.js',
            'app/profile/directives/rg-profile-education.directive.js',
            'app/profile/directives/rg-profile-work.directive.js',
            'app/profile/directives/rg-profile-skill.directive.js',
            'app/profile/directives/rg-profile-password.directive.js',
            'app/profile/directives/rg-profile-recovery.directive.js',
            'app/profile/directives/rg-profile-achat.directive.js',
            'app/profile/directives/rg-profile-ainfndreq.directive.js',
            'app/profile/directives/rg-profile-allowaddme.directive.js',
            'app/profile/directives/rg-profile-autoaddfrnd.directive.js',
            'app/profile/directives/rg-relocate-template.directive.js',
            'app/profile/services/profile.factory.js',


             //ringid.circle MODULE
            'app/circle/circle.module.js',
            'app/circle/controllers/circle-popup.controller.js',
            'app/circle/controllers/circle-edit.popup.controller.js',
            'app/circle/controllers/circle-page.controller.js',
            'app/circle/controllers/allCirclePopup.controller.js',

             //ringid.album MODULE
            'app/album/album.module.js',
            'app/album/factories/album.http.service.js',
            'app/album/factories/album.map.factory.js',
            'app/album/factories/albumServices.js',
            'app/album/controllers/albumController.js',

            'app/sticker/controllers/sticker-popup.controller.js',

            // ringid MODULE
            'app/app.module.js',
            'app/app.controller.js',
            'app/app.run.js',
            'app/app.routes.js'
    ];

   var TemplateChachFiles =['pages/partials/news_feed/top.html',
                                   'pages/partials/news_feed/bottom.html',
                                   'pages/partials/news_feed/menu.html'];




  // Project configuration.
  grunt.initConfig({
    jshint: {
      all: [
        'Gruntfile.js',
        'tasks/*.js',
        '<%= nodeunit.tests %>'
      ],
      options: {
        jshintrc: '.jshintrc'
      }
    },

    // Before generating any new files, remove any previously-created files.
    clean: {
      tests: ['tmp']
    },

    // Configuration to be run (and then tested).
    ring_ci: {
        options: {
            //custom tasks files
            vendorFiles: vendorFiles,
            linkerFiles: linkerFiles,
            settingsFile: settingsFile,
            protocolFixTemplates: protocolFixTemplates,
            protocolFixScripts: protocolFixScripts,
            workerFiles: workerFiles,
            appModules: appModules,
            appStyles: appStyles
        },
        local: {
            options: {
                target: 'dev',
                protocol: 'ssl',
                apiVersion: '141',
                branch: 'develop',
                appSrcPath: 'webapp/app/',
                appBuildPath: 'webapp/js/build/',
                eslintOptions: {
                    configFile: '.eslintrc.json'
                },
                minifyStyles: false,
                minifyScripts: false,
                buildModules: false
            },
            files: {}
        },
        live: {
            options: {
                target: 'live',
                protocol: 'ssl',
                apiVersion: '140',
                branch: 'master',
                appSrcPath: 'webapp/app/',
                appBuildPath: 'webapp/js/build/',
                buildModules: false,
                minifyStyles: true,
                minifyScripts: true,
            },
            files: {}
        },
      default_options: {
        options: {
        },
        files: {
          'tmp/default_options': ['test/fixtures/testing', 'test/fixtures/123']
        }
      },
      custom_options: {
        options: {
          separator: ': ',
          punctuation: ' !!!'
        },
        files: {
          'tmp/custom_options': ['test/fixtures/testing', 'test/fixtures/123']
        }
      }
    },

    // Unit tests.
    nodeunit: {
      tests: ['test/*_test.js']
    }

  });

  // Actually load this plugin's task(s).
  grunt.loadTasks('tasks');

  // These plugins provide necessary tasks.
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-nodeunit');

  // Whenever the "test" task is run, first clean the "tmp" dir, then run this
  // plugin's task(s), then test the result.
  grunt.registerTask('test', ['clean', 'ring_ci', 'nodeunit']);

  // By default, lint and run all tests.
  grunt.registerTask('default', ['jshint', 'test']);

};
