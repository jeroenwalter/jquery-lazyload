/** 
 * lazyload - Basic Image Lazyloader
 * Copyright (c) 2012 DIY Co
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this 
 * file except in compliance with the License. You may obtain a copy of the License at:
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under 
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF 
 * ANY KIND, either express or implied. See the License for the specific language 
 * governing permissions and limitations under the License.
 *
 * @author Brian Reavis <brian@diy.org>
 */

(function($) {
	var $window = $(window);
	var $html = $('html');
	var $body;
	var queue = [];
	var scroll = {};
	var listening = false;
	var container_width = null;
	var container_height = null;

	/**
	 * Calculates the window width / height
	 * and scroll offsets used for visibility testing.
	 */
	var updateBounds = function() {
		container_width  = $window.width();
		container_height = $window.height();
		scroll = {
			top  : Math.max($body.scrollTop(), $html.scrollTop()),
			left : Math.max($body.scrollLeft(), $html.scrollLeft())	
		};
	};

	/**
	 * Determines whether an element is
	 * visible on the page.
	 *
	 * @param {object} $el
	 */
	var visible = function($el) {
		var offset = $el.offset();
		offset.top -= scroll.top;
		offset.left -= scroll.left;

		var x_visible = offset.left + $el.width() >= 0 && offset.left <= container_width;
		var y_visible = offset.top + $el.height() >= 0 && offset.top <= container_height;

		return x_visible && y_visible;
	};

	/**
	 * Loads an individual image and triggers the
	 * appropriate callback upon completion.
	 *
	 * @param {object} job
	 */
	var load = function(job) {
		var image = new Image();
		var start = (new Date()).getTime();
		var onLoad = function() { job.success.apply(job.$el, [job.src, (new Date()).getTime() - start]); };
		var onError = function() { job.error.apply(job.$el, [job.src, (new Date()).getTime() - start]); };

		image.src = job.src;
		if (image.width) {
			onLoad();
		} else {
			image.onerror = onError;
			image.onload = onLoad;
		}
	};

	/**
	 * Triggers loading of all images in the queue
	 * that have elements visible on the page.
	 */
	var onResize = function() {
		updateBounds();
		for (var i = queue.length - 1; i >= 0; i--) {
			if (visible(queue[i].$el)) {
				load(queue[i]);
				queue.splice(i, 1);
			}
		}
		if (!queue.length) {
			$window.off('resize scroll', onResize);
			listening = false;
		}
	};

	// - - - - - - - - - - - - - - - - - - - - - - - - - - - -

	$.fn.lazyload = function(options) {
		if (!$body || !$html.length) $body = $('body');
		if (container_width === null) {
			updateBounds();
		}

		var job = $.extend({
			success: function() {},
			error: function() {},
			src: this.attr('src')
		}, options, {$el: this});

		if (!visible(this)) {
			queue.push(job);
			if (!listening) {
				$window.on('resize scroll', onResize);
				listening = true;
			}
		} else {
			load(job);
		}

		return this;
	};

})(jQuery);