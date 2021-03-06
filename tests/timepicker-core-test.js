//
// jQuery 1.4 queue - needed when testing with previos versions of jQuery
// XXX: I think the tests can be rewritten to avoid using jQuery's queue
//

if (jQuery.fn.jquery < '1.4') {
(function( jQuery ) {
    
    jQuery.extend({
        queue: function( elem, type, data ) {
            if ( !elem ) {
                return;
            }

            type = (type || "fx") + "queue";
            var q = jQuery.data( elem, type );

            // Speed up dequeue by getting out quickly if this is just a lookup
            if ( !data ) {
                return q || [];
            }

            if ( !q || jQuery.isArray(data) ) {
                q = jQuery.data( elem, type, jQuery.makeArray(data) );

            } else {
                q.push( data );
            }

            return q;
        },

        dequeue: function( elem, type ) {
            type = type || "fx";

            var queue = jQuery.queue( elem, type ), fn = queue.shift();

            // If the fx queue is dequeued, always remove the progress sentinel
            if ( fn === "inprogress" ) {
                fn = queue.shift();
            }

            if ( fn ) {
                // Add a progress sentinel to prevent the fx queue from being
                // automatically dequeued
                if ( type === "fx" ) {
                    queue.unshift("inprogress");
                }

                fn.call(elem, function() {
                    jQuery.dequeue(elem, type);
                });
            }
        }
    });

    jQuery.fn.extend({
        queue: function( type, data ) {
            if ( typeof type !== "string" ) {
                data = type;
                type = "fx";
            }

            if ( data === undefined ) {
                return jQuery.queue( this[0], type );
            }
            return this.each(function( i ) {
                var queue = jQuery.queue( this, type, data );

                if ( type === "fx" && queue[0] !== "inprogress" ) {
                    jQuery.dequeue( this, type );
                }
            });
        },
        dequeue: function( type ) {
            return this.each(function() {
                jQuery.dequeue( this, type );
            });
        },

        // Based off of the plugin by Clint Helfers, with permission.
        // http://blindsignals.com/index.php/2009/07/jquery-delay/
        delay: function( time, type ) {
            time = jQuery.fx ? jQuery.fx.speeds[time] || time : time;
            type = type || "fx";

            return this.queue( type, function() {
                var elem = this;
                setTimeout(function() {
                    jQuery.dequeue( elem, type );
                }, time );
            });
        },

        clearQueue: function( type ) {
            return this.queue( type || "fx", [] );
        }
    });

})( jQuery );
}



//
// actual tests
//

