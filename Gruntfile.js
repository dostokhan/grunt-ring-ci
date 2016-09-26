/*
 * grunt-ring-ci
 * https://github.com/dostokhan/grunt-ring-ci
 *
 * Copyright (c) 2016 Moniruzzaman Monir
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function gruntTask(grunt) {
    var appStyles = [
            'styles/ring-slider.css', 'styles/framework.css',
            'styles/common.css',
            'styles/sprite.css',
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
            'styles/sticker_market.css',
            'styles/media.css',
            'styles/newsportal.css',
            'styles/rg-animation.css',
        ],

        vendorScripts = [
            'js/vendor/angular/angular.js',
            'js/vendor/angular/angular-route.min.js',
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
            'js/vendor/oclazyload/oclazyload.min.js',
            'js/vendor/lru.js',
        ],

        // TemplateChachFiles = [
        //     'pages/partials/news_feed/top.html',
        //     'pages/partials/news_feed/bottom.html',
        //     'pages/partials/news_feed/menu.html',
        // ],


    // NEW GRUNT CUSTOM BUILD TASK CONFIGS
        debugFiles = ['app/debug.tool.js', 'app/developer.config.js'],
        linkerFiles = ['index.html', 'features.html', 'dashboard.html'],
        settingsFile = ['app/config/settings.constant.js'],
        protocolFixTemplates = [
            'index.html',
            'dashboard.html',
            'features.html',
        ],
        protocolFixScripts = ['app/init-worker.js'],
        templateReplaceFiles = ['app/shared/directives/rg-comments.directive.js'],
        workerFiles = ['app/worker/com'],
        appModules = [
            {
                name: 'globals',
                dependencies: [],
                files: [
                    'app/init-worker.js',
                    'app/wat.fall.js',
                ],
            },
            {
                name: 'ringid.digits',
                dependencies: [
                    'ringid.config',
                    'ringid.global_services',
                ],
                files: [
                    'app/digits/digits.service.js',
                    'app/digits/rg-verify-phone.directive.js',
                ],
            },
            {
                name: 'ringid.config',
                dependencies: [],
                files: [
                    'app/config/settings.constant.js',
                    'app/config/attribute-codes.constant.js',
                    'app/config/app-constants.constant.js',
                    'app/config/actions.constant.js',
                ],
            },
            {
                name: 'ringid.language',
                dependencies: [],
                files: [
                    'app/language/language.factory.js',
                ],
            },
            {
                name: 'ringid.connector',
                dependencies: [
                    'ngWebSocket',
                    'ringid.config',
                ],
                files: [
                    'app/connector/rg-syncher.factory.js',
                    'app/connector/merger.service.js',
                // 'app/connector/parser.service.js',// no use, now parser is on worker and marger is on separate file
                    'app/connector/socket.communication.factory.js',
                ],
            },
            {
                name: 'ringid.global_services',
                dependencies: [
                    'ringid.config',
                    'ringid.connector',
                    'ringid.utils',
                    'ui-notification',
                ],
                files: [
                    'app/global/services/user.map.factory.js',
                    'app/global/services/user.service.js',
                    'app/global/services/utils.factory.js',
                    'app/global/services/ringhttp.factory.js',
                    'app/global/services/global.events.factory.js',
                    'app/global/services/ringalert.factory.js',
                    'app/global/services/map.factory.js',
                    'app/global/services/auth.factory.js',
                    'app/global/services/chat.history.factory.js',
                    'app/global/services/storage.factory.js',
                    'app/global/services/contacts.factory.js',
                    'app/global/services/route.service.js',
                    'app/global/services/api/api-call.service.js',
                    'app/global/services/api/user-api.service.js',
                    'app/global/services/api.factory.js',
                ],
            },
            {
                name: 'ringid.global_directives',
                dependencies: [
                    'ngRoute',
                    'ringid.config',
                ],
                files: [
                    'app/global/directives/rg-column.directive.js',
                    'app/global/directives/rg-click.directive.js',
                    'app/global/directives/rg-dropdown.directive.js',
                    'app/global/directives/rg-page-title.js',
                    'app/global/directives/rg-user-track.js',
                ],
            },
            {
                name: 'ringid.social',
                dependencies: [],
                files: [
                    'app/auth/social/utils.service.js',
                    'app/auth/social/config.constant.js',
                    'app/auth/social/popup.factory.js',
                    'app/auth/social/oauth.factory.js',
                    'app/auth/social/auth-social.provider.js',
                ],
            },
            {
                name: 'ringid.auth',
                dependencies: [
                    'ringid.config',
                    'ringid.digits',
                    'ringid.connector',
                    'ringid.social',
                ],
                files: [
                    'app/auth/directives/rg-slider.directive.js',
                    'app/auth/controllers/auth.controller.js',
                    'app/auth/controllers/ringbox-auth.controller.js',
                    'app/auth/controllers/signin.controller.js',
                    'app/auth/controllers/signup.controller.js',
                    'app/auth/controllers/signup-select.controller.js',
                    'app/auth/controllers/password-recover.controller.js',
                ],
            },
            {
                name: 'ringid.filters',
                dependencies: ['ringid.config'],
                files: [
                    'app/shared/ring.filters.js',
                ],
            },
            {
                name: 'ringid.shared',
                dependencies: [
                    'ringid.filters',
                    'ringid.auth',
                    'ringid.global_services',
                    'ringid.config',
                ],
                files: [
                    'app/shared/models/sticker.map.factory.js',
                    'app/shared/models/circle.map.factory.js',
                    'app/shared/models/image.map.factory.js',
                    'app/shared/models/media.map.factory.js',
                    'app/shared/models/newsportal.map.factory.js',
                    'app/shared/models/mediapage.map.factory.js',
                    'app/shared/models/businesspage.map.factory.js',
                    'app/shared/models/celebrity.map.factory.js',
                    'app/shared/models/breaking-news.map.factory.js',
                    'app/shared/models/media-album.map.factory.js',
                    'app/shared/models/ringfeed.map.factory.js',
                    'app/shared/models/comment.map.factory.js',
                    'app/shared/models/album.map.factory.js',
                    'app/shared/models/ring-file.factory.js',
                    'app/shared/services/media-metadata.service.js',
                    'app/shared/services/image-quality.service.js',
                    'app/shared/services/file-upload.service.js',
                    'app/shared/services/sticker.emo.factory.js',
                    'app/shared/services/friends.factory.js',
                    'app/shared/services/friends.http.service.js',
                    'app/shared/services/circle.http.service.js',
                    'app/shared/services/portal.http.service.js',
                    'app/shared/services/business.http.service.js',
                    'app/shared/services/celebrity.http.service.js',
                    'app/shared/services/circle-manager.factory.js',
                    'app/shared/services/image.http.service.js',
                    'app/shared/services/album.factory.js',
                    'app/shared/services/media.http.service.js',
                    'app/shared/services/media.factory.js',
                    'app/shared/services/emotion.factory.js',
                    'app/shared/services/feed.factory.js',
                    'app/shared/services/invite.factory.js',
                    'app/shared/services/text-parser.service.js',
                    'app/shared/services/comment.http.service.js',
                    'app/shared/directives/rg-audio.directive.js',
                    'app/shared/directives/rg-video.directive.js',

                    'app/shared/controllers/comments.controller.js',
                    'app/shared/controllers/comments.history.controller.js',
                    'app/shared/directives/rg-comments.directive.js',
                    'app/shared/directives/rg-like.directive.js',
                    'app/shared/directives/rg-emoticon.directive.js',
                // 'app/shared/directives/rg-hashtag.directive.js', no more used. replaced by rg-selector directive inside rg-postbox directive
                    'app/shared/directives/rg-upload.directive.js',
                    'app/shared/directives/rg-invite.directive.js',
                    'app/shared/directives/rg-public-chat-room-list.directive.js',
                    'app/shared/controllers/menu.controller.js',
                    'app/shared/controllers/rightbar.controller.js',
                    'app/shared/controllers/all-suggestion.controller.js',
                    'app/shared/controllers/mutual-friends.controller.js',
                    'app/shared/directives/rg-feed-sharer-list.directive.js',
                ],
            },
            {
                name: 'ringid.ui_editor',
                dependencies: [
                ],
                files: [
                    'app/ui/editor/helpers/config.constant.js',
                    'app/ui/editor/helpers/keys.factory.js',
                    'app/ui/editor/helpers/cursor.factory.js',
                    'app/ui/editor/helpers/modifiers.factory.js',
                    'app/ui/editor/helpers/helpers.factory.js',
                    'app/ui/editor/services/editor.service.js',
                    'app/ui/editor/directives/editor.directive.js',
                ],
            },
            {
                name: 'ringid.ui_scrollbar',
                dependencies: [
                ],
                files: [
                    'app/ui/scrollbar/services/scrollbar.service.js',
                    'app/ui/scrollbar/services/helpers.service.js',
                    'app/ui/scrollbar/directives/scrollbar.directive.js',
                ],
            },
            {
                name: 'ringid.ui_ringbox',
                dependencies: [
                    'ringid.ui_player',
                ],
                files: [
                    'app/ui/ringbox/services/ringbox.service.js',
                    'app/ui/ringbox/directives/ringbox.directive.js',
                ],
            },
            {
                name: 'ringid.ui_player',
                dependencies: [
                ],
                files: [
                    'app/ui/player/services/player.service.js',
                    'app/ui/player/directives/mini.directive.js',
                    'app/ui/player/directives/player.directive.js',
                ],
            },
            {
                name: 'ringid.utils',
                dependencies: [
                    'ringid.config',
                    'ringid.global_services',
                ],
                files: [
                    'app/utils/directives/rg-url-og-preview.js',
                    'app/utils/directives/rg-url-og-fetcher.js',
                    'app/utils/directives/rg-loader.directive.js',
                    'app/utils/directives/rg-compile.directive.js',
                    'app/utils/directives/app.utils.directives.js',
                    'app/utils/directives/mid-width.directive.js',
                // 'app/utils/factories/window.focus.blur.factory.js',
                ],
            },
            {

                name: 'ringid.directives',
                dependencies: [
                    'ringid.config',
                    'ringid.connector',
                    'ringid.global_services',
                ],
                files: [
                    'app/common/directives/rg-template.directive.js',
                    'app/common/directives/rg-wizard.directive.js',
                    'app/common/directives/round-progress-directive.js',
                    'app/common/directives/rg-loading.directive.js',
                    'app/common/directives/rg-global-loader.directive.js',
                    'app/common/directives/rg-emotion.directive.js',
                    'app/common/directives/rg-photos.directive.js',
                    'app/common/directives/rg-href.directive.js',
                    'app/common/directives/rg-friend.dropdown.directive.js', // replaced by rg-selector directive inside rg-postbox directive
                    'app/common/directives/rg-hovercard.directive.js', // replaced by rg-selector directive inside rg-postbox directive
                // 'app/common/directives/rg-tag-friend.directive.js',
                    'app/common/directives/rg-img.directive.js',
                    'app/common/directives/rg-src.directive.js',
                    'app/common/directives/rg-repeat.directive.js',
                    'app/common/directives/rg-report.directive.js',
                    'app/common/directives/rg-hide-unhide.directive.js',
                ],
            },
            {
                name: 'ringid.notification',
                dependencies: [
                    'ringid.config',
                    'ringid.directives',
                ],
                files: [
                    'app/notification/factories/notification.map.factory.js',
                    'app/notification/factories/notification.http.service.js',
                    'app/notification/factories/notification.factory.js',
                // 'app/notification/directives/rg-notification.directive.js',
                    'app/notification/controllers/noti.controller.js',
                    'app/notification/controllers/noti-popup.controller.js',
                    'app/notification/controllers/image.controller.js',
                    'app/notification/controllers/media.controller.js',
                    'app/notification/controllers/ringbox-image.controller.js',
                    'app/notification/controllers/ringbox-media.controller.js',
                ],
            },
            {
                name: 'ringid.friend',
                dependencies: [
                    'ringid.config',
                    'ringid.shared',
                ],
                files: [
                    'app/friend/directives/rg-friends.directive.js',
                    'app/friend/directives/rg-requests.directive.js',
                ],
            },
            {
                name: 'ringid.header',
                dependencies: [
                    'ringid.config',
                    'ringid.auth',
                    'ringid.shared',
                    'ringid.notification',
                    'ringid.friend',
                    'ringid.chat',
                ],
                files: [
                    'app/header/controllers/header.controller.js',
                    'app/header/directives/rg-search.directive.js',
                ],
            },
            {
                name: 'ringid.postbox',
                dependencies: [],
                files: [
                    'app/postbox/controllers/ringbox-feed.controller.js',
                    'app/postbox/directives/rg-postbox.directive.js',
                    'app/postbox/directives/rg-status-uploads.directive.js',
                    'app/postbox/directives/rg-upload-preview.directive.js',
                    'app/postbox/directives/rg-selector.directive.js',
                ],
            },
            {
                name: 'ringid.feed',
                dependencies: [
                    'ngWebSocket',
                    'ringid.utils',
                    'ringid.config',
                    'ringid.connector',
                    'ringid.directives',
                    'ringid.postbox',
                ],
                files: [
                    'app/feed/directives/rg-feed-subscriber.directive.js',
                    'app/feed/directives/feedimages.directive.js',
                    'app/feed/directives/show-more.directive.js',
                    'app/feed/directives/rg-feed-hide.directive.js',
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
                    'app/feed/directives/rg-portal-news-feed-menu.directive.js',
                    'app/feed/directives/feed-message.directive.js',
                    'app/feed/directives/rg-single-feed.directive.js',
                    'app/feed/directives/rg-single-feed-details.directive.js',
                    'app/feed/directives/feed-inline-share.directive.js',
                    'app/feed/controllers/feed.main.controller.js',
                    'app/feed/controllers/feed.single.sub.controller.js',
                    'app/feed/controllers/feed.sub.controller.js',
                    'app/feed/controllers/popup.single.feed.controller.js',
                    'app/feed/controllers/feed.whoshare.controller.js',
                    'app/feed/controllers/feed.single.whoshare.controller.js',
                    'app/feed/controllers/feed.ringbox.whoshare.controller.js',
                    'app/feed/controllers/feed.share.controller.js',
                    'app/feed/controllers/feed.ringbox.share.controller.js',
                    'app/feed/controllers/feed.inline.share.controller.js',
                // 'app/feed/controllers/feed.add.controller.js', // no more needed using rg-postbox directive instead
                    'app/feed/controllers/feed.edit.controller.js',
                    'app/feed/controllers/feed.dashboard.controller.js',
                    'app/feed/controllers/feed.profile.controller.js',
                    'app/feed/controllers/feed.circle.controller.js',
                    'app/feed/controllers/feed.medias.controller.js',
                    'app/feed/controllers/feed.newsportal.controller.js',
                    'app/feed/controllers/feed.tag.user.list.controller.js',
                    'app/feed/controllers/feed.edit.tag.controller.js',
                // common feed directive for portal,businees,celeb
                    'app/feed/directives/rg-common-feed-top.directive.js',
                    'app/feed/directives/rg-common-feed-bottom.directive.js',
                    'app/feed/directives/rg-common-feed-details.directive.js',
                ],
            },
            {
                name: 'ringid.chat',
                dependencies: [
                    'ringid.config',
                    'ringid.sticker',
                    'ngWebSocket',
                    'ringid.utils',
                    'ringid.connector',
                    'angularAudioRecorder',
                ],
                files: [
                    'app/chat/shared/chat.app.js',
                    'app/chat/shared/chat.constants.js',
                    'app/chat/shared/utils.js',
                    'app/chat/shared/helpers.js',
                    'app/chat/shared/chat.packet.attributes.js',
                    'app/chat/shared/friend_tag.chat.packet.format.js',
                    'app/chat/shared/public.chat.packet.format.js',
                    'app/chat/shared/chat.packet.format.js',
                    'app/chat/shared/chat.requests.js',
                    'app/chat/shared/public.chat.requests.js',
                    'app/chat/shared/auth.requests.js',
                    'app/chat/shared/packetidgen.js',
                    'app/chat/chat.lang.js',
                    'app/chat/models/chat.message.js',
                    'app/chat/models/chat.conversation.model.js',
                    'app/chat/models/chat.box.js',
                    'app/chat/models/chat.room.js',
                    'app/chat/models/chat.room.category.js',
                    'app/chat/models/tag.chat.js',
                    'app/chat/services/chat.responses.js',
                    'app/chat/services/public.chat.responses.js',
                    'app/chat/services/auth.responses.js',
                    'app/chat/controllers/chat.controller.js',
                    'app/chat/controllers/public.chat.controller.js',
                    'app/chat/controllers/chat.history.controller.js',
                    'app/chat/controllers/chat.media.upload.controller.js',
                    'app/chat/controllers/tag.chat.controller.js',
                    'app/chat/controllers/tag.chat.popup.controller.js',
                    'app/chat/controllers/tag.chat.member.page.controller.js',
                    'app/chat/controllers/tag.chat.member.page.popup.controller.js',

                    'app/chat/controllers/tag.chat.debug.info.controller.js',
                    'app/chat/services/chat.utils.factory.js',
                    'app/chat/services/rg-recorder.service.js',
                    'app/chat/services/chat.connector.js',
                    'app/chat/services/chat.conversations.factory.js',
                    'app/chat/services/chat.exceptions.js',
                    'app/chat/services/chat.factory.js',
                    'app/chat/services/chat.helper.factory.js',
                    'app/chat/services/chat.packet.sender.service.js',
                    'app/chat/services/chat.seen.send.factory.js',
                    'app/chat/services/chat.tab.sync.factory.js',
                    'app/chat/services/chat.worker.commands.js',
                    'app/chat/services/chat.room.factory.js',
                    'app/chat/services/chat.room.category.factory.js',
                    'app/chat/services/tag.chat.factory.js',
                    'app/chat/services/tag.chat.helper.factory.js',
                    'app/chat/services/tag.chat.manager.factory.js',
                    'app/chat/services/tag.chat.storage.js',
                    'app/chat/services/tag.chat.ui.factory.js',
                    'app/chat/services/chat.request.processor.js',
                    'app/chat/services/chat.response.processor.js',
                    'app/chat/directives/rg-image-capture.directive.js',
                    'app/chat/directives/chat.directive.js',
                    'app/chat/directives/chat.ui.directive.js',
                    'app/chat/directives/chat.focus.directive.js',
                    'app/chat/directives/chat.message.directive.js',
                // 'app/chat/directives/chat.subscriber.directive.js',
                    'app/chat/directives/chat.timeout.directive.js',
                    'app/chat/directives/chat.setting.directive.js',
                    'app/chat/directives/rg.tag.chat.list.js',
                ],
            },
            {
                name: 'ringid.sticker',
                dependencies: ['ringid.config'],
                files: [
                    'app/sticker/helpers/sticker-helper.js',
                    'app/sticker/controllers/sticker-page.controller.js',
                    'app/sticker/controllers/sticker-popup.controller.js',
                    'app/sticker/models/sticker.category.model.js',
                    'app/sticker/models/sticker.collection.model.js',
                    'app/sticker/services/sticker.http.service.js',
                    'app/sticker/services/sticker.v2.http.service.js',
                    'app/sticker/services/sticker.factory.js',
                    'app/sticker/directives/sticker-category.js',
                    'app/sticker/directives/sticker-category-list.js',
                    'app/sticker/directives/sticker-directives.js',
                    'app/sticker/directives/sticker-collection-list.js',
                ],
            },
            {
                name: 'ringid.controllers',
                dependencies: ['ringid.config'],
                files: [
                    'app/common/controllers/album-list.controller.js',
                    'app/common/controllers/album-create.controller.js',
                    'app/common/controllers/ringbox-album-list.controller.js',
                    'app/common/controllers/ringbox-confirm.controller.js',
                    'app/common/controllers/single-image.controller.js',
                ],
            },
            {
                name: 'ringid.media',
                dependencies: [
                    'ringid.filters',
                    'ringid.config',
                    'ringid.controllers',
                ],
                files: [
                    'app/media/directives/rg-media.directive.js',
                    'app/media/directives/rg-media.search.directive.js',
                    'app/media/directives/search.media.directive.js',
                    'app/media/directives/rg-media.tabnav.directive.js',
                    'app/media/directives/rg-media.slider.directive.js',
                    'app/media/directives/rg-media-trend-slider.directive.js',
                    'app/media/controllers/search-result.controller.js',
                    'app/media/controllers/media.discover.controller.js',
                    'app/media/controllers/album.controller.js',
                    'app/media/controllers/media-post.controller.js',
                ],
            },
            {
                name: 'ringid.newsportal',
                dependencies: [
                    'ringid.filters',
                    'ringid.config',
                    'ringid.controllers',
                ],
                files: [
                    'app/newsportal/controllers/portal.following.controller.js',
                    'app/newsportal/controllers/portal.discover.controller.js',
                    'app/newsportal/controllers/portal.saved.controller.js',
                    'app/newsportal/controllers/portal-follow.controller.js',
                    'app/newsportal/controllers/portal.profile.controller.js',
                    'app/newsportal/controllers/portal-feed.popup.controller.js',
                    'app/newsportal/directives/rg-portal.tabnav.directive.js',
                    'app/newsportal/directives/rg-portal.slider.directive.js',
                    'app/newsportal/directives/rg-discover-portal.directive.js',
                    'app/newsportal/directives/rg-breaking-news.directive.js',
                ],
            },
            {
                name: 'ringid.business',
                dependencies: [
                    'ringid.filters',
                    'ringid.config',
                    'ringid.controllers',
                ],
                files: [
                    'app/business/controllers/feed.business.controller.js',
                    'app/business/controllers/business-follow.controller.js',
                // 'app/newsportal/controllers/portal.following.controller.js',
                    'app/business/controllers/business.discover.controller.js',
                    'app/business/controllers/business.following.controller.js',
                    'app/business/controllers/business.saved.controller.js',
                    'app/business/controllers/business.profile.controller.js',
                    'app/business/controllers/business-feed-popup.controller.js',
                // 'app/newsportal/controllers/portal.saved.controller.js',
                // 'app/newsportal/controllers/portal-follow.controller.js',
                // 'app/newsportal/controllers/portal.profile.controller.js',
                // 'app/newsportal/controllers/portal-feed.popup.controller.js',
                    'app/business/directives/rg-business.tabnav.directive.js',
                    'app/business/directives/rg-business.slider.directive.js',
                    'app/business/directives/rg-discover-business.directive.js',
                ],
            },
            {
                name: 'ringid.celebrity',
                dependencies: [
                    'ringid.filters',
                    'ringid.config',
                    'ringid.controllers',
                ],
                files: [
                    'app/celebrity/services/celebrity.helper.factory.js',
                    'app/celebrity/controllers/feed.celebrity.controller.js',
                    'app/celebrity/controllers/celebrity.discover.controller.js',
                    'app/celebrity/controllers/celebrity.following.controller.js',
                    'app/celebrity/controllers/celebrity.saved.controller.js',
                    'app/celebrity/controllers/celebrity.profile.controller.js',
                    'app/celebrity/directives/rg-celebrity.tabnav.directive.js',
                    'app/celebrity/directives/rg-celebrity.slider.directive.js',
                    'app/celebrity/directives/rg-celebrity-discover.directive.js',
                ],
            },
            {
                name: 'ringid.profile',
                dependencies: [
                    'ringid.config',
                    'ringid.digits',
                    'ringid.global_services',
                    'ringid.auth',
                    'ringid.media',
                    'ui.bootstrap',
                    'angular-svg-round-progress',
                ],
                files: [
                    'app/profile/services/profile.http.service.js',
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
                ],
            },
            {
                name: 'ringid.circle',
                dependencies: [
                    'ringid.global_services',
                    'ringid.global_directives',
                    'ringid.shared',
                ],
                files: [
                    'app/circle/controllers/circle-popup.controller.js',
                    'app/circle/controllers/circle-edit.popup.controller.js',
                    'app/circle/controllers/circle-page.controller.js',
                    'app/circle/controllers/allCirclePopup.controller.js',
                    'app/circle/controllers/circle.saved.controller.js',
                    'app/circle/directives/rg-circle.tabnav.directive.js',
                ],
            },
            {
                name: 'ringid',
                dependencies: [
                    'ngRoute',
                    'ringid.config',
                    'ui-notification',
                    'ringid.language',
                    'ringid.connector',
                    'ringid.global_services',
                    'ringid.global_directives',
                    'ringid.auth',
                    'ringid.filters',
                    'ringid.shared',
                    'ringid.utils',
                    'ringid.directives',
                    'ringid.ui_editor',
                    'ringid.ui_scrollbar',
                    'ringid.ui_ringbox',
                    'ringid.ui_player',
                    'ringid.header',
                    'ringid.friend',
                    'ringid.directives',
                    'ringid.controllers',
                    'ringid.feed',
                    'ringid.sticker',
                    'ringid.profile',
                    'ringid.circle',
                    'ringid.chat',
                    'ringid.newsportal',
                    'ringid.business',
                    'oc.lazyLoad',
                    'ringid.celebrity',
                ],
                files: [
                    'app/app.controller.js',
                    'app/app.run.js',
                    'app/app.routes.js',
                ],
            },
        ];

  // Project configuration.
    grunt.initConfig({
        jshint: {
            all: [
                'Gruntfile.js',
                'tasks/*.js',
                '<%= nodeunit.tests %>',
            ],
            options: {
                jshintrc: '.jshintrc',
            },
        },

    // Before generating any new files, remove any previously-created files.
        clean: {
            tests: ['tmp'],
        },

    // Configuration to be run (and then tested).
        ring_ci: {
            options: {
                eslintOptions: {
                    configFile: '.eslintrc.json',
                },
            // custom tasks files
                vendorFiles: vendorScripts,
                debugFiles: debugFiles,
                linkerFiles: linkerFiles,
                settingsFile: settingsFile,
                protocolFixTemplates: protocolFixTemplates,
                templateReplaceFiles: templateReplaceFiles,
                protocolFixScripts: protocolFixScripts,
                workerFiles: workerFiles,
                appModules: appModules,
                appStyles: appStyles,
            },
            local: {
                options: {
                    target: 'local',
                    protocol: 'nonssl',
                    apiVersion: '141',
                    branch: 'develop',
                    appSrcPath: '',
                    appBuildPath: 'js/build/',
                    minifyStyles: false,
                    minifyScripts: false,
                    buildModules: false,
                },
                files: {},
            },
            live: {
                options: {
                    target: 'live',
                    protocol: 'ssl',
                    apiVersion: '140',
                    branch: 'master',
                    appSrcPath: '',
                    appBuildPath: 'js/build/',
                    buildModules: false,
                    minifyStyles: true,
                    minifyScripts: true,
                },
                files: {},
            },
            default_options: {
                options: {
                },
                files: {
                    'tmp/default_options': ['test/fixtures/testing', 'test/fixtures/123'],
                },
            },
            custom_options: {
                options: {
                    separator: ': ',
                    punctuation: ' !!!',
                },
                files: {
                    'tmp/custom_options': ['test/fixtures/testing', 'test/fixtures/123'],
                },
            },
        },

    // Unit tests.
        nodeunit: {
            tests: ['test/*_test.js'],
        },

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