$.fn.timepicker.test = function() {

    var system = $({}), timeout = 100;

    $('body').append('<div id="main" style="position: absolute; top: -10000px; left: -10000px"><div><input id="timepicker" class="timepicker"/></div></div>');

    module("TimePicker API", {
        teardown: function() {
            $('#timepicker').timepicker().destroy();
        }
    });

    test('timepicker instance', function() {
        var timepicker = $('#timepicker').timepicker(),
            expected = 1;
        instance = timepicker.timepicker();
        ok(typeof instance.widget !== 'undefined', 'Get access to the instance object.');
    });

    test('selected, first, last', function() {
        var selected = false,
            timepicker = $('#timepicker').timepicker(),
            instance = timepicker.timepicker(),
            expected = 5;

        expect(expected); stop(timeout * expected);

        system.queue('test', []);
        system.queue('test', function(next) {
            selected = instance.selected();
            ok(selected === null, 'No item is selected at the beginning!.');
            timepicker.simulate('keydown', {keyCode: $.TimePicker.prototype.keyCode.DOWN});
            next();
        });

        system.delay(timeout, 'test');
        system.queue('test', function(next) {
            selected = instance.selected();
            ok(selected !== null, 'An element is selected after the DOWN key is pressed.');
            ok(instance.first(), 'That element is the first element.');
            timepicker.simulate('keydown', {keyCode: $.TimePicker.prototype.keyCode.UP});
            next();
        });

        system.delay(timeout, 'test');
        system.queue('test', function(next) {
            selected = instance.selected();
            ok(selected !== null, 'Another element is selected after the UP key is pressed.');
            ok(instance.last(), 'That element is the last element.');
            next();
        });

        system.queue('test', function(next) { start(); }).dequeue('test');
    });

    test('parse', function() {
        var timepicker = $('#timepicker').timepicker(),
            instance = timepicker.timepicker(),
            now = new Date(), k, n, value, expected;

        function time(hours, minutes, seconds) {
            hours = hours || 0; minutes = minutes || 0; seconds = seconds || 0;
            var t = new Date();
            t.setTime(now.valueOf());
            t.setHours(hours, minutes, seconds, 0, 0);
            return t;
        }

        var input = ['1', time(1),
                     '11', time(11),
                     '111', time(1, 11),
                     '1234', time(12, 34),
                     '12345', time(1, 23, 45),
                     '123456', time(12, 34, 56),
                     '441234', time(4, 41, 23),
                     '4412345', time(4, 41, 23),
                     '44123456', time(4, 41, 23),
                     '441234567', time(4, 41, 23),
                     '446161', false,
                     '46', time(5),
                     ':1', time(10),
                     ':2', time(20),
                     ':3', time(3),
                     ':4', time(4),
                     ':5', time(5),
                     ':6', time(6),
                     ':7', time(7),
                     ':8', time(8),
                     ':9', time(9),
                     ':12', time(12),
                     ':123', time(1, 23),
                     ':1234', time(12, 34),
                     ':12345', time(1, 23, 45),
                     ':123456', time(12, 34, 56),
                     ':1234567', time(12, 34, 56),
                     ':61', time(6, 10),
                     ':62', time(6, 20),
                     ':1261', false,
                     ':1271', false,
                     '1:7', time(1, 7),
                     '2:8', time(2, 8),
                     '3:9', time(3, 9),
                     '1:1', time(1, 10),
                     '6:1', time(6, 10),
                     '1:6', time(2),
                     '7:1', time(7, 10),
                     '8:60', time(9),
                     '8:59', time(8, 59),
                     '7:35', time(7, 35),
                     '3:45', time(3, 45),
                     '10:7', time(10, 7),
                     '21:08', time(21, 8),
                     '10:10', time(10, 10),
                     '10:60', time(10, 60),
                     '10:1', time(10, 10),
                     '10:3', time(10, 30),
                     '10:5', time(10, 50),
                     '6:0660', time(6, 7),
                     '6:032', time(6,3,20),
                     '1:23', time(1, 23),
                     '2:345', time(2, 34, 50),
                     '3:4567', false,
                     '4:56012', time(4, 56, 1),
                     '123:4', time(1, 23, 4),
                     '1234:5', time(12, 34, 5),
                     '123:45', time(1, 23, 45),
                     '1234:56', time(12, 34, 56),
                     '1:2:3', time(1,2,3),
                     '1:2:30', time(1,2,30),
                     '10:2:30', time(10,2,30),
                     '1:20:30', time(1,20,30),
                     '11:15:03', time(11,15,3),
                     undefined, null];

        for (k = 0, n = input.length; k < n; k = k+2) {
            value = input[k]; expected = input[k+1];
            t = instance.parse(value);
            result = t ? time(t.getHours(), t.getMinutes(), t.getSeconds()) : false;
            parsed = result ? result.toLocaleTimeString() : false;
            expectedMessage = expected ? expected.toLocaleTimeString() : 'false';

            ok(result >= expected && result <= expected,
               'Input:' + value + ' | Parsed: ' + parsed + ' | Expected: ' + expectedMessage);
        }
    });

    test('format', function() {
        var timepicker = $('#timepicker').timepicker(),
            instance = timepicker.timepicker(),
            time = new Date(1988, 8, 24, 19, 30, 0),
            k, n, formats, result, format, expected;

        formats = [['hh:mm:ss p', '07:30:00 PM'],
                   ['HH:mm:ss', '19:30:00'],
                   ['h:m:s p', '7:30:0 PM'],
                   ['H:m:s', '19:30:0']];

        for (k = 0, n = formats.length; k < n; k++) {
            format = formats[k][0]; expected = formats[k][1];
            result = instance.format(time, format);

            ok(result == expected, 'Object: ' + time.toLocaleTimeString() + ' | Format: ' + format + ' | Result: ' + result);
        }
    });

    test('getTime/setTime', function() {
        var element = $('#timepicker').timepicker(),
            instance = element.timepicker(),
            date = new Date(0,0,0,12,50,34);
            
        instance.setTime(date);
        ok(element.val() == '12:50 PM', 'passing a Date object to setTime.');

        ok(instance.getTime().toLocaleTimeString() == date.toLocaleTimeString(), 'getTime return the time set by setTime using a Date object.');

        element.timepicker('setTime', '1:20p');
        ok(element.val() == '01:20 PM', 'passing a string to setTime.');

        date = new Date(0,0,0,13,20,0);
        ok(instance.getTime().toLocaleTimeString() == date.toLocaleTimeString(), 'getTime return the time set by setTime using a string.');
    });

    test('option', function() {
        var element = $('#timepicker').timepicker(),
            instance = element.timepicker();

        instance.setTime('11:40');


        ok(instance.option('timeFormat') === 'hh:mm p', 'timeFormat: value succesfully retrieved (instance).');

        instance.option('timeFormat', 'h p');
        ok(instance.format(instance.getTime()) == '11 AM', 'timeFormat: value succesfully updated (instance).');
        ok(element.val() == '11 AM', 'timeFormat: input field value was properly updated with the new format (instance).');


        ok(element.timepicker('option', 'timeFormat') === 'h p', 'timeFormat: value succesfully retrieved (plugin).');

        element.timepicker('option', 'timeFormat', 'h:m p');
        ok(instance.format(instance.getTime()) == '11:40 AM', 'timeFormat: value succesfully updated (plugin).');
        ok(element.val() == '11:40 AM', 'timeFormat: input field value was properly updated with the new format (plugin).');
    });



    module("TimePicker Options", {
        teardown: function() {
            $('#timepicker').timepicker().destroy();
        }
    });

    test('minTime', function() {
        var timepicker, instance;
        timepicker = $('#timepicker').timepicker({ minTime: '2p' });
        timepicker.focus();
    });

    test('dropdown', function() {
        var timepicker, instance;
        timepicker = $('#timepicker').timepicker({ dropdown: false });
        instance = timepicker.timepicker();
        timepicker.focus();
        ok(instance.closed(), 'dropdown is not opened if dropdown was set to false.');
        timepicker.blur();

        instance.option('dropdown', true);
        timepicker.focus();
        ok(!instance.closed(), 'dropdown is opened if dropdown was set to true.');
    });

    test('callbacks', function() {
        var first = false, expected = 1, timepicker;
        
        timepicker = $('#timepicker').timepicker({
            change: function(time) {
                ok(true, 'change() callback executed.');
                start();
            }
        });

        expect(expected); stop(timeout * expected);

        timepicker.val('46').change();
    });



    module('TimePicker Event Handlers');

    test('open/close', function() {
        var timepicker = $('#timepicker').timepicker(),
            instance = timepicker.timepicker(),
            selected = null,
            expected = 8;

        expect(expected); stop(timeout * expected);

        system.queue('test', []);
        system.queue('test', function(next) {
            ok(instance.closed(), 'TimePicker starts closed.');
            timepicker.focus();
            next();
        });

        system.delay(timeout, 'test');
        system.queue('test', function(next) {
            ok(!instance.closed(), 'TimePicker opens when input field gains focus.');
            timepicker.simulate('keydown', {keyCode: 65});
            next();
        });

        system.delay(timeout, 'test');
        system.queue('test', function(next) {
            ok(instance.closed(), 'TimePicker is closed after the \'a\' key is pressed.');
            timepicker.simulate('keydown', {keyCode: $.TimePicker.prototype.keyCode.DOWN});
            next();
        });

        system.delay(timeout, 'test');
        system.queue('test', function(next) {
            ok(!instance.closed(), 'TimePicker opens when DOWN key is pressed.');
            selected = instance.selected();
            timepicker.simulate('keydown', {keyCode: 65});
            timepicker.simulate('keydown', {keyCode: $.TimePicker.prototype.keyCode.UP});
            next();
        });

        system.delay(timeout, 'test');
        system.queue('test', function(next) {
            ok(!instance.closed(), 'TimePicker opens when UP key is pressed.');
            selected = instance.selected();
            timepicker.simulate('keydown', {keyCode: $.TimePicker.prototype.keyCode.ENTER});
            next();
        });

        system.delay(timeout, 'test');
        system.queue('test', function(next) {
            ok(instance.closed(), 'TimePicker is closed after an item has been selected pressing ENTER key.');
            ok(selected !== null, 'An element is selected after the DOWN key is pressed.');
            ok(selected ? timepicker.val() == selected.text() : false, 'The value in the input field is the text of the selected item.');
            next();
        }, 50);

        system.queue('test', function(next) {start();}).dequeue('test');
    });
};